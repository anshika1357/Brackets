import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CreatorDashboard from "@/pages/creator-dashboard";
import CreateQuestionBank from "@/pages/create-question-bank";
import LearnerDashboard from "@/pages/learner-dashboard";
import LearnerQuestionBank from "@/pages/learner-question-bank";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/creator/dashboard" component={CreatorDashboard} />
      <ProtectedRoute path="/creator/create" component={CreateQuestionBank} />
      <ProtectedRoute path="/creator/edit/:id" component={CreateQuestionBank} />
      <Route path="/learner/dashboard" component={LearnerDashboard} />
      <Route path="/learner/question-banks" component={LearnerDashboard} />
      <Route path="/learner/question-bank/:id" component={LearnerQuestionBank} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
