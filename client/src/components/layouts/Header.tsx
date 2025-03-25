import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Menu } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({ title, showBackButton, backUrl }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isHomePage = useMemo(() => location === '/', [location]);
  const isLearnerFlow = useMemo(() => location.startsWith('/learner'), [location]);
  const isCreatorFlow = useMemo(() => location.startsWith('/creator') || location === '/auth', [location]);
  
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary-600 cursor-pointer">Brackets</h1>
          </Link>
          <span className="ml-2 text-sm text-neutral-500">
            {title || (isLearnerFlow ? "Learner Portal" : isCreatorFlow ? "Creator Portal" : "Educational Platform")}
          </span>
        </div>
        
        <div className="hidden sm:flex space-x-4">
          {isHomePage && (
            <>
              <Button variant="outline" size="sm">About</Button>
              <Button variant="outline" size="sm">Help</Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            </>
          )}
          
          {showBackButton && (
            <Button variant="outline" size="sm" asChild>
              <Link href={backUrl || "/"}>
                <span className="flex items-center">
                  ← Back
                </span>
              </Link>
            </Button>
          )}
          
          {user && !isHomePage && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-600 hidden md:inline">
                Welcome, {user.username}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <span className="sr-only">Open menu</span>
                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isCreatorFlow && (
                    <DropdownMenuItem asChild>
                      <Link href="/creator/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
