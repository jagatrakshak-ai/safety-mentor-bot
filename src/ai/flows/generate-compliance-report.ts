'use server';

/**
 * @fileOverview Generates a detailed compliance report summarizing a worker's performance,
 * training progress, risk awareness, and areas needing reinforcement.
 *
 * - generateComplianceReport - A function that generates the compliance report.
 * - GenerateComplianceReportInput - The input type for the generateComplianceReport function.
 * - GenerateComplianceReportOutput - The return type for the generateComplianceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComplianceReportInputSchema = z.object({
  companyType: z.string().describe('The type of company the worker belongs to.'),
  jobRole: z.string().describe('The job role of the worker.'),
  jobDescription: z.string().describe('A description of the worker\'s job.'),
  quizScore: z.number().describe('The score the worker achieved on the safety quiz.'),
  strengths: z.string().describe('A summary of the worker\'s strengths based on the quiz.'),
  weaknesses: z.string().describe('A summary of the worker\'s weaknesses based on the quiz.'),
});
export type GenerateComplianceReportInput = z.infer<typeof GenerateComplianceReportInputSchema>;

const GenerateComplianceReportOutputSchema = z.object({
  report: z.string().describe('A detailed compliance report summarizing the worker\'s performance and recommendations.'),
  recommendations: z.string().describe('Specific recommendations for improving safety and compliance.'),
});
export type GenerateComplianceReportOutput = z.infer<typeof GenerateComplianceReportOutputSchema>;

export async function generateComplianceReport(input: GenerateComplianceReportInput): Promise<GenerateComplianceReportOutput> {
  return generateComplianceReportFlow(input);
}

const generateComplianceReportPrompt = ai.definePrompt({
  name: 'generateComplianceReportPrompt',
  input: {schema: GenerateComplianceReportInputSchema},
  output: {schema: GenerateComplianceReportOutputSchema},
  prompt: `You are an AI assistant that generates compliance reports for supervisors.

  Based on the worker's information and quiz results, create a detailed report summarizing their performance, training progress, risk awareness, and areas needing reinforcement.
  Also provide specific recommendations for improving safety and compliance.

  Company Type: {{{companyType}}}
  Job Role: {{{jobRole}}}
  Job Description: {{{jobDescription}}}
  Quiz Score: {{{quizScore}}}
  Strengths: {{{strengths}}}
  Weaknesses: {{{weaknesses}}}

  Report:
  {{report}}

  Recommendations:
  {{recommendations}}
  `,
});

const generateComplianceReportFlow = ai.defineFlow(
  {
    name: 'generateComplianceReportFlow',
    inputSchema: GenerateComplianceReportInputSchema,
    outputSchema: GenerateComplianceReportOutputSchema,
  },
  async input => {
    const {output} = await generateComplianceReportPrompt(input);
    return output!;
  }
);
