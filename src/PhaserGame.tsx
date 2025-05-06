import { forwardRef, useEffect, useRef } from 'react';
import StartGame from './game/main';
import { EventBus } from './game/EventBus';
import './game/scenes/GameScene'; //just to watch for file changes to hot reload, can remove this after dev

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (sceneInstance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene }, ref) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Always destroy previous game instance in dev
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    // Create new Phaser game instance
    const gameInstance = StartGame('game-container');
    gameRef.current = gameInstance;

    // Set initial ref
    const updateRef = (scene: Phaser.Scene | null) => {
      if (typeof ref === 'function') {
        ref({ game: gameInstance, scene });
      } else if (ref) {
        ref.current = { game: gameInstance, scene };
      }
    };

    updateRef(null); // Initially no scene

    // Listen for scene ready
    const onSceneReady = (sceneInstance: Phaser.Scene) => {
      if (currentActiveScene) {
        currentActiveScene(sceneInstance);
      }
      updateRef(sceneInstance);
    };

    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.removeListener('current-scene-ready', onSceneReady);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [ref, currentActiveScene]);

  return <div id="game-container" />;
});

// import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
// import StartGame from './game/main';
// import { EventBus } from './game/EventBus';

// export interface IRefPhaserGame
// {
//     game: Phaser.Game | null;
//     scene: Phaser.Scene | null;
// }

// interface IProps
// {
//     currentActiveScene?: (scene_instance: Phaser.Scene) => void
// }

// export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene }, ref)
// {
//     const game = useRef<Phaser.Game | null>(null!);

//     useLayoutEffect(() =>
//     {
//         if (game.current === null)
//         {

//             game.current = StartGame("game-container");

//             if (typeof ref === 'function')
//             {
//                 ref({ game: game.current, scene: null });
//             } else if (ref)
//             {
//                 ref.current = { game: game.current, scene: null };
//             }

//         }

//         return () =>
//         {
//             if (game.current)
//             {
//                 game.current.destroy(true);
//                 if (game.current !== null)
//                 {
//                     game.current = null;
//                 }
//             }
//         }
//     }, [ref]);

//     useEffect(() =>
//     {
//         EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) =>
//         {
//             if (currentActiveScene && typeof currentActiveScene === 'function')
//             {

//                 currentActiveScene(scene_instance);

//             }

//             if (typeof ref === 'function')
//             {

//                 ref({ game: game.current, scene: scene_instance });
            
//             } else if (ref)
//             {

//                 ref.current = { game: game.current, scene: scene_instance };

//             }
            
//         });
//         return () =>
//         {

//             EventBus.removeListener('current-scene-ready');
        
//         }
//     }, [currentActiveScene, ref]);

//     return (
//         <div id="game-container"></div>
//     );

// });
