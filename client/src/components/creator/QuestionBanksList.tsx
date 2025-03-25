import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { QuestionBank } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, FileTextIcon, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryClient } from "@/lib/queryClient";

export default function QuestionBanksList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [questionCounts, setQuestionCounts] = useState<{[key: number]: number}>({});
  
  const { data: questionBanks, isLoading, error } = useQuery<QuestionBank[]>({
    queryKey: ["/api/creator/question-banks"],
  });

  // Fetch question counts for each bank
  useEffect(() => {
    if (questionBanks && questionBanks.length > 0) {
      const fetchQuestions = async (bankId: number) => {
        try {
          const response = await fetch(`/api/question-banks/${bankId}/questions`, {
            credentials: 'include'
          });
          if (!response.ok) return [];
          const questions = await response.json();
          return { bankId, count: questions.length };
        } catch (error) {
          console.error(`Error fetching questions for bank ${bankId}:`, error);
          return { bankId, count: 0 };
        }
      };

      // Create promises for all question banks
      const promises = questionBanks.map(bank => fetchQuestions(bank.id));
      
      // Execute all promises and update the counts
      Promise.all(promises).then(results => {
        const counts: {[key: number]: number} = {};
        results.forEach(result => {
          if (result && typeof result === 'object' && 'bankId' in result) {
            counts[result.bankId] = result.count;
          }
        });
        setQuestionCounts(counts);
      });
    }
  }, [questionBanks]);
  
  if (isLoading) {
    return <div className="text-center py-6">Loading question banks...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        Error loading question banks: {error.message}
      </div>
    );
  }
  
  // Filter question banks
  const filteredQuestionBanks = questionBanks?.filter(bank => {
    let matchesSearch = true;
    let matchesSubject = true;
    let matchesStatus = true;
    
    if (search) {
      matchesSearch = bank.title.toLowerCase().includes(search.toLowerCase());
    }
    
    if (subjectFilter !== "all") {
      // This is simplified since we don't have subject data in the bank object
      // In a real app, this would filter based on actual subject data
      matchesSubject = true;
    }
    
    if (statusFilter !== "all") {
      matchesStatus = bank.status === statusFilter;
    }
    
    return matchesSearch && matchesSubject && matchesStatus;
  });
  
  const handlePublish = (id: number, status: 'published' | 'draft' | 'pending_approval' = 'pending_approval') => {
    // Get appropriate message based on the action
    const actionMessage = 
      status === 'pending_approval' 
        ? 'submitted for approval'
        : status === 'published' 
          ? 'published' 
          : status === 'draft' && 'returned to draft';
    
    // Make an API call to update the question bank status
    fetch(`/api/question-banks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to update question bank status`);
      }
      return response.json();
    })
    .then((updatedBank) => {
      // Refresh the question banks list
      queryClient.invalidateQueries({ queryKey: ["/api/creator/question-banks"] });
      
      // Show appropriate success message based on the updated status
      let successMessage = '';
      
      // The backend might change the requested status for non-admin users
      if (updatedBank.status === 'pending_approval' && status === 'pending_approval') {
        successMessage = 'Question bank submitted for approval';
      } else if (updatedBank.status === 'draft' && status === 'draft') {
        successMessage = 'Question bank returned to draft';
      } else if (updatedBank.status === 'published') {
        successMessage = 'Question bank published successfully';
      } else {
        successMessage = `Question bank ${actionMessage}`;
      }
      
      toast({
        title: "Success",
        description: successMessage,
      });
    })
    .catch(error => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this question bank? This action cannot be undone.')) {
      fetch(`/api/question-banks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete question bank');
        }
        // Refresh the question banks list
        queryClient.invalidateQueries({ queryKey: ["/api/creator/question-banks"] });
        toast({
          title: "Success",
          description: "Question bank deleted successfully",
        });
      })
      .catch(error => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
    }
  };
  
  return (
    <div className="flex-1">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Question Banks</h2>
          <p className="text-neutral-600">Manage your existing question banks or create new ones</p>
        </div>
        <Button variant="secondary" className="flex items-center" asChild>
          <Link href="/creator/question-bank/new">
            <span className="flex items-center">+ New Question Bank</span>
          </Link>
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search by title or keywords..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="building-services">Building Services</SelectItem>
                <SelectItem value="structures">Structures</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      
      {/* Question Banks List */}
      <div className="space-y-4">
        {filteredQuestionBanks?.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            No question banks found. Create a new one to get started.
          </div>
        ) : (
          filteredQuestionBanks?.map((bank) => (
            <Card 
              key={bank.id} 
              className={`p-4 border-l-4 ${
                bank.status === 'published' 
                  ? 'border-l-green-500' 
                  : bank.status === 'pending_approval'
                    ? 'border-l-blue-500'
                    : 'border-l-amber-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold">{bank.title}</h3>
                    <Badge variant={
                      bank.status === 'published' 
                        ? 'secondary' 
                        : bank.status === 'pending_approval'
                          ? 'default'
                          : 'outline'
                    }>
                      {bank.status === 'published' 
                        ? 'Published' 
                        : bank.status === 'pending_approval'
                          ? 'Pending Approval'
                          : 'Draft'
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-neutral-500 space-x-4">
                    <span className="flex items-center">
                      <FileTextIcon className="h-4 w-4 mr-1" /> 
                      {questionCounts[bank.id] || 0} questions
                    </span>
                    <span className="flex items-center">
                      <BookmarkIcon className="h-4 w-4 mr-1" /> 
                      {/* This would be actual subject list */}
                      Various subjects
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/creator/question-bank/${bank.id}`}>
                      {bank.status === 'draft' ? 'Continue' : 'Edit'}
                    </Link>
                  </Button>
                  
                  {bank.status === 'draft' && (
                    <Button size="sm" onClick={() => handlePublish(bank.id)}>
                      Submit for Approval
                    </Button>
                  )}
                  
                  {bank.status === 'pending_approval' && (
                    <Button size="sm" variant="outline" disabled>
                      Awaiting Approval
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(bank.id)}>
                        Delete
                      </DropdownMenuItem>
                      {bank.status === 'published' && (
                        <DropdownMenuItem onClick={() => handlePublish(bank.id, 'draft')}>
                          Unpublish
                        </DropdownMenuItem>
                      )}
                      {bank.status === 'pending_approval' && (
                        <DropdownMenuItem onClick={() => handlePublish(bank.id, 'draft')}>
                          Cancel Approval Request
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
