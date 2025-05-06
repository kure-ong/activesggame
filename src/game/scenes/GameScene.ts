import Phaser from 'phaser';
import { getRandomQuestions, Question } from '../questionBank';
import { GamepadHandler } from '../utils/gamepadUtils';
import { formatTime } from '../utils/formatTime';
import { updateAnswerHighlights } from '../utils/highlightUtils';
import { Assets } from '../constants/assets';
import {
  LANES_X,
  MAX_QUESTIONS,
  PRESS_TARGET,
  GAME_DURATION,
  GO_TIMER_DURATION,
} from '../constants/gameConfig';

interface GameSceneData {
  avatar: string;
}

const USE_GAMEPAD = false; // ← toggle this to false to use keyboard

export default class GameScene extends Phaser.Scene {
  private avatar!: Phaser.GameObjects.Sprite;
  private questions: Question[] = [];
  private currentQuestionIndex = 0;
  private goTimerText!: Phaser.GameObjects.Text;
  private gameTimerText!: Phaser.GameObjects.Text;
  private gameCountdownValue = GAME_DURATION;
  private gameCountdownInterval!: Phaser.Time.TimerEvent;
  private answerTexts: Phaser.GameObjects.Text[] = [];
  private buttonPressCount = 0;
  private selectedLane = 1;
  private modal!: Phaser.GameObjects.Container;
  private goCountdown = GO_TIMER_DURATION;
  private questionBox!: Phaser.GameObjects.Container;
  private padHandler = new GamepadHandler();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private inputLocked = false;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image(Assets.Backgrounds.Play, 'assets/play-background.png');
    this.load.image(Assets.UI.Track, 'assets/racetrack.png');
    this.load.image(Assets.Avatars.RunBoy, 'assets/run-boy.png');
    this.load.image(Assets.Avatars.RunGirl, 'assets/run-girl.png');
    this.load.image(Assets.UI.Modal, 'assets/modal-background.png');
  }

  create(data: GameSceneData) {
    this.add.image(540, 960, Assets.Backgrounds.Play);
    this.add.image(540, 1400, Assets.UI.Track);

    if (!USE_GAMEPAD) {
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
    
    const avatarKey =
      data.avatar === 'boy' ? Assets.Avatars.RunBoy : Assets.Avatars.RunGirl;
    this.avatar = this.add.sprite(LANES_X[this.selectedLane], 1200, avatarKey);

    this.questions = getRandomQuestions();

    this.gameTimerText = this.add
      .text(540, 50, formatTime(this.gameCountdownValue), {
        fontSize: '48px',
        color: '#fff',
      })
      .setOrigin(0.5);

    this.startGameCountdown();
    this.startGoTimer();
  }

  startGameCountdown() {
    this.gameCountdownInterval = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.gameCountdownValue--;
        this.gameTimerText.setText(formatTime(this.gameCountdownValue));
        if (this.gameCountdownValue <= 0) this.endGame();
      },
    });
  }

  startGoTimer() {
    this.questionBox?.destroy();

    const question = this.questions[this.currentQuestionIndex];
    this.goCountdown = GO_TIMER_DURATION;
    this.goTimerText = this.add
      .text(540, 300, this.goCountdown.toString(), {
        fontSize: '72px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.goCountdown--;
        if (this.goCountdown > 0) {
          this.goTimerText.setText(this.goCountdown.toString());
        } else if (this.goCountdown === 0) {
          this.goTimerText.setText('Go!');
        } else {
          this.goTimerText.destroy();
          this.displayQuestion(question);
        }
      },
    });
  }

  displayQuestion(question: Question) {
    this.buttonPressCount = 0;
    this.questionBox?.destroy();

    const topicText = this.add
      .text(540, 150, question.topic, {
        fontSize: '36px',
        color: '#fff',
      })
      .setOrigin(0.5);

    const questionText = this.add
      .text(540, 250, question.question, {
        fontSize: '32px',
        color: '#fff',
        wordWrap: { width: 800 },
      })
      .setOrigin(0.5);

    this.answerTexts = question.answers.map((answer, i) =>
      this.add
        .text(LANES_X[i], 400, answer, {
          fontSize: '28px',
          color: '#fff',
          backgroundColor: i === this.selectedLane ? '#4444ff' : undefined,
        })
        .setOrigin(0.5)
    );

    this.questionBox = this.add.container(0, 0, [
      topicText,
      questionText,
      ...this.answerTexts,
    ]);
  }

  update() {
    if (!this.inputLocked) {
      if (USE_GAMEPAD) {
        const pads = navigator.getGamepads();
        const pad = pads[0];
        if (!pad) return;
    
        // Left
        if (this.padHandler.isButtonJustPressed(pad, 14) && this.selectedLane > 0) {
          this.selectedLane--;
          this.avatar.setX(LANES_X[this.selectedLane]);
          updateAnswerHighlights(this.answerTexts, this.selectedLane);
        }
    
        // Right
        if (this.padHandler.isButtonJustPressed(pad, 15) && this.selectedLane < 2) {
          this.selectedLane++;
          this.avatar.setX(LANES_X[this.selectedLane]);
          updateAnswerHighlights(this.answerTexts, this.selectedLane);
        }
    
        // Confirm
        if (pad.buttons.some(btn => btn.pressed)) {
          this.buttonPressCount++;
          if (this.buttonPressCount >= PRESS_TARGET) {
            this.registerAnswer();
          }
        }
    
      } else {
        // Keyboard mode
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) && this.selectedLane > 0) {
          this.selectedLane--;
          this.avatar.setX(LANES_X[this.selectedLane]);
          updateAnswerHighlights(this.answerTexts, this.selectedLane);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) && this.selectedLane < 2) {
          this.selectedLane++;
          this.avatar.setX(LANES_X[this.selectedLane]);
          updateAnswerHighlights(this.answerTexts, this.selectedLane);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
          this.buttonPressCount++;
          if (this.buttonPressCount >= PRESS_TARGET) {
            this.registerAnswer();
          }
        }
      }
    }
  }

  registerAnswer() {
    const current = this.questions[this.currentQuestionIndex];
    const isCorrect = this.selectedLane === current.correctIndex;
    this.showModal(isCorrect);
  }

  showModal(isCorrect: boolean) {
    const question = this.questions[this.currentQuestionIndex];
    this.inputLocked = true; 
    this.gameCountdownInterval.paused = true;

    const bg = this.add.image(540, 960, Assets.UI.Modal);
    const text = this.add
      .text(540, 960, isCorrect ? 'Correct!' : 'Wrong!', {
        fontSize: '64px',
        color: '#fff',
      })
      .setOrigin(0.5);

    this.modal = this.add.container(0, 0, [bg, text])
      .setAlpha(0) // start fully transparent
      .setDepth(2);

    this.tweens.add({
      targets: this.modal,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: this.modal,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (this.modal && this.modal.active) {
            this.modal.destroy();
            this.inputLocked = false;
            this.gameCountdownInterval.paused = false;
            this.currentQuestionIndex++;
    
            if (
              this.currentQuestionIndex < MAX_QUESTIONS &&
              this.gameCountdownValue > 0
            ) {
              // this.startGoTimer();
              this.displayQuestion(question);
            } else {
              this.endGame();
            }
          }
        },
      });
    });
  }

  endGame() {
    // this.scene.start('GameFinishScene',{ avatar: this.avatar });
  }
}
