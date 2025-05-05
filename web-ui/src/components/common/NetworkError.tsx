import { AlertTriangle } from 'lucide-react';
import { useErrorBoundary } from 'react-error-boundary';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

const NetworkError = ({ what }: { what?: string }) => {
    const { resetBoundary } = useErrorBoundary();
    return <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to Load {what ?? "Page"}</AlertTitle>
        <AlertDescription>
            Could not fetch data from the server due to a network error.
            Please check your connection and try again.
            <Button onClick={resetBoundary}>Try Again</Button>
        </AlertDescription>
    </Alert>
}

export default NetworkError