import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { questionBankFormSchema, questionFormSchema } from "@shared/schema";
import type { InsertQuestionBank, InsertQuestion, Question, QuestionBank } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PlusCircle, Trash2, Edit, Eye, Check, Save, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import PageLayout from "@/components/PageLayout";
import { toast } from "@/hooks/use-toast";

export default function CreateQuestionBank() {
  const { id } = useParams();
  const isEditing = !!id;
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Fetch question bank if editing
  const { data: questionBank, isLoading: isLoadingQuestionBank } = useQuery<QuestionBank>({
    queryKey: [`/api/question-banks/${id}`],
    enabled: isEditing && !!user,
  });

  // Fetch questions if editing
  const { data: fetchedQuestions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/question-banks/${id}/questions`],
    enabled: isEditing && !!user,
    onSuccess: (data) => {
      setQuestions(data);
    }
  });

  // Question bank form
  const questionBankForm = useForm<InsertQuestionBank>({
    resolver: zodResolver(questionBankFormSchema),
    defaultValues: {
      title: "",
      organization: user?.organization || "",
      introduction: "",
      published: false,
      creatorId: user?.id
    }
  });

  // Update form values when editing and data is loaded
  useEffect(() => {
    if (isEditing && questionBank) {
      questionBankForm.reset({
        title: questionBank.title,
        organization: questionBank.organization,
        introduction: questionBank.introduction || "",
        published: questionBank.published,
        creatorId: questionBank.creatorId
      });
    }
  }, [isEditing, questionBank, questionBankForm]);

  // Question form
  const questionForm = useForm<InsertQuestion>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionBankId: Number(id) || 0,
      examName: "",
      examYear: "",
      subject: "",
      questionText: "",
      hasOptions: true,
      options: ["", "", "", ""],
      correctAnswer: "",
      description: "",
      serialNumber: questions.length + 1
    }
  });

  // Reset question form when currentQuestion changes
  useEffect(() => {
    if (currentQuestion) {
      questionForm.reset({
        ...currentQuestion,
        questionBankId: currentQuestion.questionBankId,
      });
    } else {
      questionForm.reset({
        questionBankId: Number(id) || 0,
        examName: "",
        examYear: "",
        subject: "",
        questionText: "",
        hasOptions: true,
        options: ["", "", "", ""],
        correctAnswer: "",
        description: "",
        serialNumber: questions.length + 1
      });
    }
  }, [currentQuestion, questions.length, id, questionForm]);

  // Create question bank mutation
  const createQuestionBankMutation = useMutation({
    mutationFn: async (data: InsertQuestionBank) => {
      const res = await apiRequest("POST", "/api/question-banks", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Question bank created!",
        description: "You can now add questions to your bank."
      });
      navigate(`/creator/edit/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating question bank",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update question bank mutation
  const updateQuestionBankMutation = useMutation({
    mutationFn: async (data: Partial<QuestionBank>) => {
      const res = await apiRequest("PUT", `/api/question-banks/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Question bank updated!",
        description: "Your changes have been saved."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/question-banks/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating question bank",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: InsertQuestion) => {
      const res = await apiRequest("POST", "/api/questions", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Question added!",
        description: "Your question has been added to the bank."
      });
      setQuestions(prev => [...prev, data]);
      setCurrentQuestion(null);
      questionForm.reset({
        questionBankId: Number(id) || 0,
        examName: questionForm.getValues("examName"),
        examYear: questionForm.getValues("examYear"),
        subject: questionForm.getValues("subject"),
        questionText: "",
        hasOptions: true,
        options: ["", "", "", ""],
        correctAnswer: "",
        description: "",
        serialNumber: questions.length + 2
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Question> }) => {
      const res = await apiRequest("PUT", `/api/questions/${id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Question updated!",
        description: "Your changes have been saved."
      });
      setQuestions(prev => prev.map(q => q.id === data.id ? data : q));
      setCurrentQuestion(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/questions/${id}`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Question deleted",
        description: "The question has been removed from the bank."
      });
      setQuestions(prev => prev.filter(q => q.id !== variables));
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Publish question bank
  const publishQuestionBank = async () => {
    try {
      await updateQuestionBankMutation.mutateAsync({ published: true });
      toast({
        title: "Question bank published!",
        description: "Your question bank is now visible to learners."
      });
    } catch (error) {
      console.error("Error publishing question bank:", error);
    }
  };

  // Handle question bank form submission
  const onQuestionBankSubmit = async (data: InsertQuestionBank) => {
    if (isEditing) {
      await updateQuestionBankMutation.mutateAsync(data);
    } else {
      await createQuestionBankMutation.mutateAsync({
        ...data,
        creatorId: user?.id || 0
      });
    }
  };

  // Handle question form submission
  const onQuestionSubmit = async (data: InsertQuestion) => {
    // Ensure options array is properly formatted if hasOptions is true
    const formattedData = {
      ...data,
      options: data.hasOptions ? data.options : []
    };

    if (currentQuestion) {
      await updateQuestionMutation.mutateAsync({
        id: currentQuestion.id,
        data: formattedData
      });
    } else {
      await createQuestionMutation.mutateAsync({
        ...formattedData,
        questionBankId: Number(id) || 0
      });
    }
  };

  // Handle toggle hasOptions
  const handleToggleOptions = (checked: boolean) => {
    questionForm.setValue("hasOptions", checked);
    if (!checked) {
      questionForm.setValue("options", []);
    } else {
      questionForm.setValue("options", ["", "", "", ""]);
    }
  };

  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardContent className="pt-6">
              <p>Please sign in to create or edit question banks.</p>
              <Button className="mt-4" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/creator/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? "Edit Question Bank" : "Create Question Bank"}</h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update your question bank and manage questions" : "Add a new question bank to your collection"}
            </p>
          </div>
        </div>

        {/* Question Bank Information Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{isEditing ? "Question Bank Information" : "Create New Question Bank"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...questionBankForm}>
              <form onSubmit={questionBankForm.handleSubmit(onQuestionBankSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={questionBankForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Bank Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Solar System Fundamentals" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={questionBankForm.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization/Institute Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Astronomy Education Institute" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={questionBankForm.control}
                  name="introduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief Introduction</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a brief description of this question bank..." 
                          className="h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={createQuestionBankMutation.isPending || updateQuestionBankMutation.isPending}>
                  {createQuestionBankMutation.isPending || updateQuestionBankMutation.isPending ? 
                    "Saving..." : isEditing ? "Update Question Bank" : "Create Question Bank"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Question Form - Only show if editing an existing question bank */}
        {isEditing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{currentQuestion ? "Edit Question" : "Add Question"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...questionForm}>
                <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={questionForm.control}
                      name="examName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam/Test Name</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select exam" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Solar System Quiz">Solar System Quiz</SelectItem>
                              <SelectItem value="Astronomy 101">Astronomy 101</SelectItem>
                              <SelectItem value="Space Exploration">Space Exploration</SelectItem>
                              <SelectItem value="GATE-AR">GATE-AR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={questionForm.control}
                      name="examYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam/Test Year</FormLabel>
                          <FormControl>
                            <Input placeholder="YYYY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={questionForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="General Astronomy">General Astronomy</SelectItem>
                              <SelectItem value="Mercury">Mercury</SelectItem>
                              <SelectItem value="Venus">Venus</SelectItem>
                              <SelectItem value="Earth">Earth</SelectItem>
                              <SelectItem value="Mars">Mars</SelectItem>
                              <SelectItem value="Jupiter">Jupiter</SelectItem>
                              <SelectItem value="Saturn">Saturn</SelectItem>
                              <SelectItem value="Uranus">Uranus</SelectItem>
                              <SelectItem value="Neptune">Neptune</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={questionForm.control}
                    name="questionText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your question here..." 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="hasOptions" 
                        checked={questionForm.watch("hasOptions")}
                        onCheckedChange={handleToggleOptions}
                      />
                      <Label htmlFor="hasOptions">This question has multiple-choice options</Label>
                    </div>
                    
                    {questionForm.watch("hasOptions") && (
                      <div className="space-y-3 pl-6">
                        <FormLabel>Options</FormLabel>
                        <RadioGroup 
                          value={questionForm.watch("correctAnswer")}
                          onValueChange={(value) => questionForm.setValue("correctAnswer", value)}
                        >
                          {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="flex gap-3 items-center">
                              <RadioGroupItem 
                                value={questionForm.watch(`options.${index}`) || ""}
                                id={`option-${index}`}
                                disabled={!questionForm.watch(`options.${index}`)}
                              />
                              <FormField
                                control={questionForm.control}
                                name={`options.${index}`}
                                render={({ field }) => (
                                  <FormItem className="flex-grow">
                                    <FormControl>
                                      <Input placeholder={`Option ${String.fromCharCode(65 + index)}`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                    
                    {!questionForm.watch("hasOptions") && (
                      <FormField
                        control={questionForm.control}
                        name="correctAnswer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correct Answer</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the correct answer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <FormField
                    control={questionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description/Explanation (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide an explanation for the answer..." 
                            className="h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-4 pt-4 border-t">
                    {currentQuestion ? (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCurrentQuestion(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={updateQuestionMutation.isPending}
                        >
                          {updateQuestionMutation.isPending ? "Updating..." : "Update Question"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => questionForm.reset()}
                        >
                          Clear Form
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createQuestionMutation.isPending}
                        >
                          {createQuestionMutation.isPending ? "Adding..." : "Add Question"}
                        </Button>
                      </>
                    )}
                    
                    <div className="ml-auto">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            type="button" 
                            variant="default"
                            disabled={questions.length === 0 || !isEditing}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Publish Question Bank
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Publish Question Bank</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will make your question bank and all its questions visible to learners.
                              Are you sure you want to publish now?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={publishQuestionBank}>
                              Publish
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Questions List - Only show if editing and has questions */}
        {isEditing && questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Added Questions ({questions.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate(`/learner/question-bank/${id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{question.examName}</span>
                          <span>•</span>
                          <span>{question.subject}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setCurrentQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteQuestionMutation.mutate(question.id)}
                                className="bg-destructive"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-foreground mb-2">{question.questionText}</p>
                    {question.hasOptions && question.options && question.options.length > 0 && (
                      <div className="pl-4 mb-2 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs 
                              ${option === question.correctAnswer ? 
                                'bg-green-500 text-white' : 'border border-muted-foreground/30'}`}>
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span className={option === question.correctAnswer ? 'font-medium' : ''}>
                              {option}
                            </span>
                            {option === question.correctAnswer && (
                              <Check className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {!question.hasOptions && (
                      <div className="pl-4 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">Correct Answer:</div>
                          <span>{question.correctAnswer}</span>
                        </div>
                      </div>
                    )}
                    {question.description && (
                      <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                        <div className="font-medium mb-1">Description:</div>
                        <p>{question.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
