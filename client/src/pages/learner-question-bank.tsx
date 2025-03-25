import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { QuestionBank, Question } from "@shared/schema";

export default function LearnerQuestionBank() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const [filterExam, setFilterExam] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [viewMode, setViewMode] = useState("sequential");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 25;

  // Fetch question bank
  const { data: questionBank, isLoading: isLoadingBank } = useQuery<QuestionBank>({
    queryKey: [`/api/question-banks/${id}`],
  });

  // Fetch questions
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/question-banks/${id}/questions`],
    enabled: !!id,
  });

  // Filter questions based on filters
  const filteredQuestions = questions?.filter(question => {
    const matchesExam = filterExam === "all" || `${question.examName} ${question.examYear}` === filterExam;
    const matchesSubject = filterSubject === "all" || question.subject === filterSubject;
    return matchesExam && matchesSubject;
  }) || [];

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  // Get unique exam options
  const examOptions = questions ? [...new Set(questions.map(q => `${q.examName} ${q.examYear}`))] : [];
  
  // Get unique subject options
  const subjectOptions = questions ? [...new Set(questions.map(q => q.subject))] : [];

  if (isLoadingBank || isLoadingQuestions) {
    return (
      <PageLayout>
        <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!questionBank) {
    return (
      <PageLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardContent className="pt-6">
              <p>Question bank not found or has been removed.</p>
              <Button className="mt-4" onClick={() => navigate("/learner/dashboard")}>
                Back to Dashboard
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
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/learner/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{questionBank.title}</h1>
            <p className="text-muted-foreground">Created by {questionBank.organization}</p>
          </div>
        </div>

        {/* Filter Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam/Test Name & Year</label>
                <Select value={filterExam} onValueChange={setFilterExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {examOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjectOptions.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">View Mode</label>
                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    variant={viewMode === "sequential" ? "default" : "outline"}
                    onClick={() => setViewMode("sequential")}
                  >
                    Sequential
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant={viewMode === "random" ? "default" : "outline"}
                    onClick={() => setViewMode("random")}
                  >
                    Random
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        {currentQuestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to see more questions</p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setFilterExam("all");
                  setFilterSubject("all");
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {currentQuestions.map((question, index) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                      <Badge variant="outline" className="bg-primary-900/60">
                        {question.examName} {question.examYear}
                      </Badge>
                      <Badge variant="outline" className="bg-secondary-900/60">
                        {question.subject}
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                        {question.serialNumber || index + 1}
                      </div>
                      <div className="flex-grow">
                        <p className="text-foreground mb-6">{question.questionText}</p>
                        
                        {/* Options */}
                        {question.hasOptions && question.options && question.options.length > 0 && (
                          <div className="space-y-3 mb-6">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + optIndex)}
                                </div>
                                <span className="text-foreground">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Dropdown toggles */}
                        <div className="space-y-3">
                          <Dropdown title="Reveal Correct Answer">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs">
                                {question.hasOptions && question.options ? 
                                  String.fromCharCode(65 + question.options.indexOf(question.correctAnswer)) : 
                                  <CheckCircle className="h-3 w-3" />
                                }
                              </div>
                              <span className="font-medium">{question.correctAnswer}</span>
                            </div>
                          </Dropdown>
                          
                          {question.description && (
                            <Dropdown title="Show Description">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p>{question.description}</p>
                              </div>
                            </Dropdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{indexOfFirstQuestion + 1}-{Math.min(indexOfLastQuestion, filteredQuestions.length)}</span> of <span className="font-medium">{filteredQuestions.length}</span> questions
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
