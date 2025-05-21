import Phaser from 'phaser';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT, INPUT_KEYS } from '../constants/gameConfig';
import { playSound } from '../utils/soundHelper';

export default class StartMenuScene extends Phaser.Scene {
  private confirmKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('StartMenuScene');
  }

  preload() {
    this.load.image(Assets.Backgrounds.Game, 'assets/game-background.png');
    this.load.image(Assets.Logos.ActiveParents, 'assets/active-parents-logo.png');
    this.load.image(Assets.UI.GameTitle, 'assets/game-title.png');
    this.load.image(Assets.Buttons.LetsPlay, 'assets/lets-play-button.png');
    this.load.image(Assets.Backgrounds.IntroChar, 'assets/introchar.png');
  }

  create() {
    this.confirmKey = this.input.keyboard!.addKey(INPUT_KEYS.CONFIRM);

    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Game);
    this.add.image(CANVAS_WIDTH / 2, 250, Assets.Logos.ActiveParents);

    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, Assets.UI.GameTitle);

    this.add.image(0,0,Assets.Backgrounds.IntroChar).setOrigin(0, 0);

    // this.add.text(CANVAS_WIDTH / 2, 400, 'Game Title', {
    //   fontSize: '48px',
    //   color: '#ffffff',
    // }).setOrigin(0.5);

    const playButton = this.add
      .image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 1.9, Assets.Buttons.LetsPlay)
      .setInteractive();

    playButton.on('pointerdown', () => {
      playSound(this, 'buttonPress');
      this.scene.start('AvatarSelectionScene');
    });

    this.confirmKey.on('down', () => {
      playSound(this, 'buttonPress');
      this.scene.start('AvatarSelectionScene')
    });
  }
}
