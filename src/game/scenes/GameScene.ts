import Phaser from 'phaser';
import { getRandomQuestions, Question } from '../questionBank';
import { GamepadHandler } from '../utils/gamepadUtils';
import { formatTime } from '../utils/formatTime';
import { updateAnswerHighlights } from '../utils/highlightUtils';
import { Assets } from '../constants/assets';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
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
  avatarKey: string;
}

const USE_GAMEPAD = false; // ← toggle this to false to use keyboard

export default class GameScene extends Phaser.Scene {
  private avatar!: Phaser.GameObjects.Sprite;
  private avatarKey: string | null = null;
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
  private originalLaneWidth!: number;
  private originalLaneHeight!: number;
  private laneOptions!: Phaser.GameObjects.Image;
  private laneStep = 50; // pixels to move per press
  private laneTargetY = 600; // match this.avatar.y
  private laneReachedTarget = false;
  private isLaneAnimating = false;
  private modal!: Phaser.GameObjects.Container;
  private goCountdown = GO_TIMER_DURATION;
  private questionBox!: Phaser.GameObjects.Container;
  private padHandler = new GamepadHandler();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private inputLocked = true;
  private timerBarTween?: Phaser.Tweens.Tween;
  private timerBarContainer!: Phaser.GameObjects.Container;
  private autoSkipTimer!: Phaser.Time.TimerEvent;
  private score = 0;

  constructor() {
    super('GameScene');
  }

  preload() {
    // this.load.image(Assets.Backgrounds.Play, 'assets/play-background.png');
    this.load.image(Assets.UI.Track, 'assets/racetrack.png');
    this.load.image(Assets.UI.LaneOptions, 'assets/lane-options.png')
    this.load.image(Assets.Avatars.RunBoy, 'assets/run-boy.png');
    this.load.image(Assets.Avatars.RunGirl, 'assets/run-girl.png');
    this.load.image(Assets.UI.QuestionBox, 'assets/questionbox-background.png');
    this.load.image(Assets.UI.Modal, 'assets/modal-background.png');
    this.load.image(Assets.UI.TimerBar, 'assets/timerbar.png');
    this.load.image(Assets.UI.TimerBarInner, 'assets/timerbar-inner.png');
    this.load.image(Assets.UI.TimerBarIcon, 'assets/timerbar-icon.png');
  }

  init() {
    this.gameCountdownValue = GAME_DURATION; // reset timer
    this.currentQuestionIndex = 0;
    this.laneReachedTarget = false;
    this.isLaneAnimating = false;
    this.inputLocked = true;
    this.score = 0;
  }

