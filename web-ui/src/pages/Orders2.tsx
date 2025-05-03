import { ChevronRight, Clock, MapPin, Search, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"

export default function OrdersPage() {
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

                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
                        <TabsTrigger value="active">Active Orders</TabsTrigger>
                        <TabsTrigger value="past">Past Orders</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="space-y-6">
                        {activeOrders.map((order) => (
                            <OrderCard key={order.id} order={order} isActive={true} />
                        ))}
                    </TabsContent>
                    <TabsContent value="past" className="space-y-6">
                        {pastOrders.map((order) => (
                            <OrderCard key={order.id} order={order} isActive={false} />
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}

function OrderCard({ order, isActive }) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="font-bold text-lg">Order #{order.id}</div>
                            <Badge className={isActive ? "bg-green-500" : "bg-gray-500"}>{order.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{order.date}</div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <img
                                src={`/placeholder.svg?height=80&width=80&text=${order.restaurant}`}
                                width={80}
                                height={80}
                                alt={order.restaurant}
                                className="rounded-md object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{order.restaurant}</h3>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center text-sm">
                                    <Star className="h-4 w-4 fill-orange-500 text-orange-500 mr-1" />
                                    <span>{order.rating}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{order.distance} km</span>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">{order.items.join(", ")}</div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="font-bold">${order.total.toFixed(2)}</div>
                                {isActive && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm">Estimated delivery: {order.estimatedDelivery}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-4 flex justify-between items-center bg-muted/30">
                    <div className="text-sm">
                        {isActive ? (
                            <span className="text-orange-500 font-medium">Track your order in real-time</span>
                        ) : (
                            <span>Order completed</span>
                        )}
                    </div>
                    <Link to={`./${order.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                            View Details
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

const activeOrders = [
    {
        id: "ORD-7829",
        restaurant: "Pizza Palace",
        items: ["Pepperoni Pizza (Large)", "Garlic Bread", "Coke (2)"],
        total: 32.99,
        status: "On the way",
        date: "Today, 12:30 PM",
        estimatedDelivery: "15-20 min",
        rating: 4.8,
        distance: 1.2,
    },
    {
        id: "ORD-7830",
        restaurant: "Burger Joint",
        items: ["Double Cheeseburger", "Fries (Large)", "Chocolate Shake"],
        total: 24.5,
        status: "Preparing",
        date: "Today, 1:15 PM",
        estimatedDelivery: "25-30 min",
        rating: 4.5,
        distance: 0.8,
    },
]

const pastOrders = [
    {
        id: "ORD-7801",
        restaurant: "Sushi World",
        items: ["California Roll", "Salmon Nigiri (4pcs)", "Miso Soup"],
        total: 42.75,
        status: "Delivered",
        date: "Yesterday, 7:45 PM",
        rating: 4.7,
        distance: 1.5,
    },
    {
        id: "ORD-7789",
        restaurant: "Taco Fiesta",
        items: ["Beef Tacos (3)", "Guacamole & Chips", "Mexican Rice"],
        total: 28.99,
        status: "Delivered",
        date: "May 1, 2023, 6:20 PM",
        rating: 4.3,
        distance: 0.5,
    },
    {
        id: "ORD-7765",
        restaurant: "Green Bowl",
        items: ["Custom Salad Bowl", "Fresh Juice", "Protein Bar"],
        total: 19.5,
        status: "Delivered",
        date: "April 28, 2023, 12:15 PM",
        rating: 4.6,
        distance: 0.7,
    },
]
