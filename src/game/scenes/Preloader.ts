import { Scene } from 'phaser';
import { Assets } from '../constants/assets';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        // this.add.image(512, 384, 'background');

        // Center coordinates
        const centerX = 1080 / 2;
        const centerY = 960;

        this.add.text(1080 / 2, 900, 'Loading Assets...', {
            fontSize: '36px'
        }).setOrigin(0.5);

        // Outline of the progress bar
        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff);

        // Progress bar (start at far left of the outline, grow right)
        const bar = this.add.rectangle(centerX - 468 / 2 + 2, centerY, 4, 28, 0xffffff)
        .setOrigin(0, 0.5); // Anchor to left-middle

        // Update the width based on loading progress
        this.load.on('progress', (progress: number) => {
        bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.audio('bgMusic', 'assets/sfx/bgm.mp3');
        this.load.audio('321go', 'assets/sfx/321go.mp3');
        this.load.audio('buttonPress', 'assets/sfx/enter-btn.mp3');
        this.load.audio('gameComplete', 'assets/sfx/game-complete.mp3');
        this.load.audio('selection', 'assets/sfx/selection.mp3');
        this.load.audio('timesUp', 'assets/sfx/timesup.mp3');
        this.load.audio('answerCorrect', 'assets/sfx/answer-correct.mp3');
        this.load.audio('answerWrong', 'assets/sfx/answer-wrong.mp3');
        
        this.load.image(Assets.Logos.ActiveParentsWhite, 'assets/active-parents-logo-white.png');

        this.load.image(Assets.Backgrounds.Game, 'assets/background-start.png');
        this.load.image(Assets.Backgrounds.Sky, 'assets/sky.png');
        this.load.image(Assets.Backgrounds.Clouds, 'assets/clouds.png');
        this.load.image(Assets.Backgrounds.EndGame, 'assets/background-end.png');

        this.load.image(Assets.Logos.ActiveParents, 'assets/active-parents-logo.png');
        this.load.image(Assets.UI.GameTitle, 'assets/game-title.png');
        this.load.image(Assets.Buttons.LetsPlay, 'assets/lets-play-button.png');
        this.load.image(Assets.Backgrounds.IntroChar, 'assets/introchar.png');
        this.load.image(Assets.UI.Instructions, 'assets/instructions.png');

        this.load.image(Assets.Backgrounds.Racetrack, 'assets/racetrack.png');
        this.load.image(Assets.Backgrounds.FinishLine, 'assets/finish-line.png');
        this.load.image(Assets.Backgrounds.FinishLineBig, 'assets/finish-line-big.png');
        this.load.spritesheet(Assets.Parents.Sprite, 'assets/parents-sprite.png', {
            frameWidth: 500,
            frameHeight: 446
        });

        this.load.image(Assets.UI.Header, 'assets/choose-avatar-header.png');
        this.load.image(Assets.Avatars.Boy, 'assets/avatar-boy.png');
        this.load.image(Assets.Avatars.Girl, 'assets/avatar-girl.png');
        this.load.image(Assets.Avatars.BoyGrey, 'assets/avatar-boy-grey.png');
        this.load.image(Assets.Avatars.GirlGrey, 'assets/avatar-girl-grey.png');

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
        this.load.image(Assets.Logos.BU.ActiveParents, 'assets/bu-activeparents.png');
        this.load.image(Assets.Logos.BU.ActiveHealth, 'assets/bu-activehealth.png');
        this.load.image(Assets.Logos.BU.ActiveSg, 'assets/bu-activesg.png');
        this.load.image(Assets.Logos.BU.ActiveSgAC, 'assets/bu-activesgac.png');
        this.load.image(Assets.UI.Modal, 'assets/modal-background-wrong.png');
        this.load.image(Assets.UI.ModalCorrect, 'assets/modal-background-correct.png');
        this.load.image(Assets.UI.TimerBar, 'assets/timerbar.png');
        this.load.image(Assets.UI.TimerBarInner, 'assets/timerbar-inner.png');
        this.load.image(Assets.UI.TimerBarIcon, 'assets/timerbar-icon.png');
        this.load.image(Assets.Countdown.Count1, 'assets/gotimer-1.png');
        this.load.image(Assets.Countdown.Count2, 'assets/gotimer-2.png');
        this.load.image(Assets.Countdown.Count3, 'assets/gotimer-3.png');
        this.load.image(Assets.Countdown.CountGo, 'assets/gotimer-go.png');
        this.load.image(Assets.UI.FlagLeft, 'assets/flag-left.png');
        this.load.image(Assets.UI.FlagRight, 'assets/flag-right.png');
        this.load.image(Assets.UI.LaneOptions, 'assets/lane-options.png')
        this.load.image(Assets.UI.LaneHighlight0, 'assets/lanehighlight0.png');
        this.load.image(Assets.UI.LaneHighlight1, 'assets/lanehighlight1.png');
        this.load.image(Assets.UI.LaneHighlight2, 'assets/lanehighlight2.png');

        this.load.image(Assets.Avatars.CelebrateBoy, 'assets/avatar-celebrate-boy.png');
        this.load.image(Assets.Avatars.CelebrateGirl, 'assets/avatar-celebrate-girl.png');
        this.load.image(Assets.Animations.RibbonLeft, 'assets/ribbon-left.png');
        this.load.image(Assets.Animations.RibbonRight, 'assets/ribbon-right.png');
        this.load.image(Assets.Animations.Confetti, 'assets/confetti.png');

        this.load.image(Assets.UI.Analysis1, 'assets/game-analysis1.png');
        this.load.image(Assets.UI.Analysis2, 'assets/game-analysis2.png');
        this.load.image(Assets.UI.Analysis3, 'assets/game-analysis3.png');
    
        this.load.image(Assets.Buttons.Start, 'assets/start-button.png');
        this.load.image(Assets.Buttons.Skip, 'assets/skip-button.png');
        this.load.image(Assets.Buttons.Next, 'assets/next-button.png');
        this.load.image(Assets.Buttons.Done, 'assets/done-button.png');

    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

         if (!this.sound.get('bgMusic')) {
            const music = this.sound.add('bgMusic', { loop: true, volume: 0.6 });
            music.setLoop(true);
            music.play();
            this.sound.pauseOnBlur = false; 
        }
        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('StartMenuScene');
        // this.scene.start('GameFinishScene');
        // this.scene.start('GameScene');
    }
}
