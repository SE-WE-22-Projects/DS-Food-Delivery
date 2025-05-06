import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const PageError = () => {

    return <Alert variant="destructive" className="max-w-lg mx-auto my-auto">
        <AlertTitle className='flex flex-col mx-auto'>
            <AlertTriangle className="h-16 w-21 mx-auto mb-2" />
            <div className='text-lg'>
                An error occurred while displaying the page.
            </div>
        </AlertTitle>
        <AlertDescription className='flex flex-col mx-auto mt-4'>
            <div>
                An unexpected error occurred while displaying this page.
            </div>
            <div>
                See console for more details.
            </div>

        </AlertDescription>
    </Alert>
}

export default PageError