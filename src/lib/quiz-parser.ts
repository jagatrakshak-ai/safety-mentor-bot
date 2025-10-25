
import type { QuizQuestion } from '@/lib/types';

export function parseQuiz(quizText: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  const normalizedText = quizText.replace(/\r\n/g, '\n').trim();

  const questionBlocks = normalizedText.split(/\n?(?=\d+\.\s)/).filter(block => block.trim().length > 0);

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n');
    
    const questionParts: string[] = [];
    const optionLines: string[] = [];

    let isParsingQuestion = true;
    for(const line of lines) {
        if (/^[A-D]\)/.test(line.trim())) {
            isParsingQuestion = false;
        }
        if(isParsingQuestion) {
            questionParts.push(line.replace(/^\d+\.\s/, '').trim());
        } else {
            optionLines.push(line.trim());
        }
    }
    
    const questionLine = questionParts.join(' ').trim();
    if (questionLine.length < 5) continue;
    
    const options = optionLines
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
