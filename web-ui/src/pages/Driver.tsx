"use client"

import { useState } from "react"
import Link from "next/link"
import {
    MapPin,
    User,
    CheckCircle,
    Package,
    Truck,
    Navigation,
    Star,
    DollarSign,
    ToggleLeft,
    ToggleRight,
    LogOut,
    Search,
    MapIcon,
    AlertCircle,
    Phone,
    MessageSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock Data
const mockAvailableOrders = [
    {
        id: "ORD-8291",
        restaurant: "Pizza Palace",
        customer: "Sarah Johnson",
        pickupAddress: "123 Main St, Suite 101",
        deliveryAddress: "456 Oak Ave, Apt 7B",
        items: ["Large Pepperoni Pizza", "Garlic Knots", "2L Soda"],
        distance: 2.3,
        earnings: 8.5,
        pickupTime: "Ready now",
        estimatedTime: 15,
        isUrgent: true,
    },
    {
        id: "ORD-8295",
        restaurant: "Burger Joint",
        customer: "Michael Smith",
        pickupAddress: "789 Market St",
        deliveryAddress: "321 Pine St, Unit 12",
        items: ["Double Cheeseburger", "Large Fries", "Chocolate Shake"],
        distance: 3.7,
        earnings: 10.25,
        pickupTime: "Ready in 5 min",
        estimatedTime: 20,
        isUrgent: false,
    },
    {
        id: "ORD-8302",
        restaurant: "Sushi World",
        customer: "Emily Chen",
        pickupAddress: "555 Cherry Blossom Rd",
        deliveryAddress: "777 Maple Dr, Apt 22C",
        items: ["California Roll (8pcs)", "Salmon Nigiri (4pcs)", "Miso Soup"],
        distance: 5.1,
        earnings: 12.75,
        pickupTime: "Ready in 10 min",
        estimatedTime: 25,
        isUrgent: false,
    },
    {
        id: "ORD-8310",
        restaurant: "Taco Fiesta",
        customer: "David Rodriguez",
        pickupAddress: "222 Fiesta Blvd",
        deliveryAddress: "888 Sunset Ave",
        items: ["Taco Combo (3)", "Chips & Guacamole", "Horchata"],
        distance: 1.8,
        earnings: 7.5,
        pickupTime: "Ready now",
        estimatedTime: 12,
        isUrgent: false,
    },
    {
        id: "ORD-8315",
        restaurant: "Thai Spice",
        customer: "Jennifer Lee",
        pickupAddress: "444 Spice St",
        deliveryAddress: "999 Highland Ave, Suite 3",
        items: ["Pad Thai", "Green Curry", "Spring Rolls (4)"],
        distance: 8.2,
        earnings: 15.0,
        pickupTime: "Ready in 15 min",
        estimatedTime: 35,
        isUrgent: true,
    },
    {
        id: "ORD-8320",
        restaurant: "Healthy Greens",
        customer: "Robert Wilson",
        pickupAddress: "333 Veggie Way",
        deliveryAddress: "111 Corporate Park, Building B",
        items: ["Kale Caesar Salad", "Quinoa Bowl", "Green Smoothie"],
        distance: 4.5,
        earnings: 9.75,
        pickupTime: "Ready in 5 min",
        estimatedTime: 22,
        isUrgent: false,
    },
    {
        id: "ORD-8325",
        restaurant: "Pasta Paradise",
        customer: "Amanda Brown",
        pickupAddress: "666 Pasta Ln",
        deliveryAddress: "222 University Ave, Dorm 12",
        items: ["Fettuccine Alfredo", "Garlic Bread", "Tiramisu"],
        distance: 6.3,
        earnings: 13.5,
        pickupTime: "Ready in 10 min",
        estimatedTime: 28,
        isUrgent: false,
    },
    {
        id: "ORD-8330",
        restaurant: "BBQ Shack",
        customer: "Thomas Garcia",
        pickupAddress: "777 Smoke St",
        deliveryAddress: "444 Suburban Rd",
        items: ["Pulled Pork Sandwich", "Brisket Plate", "Mac & Cheese", "Cornbread"],
        distance: 9.7,
        earnings: 22.0,
        pickupTime: "Ready in 15 min",
        estimatedTime: 40,
        isUrgent: true,
    },
]

const mockActiveOrders = [
    {
        id: "ORD-8289",
        restaurant: "Noodle House",
        customer: "Lisa Thompson",
        pickupAddress: "123 Asian Ave",
        deliveryAddress: "456 Residence Blvd, Apt 12",
        items: ["Beef Pho", "Spring Rolls", "Thai Iced Tea"],
        distance: 3.2,
        earnings: 9.25,
        status: "Picked Up",
        statusStep: 2,
        claimedAt: "10:30 AM",
        estimatedTime: 18,
    },
    {
        id: "ORD-8290",
        restaurant: "Mediterranean Grill",
        customer: "John Davis",
        pickupAddress: "789 Olive St",
        deliveryAddress: "321 Condo Lane, Unit 5F",
        items: ["Chicken Shawarma Plate", "Hummus & Pita", "Baklava"],
        distance: 4.8,
        earnings: 11.5,
        status: "Accepted",
        statusStep: 1,
        claimedAt: "10:45 AM",
        estimatedTime: 25,
    },
]

const mockCompletedOrders = [
    {
        id: "ORD-8285",
        restaurant: "Burger King",
        customer: "Mark Wilson",
        pickupAddress: "555 Fast Food Ln",
        deliveryAddress: "777 Residential St, House 12",
        items: ["Whopper Meal", "Chicken Nuggets", "Onion Rings"],
        distance: 2.7,
        earnings: 8.75,
        deliveredAt: "9:45 AM",
    },
    {
        id: "ORD-8286",
        restaurant: "Panda Express",
        customer: "Karen Miller",
        pickupAddress: "333 Mall Food Court",
        deliveryAddress: "888 Apartment Complex, Unit 23",
        items: ["Orange Chicken", "Chow Mein", "Egg Rolls"],
        distance: 3.5,
        earnings: 9.5,
        deliveredAt: "10:15 AM",
    },
]

export default function DriverDashboardPage() {
    const [isOnline, setIsOnline] = useState(true)
    const [activeTab, setActiveTab] = useState("available")
    const [availableOrders, setAvailableOrders] = useState(mockAvailableOrders)
    const [activeOrders, setActiveOrders] = useState(mockActiveOrders)
    const [completedOrders, setCompletedOrders] = useState(mockCompletedOrders)
    const [successMessage, setSuccessMessage] = useState("")
    const [filterDistance, setFilterDistance] = useState("all")
    const [filterEarnings, setFilterEarnings] = useState("all")

    // Filter available orders based on selected filters
    const filteredAvailableOrders = availableOrders.filter(order => {
        if (filterDistance !== "all" && filterDistance === "near") {
            if (order.distance > 3) return false
        } else if (filterDistance !== "all" && filterDistance === "medium") {
            if (order.distance < 3 || order.distance > 7) return false
        } else if (filterDistance !== "all" && filterDistance === "far") {
            if (order.distance < 7) return false
        }

        if (filterEarnings !== "all" && filterEarnings === "low") {
            if (order.earnings > 10) return false
        } else if (filterEarnings !== "all" && filterEarnings === "medium") {
            if (order.earnings < 10 || order.earnings > 20) return false
        } else if (filterEarnings !== "all" && filterEarnings === "high") {
            if (order.earnings < 20) return false
        }

        return true
    })

    const handleToggleOnline = () => {
        setIsOnline(!isOnline)
        showSuccessMessage(isOnline ? "You are now offline" : "You are now online and can receive orders")
    }

    const handleClaimOrder = (orderId) => {
        // Find the order in available orders
        const orderToClaim = availableOrders.find(order => order.id === orderId)
        if (!orderToClaim) return

        // Remove from available orders
        setAvailableOrders(availableOrders.filter(order => order.id !== orderId))

        // Add to active orders with status "Accepted"
        const claimedOrder = {
            ...orderToClaim,
            status: "Accepted",
            statusStep: 1,
            claimedAt: new Date().toLocaleTimeString()
        }
        setActiveOrders([claimedOrder, ...activeOrders])
        showSuccessMessage(`Order #${orderId} claimed successfully`)
    }

    const handleUpdateOrderStatus = (orderId, newStatus, newStatusStep) => {
        // Find the order in active orders
        const orderIndex = activeOrders.findIndex(order => order.id === orderId)
        if (orderIndex === -1) return

        // Update the order status
        const updatedOrders = [...activeOrders]
        updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            status: newStatus,
            statusStep: newStatusStep
        }

        // If the order is delivered, move it to completed orders
        if (newStatus === "Delivered") {
            const completedOrder = {
                ...updatedOrders[orderIndex],
                deliveredAt: new Date().toLocaleTimeString()
            }
            setCompletedOrders([completedOrder, ...completedOrders])
            setActiveOrders(updatedOrders.filter(order => order.id !== orderId))
            showSuccessMessage(`Order #${orderId} delivered successfully`)
        } else {
            setActiveOrders(updatedOrders)
            showSuccessMessage(`Order #${orderId} status updated to ${newStatus}`)
        }
    }

    const showSuccessMessage = (message) => {
        setSuccessMessage(message)
        setTimeout(() => {
            setSuccessMessage("")
        }, 3000)
    }

    // Calculate earnings
    const todayEarnings = completedOrders.reduce((total, order) => total + order.earnings, 0)
    const weekEarnings = todayEarnings * 5 // Mock calculation for demo purposes
    const monthEarnings = weekEarnings * 4 // Mock calculation for demo purposes

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-orange-500">
                        <div className="rounded-full bg-orange-500 p-1">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <Link href="/driver">FoodExpress Driver</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium hidden md:inline-block">
                                {isOnline ? "Online" : "Offline"}
                            </span>
                            <Switch
                                checked={isOnline}
                                onCheckedChange={handleToggleOnline}
                                className={isOnline ? "bg-green-500" : "bg-gray-300"}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder.svg" alt="Driver" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">John Driver</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            john.driver@example.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    <span>Earnings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-8">
                {successMessage && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Driver Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${todayEarnings.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                From {completedOrders.length} completed deliveries
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${weekEarnings.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                {completedOrders.length * 5} deliveries • Avg ${(weekEarnings / (completedOrders.length * 5)).toFixed(2)}/delivery
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <div className="text-2xl font-bold mr-2">4.92</div>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${star <= 5
                                                    ? "fill-orange-500 text-orange-500"
                                                    : "fill-muted stroke-muted-foreground"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Based on last 100 deliveries
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Driver Status Card */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src="/placeholder.svg" alt="Driver" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-xl font-bold">John Driver</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={isOnline ? "success" : "secondary"} className={isOnline ? "bg-green-500" : ""}>
                                            {isOnline ? "Online" : "Offline"}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">ID: DRV-7829</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <Button variant="outline" className="gap-2">
                                    <MapIcon className="h-4 w-4" />
                                    View Map
                                </Button>
                                <Button className="bg-orange-500 hover:bg-orange-600 gap-2" onClick={handleToggleOnline}>
                                    {isOnline ? (
                                        <>
                                            <ToggleRight className="h-4 w-4" />
                                            Go Offline
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="h-4 w-4" />
                                            Go Online
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Tabs */}
                <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="available" disabled={!isOnline}>
                            Available Orders
                            {isOnline && <Badge className="ml-2 bg-orange-500">{filteredAvailableOrders.length}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="active">
                            Active Orders
                            {activeOrders.length > 0 && <Badge className="ml-2 bg-green-500">{activeOrders.length}</Badge>}
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
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search orders..." className="pl-9" />
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Select value={filterDistance} onValueChange={setFilterDistance}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by distance" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Distances</SelectItem>
                                                <SelectItem value="near\">Nearby ( 3 km)</SelectItem>
                                                <SelectItem value="medium">Medium (3-7 km)</SelectItem>
                                                <SelectItem value="far">Far ( 7 km)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filterEarnings} onValueChange={setFilterEarnings}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by earnings" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Earnings</SelectItem>
                                                <SelectItem value="low">Low ( $10)</SelectItem>
                                                <SelectItem value="medium">Medium ($10-$20)</SelectItem>
                                                <SelectItem value="high">High ( $20)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {filteredAvailableOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">No available orders match your filters</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredAvailableOrders.map((order) => (
                                            <AvailableOrderCard
                                                key={order.id}
                                                order={order}
                                                onClaim={() => handleClaimOrder(order.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    {/* Active Orders Tab */}
                    <TabsContent value="active">
                        {activeOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">You don't have any active orders</p>
                                {isOnline && (
                                    <Button
                                        variant="link"
                                        className="text-orange-500 mt-2"
                                        onClick={() => setActiveTab("available")}
                                    >
                                        Browse available orders
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activeOrders.map((order) => (
                                    <ActiveOrderCard
                                        key={order.id}
                                        order={order}
                                        onUpdateStatus={handleUpdateOrderStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Completed Orders Tab */}
                    <TabsContent value="completed">
                        {completedOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">You haven't completed any orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {completedOrders.map((order) => (
                                    <CompletedOrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
            <footer className="w-full border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © 2023 FoodExpress. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-sm font-medium">
                            Terms
                        </Link>
                        <Link href="#" className="text-sm font-medium">
                            Privacy
                        </Link>
                        <Link href="#" className="text-sm font-medium">
                            Help
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

// Available Order Card Component
function AvailableOrderCard({ order, onClaim }) {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                {order.isUrgent && (
                                    <Badge className="bg-red-500">Urgent</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{order.pickupTime} • {order.estimatedTime} min delivery</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold text-green-600">
                                ${order.earnings.toFixed(2)}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                                {order.distance} km
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Package className="h-4 w-4 text-orange-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.restaurant}</p>
                                        <p className="text-sm text-muted-foreground">{order.pickupAddress}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <MapPin className="h-4 w-4 text-green-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.customer}</p>
                                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-4 flex justify-between items-center bg-muted/30">
                    <div className="text-sm">
                        <span className="text-muted-foreground">{order.items.length} items • </span>
                        <span>{order.items.join(", ")}</span>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={onClaim}>
                        Claim Order
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Active Order Card Component
function ActiveOrderCard({ order, onUpdateStatus }) {
    const getNextStatus = () => {
        switch (order.status) {
            case "Accepted":
                return { status: "Picked Up", step: 2 }
            case "Picked Up":
                return { status: "On the Way", step: 3 }
            case "On the Way":
                return { status: "Delivered", step: 4 }
            default:
                return { status: order.status, step: order.statusStep }
        }
    }

    const nextStatus = getNextStatus()

    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                <Badge className={
                                    order.status === "Accepted" ? "bg-blue-500" :
                                        order.status === "Picked Up" ? "bg-purple-500" :
                                            "bg-green-500"
                                }>
                                    {order.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Claimed at {order.claimedAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold text-green-600">
                                ${order.earnings.toFixed(2)}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                                {order.distance} km
                            </Badge>
                        </div>
                    </div>

                    {/* Order Progress */}
                    <div className="mb-6">
                        <Progress value={order.statusStep * 25} className="h-2 mb-2" />
                        <div className="grid grid-cols-4 gap-2">
                            {["Accepted", "Picked Up", "On the Way", "Delivered"].map((status, index) => {
                                const isActive = index < order.statusStep
                                return (
                                    <div key={status} className="flex flex-col items-center text-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isActive ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {index === 0 && <CheckCircle className="h-4 w-4" />}
                                            {index === 1 && <Package className="h-4 w-4" />}
                                            {index === 2 && <Truck className="h-4 w-4" />}
                                            {index === 3 && <MapPin className="h-4 w-4" />}
                                        </div>
                                        <div className={`text-xs ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                                            {status}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Package className="h-4 w-4 text-orange-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.restaurant}</p>
                                        <p className="text-sm text-muted-foreground">{order.pickupAddress}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Navigation className="h-3 w-3" />
                                                Navigate
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Phone className="h-3 w-3" />
                                                Call
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <MapPin className="h-4 w-4 text-green-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.customer}</p>
                                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Navigation className="h-3 w-3" />
                                                Navigate
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Phone className="h-3 w-3" />
                                                Call
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                Message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-4 flex justify-between items-center bg-muted/30">
                    <div className="text-sm">
                        <span className="text-muted-foreground">{order.items.length} items • </span>
                        <span>{order.items.join(", ")}</span>
                    </div>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => onUpdateStatus(order.id, nextStatus.status, nextStatus.step)}
                    >
                        Mark as {nextStatus.status}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Completed Order Card Component
function CompletedOrderCard({ order }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">Order #{order.id}</h3>
                            <Badge className="bg-green-500">Completed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Delivered at {order.deliveredAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold text-green-600">
                            ${order.earnings.toFixed(2)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                            {order.distance} km
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-orange-500" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">{order.restaurant}</p>
                                    <p className="text-sm text-muted-foreground">{order.pickupAddress}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-green-500" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">{order.customer}</p>
                                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
