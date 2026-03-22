import capture from "@/assets/sounds/capture.mp3";
import moveSelf from "@/assets/sounds/move-self.mp3";
import castle from "@/assets/sounds/castle.mp3";
import gameEnd from "@/assets/sounds/game-end.mp3";
import gameStart from "@/assets/sounds/game-start.mp3";
import illegal from "@/assets/sounds/illegal.mp3";
import moveCheck from "@/assets/sounds/move-check.mp3";
import promote from "@/assets/sounds/promote.mp3";
import tenseconds from "@/assets/sounds/tenseconds.mp3";


export const sounds = {
  moveSelf: new Audio(moveSelf),
  capture: new Audio(capture),
  castle: new Audio(castle),
  gameEnd: new Audio(gameEnd),
  gameStart: new Audio(gameStart),
  illegal: new Audio(illegal),
  moveCheck: new Audio(moveCheck),
  promote: new Audio(promote),
  tenseconds: new Audio(tenseconds),
} as const;

export type SoundKeys = keyof typeof sounds;

export const playSound = (key : SoundKeys) => {
    const sound = sounds[key];
    if(!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
}