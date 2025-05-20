import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { ErrorBoundary } from 'react-error-boundary';
import PageError from '@/components/common/PageError';
import { Suspense } from 'react';

const NewLayout = () => {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <ErrorBoundary fallback={<PageError />}>
                <Header />
                <ScrollRestoration />
                <ErrorBoundary fallback={<PageError />}>
                    <div className='grow flex'>
                        <Suspense>
                            <Outlet />
                        </Suspense>
                    </div>
                </ErrorBoundary>
                <Footer />
            </ErrorBoundary >
        </div>
    );
};

export default NewLayout;