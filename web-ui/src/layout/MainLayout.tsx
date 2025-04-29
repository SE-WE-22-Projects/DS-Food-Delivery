import { Outlet } from 'react-router-dom';
import { Header } from '@/components/common/Header';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 text-gray-900">
            <Header />
            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;