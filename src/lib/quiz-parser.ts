
import type { QuizQuestion } from '@/lib/types';

export function parseQuiz(quizText: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  const normalizedText = quizText.replace(/\r\n/g, '\n').trim();

  // Split by question number (e.g., "1.", "2.")
  const questionBlocks = normalizedText.split(/\n?(?=\d+\.\s)/).filter(block => block.trim().length > 0);

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n');
    
    // The first line is always the question
    const questionLine = lines[0].replace(/^\d+\.\s/, '').trim();
    if (questionLine.length < 5) continue;
    
    const options = lines
      .slice(1)
      .map(line => line.trim())
      .filter(line => /^[A-D]\)/.test(line));

    if (options.length > 1) {
      // It's a multiple-choice question
      questions.push({
        question: questionLine,
        options: options.map(opt => opt.replace(/^[A-D]\)\s*/, '')),
        type: 'multiple-choice',
      });
    } else {
      // It's a text-based (or incorrectly formatted) question
      questions.push({
        question: questionLine,
        options: null,
        type: 'text',
      });
    }
  }

  return questions;
}
