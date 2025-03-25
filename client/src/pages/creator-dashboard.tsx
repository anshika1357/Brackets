import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DataTable } from "@/components/ui/data-table";
import type { QuestionBank } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  EyeOff, 
  Search,
  QuestionMarkCircle
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreatorDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [questionBankToDelete, setQuestionBankToDelete] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const { data: questionBanks, isLoading, error } = useQuery<QuestionBank[]>({
    queryKey: ["/api/question-banks", user?.id],
    enabled: !!user,
  });

  // Filtered question banks
  const filteredQuestionBanks = questionBanks?.filter(qb => {
    let statusMatch = true;
    if (filterStatus === "published") statusMatch = qb.published;
    if (filterStatus === "draft") statusMatch = !qb.published;
    
    return statusMatch;
  }) || [];

  // Delete question bank
  const handleDeleteQuestionBank = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/question-banks/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/question-banks"] });
      setQuestionBankToDelete(null);
    } catch (error) {
      console.error("Error deleting question bank:", error);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    try {
      await apiRequest("PUT", `/api/question-banks/${id}`, {
        published: !currentStatus
      });
      queryClient.invalidateQueries({ queryKey: ["/api/question-banks"] });
    } catch (error) {
      console.error("Error updating publish status:", error);
    }
  };

  // Table columns
  const columns: ColumnDef<QuestionBank>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "organization",
      header: "Organization",
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.published ? "success" : "secondary"}>
          {row.original.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const questionBank = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/learner/question-bank/${questionBank.id}`)}
              title="View Question Bank"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/creator/edit/${questionBank.id}`)}
              title="Edit Question Bank"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleTogglePublish(questionBank.id, questionBank.published)}
              title={questionBank.published ? "Unpublish" : "Publish"}
            >
              {questionBank.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <AlertDialog open={questionBankToDelete === questionBank.id} onOpenChange={(isOpen) => {
              if (!isOpen) setQuestionBankToDelete(null);
            }}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setQuestionBankToDelete(questionBank.id)}
                  title="Delete Question Bank"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Question Bank</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{questionBank.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteQuestionBank(questionBank.id)} className="bg-destructive">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  // If loading or error in fetching user/data
  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardContent className="pt-6">
              <p>Please sign in to access the creator dashboard.</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Question Bank Dashboard</h1>
            <p className="text-muted-foreground">Manage your educational content</p>
          </div>
          
          <Button 
            onClick={() => navigate("/creator/create")} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Question Bank
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <QuestionMarkCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Total Question Banks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{questionBanks?.length || 0}</div>
              <p className="text-muted-foreground text-sm">Created content</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-green-500" />
                </div>
                <span>Published</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {questionBanks?.filter(qb => qb.published).length || 0}
              </div>
              <p className="text-muted-foreground text-sm">Visible to learners</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Edit className="h-4 w-4 text-secondary" />
                </div>
                <span>Drafts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {questionBanks?.filter(qb => !qb.published).length || 0}
              </div>
              <p className="text-muted-foreground text-sm">Work in progress</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Question Banks</CardTitle>
            <CardDescription>
              Manage all your created question banks and their content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setFilterStatus} className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Filter Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="astronomy">Astronomy</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <TabsContent value="all">
                {isLoading ? (
                  <div className="text-center py-8">Loading question banks...</div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    Error loading question banks. Please try again.
                  </div>
                ) : filteredQuestionBanks.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No question banks found</h3>
                    <p className="text-muted-foreground">
                      Create your first question bank to get started
                    </p>
                    <Button 
                      onClick={() => navigate("/creator/create")} 
                      className="mt-4"
                    >
                      Create Question Bank
                    </Button>
                  </div>
                ) : (
                  <DataTable 
                    columns={columns} 
                    data={filteredQuestionBanks} 
                    searchColumn="title"
                    placeholderSearch="Search question banks..."
                  />
                )}
              </TabsContent>
              
              <TabsContent value="published">
                {isLoading ? (
                  <div className="text-center py-8">Loading published question banks...</div>
                ) : filteredQuestionBanks.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">No published question banks</h3>
                    <p className="text-muted-foreground">
                      Publish your draft question banks to make them visible to learners
                    </p>
                  </div>
                ) : (
                  <DataTable 
                    columns={columns} 
                    data={filteredQuestionBanks} 
                    searchColumn="title"
                    placeholderSearch="Search published banks..."
                  />
                )}
              </TabsContent>
              
              <TabsContent value="draft">
                {isLoading ? (
                  <div className="text-center py-8">Loading draft question banks...</div>
                ) : filteredQuestionBanks.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">No draft question banks</h3>
                    <p className="text-muted-foreground">
                      You don't have any unpublished question banks
                    </p>
                  </div>
                ) : (
                  <DataTable 
                    columns={columns} 
                    data={filteredQuestionBanks} 
                    searchColumn="title"
                    placeholderSearch="Search draft banks..."
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
