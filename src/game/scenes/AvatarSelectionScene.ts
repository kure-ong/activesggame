import Phaser from 'phaser';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameConfig';

export default class AvatarSelectionScene extends Phaser.Scene {
  private selectedAvatar: string | null = null;

  constructor() {
    super('AvatarSelectionScene');
  }

  preload() {
    this.load.image(Assets.Backgrounds.Game, 'assets/game-background.png');
    this.load.image(Assets.UI.Header, 'assets/choose-avatar-header.png');
    this.load.image(Assets.Avatars.Boy, 'assets/avatar-boy.png');
    this.load.image(Assets.Avatars.Girl, 'assets/avatar-girl.png');
    this.load.image(Assets.Buttons.Start, 'assets/start-button.png');
  }

  create() {
    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Game);
    this.add.image(CANVAS_WIDTH / 2, 200, Assets.UI.Header);

    const boy = this.add
      .image(CANVAS_WIDTH / 2 - 150, 600, Assets.Avatars.Boy)
      .setInteractive();
    const girl = this.add
      .image(CANVAS_WIDTH / 2 + 150, 600, Assets.Avatars.Girl)
      .setInteractive();

    const start = this.add
      .image(CANVAS_WIDTH / 2, 900, Assets.Buttons.Start)
      .setAlpha(0.5)
      .setInteractive();

    boy.on('pointerdown', () => {
      this.selectedAvatar = 'boy';
      boy.setTint(0x00ff00);
      girl.clearTint();
      start.setAlpha(1);
    });

    girl.on('pointerdown', () => {
      this.selectedAvatar = 'girl';
      girl.setTint(0x00ff00);
      boy.clearTint();
      start.setAlpha(1);
    });

    start.on('pointerdown', () => {
      if (this.selectedAvatar) {
        this.scene.start('GameScene', { avatar: this.selectedAvatar });
        // this.scene.start('GameFinishScene');
      }
    });
  }
}
