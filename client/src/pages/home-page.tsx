import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, PenToolIcon, PlanetIcon } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function HomePage() {
  const [, navigate] = useLocation();

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1462332420958-a05d1e002413?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
            opacity: 0.2
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background -z-10" />
          
        {/* Planet Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="h-[200px] w-[200px] rounded-full border border-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="h-[300px] w-[300px] rounded-full border border-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="h-[400px] w-[400px] rounded-full border border-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          
          {/* Sun */}
          <div className="h-10 w-10 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-yellow-500/50" />
          
          {/* Mercury */}
          <div className="h-2 w-2 bg-gray-400 rounded-full absolute top-[calc(50%-100px)] left-1/2 -translate-x-1/2" />
          
          {/* Venus */}
          <div className="h-3 w-3 bg-yellow-600 rounded-full absolute top-1/2 left-[calc(50%-150px)] -translate-y-1/2" />
          
          {/* Earth */}
          <div className="h-4 w-4 bg-blue-500 rounded-full absolute top-[calc(50%+200px)] left-1/2 -translate-x-1/2" />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Explore and Create Educational Content
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Learn through interactive question banks or create educational content for others.
          </p>
          
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Learner Card */}
            <div className="group bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-8 flex flex-col items-center hover:border-primary/50 transition-colors">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <BookOpenIcon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">I'm a Learner</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Explore question banks, test your knowledge, and learn at your own pace.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/learner/dashboard")} 
                className="bg-primary hover:bg-primary/90"
              >
                Start Learning
              </Button>
            </div>
            
            {/* Creator Card */}
            <div className="group bg-card/50 backdrop-blur-sm border border-secondary/20 rounded-xl p-8 flex flex-col items-center hover:border-secondary/50 transition-colors">
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <PenToolIcon className="h-10 w-10 text-secondary" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">I'm a Creator</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Create question banks, design educational content, and help others learn.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Create Content
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PlanetIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Question Banks</h3>
              <p className="text-muted-foreground">
                Access a wide range of question banks with detailed explanations and answers.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Educational Content Creation</h3>
              <p className="text-muted-foreground">
                Create and publish your own question banks with multiple choice options and detailed descriptions.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a9 9 0 1 0 9 9h-9V3z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.07 4.93A10 10 0 0 0 15.17 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Filtered Learning Experience</h3>
              <p className="text-muted-foreground">
                Sort questions by exam name, year, subject, or browse sequentially through content.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
