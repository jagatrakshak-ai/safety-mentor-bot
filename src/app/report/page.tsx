'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BookOpen, CheckCircle, Download, FileText, Loader2, RefreshCw, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import type { ProfileData, QuizResult, ComplianceReport, CourseRecommendations } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateComplianceReport as genComplianceReport } from '@/ai/flows/generate-compliance-report';
import { recommendSafetyCourses as recSafetyCourses } from '@/ai/flows/recommend-safety-courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';

export default function ReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [courses, setCourses] = useState<CourseRecommendations | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const storedProfile = localStorage.getItem('safety-mentor-profile');
    const storedQuizResult = localStorage.getItem('safety-mentor-quiz-results');

    if (!storedProfile || !storedQuizResult) {
      router.replace('/');
      return;
    }

    const parsedProfile = JSON.parse(storedProfile);
    const parsedQuizResult = JSON.parse(storedQuizResult);
    setProfile(parsedProfile);
    setQuizResult(parsedQuizResult);

    startLoading(async () => {
      try {
        const [reportData, coursesData] = await Promise.all([
          genComplianceReport({
            companyType: parsedProfile.companyType,
            jobRole: parsedProfile.jobRole,
            jobDescription: parsedProfile.jobDescription,
            quizScore: parsedQuizResult.score,
            strengths: "Identified from feedback", // Placeholder, AI will infer
            weaknesses: "Identified from feedback", // Placeholder, AI will infer
          }),
          recSafetyCourses({
            jobRole: parsedProfile.jobRole,
            quizResults: `Score: ${parsedQuizResult.score}. Feedback: ${parsedQuizResult.feedback.join(' ')}`,
          }),
        ]);
        setReport(reportData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to generate report/recommendations:', error);
        toast({
          variant: 'destructive',
          title: 'Report Generation Failed',
          description: 'Could not generate the full report. Please try again.',
        });
      }
    });
  }, [router, toast]);
  
  const handleStartOver = () => {
    localStorage.removeItem('safety-mentor-profile');
    localStorage.removeItem('safety-mentor-quiz-results');
    router.push('/');
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('safety-report.pdf');

    } catch (error) {
       console.error('Failed to download PDF:', error);
       toast({
          variant: 'destructive',
          title: 'Download Failed',
          description: 'Could not generate PDF. Please try again.',
        });
    } finally {
      setIsDownloading(false);
    }
  }

  if (!quizResult) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading results...</p>
      </div>
    );
  }
  
  const scoreVariant = quizResult.score >= 75 ? 'default' : 'destructive';
  const ScoreIcon = quizResult.score >= 75 ? CheckCircle : XCircle;

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <header className="mx-auto max-w-4xl flex justify-between items-center mb-6">
        <Logo />
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
            <Button onClick={handleStartOver}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
        </div>
      </header>
      
      <main ref={reportRef} className="mx-auto max-w-4xl bg-background p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
        <Card className="mb-6 border-0 shadow-none">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Your Safety Assessment Results</CardTitle>
                <CardDescription>An overview of your performance and tailored recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <Badge variant={scoreVariant} className="text-4xl font-bold px-4 py-2 h-auto">
                    <ScoreIcon className="mr-2 h-8 w-8" />
                    {quizResult.score}%
                </Badge>
            </CardContent>
        </Card>

        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 print:hidden">
            <TabsTrigger value="report"><FileText className="mr-2 h-4 w-4" />Compliance Report</TabsTrigger>
            <TabsTrigger value="courses"><BookOpen className="mr-2 h-4 w-4" />Recommended Courses</TabsTrigger>
            <TabsTrigger value="review" className="hidden md:flex">Quiz Review</TabsTrigger>
          </TabsList>
          
          <TabsContent value="report" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Compliance Report</CardTitle>
                <CardDescription>A summary for supervisors highlighting training progress and risk awareness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating report...</span>
                  </div>
                ) : report ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h3 className="font-semibold">Summary</h3>
                    <p>{report.report}</p>
                    <Separator className="my-4"/>
                    <h3 className="font-semibold">Recommendations for Improvement</h3>
                    <p>{report.recommendations}</p>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Could not load the compliance report.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Course Recommendations</CardTitle>
                <CardDescription>Courses to improve your safety knowledge based on your results.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Finding courses...</span>
                  </div>
                ) : courses && courses.courses.length > 0 ? (
                  <ul className="space-y-3">
                    {courses.courses.map((course, index) => (
                      <li key={index} className="flex items-start gap-3 rounded-md border p-3">
                        <BookOpen className="h-5 w-5 flex-shrink-0 text-primary mt-1" />
                        <span className="flex-1">{course}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No specific course recommendations at this time.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="mt-4">
             <Card>
              <CardHeader>
                <CardTitle>Quiz Review</CardTitle>
                <CardDescription>A breakdown of your answers and feedback for each question.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizResult.questions.map((q, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <p className="font-semibold">{i+1}. {q}</p>
                    <p className="text-sm text-muted-foreground mt-2">Your answer: <span className="font-medium text-foreground">{quizResult.userAnswers[i]}</span></p>
                    <Separator className="my-2" />
                    <p className="text-sm text-primary">Feedback: <span className="text-foreground">{quizResult.feedback[i]}</span></p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
