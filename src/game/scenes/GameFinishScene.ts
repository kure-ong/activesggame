import Phaser from 'phaser';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameConfig';

interface GameSceneData {
  avatarKey: string;
  score: number;
}

export default class GameFinishScene extends Phaser.Scene {
  private avatarAnim!: Phaser.GameObjects.Image;
  private poppers: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super('GameFinishScene');
  }

  preload() {
    this.load.image(Assets.Backgrounds.Finish, 'assets/finish-background.png');
    this.load.image(Assets.Backgrounds.Sky, 'assets/sky.png');
    this.load.image(Assets.Backgrounds.Racetrack, 'assets/racetrack.png');
    this.load.image(Assets.Avatars.CelebrateBoy, 'assets/avatar-celebrate-boy.png');
    this.load.image(Assets.Avatars.CelebrateGirl, 'assets/avatar-celebrate-girl.png');
    // this.load.spritesheet(Assets.Avatars.CelebrateGirl, 'assets/avatar-celebrate-girl.png', {
    //   frameWidth: 200,
    //   frameHeight: 300,
    // });
    this.load.spritesheet(Assets.Animations.Confetti, 'assets/confetti.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create(data: GameSceneData) {
    console.log('Avatar:', data.avatarKey);
    console.log('Score:', data.score);
    const skyBg = this.add.image(CANVAS_WIDTH / 2, 0, Assets.Backgrounds.Sky);
    const Racetrack = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Racetrack);
    skyBg.setOrigin(skyBg.originX, 0);
    Racetrack.setOrigin(Racetrack.originX, 0);
    
    // const avatarAnim = this.add.sprite(CANVAS_WIDTH / 2, 1200, Assets.Avatars.CelebrateBoy);
    // this.anims.create({
    //   key: 'celebrate',
    //   frames: this.anims.generateFrameNumbers(Assets.Avatars.CelebrateBoy, {
    //     start: 0,
    //     end: 5,
    //   }),
    //   frameRate: 20,
    //   repeat: -1,
    // });
    const startX = CANVAS_WIDTH * -2;
    const startY = CANVAS_HEIGHT * 2;
    const endX = CANVAS_WIDTH * 0.5;
    const endY = CANVAS_HEIGHT * 0.5;
    // Control point for the hill peak 
    const controlX = (startX + endX) / 2;
    const controlY = CANVAS_HEIGHT * 1.2; // Higher Y = lower visually on screen

    const avatarKey =
      data.avatarKey === 'boy' ? Assets.Avatars.CelebrateBoy : Assets.Avatars.CelebrateGirl;
    const avatar = this.add.image(startX, startY, avatarKey);
    avatar.setScale(4);

    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(startX, startY),
      new Phaser.Math.Vector2(controlX, controlY),
      new Phaser.Math.Vector2(endX, endY)
    );

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue();
        const point = curve.getPoint(t);
        avatar.setPosition(point.x, point.y);
        // Interpolate scale from 1.2 to 1.0
        const newScale = 4 - (3 * t);
        avatar.setScale(newScale);
      },
      onComplete: () => {
        console.log('Avatar landed in center.');
      }
    });
    // avatar.play('celebrate');

    this.anims.create({
      key: 'popper',
      frames: this.anims.generateFrameNumbers(Assets.Animations.Confetti, {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    for (let i = 0; i < 5; i++) {
      const popper = this.add.sprite(200 + i * 200, 0, Assets.Animations.Confetti);
      popper.play('popper');
      this.poppers.push(popper); // store poppers

      this.tweens.add({
        targets: popper,
        y: 960,
        duration: 1500,
        repeat: -1,
        yoyo: true,
        delay: i * 300,
      });
    }

    this.time.delayedCall(4000, () => {
      this.poppers.forEach((popper) => {
        this.tweens.killTweensOf(popper);
        // popper.stop();
        popper.destroy();
        this.anims.remove('popper');
      });

      this.scene.start('GameAnalysisScene', {
        score: data.score
      });
    });
  }
}
