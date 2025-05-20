import Phaser from 'phaser';
import { startConfettiSequence } from '../utils/confettiAnim';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameConfig';
import { aspectResize } from '../utils/displaySizeUtils';

interface GameSceneData {
  avatarKey: string;
  score: number;
}

let confettiTweens: Phaser.Tweens.Tween[] = [];

export default class GameFinishScene extends Phaser.Scene {
  private avatarAnim!: Phaser.GameObjects.Image;
  private poppers: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super('GameFinishScene');
  }

  preload() {
    this.load.image(Assets.Avatars.CelebrateBoy, 'assets/avatar-celebrate-boy.png');
    this.load.image(Assets.Avatars.CelebrateGirl, 'assets/avatar-celebrate-girl.png');
    this.load.image(Assets.Animations.RibbonLeft, 'assets/ribbon-left.png');
    this.load.image(Assets.Animations.RibbonRight, 'assets/ribbon-right.png');
    this.load.image(Assets.Animations.Confetti, 'assets/confetti.png')
    // this.load.spritesheet(Assets.Animations.Confetti, 'assets/confetti.png', {
    //   frameWidth: 128,
    //   frameHeight: 128,
    // });
  }

  create(data: GameSceneData) {
    console.log('Avatar:', data.avatarKey);
    console.log('Score:', data.score);
    // const skyBg = this.add.image(CANVAS_WIDTH / 2, 0, Assets.Backgrounds.Sky);
    // skyBg.setOrigin(skyBg.originX, 0);

    const skyBg = this.add.image(CANVAS_WIDTH / 2, -100, Assets.Backgrounds.Sky).setOrigin(0.5, 0);
    aspectResize(skyBg,CANVAS_WIDTH);
    
    const cloudsImg = this.add.image(CANVAS_WIDTH / 2, -250, Assets.Backgrounds.Clouds).setOrigin(0.5, 0);
    aspectResize(cloudsImg,CANVAS_WIDTH * 2.4);

    const finishLine = this.add.image(CANVAS_WIDTH / 2, 350, Assets.Backgrounds.FinishLine).setOrigin(0.5, 0);
    aspectResize(finishLine,CANVAS_WIDTH*1.3);

    const Racetrack = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 1.8, Assets.Backgrounds.Racetrack);
    Racetrack.setOrigin(Racetrack.originX, 0);
    aspectResize(Racetrack,CANVAS_WIDTH*1.3);

    const parents = this.add.sprite(CANVAS_WIDTH / 1.4, CANVAS_HEIGHT / 2.1, Assets.Parents.Sprite);
    aspectResize(parents,700);

    this.anims.create({
      key: 'wave',
      frames: this.anims.generateFrameNumbers(Assets.Parents.Sprite, { start: 0, end: 1 }),
      frameRate: 4, // Adjust to your preference (e.g. 4–8)
      repeat: -1    // -1 = loop forever
    });

    parents.play('wave');

    const ribbonLeft = this.add.image(-70, CANVAS_HEIGHT/2+320, Assets.Animations.RibbonLeft).setOrigin(0, 0.5);
    const ribbonRight = this.add.image(CANVAS_WIDTH+80, CANVAS_HEIGHT/2+250, Assets.Animations.RibbonRight).setOrigin(1, 0.5);

    aspectResize(ribbonLeft,CANVAS_WIDTH/1.35);
    aspectResize(ribbonRight,CANVAS_WIDTH/1.5);

    const startX = CANVAS_WIDTH * -2;
    const startY = CANVAS_HEIGHT * 2;
    const endX = CANVAS_WIDTH * 0.5;
    const endY = CANVAS_HEIGHT * 0.65;
    // Control point for the hill peak 
    const controlX = (startX + endX) / 2;
    const controlY = CANVAS_HEIGHT * 1.7; // Higher Y = lower visually on screen

    const avatarKey =
      data.avatarKey === 'boy' ? Assets.Avatars.CelebrateBoy : Assets.Avatars.CelebrateGirl;
    const avatar = this.add.image(startX, startY, avatarKey);

    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(startX, startY),
      new Phaser.Math.Vector2(controlX, controlY),
      new Phaser.Math.Vector2(endX, endY)
    );

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1500,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue();
        const point = curve.getPoint(t);
        avatar.setPosition(point.x, point.y);
        const newScale = 7 - (6 * t);
        avatar.setScale(newScale);
      },
      onComplete: () => {
        console.log('Avatar landed in center.');
      }
    });
    
    
    this.time.delayedCall(1400, () => {
      confettiTweens = startConfettiSequence(this, Assets.Animations.Confetti, CANVAS_WIDTH, CANVAS_HEIGHT);
    });

    const delay = 1360;

    // Ribbon Left Tween
    this.tweens.add({
      targets: ribbonLeft,
      angle: -15,
      x: ribbonLeft.x - 100,
      alpha: 0,
      duration: 700,
      delay: delay,
      ease: 'Sine.easeInOut',
      onComplete: () => ribbonLeft.destroy()
    });

    // Ribbon Right Tween
    this.tweens.add({
      targets: ribbonRight,
      angle: 15,
      x: ribbonRight.x + 100,
      alpha: 0,
      duration: 700,
      delay: delay,
      ease: 'Sine.easeInOut',
      onComplete: () => ribbonRight.destroy()
    });



    this.time.delayedCall(4000, () => {
      if (confettiTweens) confettiTweens.forEach(tween => tween.stop());
      this.scene.start('GameAnalysisScene', {
        score: data.score
      });
    });
  }
}
