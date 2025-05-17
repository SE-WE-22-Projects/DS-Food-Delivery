import { Suspense, useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DeliveryDriverStatus from "@/components/delivery/DeliveryDriverStatus"
import NearbyDeliveries from "@/components/delivery/NearbyDeliveries"
import { ErrorBoundary } from "react-error-boundary"
import ActiveDeliveries from "@/components/delivery/ActiveDeliveries"
import toast from "react-hot-toast"
import PastDeliveries from "@/components/delivery/PastDeliveries"



export default function DriverDashboardPage() {
    const [isOnline, setIsOnline] = useState(true)
    const [activeTab, setActiveTab] = useState("available")
    const [available, setAvailable] = useState(0);
    const [active, setActive] = useState(0);


    const handleToggleOnline = () => {
        setIsOnline(!isOnline)
        toast.success(isOnline ? "You are now offline" : "You are now online and can receive deliveries")
    }

    return (
        <main className="flex-1 container py-8 mx-auto">
            {/* Driver Status Card */}
            <DeliveryDriverStatus isOnline={isOnline} toggleOnline={handleToggleOnline} />

            {/* Orders Tabs */}
            <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="available" disabled={!isOnline}>
                        Available Orders
                        {isOnline && <Badge className="ml-2 bg-orange-500">{available}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        Active Orders
                        {active > 0 && <Badge className="ml-2 bg-green-500">{active}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="completed">Completed Orders</TabsTrigger>
                </TabsList>

                {/* Available Orders Tab */}
                <TabsContent value="available">
                    {!isOnline ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">You're currently offline</h3>
                            <p className="text-muted-foreground mb-6">Go online to see available orders in your area</p>
                            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleToggleOnline}>
                                Go Online
                            </Button>
                        </div>
                    ) :
                        <ErrorBoundary fallback={<div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Error loading deliveries</h3>
                            <p className="text-muted-foreground">Please try again later</p>
                        </div>}>
                            <Suspense fallback={<div className="flex flex-col items-center justify-center py-12 text-center">
                                <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                                <h3 className="text-lg font-medium">Loading available deliveries...</h3>
                            </div>}>
                                <NearbyDeliveries setAvailable={setAvailable} />
                            </Suspense>
                        </ErrorBoundary>
                    }
                </TabsContent>

                {/* Active Orders Tab */}
                <TabsContent value="active">
                    <ErrorBoundary fallback={<div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Error loading deliveries</h3>
                        <p className="text-muted-foreground">Please try again later</p>
                    </div>}>
                        <Suspense fallback={<div className="flex flex-col items-center justify-center py-12 text-center">
                            <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium">Loading active deliveries...</h3>
                        </div>}>
                            <ActiveDeliveries setActive={setActive} />
                        </Suspense>
                    </ErrorBoundary>
                </TabsContent>

                {/* Completed Orders Tab */}
                <TabsContent value="completed">
                    <ErrorBoundary fallback={<div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Error loading deliveries</h3>
                        <p className="text-muted-foreground">Please try again later</p>
                    </div>}>
                        <Suspense fallback={<div className="flex flex-col items-center justify-center py-12 text-center">
                            <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium">Loading completed deliveries...</h3>
                        </div>}>
                            <PastDeliveries />
                        </Suspense>
                    </ErrorBoundary>
                </TabsContent>
            </Tabs>
        </main>
    )
}


