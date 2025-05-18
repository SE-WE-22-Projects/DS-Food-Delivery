import AllDriversTab from "@/components/driver/AllDriversTab";
import ApprovedDriversTab from "@/components/driver/ApprovedDriversTab";
import PendingDiversTab from "@/components/driver/PendingDiversTab";
import { DynamicTabsProps } from "@/components/DynamicTab";

const restaurantTabs: DynamicTabsProps = {
    tabData: [
        {
            label: "All",
            value: "all",
            content: <AllDriversTab />
        },
        {
            label: "Pending Restaurants",
            value: "pending",
            content: <PendingDiversTab />,
        },
        {
            label: "Approved Restaurants",
            value: "approved",
            content: <ApprovedDriversTab />
        }
    ]
}

const DriverManagement = () => {
    return (
        <>
            {/* page title */}
            <header className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold pb-7 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-700 to-blue-500 text-center">
                    Driver Management
                </h1>
                <p className="text-slate-400 mt-1">Manage and view all restaurant details.</p>
            </header>
        </>
    )
}

export default DriverManagement;