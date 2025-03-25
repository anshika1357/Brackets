import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { InsertQuestionBank, insertQuestionBankSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function QuestionBankForm() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const isNewBank = !id || id === 'new';
  
  // Query the question bank if editing
  const { data: questionBank, isLoading } = useQuery({
    queryKey: [`/api/question-banks/${id}`],
    enabled: !isNewBank,
  });

  const form = useForm<InsertQuestionBank>({
    resolver: zodResolver(insertQuestionBankSchema.omit({ creatorId: true })),
    defaultValues: {
      title: "",
      status: "draft",
    },
  });

  // Update form when question bank data is loaded
  useEffect(() => {
    if (!isNewBank && questionBank) {
      form.reset({
        title: questionBank.title,
        status: questionBank.status,
      });
    }
  }, [questionBank, isNewBank, form]);

  // Create or update question bank
  const mutation = useMutation({
    mutationFn: async (data: InsertQuestionBank) => {
      const res = await apiRequest(
        isNewBank ? "POST" : "PUT",
        isNewBank ? "/api/question-banks" : `/api/question-banks/${id}`,
        data
      );
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/question-banks"] });
      toast({
        title: `Question bank ${isNewBank ? "created" : "updated"} successfully`,
        description: "You can now add questions to this bank",
      });
      if (isNewBank) {
        setLocation(`/creator/question-bank/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isNewBank ? "create" : "update"} question bank: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertQuestionBank) => {
    mutation.mutate(data);
  };

  if (!isNewBank && isLoading) {
    return <div className="text-center py-6">Loading question bank...</div>;
  }

  return (
    <Card className="p-6 mb-8">
      <h3 className="text-lg font-medium mb-4">Question Bank Details</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Bank Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., GATE Architecture 2022" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={mutation.isPending}
            >
              {mutation.isPending 
                ? (isNewBank ? "Creating..." : "Updating...") 
                : (isNewBank ? "Create Question Bank" : "Update Question Bank")
              }
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
