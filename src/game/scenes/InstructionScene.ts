import Phaser from 'phaser';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT, INPUT_KEYS } from '../constants/gameConfig';
import { playSound } from '../utils/soundHelper';
import { aspectResize } from '../utils/displaySizeUtils';
import next from 'next';

interface GameSceneData {
  avatarKey: string;
}

export default class InstructionScene extends Phaser.Scene {
  private confirmKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('InstructionScene');
  }

  preload() {
  }

  create(data: GameSceneData) {
    this.confirmKey = this.input.keyboard!.addKey(INPUT_KEYS.CONFIRM);
    
    this.add.image(120,80, Assets.Logos.ActiveParentsWhite).setDepth(999);

    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Game);
    
    const gameTitle = this.add.image(CANVAS_WIDTH / 2, 270, Assets.UI.GameTitle).setDepth(1);
    aspectResize(gameTitle, 450);

    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.UI.Instructions);

    const skipButton = this.add
      .image(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.9, Assets.Buttons.Skip)
      .setDepth(2)
      .setInteractive();

    // Helper to go next scene if data for avatar gender exists
    const nextScene = () => {
      playSound(this, 'buttonPress');
      if (data.avatarKey) {
        this.scene.start('GameScene', { avatarKey: data.avatarKey });
      }
    };
    skipButton.on('pointerdown', nextScene);
    this.confirmKey.on('down', nextScene);
    this.time.delayedCall(7000, nextScene);

  }
}
