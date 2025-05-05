import { AlertTriangle } from 'lucide-react';
import { useErrorBoundary } from 'react-error-boundary';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

const NetworkError = ({ what }: { what?: string }) => {
    const { resetBoundary } = useErrorBoundary();
    return <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertTitle className='flex flex-col mx-auto'>
            <AlertTriangle className="h-16 w-21 mx-auto mb-2" />
            <div className='text-lg'>
                Failed to Load {what ?? "Content"}
            </div>
        </AlertTitle>
        <AlertDescription className='flex flex-col mx-auto mt-4'>
            <div>
                Could not fetch data from the server due to a network error.
            </div>
            <div>
                Please check your connection and try again.
            </div>
            <Button className='mt-4 mb-4' onClick={resetBoundary}>Try Again</Button>
        </AlertDescription>
    </Alert>
}

export default NetworkError