import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { User } from "lucide-react";

interface QuestionBankCardProps {
  id: number;
  title: string;
  creatorName: string;
  questionCount: number;
  updatedAt: Date;
  onClick?: () => void;
}

export default function QuestionBankCard({
  id,
  title,
  creatorName,
  questionCount,
  updatedAt,
  onClick
}: QuestionBankCardProps) {
  // Format the updatedAt date
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };
  
  const timeAgo = formatTimeAgo(updatedAt);
  
  return (
    <Card 
      className="hover:border-primary-300 cursor-pointer transition-all duration-200"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="primary" className="bg-primary-100 text-primary-800">
            {questionCount} Questions
          </Badge>
        </div>
        <p className="text-neutral-600 mb-4 text-sm">
          {/* This would be actual description */}
          Comprehensive collection of questions covering various subjects.
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center mr-2">
              <User className="h-4 w-4 text-neutral-700" />
            </div>
            <span className="text-sm font-medium">{creatorName}</span>
          </div>
          <span className="text-xs text-neutral-500">Updated {timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
