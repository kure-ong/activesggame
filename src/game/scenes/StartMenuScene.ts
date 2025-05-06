import Phaser from 'phaser';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameConfig';

export default class StartMenuScene extends Phaser.Scene {
  constructor() {
    super('StartMenuScene');
  }

  preload() {
    this.load.image(Assets.Backgrounds.Game, 'assets/game-background.png');
    this.load.image(Assets.Logos.ActiveParents, 'assets/active-parents-logo.png');
    this.load.image(Assets.UI.GameTitle, 'assets/game-title.png');
    this.load.image(Assets.Buttons.LetsPlay, 'assets/lets-play-button.png');
  }

  create() {
    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Game);
    this.add.image(CANVAS_WIDTH / 2, 200, Assets.Logos.ActiveParents);

    this.add.image(CANVAS_WIDTH / 2, 400, Assets.UI.GameTitle);

    // this.add.text(CANVAS_WIDTH / 2, 400, 'Game Title', {
    //   fontSize: '48px',
    //   color: '#ffffff',
    // }).setOrigin(0.5);

    const playButton = this.add
      .image(CANVAS_WIDTH / 2, 800, Assets.Buttons.LetsPlay)
      .setInteractive();

    playButton.on('pointerdown', () => {
      this.scene.start('AvatarSelectionScene');
    });
  }
}
