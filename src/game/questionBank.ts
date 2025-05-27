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
    answers: ['Play an active role in their child’s life and sporting journey', 'Adopt an active lifestyle', 'Play sport'],
    correctIndex: 0,
    didYouKnowCorrect: 'Well done!\n\nWhile fitness matters, we focus on helping parents bond and grow with their kids through shared sport experiences.',
    didYouKnowWrong: 'Not quite. Correct answer is A.\n\nWhile fitness matters, we focus on helping parents bond and grow with their kids through shared sport experiences.',
    buLogo: Assets.Logos.BU.ActiveParents,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'Families that play together, grow together.',
    question: 'How can you be an Active Parent?',
    answers: ['Be a role model in adopting an active lifestyle', 'Play a supporting role in my child’s sporting journey', 'All of the above'],
    correctIndex: 2,
    didYouKnowCorrect: 'That’s right!\n\nBeing an Active Parent means both leading by example AND engaging in your child’s sporting journey.',
    didYouKnowWrong: 'Nice try. Correct answer is C.\n\nThat’s right! Being an Active Parent means both leading by example AND engaging in your child’s sporting journey.',
    buLogo: Assets.Logos.BU.ActiveParents,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'Active Health champions balanced living.',
    question: 'Which of the following is NOT what Active Health advocates for?',
    answers: ['Move Better', 'Eat Better', 'Shop Better'],
    correctIndex: 2,
    didYouKnowCorrect: 'Great job!\n\nActive Health focuses on building sustainable habits through movement, nutrition, and rest — not retail therapy!',
    didYouKnowWrong: 'Good try. Correct answer is C.\n\nActive Health focuses on building sustainable habits through movement, nutrition, and rest — not retail therapy!',
    buLogo: Assets.Logos.BU.ActiveHealth,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'Sport teaches life values.',
    question: 'What are the core values of our ActiveSG Academies & Clubs',
    answers: ['Honour, Resilience and Teamwork', 'Leadership, Responsibility and Perseverance', 'Confidence, Integrity, Sportsmanship'],
    correctIndex: 0,
    didYouKnowCorrect: 'Bravo!\n\nHonour, Resilience, and Teamwork are ActiveSG’s pillars — shaping athletes who respect the game, overcome obstacles, and thrive together.',
    didYouKnowWrong: 'Good try. Correct Answer is A.\n\nHonour, Resilience, and Teamwork are ActiveSG’s pillars — shaping athletes who respect the game, overcome obstacles, and thrive together.',
    buLogo: Assets.Logos.BU.ActiveSgAC,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'ActiveSG makes sport accessible to everyone!',
    question: 'How much is this year’s SG60 ActiveSG Credit Top-Up?',
    answers: ['$60', '$100', '$200'],
    correctIndex: 1,
    didYouKnowCorrect: 'That’s right!\n\nNew members of all ages receive $100 credits to book ActiveSG facilities.',
    didYouKnowWrong: 'Good try. Correct Answer is B.\n\nGood job! New members of all ages receive $100 credits to book ActiveSG facilities.',
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
    ...pickRandom(genre1, 5), // 5 questions from genre 1
    // ...pickRandom(genre1, 3),
    // ...pickRandom(genre2, 1),
    // ...pickRandom(genre3, 1),
  ];
}
