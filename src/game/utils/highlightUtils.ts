import Phaser from 'phaser';

export function updateAnswerHighlights(
  answerTexts: Phaser.GameObjects.Text[],
  selectedIndex: number
) {
  answerTexts.forEach((text, i) => {
    text.setStyle({
      backgroundColor: i === selectedIndex ? '#4444ff' : '',
    });
  });
}
