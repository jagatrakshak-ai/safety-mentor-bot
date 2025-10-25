
import type { QuizQuestion } from '@/lib/types';

export function parseQuiz(quizText: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Normalize line endings and remove any leading/trailing whitespace
  const normalizedText = quizText.replace(/\r\n/g, '\n').trim();

  // Split questions by a number followed by a period and a space.
  // This is a more reliable way to split the questions.
  const questionBlocks = normalizedText.split(/\n?(?=\d\.\s)/).filter(block => block.trim().length > 0);

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n');
    
    // The first line is the question.
    const questionLine = lines[0].replace(/^\d\.\s/, '').trim();
    if (questionLine.length < 5) continue;

    // Filter for lines that look like multiple-choice options (e.g., "A) ...")
    const options = lines
      .slice(1)
      .map(line => line.trim())
      .filter(line => /^[A-D]\)/.test(line));

    if (options.length > 1) {
      questions.push({
        question: questionLine,
        options: options.map(opt => opt.replace(/^[A-D]\)\s*/, '')),
        type: 'multiple-choice',
      });
    } else {
      questions.push({
        question: questionLine,
        options: null,
        type: 'text',
      });
    }
  }

  return questions;
}
