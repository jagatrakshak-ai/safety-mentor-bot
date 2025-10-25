'use server';
/**
 * @fileOverview Evaluates the quiz responses and provides a score with short, specific feedback.
 *
 * - evaluateQuizAndProvideFeedback - A function that handles the quiz evaluation and feedback process.
 * - EvaluateQuizAndProvideFeedbackInput - The input type for the evaluateQuizAndProvideFeedback function.
 * - EvaluateQuizAndProvideFeedbackOutput - The return type for the evaluateQuizAndProvideFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateQuizAndProvideFeedbackInputSchema = z.object({
  quizQuestions: z.array(z.string()).describe('An array of quiz questions.'),
  userAnswers: z.array(z.string()).describe('An array of user answers to the quiz questions.'),
  jobRole: z.string().describe('The job role of the user taking the quiz.'),
  jobDescription: z.string().describe('The job description of the user taking the quiz.'),
});
export type EvaluateQuizAndProvideFeedbackInput = z.infer<typeof EvaluateQuizAndProvideFeedbackInputSchema>;

const EvaluateQuizAndProvideFeedbackOutputSchema = z.object({
  score: z.number().describe('The overall score of the quiz.'),
  feedback: z.array(z.string()).describe('An array of feedback for each question.'),
});
export type EvaluateQuizAndProvideFeedbackOutput = z.infer<typeof EvaluateQuizAndProvideFeedbackOutputSchema>;

export async function evaluateQuizAndProvideFeedback(
  input: EvaluateQuizAndProvideFeedbackInput
): Promise<EvaluateQuizAndProvideFeedbackOutput> {
  return evaluateQuizAndProvideFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateQuizAndProvideFeedbackPrompt',
  input: {schema: EvaluateQuizAndProvideFeedbackInputSchema},
  output: {schema: EvaluateQuizAndProvideFeedbackOutputSchema},
  prompt: `You are an AI safety expert evaluating a safety quiz.

  You will provide a score based on the answers provided, as well as feedback for each question.
  Take into account the user's job role and job description when evaluating the answers.

  Job Role: {{{jobRole}}}
  Job Description: {{{jobDescription}}}

  Quiz Questions and User Answers:
  {{#each quizQuestions}}
    Question {{@index}}: {{this}}
    Answer: {{../userAnswers.[@index]}}
  {{/each}}
  `,
});

const evaluateQuizAndProvideFeedbackFlow = ai.defineFlow(
  {
    name: 'evaluateQuizAndProvideFeedbackFlow',
    inputSchema: EvaluateQuizAndProvideFeedbackInputSchema,
    outputSchema: EvaluateQuizAndProvideFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
