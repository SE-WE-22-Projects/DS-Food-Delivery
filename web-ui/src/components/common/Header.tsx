import { MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import CartMenu from "../cart/CartMenu";
import useUserStore from "@/store/user";
import UserMenu from "./UserMenu";

export function Header() {
  const userId = useUserStore((state) => state.userId);
  const location = useLocation();

  return (
    <>
      <header className=
        "fixed top-0 z-50 w-full backdrop-blur bg-gradient-to-b from-white/10  to-gray-100/90 shadow-md border-b ">
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
          <nav className="md:flex gap-4 text-sm font-medium">
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
          <div className="flex items-center gap-2">
            {userId && <CartMenu />}
            {userId && <UserMenu />}
            {!userId && <Link to="/login">
              <Button className="bg-transparent hover:bg-transparent text-black font-bold" variant="ghost" >Sign In</Button>
            </Link>}
            {!userId && <Link to="/register">
              <Button className="bg-orange-500 hover:bg-orange-600" >Register</Button>
            </Link>}
          </div>
        </div>
      </header >
      {location.pathname !== "/" && <div className="h-16 w-[100vw]"></div>}
    </>
  );
}
