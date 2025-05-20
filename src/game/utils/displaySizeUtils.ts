export function aspectResize(imageObject: Phaser.GameObjects.Image,targetWidth: number) {
  const aspectHeight = imageObject.height * (targetWidth / imageObject.width)
  imageObject.setDisplaySize(targetWidth, aspectHeight);
}