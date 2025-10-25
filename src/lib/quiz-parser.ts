import type { QuizQuestion } from '@/lib/types';

export function parseQuiz(quizText: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Normalize line endings
  const normalizedText = quizText.replace(/\r\n/g, '\n');

  // Split by common question markers like "Q1:", "1.", etc.
  const questionBlocks = normalizedText.split(/(?=\n\d+\.|\nQ\d+:|\nQuestion \d+:)/).map(b => b.trim()).filter(Boolean);

  // If the first split doesn't work, try another strategy
  if (questionBlocks.length <= 1) {
    const fallbackBlocks = normalizedText.split('\n\n').map(b => b.trim()).filter(Boolean);
    questionBlocks.splice(0, questionBlocks.length, ...fallbackBlocks);
  }

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n');
    const questionLine = lines[0].replace(/^(\d+\.|Q\d+:|Question \d+:)\s*/, '').trim();
    
    // Ignore blocks that are too short to be a question
    if (questionLine.length < 5) continue;

    const options = lines
      .slice(1)
      .map(line => line.trim())
      .filter(line => /^\s*[A-Da-d][\)\.]\s/.test(line));

    if (options.length > 1) { // Require at least 2 options for multiple choice
      questions.push({
        question: questionLine,
        options: options.map(opt => opt.replace(/^\s*[A-Da-d][\)\.]\s*/, '')),
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
