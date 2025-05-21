import Phaser from 'phaser';
import { startConfettiSequence } from '../utils/confettiAnim';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT, INPUT_KEYS } from '../constants/gameConfig';
import { playSound } from '../utils/soundHelper';

interface GameSceneData {
  score: number;
}

let confettiTweens: Phaser.Tweens.Tween[] = [];

export default class GameAnalysisScene extends Phaser.Scene {
  private poppers: Phaser.GameObjects.Sprite[] = [];
  private confirmKey!: Phaser.Input.Keyboard.Key;
  
  constructor() {
    super('GameAnalysisScene');
  }

  preload() {
    this.load.image(Assets.UI.Analysis1, 'assets/game-analysis1.png');
    this.load.image(Assets.UI.Analysis2, 'assets/game-analysis2.png');
    this.load.image(Assets.UI.Analysis3, 'assets/game-analysis3.png');
    this.load.image(Assets.Buttons.Done, 'assets/done-button.png');
  }

  create(data: GameSceneData) {
    let analysisImageKey: string;

    this.add.image(120,80, Assets.Logos.ActiveParentsWhite).setDepth(999);

    this.confirmKey = this.input.keyboard!.addKey(INPUT_KEYS.CONFIRM);

    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Game);

    confettiTweens = startConfettiSequence(this, Assets.Animations.Confetti, CANVAS_WIDTH, CANVAS_HEIGHT);

    // this.add.text(CANVAS_WIDTH / 2, 200, "Congratulations, you're a family of", {
    //   fontSize: '36px',
    //   color: '#ffffff',
    // }).setOrigin(0.5);
    if (data.score >= 55) {
      analysisImageKey = Assets.UI.Analysis1;
    } else if (data.score >= 31) {
      analysisImageKey = Assets.UI.Analysis2;
    } else {
      analysisImageKey = Assets.UI.Analysis3;
    }
    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, analysisImageKey).setDepth(2);

    const doneButton = this.add.image(CANVAS_WIDTH / 2, 1650, Assets.Buttons.Done).setInteractive();
    doneButton.on('pointerdown', () => this.endScene());
    this.confirmKey.on('down', () => this.endScene());
  }

  private endScene() {
    playSound(this, 'buttonPress');
    if (confettiTweens) confettiTweens.forEach(tween => tween.stop());
    this.scene.start('StartMenuScene');
  }
}
