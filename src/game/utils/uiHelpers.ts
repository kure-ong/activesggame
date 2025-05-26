import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants/gameConfig";
import { globalTextStyle } from '../constants/textStyle';

export function addResetButton(scene: Phaser.Scene) {
  const buttonSize = 32;
  const radius = buttonSize / 2;
  const margin = 24;

  // Position the top-left corner of the container so the *circle's edge* is 5px from canvas edge
  const x = CANVAS_WIDTH - margin - radius;
  const y = CANVAS_HEIGHT - margin - radius;

  // Create a container to group circle and text
  const buttonContainer = scene.add.container(x, y);

  // Draw the circular button background
  const circle = scene.add.graphics();
  circle.fillStyle(0xff4d4d, 1);
  circle.fillCircle(radius, radius, radius); // draw circle centered in its bounds

  // Add the "R" text centered in the circle
  const label = scene.add.text(radius, radius, 'R', {
    ...globalTextStyle,
    fontSize: '16px',
  }).setOrigin(0.5);

  // Add both to the container
  buttonContainer.add([circle, label]).setDepth(1000);

  // Make the circle interactive using a circular hit area
  circle.setInteractive(
    new Phaser.Geom.Circle(radius, radius, radius),
    Phaser.Geom.Circle.Contains
  );

  // Refresh game on click
  circle.on('pointerdown', () => window.location.reload());
}