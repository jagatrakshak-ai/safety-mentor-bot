export type ProfileData = {
  companyType: string;
  jobRole: string;
  jobDescription: string;
};

export type QuizQuestion = {
  question: string;
  options: string[] | null;
  type: 'multiple-choice' | 'text';
};

export type Quiz = QuizQuestion[];

export type QuizResult = {
  score: number;
  feedback: string[];
  userAnswers: string[];
  questions: string[];
};

export type ComplianceReport = {
  report: string;
  recommendations: string;
};

export type CourseRecommendations = {
  courses: string[];
};
