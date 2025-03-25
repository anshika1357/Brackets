import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layouts/Header";
import QuestionView from "@/components/learner/QuestionView";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { QuestionBank, Question, Subject, Exam } from "@shared/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function QuestionBankDetailPage() {
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 25;
  
  // Fetch question bank details
  const { data: questionBank, isLoading: isLoadingBank } = useQuery<QuestionBank>({
    queryKey: [`/api/question-banks/${id}`],
  });
  
  // Fetch questions for this bank
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/question-banks/${id}/questions`],
    enabled: !!id,
  });
  
  // Fetch subjects and exams for filter options
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  const { data: exams } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });
  
  // Filter questions
  const filteredQuestions = questions?.filter(question => {
    let matchesSearch = true;
    let matchesYear = true;
    let matchesSubject = true;
    
    if (search) {
      matchesSearch = question.questionText.toLowerCase().includes(search.toLowerCase());
    }
    
    if (yearFilter !== "all") {
      matchesYear = question.examYear === yearFilter;
    }
    
    if (subjectFilter !== "all") {
      matchesSubject = question.subjectId === parseInt(subjectFilter);
    }
    
    return matchesSearch && matchesYear && matchesSubject;
  });
  
  // Pagination
  const totalPages = Math.ceil((filteredQuestions?.length || 0) / questionsPerPage);
  const paginatedQuestions = filteredQuestions?.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const isLoading = isLoadingBank || isLoadingQuestions;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Header 
          title="Learner Portal" 
          showBackButton 
          backUrl="/learner/question-banks" 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">Loading questions...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header 
        title="Learner Portal" 
        showBackButton 
        backUrl="/learner/question-banks" 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">{questionBank?.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-neutral-600">
              <span>By Creator</span>
              <span>•</span>
              <span>{paginatedQuestions?.length || 0} Questions</span>
              <span>•</span>
              <span>Updated {questionBank?.updatedAt.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search questions..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select 
                  value={yearFilter}
                  onValueChange={setYearFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {/* Get unique years from questions */}
                    {[...new Set(questions?.map(q => q.examYear))]
                      .sort()
                      .reverse()
                      .map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={subjectFilter}
                  onValueChange={setSubjectFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects?.map(subject => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          
          {/* Questions List */}
          {paginatedQuestions?.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No questions match your filters. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedQuestions?.map((question, index) => (
                <QuestionView 
                  key={question.id}
                  question={question}
                  questionNumber={index + 1 + (currentPage - 1) * questionsPerPage}
                  exams={exams}
                  subjects={subjects}
                />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  page < 0 ? (
                    <span key={index} className="text-neutral-500">...</span>
                  ) : (
                    <Button
                      key={index}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
