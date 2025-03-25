import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilLine, User } from "lucide-react";

export default function HomeHero() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Welcome to Brackets</h2>
        <p className="text-lg mb-12 text-neutral-600">
          The comprehensive platform for educational question banks and learning resources
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Learner Card */}
          <Card className="hover:border-primary-400 cursor-pointer">
            <CardContent className="p-8">
              <div className="h-16 w-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">I'm a Learner</h3>
              <p className="text-neutral-600 mb-6">
                Access curated question banks, practice exams, and learning resources
              </p>
              <Button className="w-full" asChild>
                <Link href="/learner/question-banks">Continue as Learner</Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Creator Card */}
          <Card className="hover:border-secondary-400 cursor-pointer">
            <CardContent className="p-8">
              <div className="h-16 w-16 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <PencilLine className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">I'm a Creator</h3>
              <p className="text-neutral-600 mb-6">
                Create, manage and publish question banks for your students or audience
              </p>
              <Button className="w-full" variant="secondary" asChild>
                <Link href="/auth">Continue as Creator</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
