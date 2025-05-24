import { Assets } from './constants/assets';

// questionBank.ts
// Holds the dummy data for genres, topics, questions and answers.

export interface Question {
  genre: string;
  topic: string;
  question: string;
  answers: string[];
  correctIndex: number;
  didYouKnowCorrect: string;
  didYouKnowWrong: string;
  buLogo: string;
}

const questions: Question[] = [
  {
    genre: 'Dummy Genre 1',
    topic: 'Active Parents strengthens family bonds through sport.',
    question: 'We enable and empower parents to…',
    answers: ['Dummy Answer A', 'Dummy Answer B', 'Dummy Answer C'],
    correctIndex: 1,
    didYouKnowCorrect: 'Well done! While fitness matters, we focus on helping parents bond and grow with their kids through shared sport experiences.',
    didYouKnowWrong: 'Not quite. Correct answer is A.\nWhile fitness matters, we focus on helping parents bond and grow with their kids through shared sport experiences.',
    buLogo: Assets.Logos.BU.ActiveParents,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'Families that play together, grow together.',
    question: 'How can you be an Active Parent?',
    answers: ['X', 'Y', 'Z'],
    correctIndex: 1,
    didYouKnowCorrect: 'That’s right! Being an Active Parent means both leading by example AND engaging in your child’s sporting journey.',
    didYouKnowWrong: 'Nice try. Correct answer is C.\nThat’s right! Being an Active Parent means both leading by example AND engaging in your child’s sporting journey.',
    buLogo: Assets.Logos.BU.ActiveParents,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'Active Health champions balanced living.',
    question: 'Which of the following is NOT what Active Health advocates for?',
    answers: ['Answer A', 'Answer B', 'Answer C'],
    correctIndex: 1,
    didYouKnowCorrect: 'Great job! Active Health focuses on building sustainable habits through movement, nutrition, and rest — not retail therapy!',
    didYouKnowWrong: 'Good try. Correct answer is C.\nActive Health focuses on building sustainable habits through movement, nutrition, and rest — not retail therapy!',
    buLogo: Assets.Logos.BU.ActiveHealth,
  },
  {
    genre: 'Dummy Genre 2',
    topic: 'Sport teaches life values.',
    question: 'What are the core values of our ActiveSG Academies & Clubs',
    answers: ['A', 'B', 'C'],
    correctIndex: 1,
    didYouKnowCorrect: 'Bravo! Honour, Resilience, and Teamwork are ActiveSG’s pillars — shaping athletes who respect the game, overcome obstacles, and thrive together.',
    didYouKnowWrong: 'Good try. Correct Answer is A.\nHonour, Resilience, and Teamwork are ActiveSG’s pillars — shaping athletes who respect the game, overcome obstacles, and thrive together.',
    buLogo: Assets.Logos.BU.ActiveSgAC,
  },
  {
    genre: 'Dummy Genre 3',
    topic: 'ActiveSG makes sport accessible to everyone!',
    question: 'How much is this year’s SG60 ActiveSG Credit Top-Up?',
    answers: ['A1', 'B1', 'C1'],
    correctIndex: 1,
    didYouKnowCorrect: 'That’s right! New members of all ages receive $100 credits to book ActiveSG facilities.',
    didYouKnowWrong: 'Good try. Correct Answer is B.\nGood job! New members of all ages receive $100 credits to book ActiveSG facilities.',
    buLogo: Assets.Logos.BU.ActiveSg,
  },
];

export function getRandomQuestions(): Question[] {
  const genre1 = questions.filter(q => q.genre === 'Dummy Genre 1');
  const genre2 = questions.filter(q => q.genre === 'Dummy Genre 2');
  const genre3 = questions.filter(q => q.genre === 'Dummy Genre 3');

  const pickRandom = (arr: Question[], count: number) => {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
  };

  return [
    ...pickRandom(genre1, 3),
    ...pickRandom(genre2, 1),
    ...pickRandom(genre3, 1),
  ];
}
