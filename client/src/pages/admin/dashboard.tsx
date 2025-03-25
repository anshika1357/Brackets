import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layouts/Header";
import { 
  ShieldAlertIcon, 
  UsersIcon, 
  BookOpenIcon, 
  ClipboardListIcon
} from "lucide-react";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
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
  
  if (!user || user.role !== "admin") {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4">
      <Header title="Admin Dashboard" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-neutral-600">Manage platform content and users</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Card */}
        <Card className="p-6 flex flex-col h-full">
          <div className="mb-4">
            <ShieldAlertIcon className="h-10 w-10 text-blue-500 mb-2" />
            <h2 className="text-xl font-semibold">Content Approvals</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Review and approve pending question banks submitted by creators
            </p>
          </div>
          <div className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/admin/pending-approvals">
                Manage Approvals
              </Link>
            </Button>
          </div>
        </Card>
        
        {/* User Management Card */}
        <Card className="p-6 flex flex-col h-full">
          <div className="mb-4">
            <UsersIcon className="h-10 w-10 text-green-500 mb-2" />
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="mt-auto">
            <Button asChild variant="outline" className="w-full">
              <Link href="#">
                Manage Users
              </Link>
            </Button>
          </div>
        </Card>
        
        {/* Content Management Card */}
        <Card className="p-6 flex flex-col h-full">
          <div className="mb-4">
            <BookOpenIcon className="h-10 w-10 text-amber-500 mb-2" />
            <h2 className="text-xl font-semibold">Subject Management</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Manage subjects, exams, and categories
            </p>
          </div>
          <div className="mt-auto">
            <Button asChild variant="outline" className="w-full">
              <Link href="#">
                Manage Subjects
              </Link>
            </Button>
          </div>
        </Card>
        
        {/* Stats & Reports Card */}
        <Card className="p-6 flex flex-col h-full">
          <div className="mb-4">
            <ClipboardListIcon className="h-10 w-10 text-purple-500 mb-2" />
            <h2 className="text-xl font-semibold">Reports & Analytics</h2>
            <p className="text-sm text-neutral-600 mt-1">
              View platform statistics and usage reports
            </p>
          </div>
          <div className="mt-auto">
            <Button asChild variant="outline" className="w-full">
              <Link href="#">
                View Reports
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}