// src/components/Header.tsx
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import CartMenu from "../cart/CartMenu";
import { User2 } from "lucide-react";

export function Header() {
  return (
    <>
      <div className="h-16 w-full" />
      <header className="bg-[#ff9e36] shadow fixed top-0 left-0 z-10 w-[100vw]">
        <div className="mx-auto py-4 flex justify-between items-center px-8">
          {/* logo */}
          <Link to="/" className="text-3xl font-bold text-[#ff4545]">
            QuickEats
          </Link>

          {/* nav links */}
          <NavigationMenu >
            <NavigationMenuList className="space-x-6 text-lg hidden md:flex">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className="hover:text-red-500 font-semibold text-[20px]">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/about" className="hover:text-red-500 font-semibold text-[20px]">About Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/contact" className="hover:text-red-500 font-semibold text-[20px]">Contact</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="font-semibold text-[20px]">
                <CartMenu />
              </NavigationMenuItem>
              <NavigationMenuItem className="font-semibold text-[20px]">
                <User2 />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
    </>
  );
}
