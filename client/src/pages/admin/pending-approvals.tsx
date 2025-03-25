import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { QuestionBank } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, FileTextIcon, BookmarkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layouts/Header";

export default function PendingApprovalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [questionCounts, setQuestionCounts] = useState<{[key: number]: number}>({});
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);
  
  // Fetch all question banks
  const { data: questionBanks, isLoading, error } = useQuery<QuestionBank[]>({
    queryKey: ["/api/question-banks"],
  });
  
  // Filter to only show pending approval ones
  const pendingQuestionBanks = questionBanks?.filter(bank => 
    bank.status === 'pending_approval' && 
    bank.title.toLowerCase().includes(search.toLowerCase())
  );
  
  // Fetch question counts for each bank
  useEffect(() => {
    if (pendingQuestionBanks && pendingQuestionBanks.length > 0) {
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
      const promises = pendingQuestionBanks.map(bank => fetchQuestions(bank.id));
      
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
  }, [pendingQuestionBanks]);
  
  const handleApprove = (id: number) => {
    // Make an API call to approve the question bank (update status to 'published')
    fetch(`/api/question-banks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'published' }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to approve question bank');
      }
      return response.json();
    })
    .then(() => {
      // Refresh the question banks list
      queryClient.invalidateQueries({ queryKey: ["/api/question-banks"] });
      toast({
        title: "Success",
        description: "Question bank approved and published",
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
  
  const handleReject = (id: number) => {
    // Make an API call to reject the question bank (update status to 'draft')
    fetch(`/api/question-banks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'draft' }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to reject question bank');
      }
      return response.json();
    })
    .then(() => {
      // Refresh the question banks list
      queryClient.invalidateQueries({ queryKey: ["/api/question-banks"] });
      toast({
        title: "Success",
        description: "Question bank rejected and returned to draft",
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
  
  if (!user || user.role !== "admin") {
    return null;
  }
  
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
  
  return (
    <div className="container mx-auto p-4">
      <Header title="Admin Dashboard - Pending Approvals" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Pending Approvals</h1>
        <p className="text-neutral-600">Review and approve question banks submitted by creators</p>
      </div>
      
      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>
      
      {/* Pending Banks List */}
      <div className="space-y-4">
        {pendingQuestionBanks?.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            No question banks pending approval.
          </div>
        ) : (
          pendingQuestionBanks?.map((bank) => (
            <Card key={bank.id} className="p-4 border-l-4 border-l-blue-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold">{bank.title}</h3>
                    <Badge>Pending Approval</Badge>
                  </div>
                  <div className="flex items-center text-sm text-neutral-500 space-x-4">
                    <span>Created by: User #{bank.creatorId}</span>
                    <span className="flex items-center">
                      <FileTextIcon className="h-4 w-4 mr-1" /> 
                      {questionCounts[bank.id] || 0} questions
                    </span>
                    <span className="flex items-center">
                      <BookmarkIcon className="h-4 w-4 mr-1" /> 
                      Various subjects
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/creator/question-bank/${bank.id}`}>
                      Review Details
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(bank.id)}
                  >
                    <CheckIcon className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(bank.id)}
                  >
                    <XIcon className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}