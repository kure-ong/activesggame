import Phaser from 'phaser';
import { getRandomQuestions, Question } from '../questionBank';
import { GamepadHandler } from '../utils/gamepadUtils';
import { formatTime } from '../utils/formatTime';
import { updateAnswerHighlights } from '../utils/highlightUtils';
import { Assets } from '../constants/assets';
import {
  LANES_X,
  MAX_QUESTIONS,
  QUESTION_TIME_LIMIT,
  PRESS_TARGET,
  GAME_DURATION,
  GO_TIMER_DURATION,
  MODAL_DURATION,
} from '../constants/gameConfig';
import { globalTextStyle } from '../constants/textStyle';

interface GameSceneData {
  avatar: string;
}

const USE_GAMEPAD = false; // ← toggle this to false to use keyboard

export default class GameScene extends Phaser.Scene {
  private avatar!: Phaser.GameObjects.Sprite;
  private questions: Question[] = [];
  private currentQuestionIndex = 0;
  private currentQuestion!: Question;
  private goTimerText!: Phaser.GameObjects.Text;
  private goTimerEvent!: Phaser.Time.TimerEvent;
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
  private timerBarBg!: Phaser.GameObjects.Image;
  private timerBarInner!: Phaser.GameObjects.Image;
  private timerBarIcon!: Phaser.GameObjects.Image;
  private timerBarWidth!: number;
  private autoSkipTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image(Assets.Backgrounds.Play, 'assets/play-background.png');
    this.load.image(Assets.UI.Track, 'assets/racetrack.png');
    this.load.image(Assets.Avatars.RunBoy, 'assets/run-boy.png');
    this.load.image(Assets.Avatars.RunGirl, 'assets/run-girl.png');
    this.load.image(Assets.UI.QuestionBox, 'assets/questionbox-background.png');
    this.load.image(Assets.UI.Modal, 'assets/modal-background.png');
    this.load.image(Assets.UI.TimerBar, 'assets/timerbar.png');
    this.load.image(Assets.UI.TimerBarInner, 'assets/timerbar-inner.png');
    this.load.image(Assets.UI.TimerBarIcon, 'assets/timerbar-icon.png');
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
        ...globalTextStyle
      })
      .setOrigin(0.5);

    this.startGameCountdown();
    this.startGoTimer();
  }

  update() {
    if (!this.inputLocked) {
      if (USE_GAMEPAD) {
        const pads = navigator.getGamepads();
        const pad = pads[0];
        if (!pad) return;
    
        // Left
        if (this.padHandler.isButtonJustPressed(pad, 14) && this.selectedLane > 0) {
          this.moveLane(-1);
        }
    
        // Right
        if (this.padHandler.isButtonJustPressed(pad, 15) && this.selectedLane < 2) {
          this.moveLane(1);
        }
    
        // Confirm
        if (pad.buttons.some(btn => btn.pressed)) {
          this.runToAnswer();
        }
    
      } else {
        // Keyboard mode
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) && this.selectedLane > 0) {
          this.moveLane(-1);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) && this.selectedLane < 2) {
          this.moveLane(1);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
          this.runToAnswer();
        }
      }
    }
  }

  private moveLane(direction: -1 | 1) {
    this.selectedLane += direction;
    this.avatar.setX(LANES_X[this.selectedLane]);
    updateAnswerHighlights(this.answerTexts, this.selectedLane);
  }

  private runToAnswer() {
    this.buttonPressCount++;
    if (this.buttonPressCount >= PRESS_TARGET) {
      this.registerAnswer();
    }
  }

  private startGameCountdown() {
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

  private startGoTimer() {
    this.questionBox?.destroy();
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.goCountdown = GO_TIMER_DURATION;

    this.goTimerText = this.add
      .text(540, 300, this.goCountdown.toString(), {
        fontSize: '72px',
        ...globalTextStyle
      })
      .setOrigin(0.5);

      this.goTimerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.goCountdown--;
        if (this.goCountdown > 0) {
          this.goTimerText.setText(this.goCountdown.toString());
        } else if (this.goCountdown === 0) {
          this.goTimerText.setText('Go!');
        } else {
          this.goTimerEvent.remove();
          this.goTimerText.destroy();
          this.displayQuestion(this.currentQuestion);
          console.log('start go timer complete');
        }
      },
    });
  }

  private displayQuestion(question: Question) {
    this.buttonPressCount = 0;
    this.questionBox?.destroy();
  
    const topicText = this.add.text(540, 150, question.topic, {
      ...globalTextStyle,
      fontSize: '36px',
    }).setOrigin(0.5);
  
    const questionText = this.add.text(540, 250, question.question, {
      ...globalTextStyle,
      fontSize: '32px',
      wordWrap: { width: 800 },
    }).setOrigin(0.5);
  
    this.answerTexts = question.answers.map((answer, i) =>
      this.add.text(LANES_X[i], 400, answer, {
        ...globalTextStyle,
        fontSize: '28px',
        color: '#fff',
        backgroundColor: i === this.selectedLane ? '#4444ff' : undefined,
      }).setOrigin(0.5)
    );
  
    this.questionBox = this.add.container(0, 0, [topicText, questionText, ...this.answerTexts]);
  
    this.createTimerBar(200,500,QUESTION_TIME_LIMIT);
  
  }

  private createTimerBar(x: number, y: number, duration: number) {
    // 🔄 Reset timer bar if it exists
    this.timerBarContainer?.destroy();
  
    const bg = this.add.image(0, 0, Assets.UI.TimerBar).setOrigin(0.5);
    const inner = this.add.image(0, 0, Assets.UI.TimerBarInner).setOrigin(0.5);
    const icon = this.add.image(0, 0, Assets.UI.TimerBarIcon).setOrigin(0, 0.5);
    icon.setX(-bg.width / 2 - icon.width / 2);
    const fullWidth = inner.width;

    this.timerBarContainer = this.add.container(x, y, [bg, inner, icon]); 
  
    // 💡 Set up countdown animation via tween (right to left)
    this.tweens.addCounter({
      from: fullWidth,
      to: 0,
      duration: duration,
      ease: 'Linear',
      onUpdate: (tween) => {
        const value = tween.getValue();
        const cropX = fullWidth - value;
        // Shrink from right to left
        inner.setCrop(cropX, 0, fullWidth, inner.height);
        inner.setX(-cropX-9);
      },
      onComplete: () => {
        console.log('Tween complete');
        if (!this.inputLocked) {
          this.registerAnswer(); // auto-submit if player didn't respond
        }
      }
    });
  }

  private registerAnswer() {
    
    const isCorrect = this.selectedLane === this.currentQuestion.correctIndex;

    if (isCorrect) {
      this.currentQuestionIndex++;
      this.goToNextQuestion();
    } else {
      this.showModal(false);
    }
  }

  private showModal(isCorrect: boolean) {
    this.inputLocked = true;
    this.gameCountdownInterval.paused = true;

    const bg = this.add.image(0,0, Assets.UI.Modal).setOrigin(0.5);
    const text = this.add
      .text(-bg.width / 2 + 40, 40, isCorrect ? 'Correct!' : this.currentQuestion.didYouKnow, {
        ...globalTextStyle,
        fontSize: '32px',
        color: '#000',
        align: 'left',
        wordWrap: { width: bg.width - 300, useAdvancedWrap: true },
      })
      .setOrigin(0, 0.5);

    this.modal = this.add.container(540, 960, [bg, text])
      .setAlpha(0)
      .setDepth(2);

    this.modal.setSize(bg.width,bg.height);

    this.tweens.add({
      targets: this.modal,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    this.time.delayedCall(MODAL_DURATION, () => {
      this.tweens.add({
        targets: this.modal,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          this.modal.destroy();
          this.inputLocked = false;
          this.gameCountdownInterval.paused = false;
          this.currentQuestionIndex++;
          this.goToNextQuestion();
        },
      });
    });
  }

  private goToNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length && this.gameCountdownValue > 0) {
      if (this.currentQuestionIndex === 0) {
        this.startGoTimer();
      } else {
        this.currentQuestion = this.questions[this.currentQuestionIndex];
        this.displayQuestion(this.currentQuestion);
      }
    } else {
      this.endGame();
    }
  }

  private endGame() {
    // this.scene.start('GameFinishScene',{ avatar: this.avatar });
  }
}
