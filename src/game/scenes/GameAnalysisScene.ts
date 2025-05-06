import Phaser from 'phaser';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameConfig';

export default class GameAnalysisScene extends Phaser.Scene {
  constructor() {
    super('GameAnalysisScene');
  }

  preload() {
    this.load.image(Assets.Backgrounds.Game, 'assets/game-background.png');
    this.load.image(Assets.UI.Analysis1, 'assets/game-analysis1.png');
    this.load.image(Assets.UI.Analysis2, 'assets/game-analysis2.png');
    this.load.image(Assets.UI.Analysis3, 'assets/game-analysis3.png');
    this.load.image(Assets.Buttons.Done, 'assets/done-button.png');
    this.load.spritesheet(Assets.Animations.Confetti, 'assets/confetti.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create() {
    // this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Play);
    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Game);

    // this.add.text(CANVAS_WIDTH / 2, 200, "Congratulations, you're a family of", {
    //   fontSize: '36px',
    //   color: '#ffffff',
    // }).setOrigin(0.5);

    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100, Assets.UI.Analysis1).setDepth(2);

    const doneButton = this.add.image(CANVAS_WIDTH / 2, 1650, Assets.Buttons.Done).setInteractive();
    doneButton.on('pointerdown', () => {
      this.scene.start('StartMenuScene');
    });

    this.anims.create({
      key: 'popper',
      frames: this.anims.generateFrameNumbers(Assets.Animations.Confetti, {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    for (let i = 0; i < 3; i++) {
      const popper = this.add.sprite(300 + i * 200, 0, Assets.Animations.Confetti).setDepth(1);
      popper.play('popper');
      this.tweens.add({
        targets: popper,
        y: 960,
        duration: 2000,
        repeat: -1,
        yoyo: true,
        delay: i * 200,
      });
    }
  }
}
