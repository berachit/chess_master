export const calculateElo = ({ whiteRating, blackRating, result }) => {
  const k = 32;

  const expectedWhite =
    1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
  const expectedBlack =
    1 / (1 + Math.pow(10, (whiteRating - blackRating) / 400));
    
  let actualWhite;
  let actualBlack;

  if (result === "white_win") {
    actualWhite = 1;
    actualBlack = 0;
  } else if (result === "black_win") {
    actualWhite = 0;
    actualBlack = 1;
  } else {
    actualWhite = 0.5;
    actualBlack = 0.5;
  }

  const newWhiteRating = Math.round(
    whiteRating + k * (actualWhite - expectedWhite),
  );
  const newBlackRating = Math.round(
    blackRating + k * (actualBlack - expectedBlack),
  );

  return { newWhiteRating, newBlackRating };
};
