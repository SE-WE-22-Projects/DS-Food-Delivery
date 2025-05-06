// src/components/Header.tsx
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import CartMenu from "../cart/CartMenu";

export function Header() {
  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-orange-500/90  to-orange-400/80 backdrop-blur ">
        <div className="flex h-16 items-center justify-between mx-6">
          <Link to="/" className="hover:opacity-70">
            <div className="flex items-center gap-2 font-bold text-xl text-orange-600">
              <div className="rounded-full bg-orange-600 p-1">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              QuickEats
            </div>
          </Link>
          <div className="grow" />
          <nav className="md:flex gap-6 text-white font-bold text-md">
            <Link to="/restaurant" className="hover:opacity-70">
              Restaurants
            </Link>
            <Link to="#" className="hover:opacity-70">
              Offers
            </Link>
            <Link to="#" className="hover:opacity-70">
              About Us
            </Link>
          </nav>
          <div className="grow" />
          <div className="flex items-center gap-4">
            <CartMenu />
            <Button className="bg-orange-500 hover:bg-orange-600">Sign In</Button>
          </div>
        </div>
      </header>
      <div className="h-16 w-[100vw] bg-yellow-400"></div>
    </>
  );
}
