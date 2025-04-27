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
            <div className="flex justify-center w-full">
                <h1 className="text-4xl lg:text-5xl">Restaurant Management</h1>
            </div>
            <div className="flex justify-center w-full">
                <DynamicTabs tabData={restaurantTabs.tabData} />
            </div>
        </>
    )
}

export default RestaurantManagement