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
  userAnswers: z
    .array(z.string())
    .describe('An array of user answers to the quiz questions.'),
  jobRole: z.string().describe('The job role of the user taking the quiz.'),
  jobDescription: z
    .string()
    .describe('The job description of the user taking the quiz.'),
});
export type EvaluateQuizAndProvideFeedbackInput = z.infer<
  typeof EvaluateQuizAndProvideFeedbackInputSchema
>;

const EvaluateQuizAndProvideFeedbackOutputSchema = z.object({
  score: z
    .number()
    .describe('The overall score of the quiz as a percentage (0-100).'),
  feedback: z
    .array(z.string())
    .describe(
      'An array of feedback for each question. The length of this array must match the number of questions.'
    ),
});
export type EvaluateQuizAndProvideFeedbackOutput = z.infer<
  typeof EvaluateQuizAndProvideFeedbackOutputSchema
>;

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

  You will evaluate the user's answers and provide a final score as a percentage from 0 to 100.
  You must also provide specific, constructive feedback for each individual answer. The feedback should explain why the answer is correct or incorrect.
  If a user's answer is an empty string, you must state 'No answer was provided.' in the feedback for that question.
  Take into account the user's job role and job description when evaluating the answers for context.

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