  create(data: GameSceneData) {
    // this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Assets.Backgrounds.Play);
    const trackImg = this.add.image(CANVAS_WIDTH / 2, 0, Assets.UI.Track).setOrigin(0.5, 0);
    const trackImgAspectHeight = trackImg.height * (CANVAS_WIDTH / trackImg.width)
    trackImg.setDisplaySize(CANVAS_WIDTH, trackImgAspectHeight);

    this.laneOptions = this.add.image(CANVAS_WIDTH / 2, 0, Assets.UI.LaneOptions).setOrigin(0.5, 0);
    this.laneOptions.setDisplaySize(640, this.laneOptions.height * (640 / this.laneOptions.width));
    this.originalLaneWidth = this.laneOptions.displayWidth;
    this.originalLaneHeight = this.laneOptions.displayHeight;
    this.laneOptions.setY(0);

    const trackContainer = this.add.container(0, 0, [trackImg, this.laneOptions]);
    trackContainer.setY(CANVAS_HEIGHT - trackImgAspectHeight);


    // const shape = this.make.graphics({ x: 0, y: trackImg.height * (CANVAS_WIDTH / trackImg.width), add: true });
    // shape.fillStyle(0xffffff);
    // shape.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT/2);
    // shape.setDepth(10);
    // const mask = shape.createGeometryMask();
    // trackContainer.setMask(mask);


    if (!USE_GAMEPAD) {
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
    
    const avatarGender =
      data.avatarKey === 'boy' ? Assets.Avatars.RunBoy : Assets.Avatars.RunGirl;
    this.avatar = this.add.sprite(LANES_X[this.selectedLane], 1500, avatarGender);
    this.avatarKey = data.avatarKey;

    this.questions = getRandomQuestions();

    this.gameTimerText = this.add
      .text(CANVAS_WIDTH / 2, 50, formatTime(this.gameCountdownValue), {
        fontSize: '48px',
        ...globalTextStyle
      })
      .setOrigin(0.5);

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
          // this.runToAnswer();
          this.moveLaneOptionsDown();
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
          // this.runToAnswer();
          this.moveLaneOptionsDown();
        }
      }
    }
  }

  private moveLaneOptionsDown() {
    if (this.laneReachedTarget || this.isLaneAnimating || this.inputLocked) return;

    const currentY = this.laneOptions.y;
    const nextY = currentY + this.laneStep;
    const finalY = this.laneTargetY;
    const maxScale = 1.9;
    const overshootScale = 2.5;
    
    const progress = Phaser.Math.Clamp(nextY / finalY, 0, 1);
    const scaleFactor = 1 + (maxScale - 1) * progress;

    const nextWidth = this.originalLaneWidth * scaleFactor;
    const nextHeight = this.originalLaneHeight * scaleFactor;
    
    if (nextY >= finalY) {
      this.laneReachedTarget = true;
      this.isLaneAnimating = true;
      this.inputLocked = true;

      const overshootWidth = this.originalLaneWidth * overshootScale;
      const overshootHeight = this.originalLaneHeight * overshootScale;
      const finalWidth = this.originalLaneWidth * maxScale;
      const finalHeight = this.originalLaneHeight * maxScale;
  
      this.tweens.add({
        targets: this.laneOptions,
        y: finalY,
        displayWidth: overshootWidth,
        displayHeight: overshootHeight,
        alpha: 1,
        duration: 200,
        ease: 'Back.Out',
        onComplete: () => {
          console.log('Lane reached avatar!');
          this.tweens.add({
            targets: this.laneOptions,
            displayWidth: finalWidth,
            displayHeight: finalHeight,
            alpha: 0,
            duration: 150,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              console.log('Lane reached avatar with bounce-pop!');
              this.isLaneAnimating = false;
              this.inputLocked = false;
              this.registerAnswer();
            }
          });
        }
      });
    } else {
      this.tweens.add({
        targets: this.laneOptions,
        y: nextY,
        displayWidth: nextWidth,
        displayHeight: nextHeight,
        duration: 500,
        ease: 'Power2' // smooth in-between movement
      });
    }
  }

  private resetLaneOptions() {
    this.laneReachedTarget = false;
    this.isLaneAnimating = false;
    
    // Optionally stop any active tweens
    this.tweens.killTweensOf(this.laneOptions);
  
    // Reset alpha position and scale
    this.laneOptions.setAlpha(1);
    this.laneOptions.setY(0);
    this.laneOptions.setDisplaySize(this.originalLaneWidth, this.originalLaneHeight);
  }

  private moveLane(direction: -1 | 1) {
    // this.selectedLane += direction;
    // this.avatar.setX(LANES_X[this.selectedLane]);
    // updateAnswerHighlights(this.answerTexts, this.selectedLane);
    const newLane = this.selectedLane + direction;

    // Guard against invalid lane index
    // if (newLane < 0 || newLane >= LANES_X.length) return;

    this.selectedLane = newLane;

    this.tweens.add({
      targets: this.avatar,
      x: LANES_X[this.selectedLane],
      duration: 200, // ms for the slide animation
      ease: 'Power2', // smooth easing
      onUpdate: () => {
        // Optional: update highlights during movement (not just after)
        updateAnswerHighlights(this.answerTexts, this.selectedLane);
      }
    });
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
        this.gameTimerText.setStyle({
          fontSize: '48px',
          ...globalTextStyle
        });
        if (this.gameCountdownValue <= 0) this.endGame();
      },
    });
  }

  private startGoTimer() {
    this.questionBox?.destroy();
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.goCountdown = GO_TIMER_DURATION;

    this.goTimerText = this.add
      .text(CANVAS_WIDTH / 2, 300, this.goCountdown.toString(), {
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
          this.inputLocked = false;
          this.startGameCountdown();
          this.displayQuestion(this.currentQuestion);
        }
      },
    });
  }

  private displayQuestion(question: Question) {
    this.buttonPressCount = 0;
    this.questionBox?.destroy();
  
    const topicText = this.add.text(CANVAS_WIDTH / 2, 150, question.topic, {
      ...globalTextStyle,
      fontSize: '36px',
    }).setOrigin(0.5);
  
    const questionText = this.add.text(CANVAS_WIDTH / 2, 250, question.question, {
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
    this.timerBarContainer?.destroy();
    this.stopTimerBar();
  
    const bg = this.add.image(0, 0, Assets.UI.TimerBar).setOrigin(0.5);
    const inner = this.add.image(0, 0, Assets.UI.TimerBarInner).setOrigin(0.5);
    const icon = this.add.image(0, 0, Assets.UI.TimerBarIcon).setOrigin(0, 0.5);
    icon.setX(-bg.width / 2 - icon.width / 2);
    const fullWidth = inner.width;

    this.timerBarContainer = this.add.container(x, y, [bg, inner, icon]); 
  
    // 💡 Set up countdown animation via tween (right to left)
    this.timerBarTween = this.tweens.addCounter({
      from: fullWidth,
      to: 40,
      duration: duration,
      ease: 'Linear',
      onUpdate: (tween) => {
        const value = tween.getValue();
        const cropX = fullWidth - value;
        // Shrink from right to left
        inner.setCrop(cropX, 0, fullWidth, inner.height);
        inner.setX(-cropX-9);
        
        // const elapsed = tween.progress * duration;
        // const remaining = Math.ceil((duration - elapsed) / 1000);
        // console.log('⏱ Remaining seconds:', remaining);
      },
      onComplete: () => {
        if (!this.inputLocked) {
          this.registerAnswer(); // auto-submit if player didn't respond
        }
      }
    });
  }

  private stopTimerBar() {
    if (this.timerBarTween) {
      this.timerBarTween.stop();
      this.tweens.killTweensOf(this.timerBarTween);
      this.timerBarTween = undefined;
    }
  }

  private registerAnswer() {
    
    const isCorrect = this.selectedLane === this.currentQuestion.correctIndex;

    if (isCorrect) {
      this.score += 5;
      this.goToNextQuestion();
    } else {
      this.resetLaneOptions();
      this.showModal(false);
    }
  }

  private goToNextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex < this.questions.length && this.gameCountdownValue > 0) {
      this.resetLaneOptions();
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

  private showModal(isCorrect: boolean) {
    this.inputLocked = true;
    this.gameCountdownInterval.paused = true;
    this.stopTimerBar();

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

    this.modal = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, [bg, text])
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
          // this.timerBarContainer?.destroy();
          this.goToNextQuestion();
        },
      });
    });
  }

  private endGame() {
    this.stopTimerBar();
    this.score += this.gameCountdownValue; // ✅ Add remaining time
    console.log('Final score:', this.score);

    console.log('Game Ended')
    this.scene.start('GameFinishScene',{ 
    avatarKey: this.avatarKey,
    score: this.score 
    });
  }
}
