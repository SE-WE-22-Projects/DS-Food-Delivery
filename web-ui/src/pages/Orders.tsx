import { Search } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import OrderList from "@/components/order/OrderList"
import { useState, Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import NetworkError from "@/components/common/NetworkError"
import OrderLoader from "@/components/order/OrderLoader"

export default function OrdersPage() {
    const [orderType, setOrderType] = useState("active");

    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                        <p className="text-muted-foreground mt-1">View and track your orders</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-9 w-full md:w-[250px] rounded-full border-orange-200 focus-visible:ring-orange-500"
                            />
                        </div>
                    </div>
                </div>

                <Tabs value={orderType} onValueChange={(v) => setOrderType(v)} className="w-full">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
                        <TabsTrigger value="active">Active Orders</TabsTrigger>
                        <TabsTrigger value="past">Past Orders</TabsTrigger>
                    </TabsList>
                </Tabs>
                <ErrorBoundary fallback={<NetworkError what='Restaurants' />}>
                    <Suspense fallback={<OrderLoader />}>
                        <OrderList active={orderType === "active"} />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </main>
    )
}
