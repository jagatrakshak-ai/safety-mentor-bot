'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Loader2, User, Sparkles, ClipboardList, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import placeHolderImages from '@/lib/placeholder-images.json';

const profileFormSchema = z.object({
  companyType: z.string({
    required_error: 'Please select a company type.',
  }),
  jobRole: z
    .string()
    .min(2, {
      message: 'Job role must be at least 2 characters.',
    })
    .max(50, {
      message: 'Job role must not be longer than 50 characters.',
    }),
  jobDescription: z.string().min(10, {
    message: 'Job description must be at least 10 characters.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const companyTypes = [
  'Construction',
  'Manufacturing',
  'Healthcare',
  'Technology',
  'Office',
  'Retail',
  'Hospitality',
  'Other',
];

const howItWorksSteps = [
    {
        icon: User,
        title: "1. Create Your Profile",
        description: "Tell us your industry and job role so we can tailor the assessment.",
    },
    {
        icon: Sparkles,
        title: "2. AI Generates a Quiz",
        description: "Our AI creates a unique, multiple-choice quiz based on your profile.",
    },
    {
        icon: ClipboardList,
        title: "3. Take the Quiz",
        description: "Answer the questions to test your workplace safety knowledge.",
    },
    {
        icon: FileText,
        title: "4. Get Your Report",
        description: "Receive an AI-generated compliance report and course recommendations.",
    }
]

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      companyType: '',
      jobRole: '',
      jobDescription: '',
    },
    mode: 'onChange',
  });

  function onSubmit(data: ProfileFormValues) {
    startTransition(() => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('safety-mentor-profile', JSON.stringify(data));
          router.push('/quiz');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save profile. Please try again.',
        });
      }
    });
  }

  const heroImage = placeHolderImages.placeholderImages.find(p => p.id === 'hero');

  return (
    <div className="relative min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="mx-auto flex w-full max-w-xl flex-col justify-center space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <Logo className="mx-auto" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Start Your Safety Assessment
            </h1>
            <p className="text-sm text-muted-foreground">
              Tell us about your role to get a personalized safety quiz.
            </p>
          </div>
          <Card className="w-full">
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="companyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companyTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Role</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Site Manager"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly describe your main responsibilities."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Start Quiz
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="space-y-6 pt-4">
             <div className="flex flex-col space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">
                    How It Works
                </h2>
                <p className="text-sm text-muted-foreground">
                    A simple, four-step process to enhance your safety knowledge.
                </p>
             </div>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {howItWorksSteps.map((step, index) => (
                    <Card key={step.title} className="bg-muted/30 animate-in fade-in-0 slide-in-from-bottom-5 duration-500" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'backwards' }}>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <step.icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-base font-semibold">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </CardContent>
                    </Card>
                ))}
             </div>
          </div>

        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
      </div>
    </div>
  );
}
