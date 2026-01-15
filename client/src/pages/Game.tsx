import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChessBoardUI from '../components/ChessBoardUI';
import PlayerPanel from '../components/PlayerPanel';
import MoveList from '../components/MoveList';
import GameControls from '../components/GameControls';
import StatusBanner from '../components/StatusBanner';

// Placeholder data
const gameData = {
  id: 'demo',
  white: {
    name: 'Magnus Carlsen',
    rating: 2847,
    time: '4:32',
    capturedPieces: ['♟', '♟', '♝'],
  },
  black: {
    name: 'Hikaru Nakamura',
    rating: 2785,
    time: '5:15',
    capturedPieces: ['♙', '♙', '♘'],
  },
  moves: [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'a6' },
    { number: 4, white: 'Ba4', black: 'Nf6' },
    { number: 5, white: 'O-O', black: 'Be7' },
    { number: 6, white: 'Re1', black: 'b5' },
    { number: 7, white: 'Bb3', black: 'd6' },
    { number: 8, white: 'c3', black: 'O-O' },
    { number: 9, white: 'h3', black: 'Nb8' },
    { number: 10, white: 'd4', black: 'Nbd7' },
  ],
  status: 'playing' as const,
  currentTurn: 'white' as 'white' | 'black',
};

const Game = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status Banner */}
          <div className="mb-6">
            <StatusBanner status={gameData.status} playerColor="white" />
          </div>

          {/* Game Layout */}
          <div className="grid lg:grid-cols-[1fr_auto_300px] gap-6">
            {/* Left Panel - Move List (Desktop) */}
            <div className="hidden lg:block">
              <MoveList 
                moves={gameData.moves} 
                currentMove={gameData.moves.length * 2}
              />
            </div>

            {/* Center - Board */}
            <div className="flex flex-col gap-4">
              {/* Opponent Panel */}
              <PlayerPanel
                name={gameData.black.name}
                rating={gameData.black.rating}
                time={gameData.black.time}
                isActive={gameData.currentTurn === 'black'}
                isWhite={false}
                capturedPieces={gameData.black.capturedPieces}
              />

              {/* Chess Board */}
              <div className="flex justify-center">
                <ChessBoardUI 
                  size="xl" 
                  showCoordinates 
                  interactive 
                />
              </div>

              {/* Player Panel */}
              <PlayerPanel
                name={gameData.white.name}
                rating={gameData.white.rating}
                time={gameData.white.time}
                isActive={gameData.currentTurn === 'white'}
                isWhite={true}
                capturedPieces={gameData.white.capturedPieces}
              />
            </div>

            {/* Right Panel - Controls */}
            <div className="space-y-4">
              {/* Mobile Move List */}
              <div className="lg:hidden h-48">
                <MoveList 
                  moves={gameData.moves} 
                  currentMove={gameData.moves.length * 2}
                />
              </div>

              {/* Game Controls */}
              <GameControls 
                canGoBack={gameData.moves.length > 0}
                canGoForward={false}
              />

              {/* Game Info Card */}
              <div className="card p-4 space-y-3">
                <h3 className="font-display font-semibold text-foreground text-sm">
                  Game Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Time Control</span>
                    <span className="text-foreground">10+0 Rapid</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Game ID</span>
                    <span className="text-foreground font-mono">{id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Moves</span>
                    <span className="text-foreground">{gameData.moves.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;
