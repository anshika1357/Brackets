import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layouts/Header";
import QuestionBankCard from "@/components/learner/QuestionBankCard";
import { Button } from "@/components/ui/button";
import { QuestionBank } from "@shared/schema";

export default function QuestionBanksPage() {
  const [_, setLocation] = useLocation();
  const [questionCounts, setQuestionCounts] = useState<{[key: number]: number}>({});
  
  // Fetch published question banks
  const { data: questionBanks, isLoading, error } = useQuery<QuestionBank[]>({
    queryKey: ["/api/question-banks"],
  });
  
  // Fetch question counts for each bank
  useEffect(() => {
    if (questionBanks && questionBanks.length > 0) {
      const fetchQuestionCount = async (bankId: number) => {
        try {
          const response = await fetch(`/api/question-banks/${bankId}/questions`);
          if (!response.ok) {
            console.warn(`Failed to fetch questions for bank ${bankId}: ${response.status}`);
            return { bankId, count: 0 };
          }
          const questions = await response.json();
          return { bankId, count: Array.isArray(questions) ? questions.length : 0 };
        } catch (error) {
          console.error(`Error fetching questions for bank ${bankId}:`, error);
          return { bankId, count: 0 };
        }
      };

      // Create promises for all question banks
      const promises = questionBanks.map(bank => fetchQuestionCount(bank.id));
      
      // Execute all promises and update the counts
      Promise.all(promises)
        .then(results => {
          const counts: {[key: number]: number} = {};
          results.forEach(result => {
            if (result && typeof result === 'object' && 'bankId' in result) {
              counts[result.bankId] = result.count;
            }
          });
          setQuestionCounts(counts);
        })
        .catch(error => {
          console.error("Error fetching question counts:", error);
        });
    }
  }, [questionBanks]);
  
  const handleQuestionBankClick = (id: number) => {
    setLocation(`/learner/question-bank/${id}`);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header 
        title="Learner Portal" 
        showBackButton 
        backUrl="/" 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">GATE Architecture Resources</h2>
            <p className="text-neutral-600">
              Browse question banks by creators to help you prepare for GATE Architecture exams
            </p>
          </div>
          
          {/* Question Banks */}
          {isLoading ? (
            <div className="text-center py-8">Loading question banks...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading question banks: {(error as Error).message}
            </div>
          ) : questionBanks?.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No question banks available yet.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {questionBanks?.map((bank) => (
                  <QuestionBankCard 
                    key={bank.id}
                    id={bank.id}
                    title={bank.title}
                    creatorName="Creator" // This would be actual creator name
                    questionCount={questionCounts[bank.id] || 0}
                    updatedAt={bank.updatedAt ? new Date(bank.updatedAt) : new Date()}
                    onClick={() => handleQuestionBankClick(bank.id)}
                  />
                ))}
              </div>
              
              {questionBanks && questionBanks.length > 4 && (
                <div className="text-center">
                  <Button variant="outline">Load More Question Banks</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
