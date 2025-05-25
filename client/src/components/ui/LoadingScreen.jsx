import { BookOpen } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <BookOpen className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
        <div className="loading-spinner h-8 w-8 mx-auto" />
      </div>
    </div>
  );
}