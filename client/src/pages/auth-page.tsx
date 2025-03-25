import Header from "@/components/layouts/Header";
import AuthForms from "@/components/auth/AuthForms";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user && !isLoading) {
    return <Redirect to="/creator/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header 
        title="Creator Portal" 
        showBackButton 
        backUrl="/" 
      />
      <AuthForms />
    </div>
  );
}
