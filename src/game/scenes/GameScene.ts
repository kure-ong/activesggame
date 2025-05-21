import Phaser from 'phaser';
import { getRandomQuestions, Question } from '../questionBank';
import { GamepadHandler } from '../utils/gamepadUtils';
import { formatTime } from '../utils/formatTime';
import { updateAnswerHighlights } from '../utils/highlightUtils';
import { aspectResize } from '../utils/displaySizeUtils';
import { playSound } from '../utils/soundHelper';
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
  INPUT_KEYS,
} from '../constants/gameConfig';
import { globalTextStyle } from '../constants/textStyle';
import { Asset } from 'next/font/google';

interface GameSceneData {
  avatarKey: string;
}

type AvatarState = 'idle' | 'running' | 'stopping';

const USE_GAMEPAD = false; // ← toggle this to false to use keyboard

export default class GameScene extends Phaser.Scene {
  private avatar!: Phaser.GameObjects.Sprite;
  private avatarKey: string | null = null;
  private avatarRunGender: string;
  private avatarStopGender: string;

  private avatarState: AvatarState = 'idle';
  private stopRunDelayEvent?: Phaser.Time.TimerEvent;

  private questions: Question[] = [];
  private currentQuestionIndex = 0;
  private currentQuestion!: Question;
  private goTimerText!: Phaser.GameObjects.Text;
  private goTimerImg!: Phaser.GameObjects.Image;
  private goTimerEvent!: Phaser.Time.TimerEvent;
  private gameTimerText!: Phaser.GameObjects.Text;
  private gameCountdownValue = GAME_DURATION;
  private gameCountdownInterval!: Phaser.Time.TimerEvent;
  private answerTexts: Phaser.GameObjects.Text[] = [];
  private answerBtns: Phaser.GameObjects.Image[] = [];
  private selectedLane = 1;
  private originalLaneWidth!: number;
  private originalLaneHeight!: number;
  private trackImgAspectHeight!: number;
  private laneHighlights: Phaser.GameObjects.Image[] = [];
  private laneOptions!: Phaser.GameObjects.Image;
  private laneStep = 50; // pixels to move per press
  private laneTargetY = 600; // match this.avatar.y
  private laneReachedTarget = false;
  private isLaneAnimating = false;
  private modal!: Phaser.GameObjects.Container;
  private goCountdown = GO_TIMER_DURATION;
  private questionBox!: Phaser.GameObjects.Container;
  private padHandler = new GamepadHandler();
  private prevPadButtons: boolean[] = [];
  private padEnterKey = 15;
  // private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  // private enterKey!: Phaser.Input.Keyboard.Key;
  private leftKey!: Phaser.Input.Keyboard.Key;
  private rightKey!: Phaser.Input.Keyboard.Key;
  private confirmKey!: Phaser.Input.Keyboard.Key;
  private inputLocked = true;
  private timerBarTween?: Phaser.Tweens.Tween;
  private timerBarContainer!: Phaser.GameObjects.Container;
  private autoSkipTimer!: Phaser.Time.TimerEvent;
  private score = 0;

  private readonly FLAG_PADDING = 175;
  private readonly FLAG_SCALE_START = 0.2;
  private readonly FLAG_SCALE_END = 20;
  private readonly FLAG_WIDTH = 60;
  private readonly FLAG_HEIGHT = 259;
  private readonly FLAG_DUPLICATES = 4;

  private flags: { left: Phaser.GameObjects.Image; right: Phaser.GameObjects.Image; flagCrossedPeak: boolean; progressAfterPeak: number; leftNextX: number; rightNextX: number; nextY: number; nextScale: number;velocityY:number;}[] = [];
  private currentFlagIndex: number = 0;
  private createFlagIndex: number = 2;
  private flagStep: number = 25;

  private blackOverlay!: Phaser.GameObjects.Graphics;

  constructor() {
    super('GameScene');
  }

