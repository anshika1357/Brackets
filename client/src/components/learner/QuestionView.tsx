import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { Question, Subject, Exam } from "@shared/schema";

interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  exams?: Exam[];
  subjects?: Subject[];
}

export default function QuestionView({ 
  question, 
  questionNumber,
  exams,
  subjects 
}: QuestionViewProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Find exam and subject names
  const examName = exams?.find(e => e.id === question.examId)?.name || "Unknown Exam";
  const subjectName = subjects?.find(s => s.id === question.subjectId)?.name || "Unknown Subject";
  
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  
  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="primary" className="bg-primary-100 text-primary-800">
            {examName} {question.examYear}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-800">
            {subjectName}
          </Badge>
        </div>
        <span className="text-sm text-neutral-500">Question #{questionNumber}</span>
      </div>
      
      <div className="mb-4">
        <p className="font-medium mb-4">{question.questionText}</p>
        
        {question.options && question.options.length > 0 && (
          <div className="ml-4 space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-start">
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                <p>{option}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-neutral-200 pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-3"
          onClick={toggleAnswer}
        >
          {showAnswer ? (
            <span className="flex items-center">
              <EyeOff className="h-4 w-4 mr-1" /> Hide Answer & Explanation
            </span>
          ) : (
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" /> View Answer & Explanation
            </span>
          )}
        </Button>
        
        {showAnswer && (
          <div className="bg-neutral-50 p-4 rounded-md">
            <div className="mb-3">
              <span className="font-semibold">Correct Answer:</span>
              <span className="ml-2 text-green-600 font-medium">
                {/* Find the option letter that matches the correct answer */}
                {question.options 
                  ? `${String.fromCharCode(65 + question.options.indexOf(question.correctAnswer))}. ${question.correctAnswer}`
                  : question.correctAnswer
                }
              </span>
            </div>
            
            {question.description && (
              <div>
                <span className="font-semibold">Explanation:</span>
                <p className="mt-1 text-sm">{question.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
