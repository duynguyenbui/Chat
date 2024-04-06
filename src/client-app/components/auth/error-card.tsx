import { AlertTriangle } from 'lucide-react';
import { AuthWrapper } from './auth-wrapper';

export const ErrorCard = () => {
  return (
    <AuthWrapper isLogo={false}>
      <div className="w-full flex justify-center items-center">
        <h3 className="text-xl mr-2 font-bold text-muted-foreground">
          Opps! Something went wrong. Please try again later.
        </h3>
        <AlertTriangle className="text-destructive w-16 h-16" />
      </div>
    </AuthWrapper>
  );
};
