import { Outlet } from 'react-router-dom';
import CartMenu from '../components/cart/CartMenu';
import { Header } from '@/components/common/Header';
import { NavigationMenu, NavigationMenuList } from '../components/ui/navigation-menu';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 text-gray-900">
            <Header />
            <NavigationMenu className="w-full border-b py-2 shadow-md h-14 flex-none">
                <NavigationMenuList className="w-full flex items-center">
                    <div className="flex-grow" />
                    <CartMenu />
                </NavigationMenuList>
            </NavigationMenu>
            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;