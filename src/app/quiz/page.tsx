'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, Send } from 'lucide-react';

import { generateTailoredSafetyQuiz } from '@/ai/flows/generate-tailored-safety-quiz';
import { evaluateQuizAndProvideFeedback } from '@/ai/flows/evaluate-quiz-and-provide-feedback';
import type { ProfileData, Quiz as QuizType } from '@/lib/types';
import { parseQuiz } from '@/lib/quiz-parser';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Logo } from '@/components/logo';

export default function QuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoadingQuiz, startQuizGeneration] = useTransition();
  const [isEvaluating, startEvaluation] = useTransition();

  useEffect(() => {
    const storedProfile = localStorage.getItem('safety-mentor-profile');
    if (!storedProfile) {
      router.replace('/');
      return;
    }
    const parsedProfile = JSON.parse(storedProfile);
    setProfile(parsedProfile);

    startQuizGeneration(async () => {
      try {
        const result = await generateTailoredSafetyQuiz(parsedProfile);
        if (result && result.quiz) {
          const parsedQuiz = parseQuiz(result.quiz);
          if(parsedQuiz.length === 0) {
            throw new Error("AI failed to generate a valid quiz. Please try again.");
          }
          setQuiz(parsedQuiz);
          setAnswers(new Array(parsedQuiz.length).fill(''));
        } else {
          throw new Error("Received an empty response from the AI.");
        }
      } catch (error) {
        console.error('Failed to generate quiz:', error);
        toast({
          variant: 'destructive',
          title: 'Quiz Generation Failed',
          description: error instanceof Error ? error.message : "Something went wrong. Please go back and try again.",
        });
        // Optional: redirect back or allow retry
      }
    });
  }, [router, toast]);

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };
  
  const handleSubmit = () => {
    if (!quiz || !profile) return;
    
    const unansweredIndex = answers.findIndex(answer => answer.trim() === '');
    if (unansweredIndex !== -1) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Quiz',
        description: `Please answer question ${unansweredIndex + 1} before submitting.`,
      });
      setCurrentQuestionIndex(unansweredIndex);
      return;
    }

    startEvaluation(async () => {
      try {
        const quizQuestions = quiz.map(q => q.question);
        const result = await evaluateQuizAndProvideFeedback({
            quizQuestions,
            userAnswers: answers,
            jobRole: profile.jobRole,
            jobDescription: profile.jobDescription
        });
        
        localStorage.setItem('safety-mentor-quiz-results', JSON.stringify({ ...result, userAnswers: answers, questions: quiz.map(q => q.question + '\n' + q.options?.map(o => o).join('\n') ) }));
        router.push('/report');

      } catch (error) {
         console.error('Failed to evaluate quiz:', error);
         toast({
          variant: 'destructive',
          title: 'Evaluation Failed',
          description: "Something went wrong during evaluation. Please try submitting again.",
        });
      }
    });
  }

  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.length) * 100 : 0;
  const currentQuestion = quiz?.[currentQuestionIndex];

  if (isLoadingQuiz) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Generating your personalized quiz...</p>
      </div>
    );
  }

  if (!quiz || !currentQuestion) {
     return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load the quiz. Please try starting over.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/')} className="mt-4">Start Over</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6">
      <Logo className="mb-4" />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={progress} className="mb-4 h-2" />
          <CardTitle>Question {currentQuestionIndex + 1} of {quiz.length}</CardTitle>
          <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
             <RadioGroup 
                value={answers[currentQuestionIndex]} 
                onValueChange={handleAnswerChange}
                className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-md border p-4 transition-all hover:bg-accent/50 has-[:checked]:bg-accent has-[:checked]:border-primary">
                  <RadioGroupItem value={option} id={`q${currentQuestionIndex}-opt${index}`} />
                  <Label htmlFor={`q${currentQuestionIndex}-opt${index}`} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              placeholder="Type your answer here..."
              value={answers[currentQuestionIndex]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="h-40 resize-none text-base"
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex < quiz.length - 1 ? (
             <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isEvaluating}>
              {isEvaluating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  Submit Quiz
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
