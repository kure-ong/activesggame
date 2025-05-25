import Phaser from 'phaser';
import { Assets } from '../constants/assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT, INPUT_KEYS } from '../constants/gameConfig';
import { playSound } from '../utils/soundHelper';

export default class AvatarSelectionScene extends Phaser.Scene {
  private selectedAvatar: string | null = null;
  private leftKey!: Phaser.Input.Keyboard.Key;
  private rightKey!: Phaser.Input.Keyboard.Key;
  private confirmKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('AvatarSelectionScene');
  }

  preload() {
   
  }

  create() {    
    this.leftKey = this.input.keyboard!.addKey(INPUT_KEYS.LEFT);
    this.rightKey = this.input.keyboard!.addKey(INPUT_KEYS.RIGHT);
    this.confirmKey = this.input.keyboard!.addKey(INPUT_KEYS.CONFIRM);
    
    this.add.image(120,80, Assets.Logos.ActiveParentsWhite).setDepth(999);

    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Game);
    this.add.image(CANVAS_WIDTH / 2, 400, Assets.UI.Header);

    const boy = this.add
      .image(CANVAS_WIDTH / 2 - 230, 800, Assets.Avatars.BoyGrey)
      .setInteractive();
    const girl = this.add
      .image(CANVAS_WIDTH / 2 + 230, 800, Assets.Avatars.GirlGrey)
      .setInteractive();

    const next = this.add
      .image(CANVAS_WIDTH / 2, 1200, Assets.Buttons.Next)
      .setAlpha(0.5)
      .setInteractive();

    this.selectedAvatar = null;
    let selectedIndex = 0; // 0 = boy, 1 = girl

    // Helper function to update UI
    const updateAvatarSelection = () => {
      playSound(this, 'selection');
      if (selectedIndex === 0) {
        this.selectedAvatar = 'boy';
        boy.setTexture(Assets.Avatars.Boy);
        girl.setTexture(Assets.Avatars.GirlGrey);
      } else {
        this.selectedAvatar = 'girl';
        boy.setTexture(Assets.Avatars.BoyGrey);
        girl.setTexture(Assets.Avatars.Girl);
      }
      next.setAlpha(1);
    };

    // Initial selection
    updateAvatarSelection();

    // Helper to select avatar by index
    const selectAvatar = (index: number) => {
      selectedIndex = index;
      updateAvatarSelection();
    };

    // Helper to go next scene if avatar selected
    const nextScene = () => {
      playSound(this, 'buttonPress');
      if (this.selectedAvatar) {
        this.scene.start('InstructionScene', { avatarKey: this.selectedAvatar });
      }
    };

    // Keyboard input
    this.leftKey.on('down', () => selectAvatar(0));
    this.rightKey.on('down', () => selectAvatar(1));
    this.confirmKey.on('down', nextScene);

    // Pointer input
    boy.on('pointerdown', () => selectAvatar(0));
    girl.on('pointerdown', () => selectAvatar(1));
    next.on('pointerdown', nextScene);
  }
}