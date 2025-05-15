import Phaser from 'phaser';
import { Assets } from '../constants/assets';

export function updateAnswerHighlights(
  answerBtns: Phaser.GameObjects.Image[],
  answerTexts: Phaser.GameObjects.Text[],
  selectedIndex: number
) {
  answerTexts.forEach((text, i) => {
    text.setStyle({
      color: i === selectedIndex ? '#1DABE3':'#9D1E65',
    });
  });

  answerBtns.forEach((btn, i) => {
    const key = i === selectedIndex
      ? `Blue${String.fromCharCode(65 + i)}`
      : `Red${String.fromCharCode(65 + i)}`;

    btn.setTexture(Assets.Buttons[key as keyof typeof Assets.Buttons]);
  });
}
