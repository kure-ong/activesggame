export function startConfettiSequence(
  scene: Phaser.Scene,
  confettiKey: string,
  CANVAS_WIDTH: number,
  CANVAS_HEIGHT: number
): Phaser.Tweens.Tween[] {
  const activeTweens: Phaser.Tweens.Tween[] = [];

  const confettiTop = scene.add.image(CANVAS_WIDTH / 2, -100, confettiKey)
    .setOrigin(0.5)
    .setAlpha(1)
    .setRotation(0);

  confettiTop.setDisplaySize(confettiTop.width / 2, confettiTop.height);

  const playSequence = () => {
    const topTween = scene.tweens.add({
      targets: confettiTop,
      y: CANVAS_HEIGHT / 2 - 300,
      alpha: 0,
      duration: 1800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        confettiTop.setY(-200).setAlpha(1);

        const confettiLeft = scene.add.image(-200, CANVAS_HEIGHT / 2, confettiKey)
          .setOrigin(0.5)
          .setAlpha(1)
          .setRotation(Phaser.Math.DegToRad(-30))
          .setDisplaySize(confettiTop.width * 2, confettiTop.height / 2);

        const confettiRight = scene.add.image(CANVAS_WIDTH + 200, CANVAS_HEIGHT / 2, confettiKey)
          .setOrigin(0.5)
          .setAlpha(1)
          .setRotation(Phaser.Math.DegToRad(30))
          .setDisplaySize(confettiTop.width * 2, confettiTop.height / 2);

        const leftTween = scene.tweens.add({
          targets: confettiLeft,
          x: CANVAS_WIDTH / 2 - 300,
          alpha: 0,
          duration: 1800,
          ease: 'Sine.easeOut',
          onComplete: () => confettiLeft.destroy()
        });

        const rightTween = scene.tweens.add({
          targets: confettiRight,
          x: CANVAS_WIDTH / 2 + 300,
          alpha: 0,
          duration: 1800,
          ease: 'Sine.easeOut',
          onComplete: () => {
            confettiRight.destroy();
            scene.time.delayedCall(500, playSequence);
          }
        });

        activeTweens.push(leftTween, rightTween);
      }
    });

    activeTweens.push(topTween);
  };

  playSequence();

  return activeTweens;
}
