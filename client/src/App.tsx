import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "@/pages/creator/dashboard-page";
import QuestionBankPage from "@/pages/creator/question-bank-page";
import QuestionBanksPage from "@/pages/learner/question-banks-page";
import QuestionBankDetailPage from "@/pages/learner/question-bank-detail-page";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/creator/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/creator/question-bank/:id" component={QuestionBankPage} />
      <ProtectedRoute path="/creator/question-bank/new" component={QuestionBankPage} />
      <Route path="/learner/question-banks" component={QuestionBanksPage} />
      <Route path="/learner/question-bank/:id" component={QuestionBankDetailPage} />
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
