import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { ErrorBoundary } from 'react-error-boundary';
import PageError from '@/components/common/PageError';

const NewLayout = () => {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <Header />
            <ScrollRestoration />
            <ErrorBoundary fallback={<PageError />}>
                <div className='grow flex'>
                    <Outlet />
                </div>
            </ErrorBoundary>
            <Footer />
        </div>

    );
};

export default NewLayout;