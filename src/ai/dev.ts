import { config } from 'dotenv';
config();

import '@/ai/flows/generate-compliance-report.ts';
import '@/ai/flows/evaluate-quiz-and-provide-feedback.ts';
import '@/ai/flows/generate-tailored-safety-quiz.ts';
import '@/ai/flows/recommend-safety-courses.ts';