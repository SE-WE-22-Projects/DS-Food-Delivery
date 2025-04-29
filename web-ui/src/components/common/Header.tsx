// src/components/Header.tsx
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import CartMenu from "../cart/CartMenu";

export function Header() {
  return (
    <header className="bg-amber-500/80 shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Your logo / brand */}
        <Link to="/" className="text-3xl font-bold text-red-600">
          QuickEats
        </Link>

        {/* nav links */}
        <NavigationMenu>
          <NavigationMenuList className="space-x-6 text-lg hidden md:flex">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className="hover:text-red-500 font-semibold text-[25px]">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/about" className="hover:text-red-500 font-semibold text-[25px]">About Us</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/contact" className="hover:text-red-500 font-semibold text-[25px]">Contact</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <div className="flex-grow" />
            <CartMenu />
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
