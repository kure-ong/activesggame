import Phaser from 'phaser';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;
export const LANES_X = [150, 540, 930];
export const MAX_QUESTIONS = 5;
export const QUESTION_TIME_LIMIT = 12000 // 1000 = 1 sec
export const PRESS_TARGET = 1;
export const GO_TIMER_DURATION = 3;
// export const GO_TIMER_DURATION = 1;
export const GAME_DURATION = 60;
// export const GAME_DURATION = 5;
export const MODAL_DURATION = 5100; //1000 = 1 sec

// Key bindings (can swap values easily later)
export const INPUT_KEYS = {
  LEFT: Phaser.Input.Keyboard.KeyCodes.COMMA,     // < key
  RIGHT: Phaser.Input.Keyboard.KeyCodes.PERIOD,   // > key
  CONFIRM: Phaser.Input.Keyboard.KeyCodes.D       // D key
  // can switch to left/right arrow and enter key:
  // LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
  // RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  // CONFIRM: Phaser.Input.Keyboard.KeyCodes.ENTER
};