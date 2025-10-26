# Safety Mentor Bot

Safety Mentor Bot is an intelligent, AI-driven application designed to enhance workplace safety by providing personalized training assessments. It dynamically generates safety quizzes tailored to an individual's specific job role and industry. Based on the quiz results, it provides a comprehensive compliance report, detailed feedback, and actionable course recommendations to improve safety knowledge.

## Features

- **Personalized User Profiling**: Users start by providing their industry, job role, and a description of their responsibilities. This profile is used to tailor the entire assessment experience.
- **AI-Generated Safety Quiz**: Leverages the power of Google's Gemini model via Genkit to create a unique, multiple-choice safety quiz that is highly relevant to the user's specific work context.
- **Interactive Quiz Experience**: A clean, step-by-step user interface for taking the quiz, with progress tracking.
- **AI-Powered Evaluation and Feedback**: After submission, an AI agent evaluates the user's answers, calculates a final score, and provides constructive feedback for each question.
- **Detailed Compliance Report**: The AI generates a formal compliance report that summarizes the user's performance, analyzes risk awareness, and identifies areas needing reinforcement. This is ideal for supervisory review.
- **Actionable Course Recommendations**: Based on quiz performance, the application suggests relevant safety courses, complete with links to external resources like documentation or YouTube videos.
- **Downloadable PDF Report**: Users can download a complete, professionally formatted PDF of their assessment results, including their score, feedback, compliance report, and course recommendations.

## Technology Stack

This project is built with a modern, type-safe, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (The open-source generative AI framework from Google)
  - **Model**: Google Gemini Pro
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## How It Works

1.  **Profile Creation**: The user fills out a simple form on the homepage. This data is stored in the browser's local storage.
2.  **Quiz Generation**: On the quiz page, the user's profile is sent to a Genkit flow. The AI uses this information to generate a relevant, multiple-choice quiz.
3.  **Quiz Submission & Evaluation**: The user's answers are sent to another Genkit flow, which evaluates the responses, calculates a score, and generates feedback.
4.  **Report & Recommendation Generation**: On the report page, two parallel AI calls are made: one to generate the detailed compliance report and another to recommend safety courses based on the results.
5.  **Display Results**: The final report page presents all the generated information—score, feedback, compliance report, and courses—in a clear, tabbed interface.
