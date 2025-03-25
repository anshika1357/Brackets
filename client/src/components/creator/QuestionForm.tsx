import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InsertQuestion, insertQuestionSchema, Subject, Exam } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload 
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionFormProps {
  questionBankId: number;
  currentQuestionNumber?: number;
  questionId?: number;
  onAddAnother?: () => void;
  onComplete?: () => void;
}

export default function QuestionForm({ 
  questionBankId, 
  currentQuestionNumber = 1,
  questionId,
  onAddAnother,
  onComplete
}: QuestionFormProps) {
  const { toast } = useToast();
  const isEditing = !!questionId;
  
  // Get subjects and exams
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  const { data: exams } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });
  
  // Get question if editing
  const { data: question, isLoading: isLoadingQuestion } = useQuery({
    queryKey: [`/api/questions/${questionId}`],
    enabled: isEditing,
  });
  
  // Initialize with 4 options
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  
  const form = useForm<InsertQuestion>({
    resolver: zodResolver(insertQuestionSchema.omit({ 
      id: true, 
      questionBankId: true,
      serialNumber: true 
    })),
    defaultValues: {
      examId: 0,
      examYear: new Date().getFullYear().toString(),
      subjectId: 0,
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      description: "",
    },
  });
  
  // Update form when question data is loaded
  useEffect(() => {
    if (isEditing && question) {
      form.reset({
        examId: question.examId,
        examYear: question.examYear,
        subjectId: question.subjectId,
        questionText: question.questionText,
        options: question.options || ["", "", "", ""],
        correctAnswer: question.correctAnswer,
        description: question.description || "",
      });
      if (question.options) {
        setOptions(question.options);
      }
    }
  }, [question, isEditing, form]);
  
  // Update options in form when options state changes
  useEffect(() => {
    form.setValue("options", options);
  }, [options, form]);
  
  // Update correct answer to be valid when options change
  useEffect(() => {
    const currentCorrectAnswer = form.getValues("correctAnswer");
    if (currentCorrectAnswer && !options.includes(currentCorrectAnswer)) {
      form.setValue("correctAnswer", "");
    }
  }, [options, form]);
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  // Create or update question
  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertQuestion>) => {
      const res = await apiRequest(
        isEditing ? "PUT" : "POST",
        isEditing 
          ? `/api/questions/${questionId}` 
          : `/api/question-banks/${questionBankId}/questions`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/question-banks/${questionBankId}/questions`] 
      });
      toast({
        title: `Question ${isEditing ? "updated" : "created"} successfully`,
        description: isEditing 
          ? "Your changes have been saved" 
          : "The question has been added to the bank",
      });
      if (!isEditing && onAddAnother) {
        form.reset({
          examId: form.getValues("examId"),
          examYear: form.getValues("examYear"),
          subjectId: form.getValues("subjectId"),
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          description: "",
        });
        setOptions(["", "", "", ""]);
        onAddAnother();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} question: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: InsertQuestion) => {
    // Filter out empty options
    const filteredOptions = data.options?.filter(opt => opt.trim() !== "") || [];
    mutation.mutate({
      ...data,
      options: filteredOptions.length > 0 ? filteredOptions : undefined,
    });
  };
  
  const handleCompleteClick = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  // For previous/next functionality (would need actual implementation)
  const handlePrevious = () => {
    // Navigation logic would go here
  };
  
  const handleNext = () => {
    // Navigation logic would go here
  };
  
  if (isEditing && isLoadingQuestion) {
    return <div className="text-center py-6">Loading question...</div>;
  }
  
  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {isEditing ? `Edit Question #${currentQuestionNumber}` : `Add Question #${currentQuestionNumber}`}
        </h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrevious}
            disabled={currentQuestionNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNext}
            // This would need logic to determine if there's a next question
            disabled={isEditing}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="examId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam/Paper Name</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exams?.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.name}
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
              name="examYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Year</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="YYYY" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
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
            name="questionText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter your question here..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Options</FormLabel>
            <div className="space-y-3 mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 mr-2">
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={option} 
                                id={`option-${index}`} 
                                disabled={!option.trim()}
                              />
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Input 
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            {form.formState.errors.correctAnswer && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.correctAnswer.message}
              </p>
            )}
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add explanation, solution or additional information..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Attachments (Optional)</FormLabel>
            <div className="border border-dashed border-neutral-300 rounded-md p-4 text-center">
              <Upload className="h-6 w-6 mx-auto text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-600 mb-1">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-neutral-500">Max 8 images, 1MB each</p>
              <Button 
                variant="link" 
                className="mt-2 text-sm"
                type="button"
              >
                Browse Files
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
            <div className="flex gap-3">
              <Button 
                type="submit"
                variant="outline" 
                className="flex-1 sm:flex-none"
              >
                Save Draft
              </Button>
              <Button 
                type="submit"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  // This ensures form validation runs before onAddAnother
                  if (form.formState.isValid && onAddAnother) {
                    setTimeout(onAddAnother, 0);
                  }
                }}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "+ Add Next Question"}
              </Button>
            </div>
            <Button 
              variant="secondary"
              type="button"
              onClick={handleCompleteClick}
            >
              Complete & Publish
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
