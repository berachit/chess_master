export interface GameAnalytics {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  gamesAsWhite: number;
  gamesAsBlack: number;
  whiteWins: number;
  blackWins: number;
  currentRating: number;
  avgOpponentRating: number;
  winRate: number;
  whiteWinRate: number;
  blackWinRate: number;
}
