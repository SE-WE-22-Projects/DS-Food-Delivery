import { AppSidebarProps } from "@/components/app-sidebar";
import CustomerManagement from "@/pages/CustomerManagement";
import DriverManagement from "@/pages/DriverManagement";
import Inquires from "@/pages/Inquires";
import MyRestaurants from "@/pages/MyRestaurants";
import OrderManagement from "@/pages/OrderManagement";
import PaymentManagement from "@/pages/PaymentManagement";
import RegisterRestaurant from "@/pages/RegisterRestaurant";
import RestaurantManagement from "@/pages/RestaurantManagement";
import ReviewsandRatings from "@/pages/ReviewsandRatings";
import { Bike, User, UtensilsCrossed, ShoppingBasket, DollarSign, Star, Mail } from "lucide-react";

export const sidebarData: AppSidebarProps[] = [
    {
        groupTitle: "Users",
        role: "user_admin",
        itemList: [
            { itemName: "Driver Management", url: "/dashboard/admin/drivers", icon: Bike, element: <DriverManagement /> },
           // { itemName: "User Management", url: "/dashboard/admin/customers", icon: User, element: <CustomerManagement /> },
        ]
    },
    {
        groupTitle: "Operations",
        role: "user_admin",
        itemList: [
            { itemName: "Restaurant Management", url: "/dashboard/admin/restaurants", icon: UtensilsCrossed, element: <RestaurantManagement /> },
            { itemName: "Order Management", url: "/dashboard/admin/orders", icon: ShoppingBasket, element: <OrderManagement /> },
            { itemName: "Payment Management", url: "/dashboard/admin/payments", icon: DollarSign, element: <PaymentManagement /> },
        ]
    },
    {
        groupTitle: "Feedbacks and Inquires",
        role: "user_admin",
        itemList: [
            { itemName: "Reviews and Ratings", url: "/dashboard/admin/reviews", icon: Star, element: <ReviewsandRatings /> },
            { itemName: "Inquires", url: "/dashboard/admin/inquires", icon: Mail, element: <Inquires /> },
        ]
    },
    {
        groupTitle: "Restaurant",
        role: "user_owner",
        itemList: [
            { itemName: "My Restaurants", url: "/dashboard/restaurant", icon: Mail, element: <MyRestaurants /> },
            { itemName: "Register Restaurant", url: "/dashboard/restaurant/create", icon: Star, element: <RegisterRestaurant /> },
        ]
    }
];