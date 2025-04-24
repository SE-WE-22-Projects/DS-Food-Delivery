import { AppSidebarProps } from "@/components/app-sidebar";
import { Bike, User, UtensilsCrossed, Salad, ShoppingBasket, DollarSign, Star, Mail } from "lucide-react";

export const sidebarData: AppSidebarProps[] = [
    {
        groupTitle: "Users",
        itemList: [
            { itemName: "Driver Management", url: "/drivers", icon: Bike },
            { itemName: "Customer Management", url: "/customers", icon: User },
        ]
    },
    {
        groupTitle: "Operations",
        itemList: [
            { itemName: "Restaurent Management", url: "/restaurents", icon: UtensilsCrossed },
            { itemName: "Menu Management", url: "/menus", icon: Salad },
            { itemName: "Order Management", url: "/orders", icon: ShoppingBasket },
            { itemName: "Payment Management", url: "/payments", icon: DollarSign },
        ]
    },
    {
        groupTitle: "Feedbacks and Inquires",
        itemList: [
            { itemName: "Reviews and Ratings", url: "/reviews", icon: Star },
            { itemName: "Inquires", url: "/inquires", icon: Mail },
        ]
    },
];