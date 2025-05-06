import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const NewLayout = () => {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <Header />
            <ScrollRestoration />
            <div className='grow flex'>
                <Outlet />
            </div>
            <Footer />
        </div>

    );
};

export default NewLayout;