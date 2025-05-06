// questionBank.ts
// Holds the dummy data for genres, topics, questions and answers.

export interface Question {
  genre: string;
  topic: string;
  question: string;
  answers: string[];
  correctIndex: number;
}

const questions: Question[] = [
  {
    genre: 'Dummy Genre 1',
    topic: 'Dummy Topic 1',
    question: 'Dummy Question 1',
    answers: ['Dummy Answer A', 'Dummy Answer B', 'Dummy Answer C'],
    correctIndex: 1,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'Dummy Topic 2',
    question: 'Dummy Question 2',
    answers: ['Answer A', 'Answer B', 'Answer C'],
    correctIndex: 1,
  },
  {
    genre: 'Dummy Genre 2',
    topic: 'Dummy Topic 3',
    question: 'Question 3',
    answers: ['A', 'B', 'C'],
    correctIndex: 1,
  },
  {
    genre: 'Dummy Genre 3',
    topic: 'Dummy Topic 4',
    question: 'Question 4',
    answers: ['A1', 'B1', 'C1'],
    correctIndex: 1,
  },
  {
    genre: 'Dummy Genre 1',
    topic: 'Dummy Topic 5',
    question: 'Question 5',
    answers: ['X', 'Y', 'Z'],
    correctIndex: 1,
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
