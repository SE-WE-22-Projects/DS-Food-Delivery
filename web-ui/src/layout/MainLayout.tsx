import { Outlet } from 'react-router-dom';
import CartMenu from '../components/cart/CartMenu';
import { NavigationMenu, NavigationMenuList } from '../components/ui/navigation-menu';


const MainLayout = () => {
    return (
        <>
            <NavigationMenu className='min-w-[100vw] border-b-1 py-2 shadow-md bg-gray-100 min-h-[56px]'>
                <NavigationMenuList className='
                flex w-[100vw]'>
                    <div className='grow' />
                    <CartMenu />
                </NavigationMenuList>
            </NavigationMenu>
            <Outlet />
        </>
    )
}

export default MainLayout