  preload() {
    // this.load.image(Assets.Backgrounds.Sky, 'assets/sky.png');
    // this.load.image(Assets.Backgrounds.Clouds, 'assets/clouds.png');
    // this.load.image(Assets.Backgrounds.Racetrack, 'assets/racetrack.png');
    // this.load.image(Assets.Backgrounds.FinishLine, 'assets/finish-line.png');
    this.load.image(Assets.UI.LaneOptions, 'assets/lane-options.png')
    // this.load.image(Assets.Avatars.RunBoy, 'assets/run-boy.png');
    this.load.spritesheet(Assets.Avatars.RunBoy, 'assets/avatar-running-sprite-boy.png', {
      frameWidth: 300,
      frameHeight: 550
    })
    this.load.spritesheet(Assets.Avatars.StopBoy, 'assets/avatar-stop-sprite-boy.png', {
      frameWidth: 300,
      frameHeight: 550
    })
    // this.load.image(Assets.Avatars.RunGirl, 'assets/run-girl.png');
    this.load.spritesheet(Assets.Avatars.RunGirl, 'assets/avatar-running-sprite-girl.png', {
      frameWidth: 300,
      frameHeight: 550
    })
    this.load.spritesheet(Assets.Avatars.StopGirl, 'assets/avatar-stop-sprite-girl.png', {
      frameWidth: 300,
      frameHeight: 550
    })
    this.load.image(Assets.UI.QuestionBox, 'assets/questionbox-background.png');
    this.load.image(Assets.Buttons.BlueA, 'assets/btn-blue-a.png');
    this.load.image(Assets.Buttons.BlueB, 'assets/btn-blue-b.png');
    this.load.image(Assets.Buttons.BlueC, 'assets/btn-blue-c.png');
    this.load.image(Assets.Buttons.RedA, 'assets/btn-red-a.png');
    this.load.image(Assets.Buttons.RedB, 'assets/btn-red-b.png');
    this.load.image(Assets.Buttons.RedC, 'assets/btn-red-c.png');
    this.load.image(Assets.UI.Modal, 'assets/modal-background.png');
    this.load.image(Assets.UI.TimerBar, 'assets/timerbar.png');
    this.load.image(Assets.UI.TimerBarInner, 'assets/timerbar-inner.png');
    this.load.image(Assets.UI.TimerBarIcon, 'assets/timerbar-icon.png');
    this.load.image(Assets.Countdown.Count1, 'assets/gotimer-1.png');
    this.load.image(Assets.Countdown.Count2, 'assets/gotimer-2.png');
    this.load.image(Assets.Countdown.Count3, 'assets/gotimer-3.png');
    this.load.image(Assets.Countdown.CountGo, 'assets/gotimer-go.png');
    this.load.image(Assets.UI.FlagLeft, 'assets/flag-left.png');
    this.load.image(Assets.UI.FlagRight, 'assets/flag-right.png');
    this.load.image(Assets.UI.LaneHighlight0, 'assets/lanehighlight0.png');
    this.load.image(Assets.UI.LaneHighlight1, 'assets/lanehighlight1.png');
    this.load.image(Assets.UI.LaneHighlight2, 'assets/lanehighlight2.png');
    // this.load.spritesheet(Assets.Parents.Sprite, 'assets/parents-sprite.png', {
    //   frameWidth: 500,
    //   frameHeight: 446
    // });
  }

  init() {
    this.gameCountdownValue = GAME_DURATION; // reset timer
    this.currentQuestionIndex = 0;
    this.laneReachedTarget = false;
    this.isLaneAnimating = false;
    this.inputLocked = true;
    this.score = 0;
    this.currentFlagIndex = 0;
    this.createFlagIndex = 2;
  }

  create(data: GameSceneData) {
    this.add.image(120,80, Assets.Logos.ActiveParentsWhite).setDepth(999);
    const skyBg = this.add.image(CANVAS_WIDTH / 2, 0, Assets.Backgrounds.Sky).setOrigin(0.5, 0);
    const skyBgAspectHeight = skyBg.height * (CANVAS_WIDTH / skyBg.width)
    skyBg.setDisplaySize(CANVAS_WIDTH, skyBgAspectHeight);
    
    const cloudsImg = this.add.image(CANVAS_WIDTH / 2, -100, Assets.Backgrounds.Clouds).setOrigin(0.5, 0);
    const cloudsImgAspectHeight = cloudsImg.height * ((CANVAS_WIDTH * 2) / cloudsImg.width)
    cloudsImg.setDisplaySize(CANVAS_WIDTH * 2, cloudsImgAspectHeight);
    
    const trackImg = this.add.image(CANVAS_WIDTH / 2, 0, Assets.UI.Track).setOrigin(0.5, 0);
    this.trackImgAspectHeight = trackImg.height * (CANVAS_WIDTH / trackImg.width)
    trackImg.setDisplaySize(CANVAS_WIDTH, this.trackImgAspectHeight);

    this.laneOptions = this.add.image(CANVAS_WIDTH / 2, 0, Assets.UI.LaneOptions).setOrigin(0.5, 0);
    this.laneOptions.setDisplaySize(640, this.laneOptions.height * (640 / this.laneOptions.width));
    this.originalLaneWidth = this.laneOptions.displayWidth;
    this.originalLaneHeight = this.laneOptions.displayHeight;
    this.laneOptions.setY(0);

    const trackContainer = this.add.container(0, 0, [trackImg, this.laneOptions]).setDepth(2);
    trackContainer.setY(CANVAS_HEIGHT - this.trackImgAspectHeight);
    
    this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT - this.trackImgAspectHeight + 50, Assets.Backgrounds.FinishLine).setOrigin(0.5, 1);

