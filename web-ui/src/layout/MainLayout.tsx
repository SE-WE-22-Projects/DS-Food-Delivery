import { Outlet } from 'react-router-dom';
import CartMenu from '../components/cart/CartMenu';
import { NavigationMenu, NavigationMenuList } from '../components/ui/navigation-menu';


const MainLayout = () => {
    return (
        <>
            <div className='flex min-h-[100vh] flex-col'>
                <NavigationMenu className='min-w-[100vw] border-b-1 py-2 shadow-md bg-gray-100 min-h-[56px] grow-0'>
                    <NavigationMenuList className='
                flex w-[100vw]'>
                        <div className='grow' />
                        <CartMenu />
                    </NavigationMenuList>
                </NavigationMenu>
                <div className='bg-gray-200 grow'>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default MainLayout