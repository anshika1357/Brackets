import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Settings 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

interface CreatorSidebarProps {
  user: User;
  statsData?: {
    published: number;
    drafts: number;
    totalQuestions: number;
  };
}

export default function CreatorSidebar({ user, statsData }: CreatorSidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const defaultStats = {
    published: 0,
    drafts: 0,
    totalQuestions: 0,
    ...statsData
  };
  
  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-neutral-100">
          <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-700 font-medium">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium">{user.username}</h3>
            <p className="text-sm text-neutral-500">
              {user.companyName || "Organization"}
            </p>
          </div>
        </div>
        <nav className="mt-4 space-y-1">
          <Link href="/creator/dashboard">
            <a className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
              location === "/creator/dashboard" 
                ? "bg-primary-50 text-primary-700" 
                : "text-neutral-700 hover:bg-neutral-100"
            }`}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
          </Link>
          <a className="flex items-center space-x-2 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100">
            <FileText className="h-4 w-4" />
            <span>Question Banks</span>
          </a>
          <a className="flex items-center space-x-2 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </a>
          <a 
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </a>
        </nav>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-medium mb-3">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Published Banks</span>
            <span className="font-medium">{defaultStats.published}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Draft Banks</span>
            <span className="font-medium">{defaultStats.drafts}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Total Questions</span>
            <span className="font-medium">{defaultStats.totalQuestions}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
