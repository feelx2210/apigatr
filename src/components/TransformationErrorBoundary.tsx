import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TransformationErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface TransformationErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export class TransformationErrorBoundary extends React.Component<
  TransformationErrorBoundaryProps,
  TransformationErrorBoundaryState
> {
  constructor(props: TransformationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TransformationErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TransformationErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">
            Transformation Feature Unavailable
          </h3>
          <p className="text-muted-foreground max-w-md">
            The API transformation feature is temporarily unavailable. 
            This may be due to heavy server load or a temporary issue.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRetry?.();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}