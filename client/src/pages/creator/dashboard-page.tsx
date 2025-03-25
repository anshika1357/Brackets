import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layouts/Header";
import CreatorSidebar from "@/components/creator/CreatorSidebar";
import QuestionBanksList from "@/components/creator/QuestionBanksList";
import { useAuth } from "@/hooks/use-auth";
import { QuestionBank } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch question banks for stats
  const { data: questionBanks } = useQuery<QuestionBank[]>({
    queryKey: ["/api/creator/question-banks"],
  });
  
  // Calculate stats for sidebar
  const statsData = {
    published: questionBanks?.filter(bank => bank.status === 'published').length || 0,
    drafts: questionBanks?.filter(bank => bank.status === 'draft').length || 0,
    totalQuestions: 0, // This would be calculated from actual questions data
  };
  
  if (!user) {
    return null; // Protected route should handle redirecting
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header title="Creator Dashboard" />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-6">
          <CreatorSidebar 
            user={user} 
            statsData={statsData}
          />
          <QuestionBanksList />
        </div>
      </div>
    </div>
  );
}