    this.anims.create({
      key: 'wave',
      frames: this.anims.generateFrameNumbers(Assets.Parents.Sprite, { start: 0, end: 1 }),
      frameRate: 4, // Adjust to your preference (e.g. 4–8)
      repeat: -1    // -1 = loop forever
    });

    const parents = this.add.sprite(CANVAS_WIDTH / 2, CANVAS_HEIGHT - this.trackImgAspectHeight + 10, Assets.Parents.Sprite).setOrigin(0.5, 1);
    parents.setDisplaySize(200, parents.height * (200 / parents.width));

    parents.play('wave');

    // const shape = this.make.graphics({ x: 0, y: 0, add: true } as any);
    // shape.fillStyle(0xffffff);
    // shape.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT/2);
    // shape.setDepth(10);
    // const mask = shape.createGeometryMask();
    // trackContainer.setMask(mask);
    
    this.avatarRunGender = data.avatarKey === 'boy' ? Assets.Avatars.RunBoy : Assets.Avatars.RunGirl;
    this.avatarStopGender = data.avatarKey === 'boy' ? Assets.Avatars.StopBoy : Assets.Avatars.StopGirl;

    this.anims.create({
      key: 'run_lane_0',
      frames: this.anims.generateFrameNumbers(this.avatarRunGender, { start: 0, end: 1 }),
      frameRate: 10, // slow pace; adjust to 10–12 for faster running
      repeat: -1
    });

