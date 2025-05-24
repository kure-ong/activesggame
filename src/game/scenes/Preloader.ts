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

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
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
        this.load.spritesheet(Assets.Parents.Sprite, 'assets/parents-sprite.png', {
            frameWidth: 500,
            frameHeight: 446
        });
        this.load.image(Assets.Logos.ActiveParentsWhite, 'assets/active-parents-logo-white.png');

        this.load.image(Assets.UI.Header, 'assets/choose-avatar-header.png');
        this.load.image(Assets.Avatars.Boy, 'assets/avatar-boy.png');
        this.load.image(Assets.Avatars.Girl, 'assets/avatar-girl.png');
        this.load.image(Assets.Avatars.BoyGrey, 'assets/avatar-boy-grey.png');
        this.load.image(Assets.Avatars.GirlGrey, 'assets/avatar-girl-grey.png');

    
        this.load.image(Assets.Buttons.Start, 'assets/start-button.png');
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
