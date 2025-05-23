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

    const nextScene = () => {
      playSound(this, 'buttonPress');
      this.scene.start('AvatarSelectionScene');
    };
    
    playButton.on('pointerdown', nextScene);
    this.confirmKey.on('down', nextScene);

  }
}
