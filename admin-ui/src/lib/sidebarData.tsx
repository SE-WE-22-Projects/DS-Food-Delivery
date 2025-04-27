import { AppSidebarProps } from "@/components/app-sidebar";
import CustomerManagement from "@/pages/CustomerManagement";
import DriverManagement from "@/pages/DriverManagement";
import Inquires from "@/pages/Inquires";
import MenuManagement from "@/pages/MenuManagement";
import OrderManagement from "@/pages/OrderManagement";
import PaymentManagement from "@/pages/PaymentManagement";
import RestaurantManagement from "@/pages/RestaurantManagement";
import ReviewsandRatings from "@/pages/ReviewsandRatings";
import { Bike, User, UtensilsCrossed, Salad, ShoppingBasket, DollarSign, Star, Mail } from "lucide-react";

export const sidebarData: AppSidebarProps[] = [
    {
        groupTitle: "Users",
        itemList: [
            { itemName: "Driver Management", url: "/dashboard/drivers", icon: Bike, element: <DriverManagement /> },
            { itemName: "Customer Management", url: "/dashboard/customers", icon: User, element: <CustomerManagement /> },
        ]
    },
    {
        groupTitle: "Operations",
        itemList: [
            { itemName: "Restaurent Management", url: "/dashboard/restaurants", icon: UtensilsCrossed, element: <RestaurantManagement /> },
            { itemName: "Menu Management", url: "/dashboard/menus", icon: Salad, element: <MenuManagement /> },
            { itemName: "Order Management", url: "/dashboard/orders", icon: ShoppingBasket, element: <OrderManagement /> },
            { itemName: "Payment Management", url: "/dashboard/payments", icon: DollarSign, element: <PaymentManagement /> },
        ]
    },
    {
        groupTitle: "Feedbacks and Inquires",
        itemList: [
            { itemName: "Reviews and Ratings", url: "/dashboard/reviews", icon: Star, element: <ReviewsandRatings /> },
            { itemName: "Inquires", url: "/dashboard/inquires", icon: Mail, element: <Inquires /> },
        ]
    },
];