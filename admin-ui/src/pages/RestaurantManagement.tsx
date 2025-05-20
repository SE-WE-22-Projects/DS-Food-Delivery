import api from "@/api"
import DynamicModal from "@/components/DynamicModal"
import DynamicTabs, { DynamicTabsProps } from "@/components/DynamicTab"
import AllRestaurantTab from "@/components/restaurant/AllRestaurantTab"
import ApprovedRestaurantTab from "@/components/restaurant/ApprovedRestaurantTab"
import CreateRestaurantForm from "@/components/restaurant/CreateRestaurantForm"
import PendingRestaurantTab from "@/components/restaurant/PendingRestaurantTab"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const restaurantTabs: DynamicTabsProps = {
    tabData: [
        {
            label: "All Restaurants",
            value: "all",
            content: <AllRestaurantTab />
        },
        {
            label: "Pending Restaurants",
            value: "pending",
            content: <PendingRestaurantTab />,
        },
        {
            label: "Approved Restaurants",
            value: "approved",
            content: <ApprovedRestaurantTab />
        }
    ]
}

const RestaurantManagement = () => {
    const queryClient = useQueryClient()
    return (
        <>
            {/* page title */}
            <header className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold pb-7 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-700 to-blue-500 text-center">
                    Restaurant Management
                </h1>
                <p className="text-slate-400 mt-1">Manage and view all restaurant details.</p>
            </header>
            <div className="flex justify-center w-full">
                <DynamicTabs tabData={restaurantTabs.tabData} />
            </div>
        </>
    )
}

export default RestaurantManagement