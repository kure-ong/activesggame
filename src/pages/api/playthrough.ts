import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dirPath = path.join(process.cwd(), 'data');
const filePath = path.join(dirPath, 'playthrough.csv');
const HEADERS = 'index,timestamp,duration_in_seconds,score';

function ensureCSVFileWithHeaders(): void {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, HEADERS + '\n');
  } else {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content.startsWith('index,')) {
      const originalData = content ? `\n${content}` : '';
      fs.writeFileSync(filePath, HEADERS + originalData + '\n');
    }
  }
}

function getNextIndex(): number {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = content.split('\n');
  const dataLines = lines.slice(1); // exclude header
  if (dataLines.length === 0) return 1;

  const lastLine = dataLines[dataLines.length - 1];
  const lastIndex = parseInt(lastLine.split(',')[0], 10);
  return isNaN(lastIndex) ? 1 : lastIndex + 1;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  ensureCSVFileWithHeaders();

  if (req.method === 'POST') {
    const { duration, score } = req.body;

    if (typeof score !== 'number' || typeof duration !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid "score" or "duration"' });
    }

    const timestamp = new Date().toISOString();
    const index = getNextIndex();
    const row = `${index},${timestamp},${duration},${score}\n`;
    fs.appendFileSync(filePath, row);

    return res.status(200).json({ message: 'Playthrough logged', index, timestamp, score, duration });
  }

  if (req.method === 'GET') {
    const csv = fs.readFileSync(filePath, 'utf-8');
    return res.status(200).send(csv);
  }

  return res.status(405).end();
}