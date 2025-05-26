import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import StartMenuScene from './scenes/StartMenuScene';
import AvatarSelectionScene from './scenes/AvatarSelectionScene';
import InstructionScene from './scenes/InstructionScene';
import GameScene from './scenes/GameScene';
import GameFinishScene from './scenes/GameFinishScene';
import GameAnalysisScene from './scenes/GameAnalysisScene';
import { loadFont } from './utils/loadFont';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1080,
    height: 1920,
    parent: 'game-container',
    backgroundColor: '#2D2D2D',
    scene: [
        // Boot,
        Preloader,
        // MainMenu,
        // MainGame,
        // GameOver
        //
        StartMenuScene,
        AvatarSelectionScene,
        InstructionScene,
        GameScene,
        GameFinishScene,
        GameAnalysisScene,
    ],
    physics: {
        default: 'arcade',
    },
};

const StartGame = async (parent: string): Promise<Phaser.Game> => {
    await loadFont('Houschka Rounded', '/assets/fonts/Houschka Rounded Medium.ttf'); // adjust path if needed
    return new Game({ ...config, parent });
  };

export default StartGame;
