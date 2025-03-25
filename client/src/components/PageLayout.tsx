import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  PlanetIcon, 
  LogOutIcon, 
  MenuIcon, 
  UserIcon,
  BookOpenIcon,
  BarChartIcon,
  PenToolIcon,
  LayoutDashboardIcon
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  const isCreatorSection = location.startsWith("/creator");
  const isLearnerSection = location.startsWith("/learner");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b transition-all ${isScrolled ? 'bg-background/80 backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <PlanetIcon className="h-6 w-6 text-secondary-600" />
            <span>Brackets</span>
          </Link>
          
          {/* Navigation - shown based on section and auth state */}
          <div className="hidden md:flex items-center space-x-6">
            {isCreatorSection && user && (
              <nav className="flex items-center space-x-6">
                <Link href="/creator/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/creator/create" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Create Content
                </Link>
              </nav>
            )}
            
            {isLearnerSection && (
              <nav className="flex items-center space-x-6">
                <Link href="/learner/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Explore
                </Link>
                <Link href="/learner/question-banks" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Question Banks
                </Link>
              </nav>
            )}
          </div>
          
          {/* User Menu or Sign In Button */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.organization || "No organization"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/creator/dashboard" className="cursor-pointer">
                      <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="grid gap-6 py-6">
                  <div className="flex flex-col space-y-3">
                    <Link href="/" className="text-lg font-semibold flex items-center gap-2">
                      <PlanetIcon className="h-5 w-5 text-secondary-600" />
                      Brackets
                    </Link>
                    
                    <hr className="border-t" />
                    
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 py-3">
                          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-foreground">
                              {user.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.organization || "No organization"}
                            </div>
                          </div>
                        </div>
                        
                        <hr className="border-t" />
                        
                        <Link href="/creator/dashboard" className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                          <LayoutDashboardIcon className="h-5 w-5" />
                          Dashboard
                        </Link>
                        <Link href="/creator/create" className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                          <PenToolIcon className="h-5 w-5" />
                          Create Content
                        </Link>
                        
                        <hr className="border-t" />
                        
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <LogOutIcon className="h-5 w-5" />
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth" className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                          <UserIcon className="h-5 w-5" />
                          Sign In / Register
                        </Link>
                        
                        <hr className="border-t" />
                      </>
                    )}
                    
                    <Link href="/learner/dashboard" className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                      <BookOpenIcon className="h-5 w-5" />
                      Learn
                    </Link>
                    <Link href="/learner/question-banks" className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                      <BarChartIcon className="h-5 w-5" />
                      Question Banks
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-2 text-xl font-bold mb-4 md:mb-0">
              <PlanetIcon className="h-5 w-5 text-secondary-600" />
              <span>Brackets</span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Brackets. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
