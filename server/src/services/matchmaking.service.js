import { matchmakingQueue } from "../utils/matchmaking.queue.js";

const MAX_RATING_DIFF = 250;

export const addPlayerToQueue = async ({
  userId,
  username,
  rating,
  socketId,
  timeControl,
}) => {
  const targetId = userId.toString();
  const queue = matchmakingQueue[timeControl.type];

  const alreadyQueued = queue.some(
    (player) => player.userId.toString() === targetId,
  );

  if (alreadyQueued) {
    throw new Error("Player is already in queue");
  }

  const player = {
    userId,
    username,
    rating,
    socketId,
    timeControl,
    joinedAt: Date.now(),
  };

  queue.push(player);

  return player;
};

export const removePlayerFromQueue = async (userId) => {
  let playerRemoved = false;
  const targetId = userId.toString();

  for (const type in matchmakingQueue) {
    const index = matchmakingQueue[type].findIndex(
      (player) => player.userId.toString() === targetId,
    );

    if (index !== -1) {
      matchmakingQueue[type].splice(index, 1);
      playerRemoved = true;
    }
  }

  return playerRemoved;
};

export const findMatchAndExtract = ({ userId, rating, timeControl }) => {
  const queue = matchmakingQueue[timeControl.type];

  if (!queue) {
    throw new Error("Invalid time control type");
  }

  const targetId = userId.toString();

  const opponentIndex = queue.findIndex(
    (player) =>
      player.userId.toString() !== targetId &&
      Math.abs(player.rating - rating) <= MAX_RATING_DIFF,
  );

  if (opponentIndex === -1) {
    return null;
  }

  return queue.splice(opponentIndex, 1)[0];
};
