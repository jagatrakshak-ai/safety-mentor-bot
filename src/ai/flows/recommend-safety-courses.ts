'use server';

/**
 * @fileOverview Recommends safety courses based on quiz results and user role.
 *
 * - recommendSafetyCourses - A function that recommends safety courses.
 * - RecommendSafetyCoursesInput - The input type for the recommendSafetyCourses function.
 * - RecommendSafetyCoursesOutput - The return type for the recommendSafetyCourses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSafetyCoursesInputSchema = z.object({
  jobRole: z.string().describe('The job role of the user.'),
  quizResults: z.string().describe('The quiz results of the user.'),
});
export type RecommendSafetyCoursesInput = z.infer<typeof RecommendSafetyCoursesInputSchema>;

const CourseSchema = z.object({
  name: z.string().describe('The name of the recommended safety course.'),
  url: z.string().url().describe('A relevant URL for the course from a documentation site or YouTube.'),
});

const RecommendSafetyCoursesOutputSchema = z.object({
  courses: z.array(CourseSchema).describe('A list of recommended safety courses with names and URLs.'),
});
export type RecommendSafetyCoursesOutput = z.infer<typeof RecommendSafetyCoursesOutputSchema>;

export async function recommendSafetyCourses(
  input: RecommendSafetyCoursesInput
): Promise<RecommendSafetyCoursesOutput> {
  return recommendSafetyCoursesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSafetyCoursesPrompt',
  input: {schema: RecommendSafetyCoursesInputSchema},
  output: {schema: RecommendSafetyCoursesOutputSchema},
  prompt: `You are an AI safety training assistant. Based on the job role and quiz results, recommend relevant safety courses. For each course, provide a name and a relevant URL (e.g., from a documentation site, reputable training provider, or YouTube).

Job Role: {{{jobRole}}}
Quiz Results: {{{quizResults}}}

Recommend safety courses:`,
});

const recommendSafetyCoursesFlow = ai.defineFlow(
  {
    name: 'recommendSafetyCoursesFlow',
    inputSchema: RecommendSafetyCoursesInputSchema,
    outputSchema: RecommendSafetyCoursesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
