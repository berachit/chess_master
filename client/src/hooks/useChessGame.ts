/** 
 * acts as the entire chess game brain for your UI:
 * Uses chess.js as the rules engine (legal moves, check, checkmate, etc.)
 * Uses React state only for things that affect rendering
 * Converts FEN → board position for the UI
 * Handles:
    - Square selection
    - Legal move highlighting
    - Move execution
    - Pawn promotion
    - Check / checkmate detection
*/

import { useState, useMemo, useEffect, createElement } from "react";
import { Chess, Square, Move } from "chess.js";
import { GameStatus } from "@/components/StatusBanner";
import { playSound } from "@/utils/sound";
import { getBotMove } from "@/utils/bot";
import { useSocket } from "@/context/SocketContext";
import { useAppSelector } from "@/store/hooks";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

const pieceToSymbol: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",

  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  K: "♔",
};

type GameMode = "bot" | "online";

interface GameConfig {
  mode: GameMode;
  level?: string;
  playerColor?: "white" | "black";
  timeControl?: string;
  gameId?: string;
}

export const useChessGame = ({
  mode = "bot",
  level = "easy",
  playerColor = "white",
  timeControl = "none",
  gameId,
}: GameConfig) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Chess() is mutable
  // We do NOT want React to re-create it on every render
  // Using useState with an initializer:
  // Creates the engine once
  // Keeps it stable forever
  const [game] = useState(() => new Chess());

  // FEN = single source of truth for React
  // game → mutable logic
  // fen → immutable snapshot for rendering
  const [fen, setFen] = useState(game.fen());

  const { socket } = useSocket();

  const effectiveTimeControl = mode === "bot" ? "none" : timeControl;

  // parse timeControl to initial seconds
  const initialSeconds = useMemo(() => {
    if (
      !effectiveTimeControl ||
      effectiveTimeControl === "none" ||
      effectiveTimeControl === "stopwatch"
    ) {
      return 0;
    }
    const match = effectiveTimeControl.match(/^(\d+)m$/);
    if (match) {
      return parseInt(match[1], 10) * 60;
    }
    return 0;
  }, [effectiveTimeControl]);

  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);
  const [isTimeout, setIsTimeout] = useState<"white" | "black" | null>(null);
  const [opponentName, setOpponentName] = useState<string>("");
  const [opponentRating, setOpponentRating] = useState<number>(1200);

  // viewIndex: which move in history we're *displaying*.
  //  -1 = live (latest) position
  //  0..N-1 = position after move N
  const [viewIndex, setViewIndex] = useState<number>(-1);

  const [isResigned, setIsResigned] = useState<boolean>(false);
  const [isDrawDeclared, setIsDrawDeclared] = useState<boolean>(false);
  const [isAbandoned, setIsAbandoned] = useState<boolean>(false);

  // Squares where the selected piece can legally move
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  // Squares where the selected piece can legally move
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([]);
  // Pawn promotion is not an instant move:
  // Pawn reaches last rank
  // UI asks: queen / rook / bishop / knight
  // Move completes

  const [hasBotMoved, setHasBotMoved] = useState(false);

  const [promotionMove, setPromotionMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  useEffect(() => {
    game.reset();
    setFen(game.fen());
    setViewIndex(-1);
    setSelectedSquare(null);
    setHighlightedSquares([]);
    setPromotionMove(null);
    setHasBotMoved(false);
    setIsResigned(false);
    setIsDrawDeclared(false);
    setIsTimeout(null);
    setIsAbandoned(false);
    setWhiteTime(initialSeconds);
    setBlackTime(initialSeconds);
  }, [gameId, initialSeconds]);

  const playerTurn = playerColor === "white" ? "w" : "b";
  const botTurn = playerColor === "white" ? "b" : "w";

  useEffect(() => {
    if (mode !== "online" || !socket || !gameId) return;

    console.log("Emitting join_game for room:", gameId);
    socket.emit("join_game", { gameId });

    socket.on("error_message", (data) => {
      console.error("Server Socket Error:", data.message);
    });

    socket.on("player_resigned", (data) => {
      console.log("Received player_resigned:", data);
      setIsResigned(true);
      try {
        playSound("gameEnd");
      } catch (e) {
        console.warn(e);
      }
    });

    socket.on("draw_offered", (data) => {
      console.log("Received draw_offered:", data);
      toast({
        title: "Draw Offered",
        description: `${data.offeredBy} has offered a draw.`,
        action: createElement(
          ToastAction,
          {
            altText: "Accept",
            onClick: () => socket.emit("accept_draw", { gameId }),
          },
          "Accept"
        ) as any,
      });
    });

    socket.on("draw_declined", (data) => {
      console.log("Received draw_declined:", data);
      toast({
        title: "Draw Declined",
        description: "Your opponent declined the draw offer.",
      });
    });

    socket.on("game_state", (data) => {
      console.log("Received game_state:", data);
      game.load(data.game.currentFen);
      setFen(game.fen());

      setWhiteTime(Math.round(data.game.whiteTimeRemaining / 1000));
      setBlackTime(Math.round(data.game.blackTimeRemaining / 1000));

      const isWhite = data.game.whitePlayer.userId === currentUser?.id;
      const opp = isWhite ? data.game.blackPlayer : data.game.whitePlayer;
      setOpponentName(opp.username);
      setOpponentRating(opp.ratingBefore || 1200);

      if (data.game.status === "finished") {
        if (data.game.result === "draw") setIsDrawDeclared(true);
        if (data.game.result === "resigned") setIsResigned(true);
        if (data.game.result === "timeout") {
          setIsTimeout(
            data.game.winnerUserId === currentUser?.id
              ? playerColor === "white"
                ? "black"
                : "white"
              : playerColor === "white"
                ? "white"
                : "black",
          );
        }
      }
    });

    socket.on("move_played", (data) => {
      const playedMove = data.move?.move;
      const incomingTurn = data.game.currentFen.split(" ")[1];
      if (incomingTurn === playerTurn && playedMove) {
        game.move({
          from: playedMove.from,
          to: playedMove.to,
          promotion: playedMove.promotion || undefined,
        });
        setFen(game.fen());
        playSound(playedMove.captured ? "capture" : "moveSelf");
      }
      setWhiteTime(Math.round(data.game.whiteTimeRemaining / 1000));
      setBlackTime(Math.round(data.game.blackTimeRemaining / 1000));
    });

    socket.on("game_finished", (data) => {
      console.log("Game finished event received:", data);
      const reason = data.resultReason || data.result;
      if (
        reason === "draw" ||
        reason === "stalemate" ||
        reason === "draw_agreement" ||
        reason === "threefold_repetition" ||
        reason === "insufficient_material" ||
        reason === "fifty_move_rule"
      ) {
        setIsDrawDeclared(true);
      } else if (reason === "resigned" || reason === "resignation") {
        setIsResigned(true);
      } else if (reason === "timeout") {
        setIsTimeout(
          data.winnerUserId === currentUser?.id
            ? playerColor === "white"
              ? "black"
              : "white"
            : playerColor === "white"
              ? "white"
              : "black",
        );
      } else if (reason === "disconnect_timeout" || reason === "aborted") {
        setIsAbandoned(true);
      }
      playSound("gameEnd");
    });

    socket.on("rematch_offered", (data) => {
      console.log("Received rematch_offered:", data);
      toast({
        title: "Rematch Offered",
        description: `${data.offeredBy} offered a rematch.`,
        action: createElement(
          ToastAction,
          {
            altText: "Accept",
            onClick: () => socket.emit("accept_rematch", { gameId }),
          },
          "Accept"
        ) as any,
      });
    });

    socket.on("rematch_accepted", (data) => {
      console.log("Received rematch_accepted:", data);
      const newColor = playerColor === "white" ? "black" : "white";
      navigate(`/game/${data.newGameId}?color=${newColor}&time=${timeControl}`);
    });

    return () => {
      socket.off("game_state");
      socket.off("move_played");
      socket.off("game_finished");
      socket.off("error_message");
      socket.off("player_resigned");
      socket.off("draw_offered");
      socket.off("draw_declined");
      socket.off("rematch_offered");
      socket.off("rematch_accepted");
    };
  }, [socket, gameId, mode, playerColor, playerTurn]);

  // Board position: if reviewing history use that move's FEN, else live FEN
  const displayFen = useMemo(() => {
    const history = game.history({ verbose: true }) as Move[];
    if (viewIndex === -1 || history.length === 0) return fen;
    // Replay moves up to viewIndex on a temp board
    const temp = new Chess();
    for (let i = 0; i <= viewIndex && i < history.length; i++) {
      temp.move(history[i]);
    }
    return temp.fen();
  }, [fen, viewIndex]);

  const currentTurn = displayFen.split(" ")[1]; // "w" or "b"

  // Clock Ticker Effect
  useEffect(() => {
    if (!effectiveTimeControl || effectiveTimeControl === "none") return;

    const isGameOver =
      game.isGameOver() || isResigned || isDrawDeclared || !!isTimeout;
    if (isGameOver) return;

    const activeColor = game.turn(); // 'w' or 'b'

    const interval = setInterval(() => {
      if (effectiveTimeControl === "stopwatch") {
        if (activeColor === "w") {
          setWhiteTime((prev) => prev + 1);
        } else {
          setBlackTime((prev) => prev + 1);
        }
      } else {
        // Countdown
        if (activeColor === "w") {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              setIsTimeout("white");
              clearInterval(interval);
              try {
                playSound("gameEnd");
              } catch (e) {
                console.warn(e);
              }
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              setIsTimeout("black");
              clearInterval(interval);
              try {
                playSound("gameEnd");
              } catch (e) {
                console.warn(e);
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [effectiveTimeControl, fen, isResigned, isDrawDeclared, isTimeout, game]);

  useEffect(() => {
    if (mode !== "bot" || viewIndex !== -1) return;

    if (
      currentTurn === botTurn &&
      !game.isGameOver() &&
      !isResigned &&
      !isDrawDeclared &&
      !hasBotMoved
    ) {
      setHasBotMoved(true);

      const delay = 300 + Math.random() * 400;

      const timer = setTimeout(() => {
        makeBotMove(level);
      }, delay);

      return () => clearTimeout(timer);
    }

    // reset when it's player's turn
    if (currentTurn === playerTurn) {
      setHasBotMoved(false);
    }
  }, [fen, viewIndex, isResigned, isDrawDeclared]);

  // Find the current player’s king square
  // Used to highlight king when in check / checkmate
  const kingSquare = useMemo(() => {
    const temp = new Chess(displayFen);
    const board = temp.board();

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        // this founds the king and should belong to the side whose turn it is
        if (piece && piece.type === "k" && piece.color === temp.turn()) {
          // converts array indices to chess notation
          const fileChar = "abcdefgh"[file];
          const rankChar = (8 - rank).toString();
          return `${fileChar}${rankChar}`;
        }
      }
    }
    return null;
    // Recompute only when position changes.
  }, [displayFen]);

  const displayStatus = useMemo(() => {
    const temp = new Chess(displayFen);
    return {
      check: temp.inCheck(),
      checkmate: temp.isCheckmate(),
    };
  }, [displayFen]);

  // heart of the game interaction
  const handleSquareClick = (square: Square) => {
    // block if reviewing history or game is over
    if (viewIndex !== -1) return;
    if (game.isGameOver()) return;
    // block if not player's turn
    if (game.turn() !== playerTurn) return;
    // if promotionMove popup is there helps to prevent the illegal click
    if (promotionMove) return;

    // returns the piece on the select sqaure
    // {type: "p", color: "w"}
    const clickedPiece = game.get(square);

    //  CASE 1: No piece selected yet
    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === game.turn()) {
        // get all the legal moves from the selected sqaure
        const moves = game.moves({ square, verbose: true });
        if (moves.length > 0) {
          setSelectedSquare(square);
          // highlights all the possible moves
          setHighlightedSquares(moves.map((m) => m.to));
        }
      }
      return;
    }

    // Switch selection to another own piece
    // this is for update selection of the piece
    if (
      clickedPiece &&
      clickedPiece.color === game.turn() &&
      square !== selectedSquare
    ) {
      const moves = game.moves({ square, verbose: true });
      setSelectedSquare(square);
      setHighlightedSquares(moves.map((m) => m.to));
      return;
    }

    // Get all legal moves from selected square
    const legalMoves = game.moves({
      square: selectedSquare,
      verbose: true,
    });

    // Check if THIS square is a legal promotion move
    const promotionCandidate = legalMoves.find(
      (m) => m.to === square && m.flags.includes("p"),
    );

    // Pause and ask user ONLY if legal promotion
    if (promotionCandidate) {
      setPromotionMove({
        from: selectedSquare,
        to: square,
      });
      return;
    }

    // Legal move → returns a Move object
    // Illegal move → returns null
    const move = game.move({
      from: selectedSquare,
      to: square,
    });

    // if legal, updates the ui
    if (move) {
      setFen(game.fen());
      setViewIndex(-1); // always jump to live on new move

      // player sound
      if (move.captured) {
        playSound("capture");
      } else if (move.isKingsideCastle() || move.isQueensideCastle()) {
        playSound("castle");
      } else {
        playSound("moveSelf");
      }

      setTimeout(() => {
        if (game.isCheckmate()) {
          playSound("gameEnd");
        } else if (game.inCheck()) {
          playSound("moveCheck");
        }
      }, 100);

      //  ONLINE MODE
      if (mode === "online" && socket && gameId) {
        socket.emit("make_move", {
          gameId,
          from: selectedSquare,
          to: square,
          clientTimestamp: Date.now(),
        });
      }
    } else {
      playSound("illegal");
    }

    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  // Pawn promotion -> Called when user clicks promotion piece like asking user to promote to which piece
  const promotePawn = (piece: "q" | "r" | "b" | "n") => {
    if (!promotionMove) return;

    // Completes the move
    const move = game.move({
      from: promotionMove.from,
      to: promotionMove.to,
      promotion: piece,
    });

    if (move) {
      playSound("promote");
      setFen(game.fen());
      setViewIndex(-1); // jump to live after promotion

      if (mode === "online" && socket && gameId) {
        socket.emit("make_move", {
          gameId,
          from: promotionMove.from,
          to: promotionMove.to,
          promotion: piece,
          clientTimestamp: Date.now(),
        });
      }
    }
    setPromotionMove(null);
    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  // Board position derived from FEN
  const position = useMemo(() => {
    const temp = new Chess(displayFen);

    return (
      temp
        .board()
        // flatMap → transform + flatten
        .flatMap((row, rankIndex) =>
          row.map((piece, fileIndex) => {
            const file = "abcdefgh"[fileIndex];
            const rank = 8 - rankIndex;
            const square = `${file}${rank}`;

            return {
              square,
              piece: piece
                ? piece.color === "w"
                  ? piece.type.toUpperCase()
                  : piece.type
                : null,
            };
          }),
        )
        .reduce(
          (acc, { square, piece }) => {
            acc[square] = piece;
            return acc;
          },
          {} as Record<string, string | null>,
        )
    );
    // Recalculate only when the display position changes
  }, [displayFen]);

  const capturedPieces = useMemo(() => {
    const white: string[] = [];
    const black: string[] = [];

    game.history({ verbose: true }).forEach((move) => {
      if (!move.captured) return;

      if (move.color === "w") {
        // White captured a black piece
        black.push(move.captured);
      } else {
        // Black captured a white piece
        white.push(move.captured.toUpperCase());
      }
    });

    // SORTING GOES HERE (THIS IS THE ANSWER)
    const order = ["p", "n", "b", "r", "q"];

    black.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    white.sort(
      (a, b) => order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase()),
    );

    return {
      white: white.map((p) => pieceToSymbol[p]),
      black: black.map((p) => pieceToSymbol[p]),
    };
  }, [fen]);

  const status = {
    check: game.inCheck(),
    checkmate: game.isCheckmate(),

    draw: game.isDraw() || isDrawDeclared,
    stalemate: game.isStalemate(),
    threefold: game.isThreefoldRepetition(),
    fiftyMove: game.isDrawByFiftyMoves(),
    insufficientMaterial: game.isInsufficientMaterial(),

    gameOver: game.isGameOver() || isResigned || isDrawDeclared || !!isTimeout || isAbandoned,
    resigned: isResigned,
    timeout: !!isTimeout,
    abandoned: isAbandoned,
  };

  const makeBotMove = async (level: string) => {
    if (game.turn() !== botTurn) return;

    const move = await getBotMove(game, level);
    if (!move) return;

    game.move(move);
    setFen(game.fen());

    // bot sound
    if (move.captured) playSound("capture");
    else playSound("moveSelf");

    setTimeout(() => {
      if (game.isCheckmate()) playSound("gameEnd");
      else if (game.inCheck()) playSound("moveCheck");
    }, 100);
  };

  const resign = () => {
    if (status.gameOver) return;
    if (mode === "online" && socket && gameId) {
      socket.emit("resign_game", { gameId });
    } else {
      setIsResigned(true);
      playSound("gameEnd");
    }
  };

  const declareDraw = () => {
    if (status.gameOver) return;
    if (mode === "online" && socket && gameId) {
      socket.emit("offer_draw", { gameId });
    } else {
      setIsDrawDeclared(true);
      playSound("gameEnd");
    }
  };

  const resetGame = () => {
    if (mode === "online" && socket && gameId) {
      socket.emit("request_rematch", { gameId });
      toast({
        title: "Rematch Offered",
        description: "Waiting for opponent to accept...",
      });
      return;
    }

    game.reset();
    setFen(game.fen());
    setViewIndex(-1);
    setSelectedSquare(null);
    setHighlightedSquares([]);
    setPromotionMove(null);
    setHasBotMoved(false);
    setIsResigned(false);
    setIsDrawDeclared(false);
    setIsTimeout(null);
    setIsAbandoned(false);
    setWhiteTime(initialSeconds);
    setBlackTime(initialSeconds);
  };

  const drawReason = (() => {
    if (status.stalemate) return "Stalemate";
    if (status.threefold) return "Threefold repetition";
    if (status.fiftyMove) return "50-move rule";
    if (status.insufficientMaterial) return "Insufficient material";
    if (isDrawDeclared) return "Draw by agreement";
    return null;
  })();

  const gameStatus: GameStatus = isResigned
    ? "resigned"
    : isDrawDeclared
      ? "draw"
      : !!isTimeout
        ? "timeout"
        : game.isCheckmate()
          ? "checkmate"
          : game.isStalemate()
            ? "stalemate"
            : game.isDraw()
              ? "draw"
              : game.inCheck()
                ? "check"
                : "playing";

  // Navigation helpers
  const history = game.history({ verbose: true }) as Move[];
  const liveIndex = history.length - 1; // index of latest move
  const activeIndex = viewIndex === -1 ? liveIndex : viewIndex;

  const resetInteractions = () => {
    setPromotionMove(null);
    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  const goToFirst = () => {
    if (viewIndex === -2) return;
    resetInteractions();
    setViewIndex(history.length > 0 ? -2 : -1);
    playSound("moveSelf");
  };
  const goToPrev = () => {
    if (activeIndex <= -2) return;
    resetInteractions();
    if (activeIndex === 0) {
      setViewIndex(-2);
    } else {
      setViewIndex(activeIndex - 1);
    }
    playSound("moveSelf");
  };
  const goToNext = () => {
    resetInteractions();
    if (viewIndex === -2) {
      setViewIndex(history.length > 0 ? (0 === liveIndex ? -1 : 0) : -1);
      playSound("moveSelf");
      return;
    }
    if (activeIndex >= liveIndex) {
      if (viewIndex !== -1) {
        setViewIndex(-1);
        playSound("moveSelf");
      }
      return;
    }
    const nextIdx = activeIndex + 1;
    setViewIndex(nextIdx === liveIndex ? -1 : nextIdx);
    playSound("moveSelf");
  };
  const goToLast = () => {
    if (viewIndex === -1) return;
    resetInteractions();
    setViewIndex(-1); // live = latest
    playSound("moveSelf");
  };

  // SINGLE RETURN (correct)
  return {
    position,
    selectedSquare,
    highlightedSquares,
    handleSquareClick,
    promotePawn,
    promotionMove,
    kingSquare,
    kingInCheck: displayStatus.check ? kingSquare : null,
    kingInCheckmate: displayStatus.checkmate ? kingSquare : null,
    moves: history,
    turn: currentTurn,
    capturedPieces,
    status,
    drawReason,
    gameStatus,
    resign,
    declareDraw,
    resetGame,
    whiteTime,
    blackTime,
    isTimeout,
    opponentName,
    opponentRating,
    // Navigation
    viewIndex,
    activeIndex,
    goToFirst,
    goToPrev,
    goToNext,
    goToLast,
    canGoBack: history.length > 0 && activeIndex > -2,
    canGoForward:
      viewIndex !== -1 && (viewIndex === -2 || activeIndex < liveIndex),
  };
};
