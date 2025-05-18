import AllApprovedDriverApplications from "@/components/driver/AllApprovedDriverApplications";
import PendingDriverApplications from "@/components/driver/PendingDriverApplications";
import DynamicTabs, { DynamicTabsProps } from "@/components/DynamicTab";

const driverTabs: DynamicTabsProps = {
    tabData: [
        {
            label: "Pending Driver Applications",
            value: "pending",
            content: <PendingDriverApplications />,
        },
        {
            label: "Approved Diver Applications",
            value: "approved",
            content: <AllApprovedDriverApplications />
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
            <div>
                <DynamicTabs tabData={driverTabs.tabData} />
            </div>
        </>
    )
}

export default DriverManagement;