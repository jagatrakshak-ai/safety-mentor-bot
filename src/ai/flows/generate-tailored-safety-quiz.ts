'use server';
/**
 * @fileOverview Generates a safety quiz tailored to the user's company type, job role, and job description.
 *
 * - generateTailoredSafetyQuiz - A function that generates the safety quiz.
 * - GenerateTailoredSafetyQuizInput - The input type for the generateTailoredSafetyQuiz function.
 * - GenerateTailoredSafetyQuizOutput - The return type for the generateTailoredSafetyQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTailoredSafetyQuizInputSchema = z.object({
  companyType: z.string().describe('The type of company the user works for.'),
  jobRole: z.string().describe('The job role of the user.'),
  jobDescription: z.string().describe('A description of the user\'s job.'),
});
export type GenerateTailoredSafetyQuizInput = z.infer<
  typeof GenerateTailoredSafetyQuizInputSchema
>;

const GenerateTailoredSafetyQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated safety quiz.'),
});
export type GenerateTailoredSafetyQuizOutput = z.infer<
  typeof GenerateTailoredSafetyQuizOutputSchema
>;

export async function generateTailoredSafetyQuiz(
  input: GenerateTailoredSafetyQuizInput
): Promise<GenerateTailoredSafetyQuizOutput> {
  return generateTailoredSafetyQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTailoredSafetyQuizPrompt',
  input: {schema: GenerateTailoredSafetyQuizInputSchema},
  output: {schema: GenerateTailoredSafetyQuizOutputSchema},
  prompt: `You are a safety expert who generates multiple-choice quizzes.

Generate a safety quiz with 4-5 multiple-choice questions tailored to the following information.

Company Type: {{{companyType}}}
Job Role: {{{jobRole}}}
Job Description: {{{jobDescription}}}

The quiz must adhere to the following format:
1.  Start each question on a new line, prefixed with a number (e.g., "1.").
2.  List the multiple-choice options immediately below the question.
3.  Each option must be on a new line and prefixed with a capital letter followed by a parenthesis (e.g., "A)", "B)", "C)", "D)").
4.  Do not include a title for the quiz.
`,
});

const generateTailoredSafetyQuizFlow = ai.defineFlow(
  {
    name: 'generateTailoredSafetyQuizFlow',
    inputSchema: GenerateTailoredSafetyQuizInputSchema,
    outputSchema: GenerateTailoredSafetyQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
