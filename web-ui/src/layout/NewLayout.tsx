import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const NewLayout = () => {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between mx-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-orange-500">
                        <div className="rounded-full bg-orange-500 p-1">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        QuickEats
                    </div>
                    <div className="grow" />
                    <nav className="hidden md:flex gap-6">
                        <Link to="/restaurant" className="text-sm font-medium">
                            Restaurants
                        </Link>
                        <Link to="#" className="text-sm font-medium">
                            Offers
                        </Link>
                        <Link to="#" className="text-sm font-medium">
                            About Us
                        </Link>
                    </nav>
                    <div className="grow" />
                    <div className="flex items-center gap-4">
                        <Link to="#" className="text-sm font-medium hidden md:block">
                            Sign In
                        </Link>
                        <Button className="bg-orange-500 hover:bg-orange-600">Order Now</Button>
                    </div>
                </div>
            </header>
            <Outlet />
            <footer className="w-full border-t py-6 md:py-0">
                <div className=" flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row container mx-auto">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © 2025 FoodExpress. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link to="#" className="text-sm font-medium">
                            Terms
                        </Link>
                        <Link to="#" className="text-sm font-medium">
                            Privacy
                        </Link>
                        <Link to="#" className="text-sm font-medium">
                            Cookies
                        </Link>
                    </div>
                </div>
            </footer>
        </div>

    );
};

export default NewLayout;