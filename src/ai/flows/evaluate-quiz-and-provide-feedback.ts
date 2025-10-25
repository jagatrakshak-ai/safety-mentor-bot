'use server';
/**
 * @fileOverview Evaluates the quiz responses and provides a score with short, specific feedback.
 *
 * - evaluateQuizAndProvideFeedback - A function that handles the quiz evaluation and feedback process.
 * - EvaluateQuizAndProvideFeedbackInput - The input type for the evaluateQuizAndprovideFeedback function.
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
  prompt: `You are an AI safety expert evaluating a safety quiz. Your task is to evaluate the user's answers and provide a final score as a percentage (0-100). You must also provide specific, constructive feedback for each answer, explaining why it is correct or incorrect.

Your evaluation should be contextualized by the user's job role and description.

Job Role: {{{jobRole}}}
Job Description: {{{jobDescription}}}

You will be provided a list of questions and a corresponding list of user answers. For each question, evaluate the provided user answer. If a user's answer is an empty string, you must state 'No answer was provided.' in the feedback for that question.

Here are the questions and answers to evaluate:
{{#each quizQuestions}}
Question {{@index}}: {{this}}
User's Answer for Question {{@index}}: {{lookup ../userAnswers @index}}
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
