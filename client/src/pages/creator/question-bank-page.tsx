import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layouts/Header";
import QuestionBankForm from "@/components/creator/QuestionBankForm";
import QuestionForm from "@/components/creator/QuestionForm";
import { Question } from "@shared/schema";

export default function QuestionBankPage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  
  const isNewBank = !id || id === 'new';
  const bankId = isNewBank ? 0 : parseInt(id);
  
  // Fetch questions if editing a bank
  const { data: questions } = useQuery<Question[]>({
    queryKey: [`/api/question-banks/${bankId}/questions`],
    enabled: !isNewBank,
  });
  
  const handleAddAnotherQuestion = () => {
    setCurrentQuestionNumber(prev => prev + 1);
  };
  
  const handleComplete = () => {
    setLocation("/creator/dashboard");
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header 
        title={isNewBank ? "Create Question Bank" : "Edit Question Bank"} 
        showBackButton 
        backUrl="/creator/dashboard" 
      />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">
              {isNewBank ? "Question Bank Creation" : "Edit Question Bank"}
            </h2>
            <p className="text-neutral-600">
              {isNewBank 
                ? "Create a new question bank and add questions" 
                : "Edit your question bank and manage questions"
              }
            </p>
          </div>
          
          {/* Question Bank Form */}
          <QuestionBankForm />
          
          {/* Question Form - Only show if bank has ID (not new) */}
          {!isNewBank && (
            <QuestionForm 
              questionBankId={bankId}
              currentQuestionNumber={currentQuestionNumber}
              onAddAnother={handleAddAnotherQuestion}
              onComplete={handleComplete}
            />
          )}
          
          {/* If this is a new bank, prompt to save the bank first */}
          {isNewBank && (
            <div className="text-center py-6 text-neutral-500">
              Save the question bank first to start adding questions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