    this.anims.create({
      key: 'run_lane_1',
      frames: this.anims.generateFrameNumbers(this.avatarRunGender, { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'run_lane_2',
      frames: this.anims.generateFrameNumbers(this.avatarRunGender, { start: 4, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.avatar = this.add.sprite(LANES_X[this.selectedLane], 1500, this.avatarStopGender,this.selectedLane).setDepth(7);
    this.avatarKey = data.avatarKey;

    this.questions = getRandomQuestions();

    this.gameTimerText = this.add
      .text(CANVAS_WIDTH / 2, 120, formatTime(this.gameCountdownValue), {
        fontSize: '48px',
        ...globalTextStyle
      })
      .setOrigin(0.5);

    this.startGoTimer();

    // if (!USE_GAMEPAD) {
    //   this.cursors = this.input.keyboard!.createCursorKeys();
    //   this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    // }
    if (!USE_GAMEPAD) {
      this.leftKey = this.input.keyboard!.addKey(INPUT_KEYS.LEFT);
      this.rightKey = this.input.keyboard!.addKey(INPUT_KEYS.RIGHT);
      this.confirmKey = this.input.keyboard!.addKey(INPUT_KEYS.CONFIRM);
    }
    this.avatarState = 'idle';
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
        // if (pad.buttons.some((btn,index) => btn.pressed && index !== 14 && index !== 15)) {
        //   this.moveLaneOptionsDown();
        //   this.createFlag();
        //   this.playNextFlagTween();
        //   this.runningHandler();
        // }
        pad.buttons.forEach((btn, index) => {
          const wasPressed = this.prevPadButtons[index] || false;
          const isPressed = btn.pressed;

          // Detect JustDown
          if (!wasPressed && isPressed  && index === this.padEnterKey) {
            this.moveLaneOptionsDown();
            this.createFlag();
            this.playNextFlagTween();
            this.runningHandler();
          }

          // Detect JustUp: previously pressed, now not pressed
          if (wasPressed && !isPressed  && index === this.padEnterKey) {
            this.stopHandler();
          }

          // Save current state for next frame
          this.prevPadButtons[index] = isPressed;
        });

    
      } else {
        // Keyboard mode
        if (Phaser.Input.Keyboard.JustDown(this.leftKey) && this.selectedLane > 0) {
          this.moveLane(-1);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.rightKey) && this.selectedLane < 2) {
          this.moveLane(1);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.confirmKey)) {
          this.moveLaneOptionsDown();
          this.createFlag();
          this.playNextFlagTween();
          this.runningHandler();
        }
        
        if (Phaser.Input.Keyboard.JustUp(this.confirmKey)) {
          this.stopHandler();
        }
      }
    }
  }

  private destroyLaneHighlights() {
    if (this.laneHighlights && this.laneHighlights.length > 0) {
      this.laneHighlights.forEach(h => h.destroy());
      this.laneHighlights = [];
    }
  }

  private setBlackOverlay() {
    this.blackOverlay = this.make.graphics({ x: 0, y: 0, add: true } as any);
    this.blackOverlay.fillStyle(0x000000, 0.7)
    .fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    .setDepth(8);
  }

  private fadeOutBlackOverlay(duration: number = 100) {
  if (!this.blackOverlay) return;

  this.tweens.add({
    targets: this.blackOverlay,
    alpha: 0,
    duration,
    onComplete: () => {
      this.blackOverlay.destroy();
    }
  });
}

  private runningHandler() {
    if (this.avatarState === 'idle' || this.avatarState === 'stopping') {
      // Cancel pending stop if any
      if (this.stopRunDelayEvent) {
        this.stopRunDelayEvent.remove();
        this.stopRunDelayEvent = undefined;
      }
      if (!this.avatar.anims.isPlaying || this.avatar.anims.getName() !== `run_lane_${this.selectedLane}`) {
        this.playRunAnimation(this.selectedLane);
      }
      this.avatarState = 'running';
    }
  }

  private stopHandler() {
    if (this.avatarState === 'running') {
      this.avatarState = 'stopping';

      this.stopRunDelayEvent = this.time.delayedCall(500, () => {
        this.stopRunAndShowPose(this.selectedLane);
        this.avatarState = 'idle';
        this.stopRunDelayEvent = undefined;
      });
    }
  }

  private createFlag() {
      // this.flags = [];

      if (this.createFlagIndex == 2) {
        const left = this.add.image(this.FLAG_PADDING, CANVAS_HEIGHT - this.trackImgAspectHeight, Assets.UI.FlagLeft)
          .setOrigin(0.5, 0)
          .setScale(this.FLAG_SCALE_START)
          .setDepth(0) // start behind track
          .setVisible(false);

        const right = this.add.image(CANVAS_WIDTH - this.FLAG_PADDING, CANVAS_HEIGHT - this.trackImgAspectHeight, Assets.UI.FlagRight)
          .setOrigin(0.5, 0)
          .setScale(this.FLAG_SCALE_START)
          .setDepth(0)
          .setVisible(false);

        this.flags.push({ left, right, flagCrossedPeak:false, progressAfterPeak: 0, leftNextX: 0, rightNextX: 0, nextY: 0, nextScale: this.FLAG_SCALE_START,velocityY:this.flagStep });
        this.createFlagIndex = 0;
        // Cycle to next pair
        this.currentFlagIndex = (this.currentFlagIndex + 1) % this.FLAG_DUPLICATES;
        // console.log('flagindex:' + this.currentFlagIndex);
      } else {
        this.createFlagIndex++;
      }

  }

  private playNextFlagTween() {
    // const { left, right } = this.flags[this.currentFlagIndex];

    const startY = CANVAS_HEIGHT - this.trackImgAspectHeight;
    const peakY = startY - (this.FLAG_HEIGHT * this.FLAG_SCALE_START);
    const endY = CANVAS_HEIGHT + 200;

    this.flags.forEach((flagGroup) =>{
      // console.log(flagGroup.left,flagGroup.right,flagGroup.flagCrossedPeak,flagGroup.progressAfterPeak,flagGroup.nextY,flagGroup.nextScale);

      // flagGroup.nextY = flagGroup.left.y + this.flagStep;
      flagGroup.velocityY = flagGroup.velocityY * 1.1; 
      flagGroup.nextY = flagGroup.left.y + flagGroup.velocityY;
      flagGroup.leftNextX = flagGroup.left.x - flagGroup.velocityY*1.7;
      flagGroup.rightNextX = flagGroup.right.x + flagGroup.velocityY*1.7;
      flagGroup.progressAfterPeak = flagGroup.flagCrossedPeak? Phaser.Math.Clamp((flagGroup.nextY - peakY) / (endY - peakY), 0, 1) : 0;
      flagGroup.nextScale = this.FLAG_SCALE_START + (this.FLAG_SCALE_END - this.FLAG_SCALE_START) * flagGroup.progressAfterPeak;

      if (!flagGroup.flagCrossedPeak) {
        flagGroup.left.setVisible(true);
        flagGroup.right.setVisible(true);
        this.tweens.add({
          targets: [flagGroup.left,flagGroup.right],
          y: peakY,
          duration: 400,
          ease: 'Sine.easeOut',
          onComplete: () => {
            flagGroup.flagCrossedPeak = true;
            flagGroup.left.setDepth(3);
            flagGroup.right.setDepth(3);
          }
        })
      }else if (flagGroup.leftNextX <= -100 || flagGroup.rightNextX >= CANVAS_WIDTH+100 )  {
        flagGroup.left.destroy();
        flagGroup.right.destroy();
      } else {
        this.tweens.add({
          targets: flagGroup.left,
          x: flagGroup.leftNextX,
          y: flagGroup.nextY,
          scale: flagGroup.nextScale,
          duration: 400,
          ease: 'Sine.easeOut',
          onComplete: () => {
            // console.log(flagGroup.flagCrossedPeak,flagGroup.progressAfterPeak, flagGroup.nextScale, flagGroup.nextY);
          }
        })
        this.tweens.add({
          targets: flagGroup.right,
          x: flagGroup.rightNextX,
          y: flagGroup.nextY,
          scale: flagGroup.nextScale,
          duration: 400,
          ease: 'Sine.easeOut',
          onComplete: () => {
            // console.log(flagGroup.flagCrossedPeak,flagGroup.progressAfterPeak, flagGroup.nextScale, flagGroup.nextY);
          }
        })
      }
    })
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
              playSound(this, 'buttonPress');
              this.isLaneAnimating = false;
              this.inputLocked = false;
              this.registerAnswer();
            }
          });
        }
      });
    } else {
      playSound(this, 'buttonPress');
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

  private playRunAnimation(laneIndex: number) {
    this.avatar.setTexture(this.avatarRunGender);
    const key = `run_lane_${laneIndex}`;
    this.avatar.play(key, true);
  }

  private stopRunAndShowPose(laneIndex: number) {
    this.avatar.stop();
    this.avatar.setTexture(this.avatarStopGender, laneIndex); // assuming laneIndex = frame index
  }

  private moveLane(direction: -1 | 1) {
      playSound(this, 'selection');
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
        updateAnswerHighlights(this.answerBtns, this.answerTexts, this.laneHighlights, this.selectedLane);
        if (this.avatarState === 'idle' || this.avatarState === 'stopping') {
          this.stopRunAndShowPose(this.selectedLane);
        }
      },
      // onComplete: () => {
      //   this.stopRunAndShowPose(this.selectedLane);
      // }
    });
  }

  private startGameCountdown() {
    this.gameCountdownInterval = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.gameCountdownValue--;
        this.gameTimerText.setText(formatTime(this.gameCountdownValue))
        .setStyle({
          fontSize: '48px',
          ...globalTextStyle
        });
        if (this.gameCountdownValue <= 0) this.endGame();
      },
    });
  }

  private startGoTimer() {
    this.setBlackOverlay();
    this.questionBox?.destroy();
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.goCountdown = GO_TIMER_DURATION;

    // this.goTimerText = this.add
    //   .text(CANVAS_WIDTH / 2, 300, this.goCountdown.toString(), {
    //     fontSize: '72px',
    //     ...globalTextStyle
    //   })
    //   .setOrigin(0.5);

    this.goTimerImg = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100, Assets.Countdown.Count3).setDepth(10);
    playSound(this, '321go');
    this.displayTopic(this.currentQuestion);
    this.goTimerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.goCountdown--;
        if (this.goCountdown > 0) {
          // this.goTimerText.setText(this.goCountdown.toString());
          const key = `Count${this.goCountdown}` as keyof typeof Assets.Countdown;
          this.goTimerImg.setTexture(Assets.Countdown[key]);
        } else if (this.goCountdown === 0) {
          // this.goTimerText.setText('Go!');
          this.goTimerImg.setTexture(Assets.Countdown.CountGo);
        } else {
          this.goTimerImg.destroy();
          this.goTimerEvent.remove();
          this.fadeOutBlackOverlay();
          // this.goTimerText.destroy();
          this.inputLocked = false;
          this.startGameCountdown();
          this.displayQuestion(this.currentQuestion);
        }
      },
    });
  }

  private displayTopic(question: Question) {
    this.questionBox?.destroy();
    this.timerBarContainer?.destroy();
    this.stopTimerBar();
    this.inputLocked = true;
    
    const questionBoxBackground = this.add.image(0, 0, Assets.UI.QuestionBox).setOrigin(0.5, 0);
    const topicText = this.add.text(0, questionBoxBackground.height / 2, question.topic, {
      ...globalTextStyle,
      fontSize: '42px',
      color: '#9D1E65',
      wordWrap: { width: 800 },
    }).setOrigin(0.5);
    this.questionBox = this.add.container(CANVAS_WIDTH / 2, 160, [questionBoxBackground,topicText]).setDepth(999);
  }

  private displayQuestion(question: Question) {
    this.questionBox?.destroy();
    this.destroyLaneHighlights();
    this.inputLocked = false;
  
    const questionBoxBackground = this.add.image(0, 0, Assets.UI.QuestionBox).setOrigin(0.5, 0);

    const questionText = this.add.text(0, 100, question.question, {
      ...globalTextStyle,
      fontSize: '32px',
      color: '#9D1E65',
      wordWrap: { width: 800 },
    }).setOrigin(0.5);

    this.answerBtns = question.answers.map((answer, i) => {
      const key = i === this.selectedLane
      ? `Blue${String.fromCharCode(65 + i)}`
      : `Red${String.fromCharCode(65 + i)}`;
      const label = Assets.Buttons[key as keyof typeof Assets.Buttons]
      return this.add.image(-questionBoxBackground.width / 2 + 80, 200 + i * 70,label).setOrigin(0, 0.5)
    });
    
    this.answerTexts = question.answers.map((answer, i) =>
      this.add.text(-questionBoxBackground.width / 2 + 162, 200 + i * 70, answer, {
        ...globalTextStyle,
        fontSize: '28px',
        color: i === this.selectedLane ? '#1DABE3':'#9D1E65',
      }).setOrigin(0, 0.5)
    );

    this.laneHighlights = question.answers.map((answer, i) => {
      const key = `LaneHighlight${i}` as keyof typeof Assets.UI;
      let x = LANES_X[i];
      if (i === 0) x += 72; // move right
      if (i === 2) x -= 72; // move left
      return this.add.image(x, CANVAS_HEIGHT - this.trackImgAspectHeight,Assets.UI[key]).setDepth(5).setOrigin(0.5, 0).setVisible(i === this.selectedLane);
    });

    this.questionBox = this.add.container(CANVAS_WIDTH / 2, 160, [questionBoxBackground,questionText,...this.answerTexts,...this.answerBtns]);
  
    this.createTimerBar(240,180,QUESTION_TIME_LIMIT);
  
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
      this.showModal();
      // this.goToNextQuestion();
    } else {
      this.resetLaneOptions();
      this.showModal();
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
        this.displayTopic(this.currentQuestion);
        this.time.delayedCall(1300,() => {
          this.displayQuestion(this.currentQuestion);
        })
      }
    } else {
      this.endGame();
    }
  }

  private showModal() {
    this.inputLocked = true;
    this.gameCountdownInterval.paused = true;
    this.stopTimerBar();
    this.setBlackOverlay();
    const bg = this.add.image(0,0, Assets.UI.Modal).setOrigin(0.5);
    const text = this.add
      .text(-bg.width / 2 + 40, 40, this.currentQuestion.didYouKnow, {
        ...globalTextStyle,
        fontSize: '32px',
        color: '#000',
        align: 'left',
        wordWrap: { width: bg.width - 300, useAdvancedWrap: true },
      })
      .setOrigin(0, 0.5);

    this.modal = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100, [bg, text])
      .setAlpha(0)
      .setDepth(9);

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
          this.fadeOutBlackOverlay();
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
    if (this.gameCountdownInterval) {
      this.gameCountdownInterval.remove(false);
    }
    console.log('Final score:', this.score);

    console.log('Game Ended')
    this.scene.start('GameFinishScene',{ 
    avatarKey: this.avatarKey,
    score: this.score 
    });
  }
}
