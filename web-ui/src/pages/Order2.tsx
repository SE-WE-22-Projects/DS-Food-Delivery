import { useState, useEffect } from "react"
import { ArrowLeft, Clock, MessageSquare, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function OrderTrackingPage() {
    // In a real app, you would fetch the order data based on the ID
    const order = orderData
    const [progress, setProgress] = useState(60)
    const [estimatedTime, setEstimatedTime] = useState(15)

    // Simulate order progress
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(timer)
                    return 100
                }
                return prevProgress + 1
            })

            if (estimatedTime > 0 && progress < 100) {
                setEstimatedTime((prevTime) => prevTime - 0.1)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [estimatedTime, progress])

    return (

        <main className="flex-1">
            <div className="container px-4 py-8 md:px-6 md:py-12 mx-auto">
                <Link to="/order" className="flex items-center gap-1 text-muted-foreground mb-6">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to orders</span>
                </Link>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column - Order Status */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight mb-6">Tracking Order #{order.id}</h1>

                        {/* Order Status Card */}
                        <Card className="mb-8">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Order Status</h2>
                                    <div className="flex items-center text-orange-500">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span className="font-medium">
                                            {Math.ceil(estimatedTime)} min{Math.ceil(estimatedTime) !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                <Progress value={progress} className="h-2 mb-8" />

                                <div className="grid grid-cols-4 gap-2">
                                    {orderStatuses.map((status, index) => {
                                        const isActive = index * 25 <= progress
                                        return (
                                            <div key={status.label} className="flex flex-col items-center text-center">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isActive ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    <status.icon className="h-5 w-5" />
                                                </div>
                                                <div className={`text-xs ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                                                    {status.label}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Card */}
                        <Card className="mb-8">
                            <CardContent className="p-0">
                                <div className="relative w-full h-[300px] bg-muted">
                                    <img
                                        src="/placeholder.svg?height=300&width=600&text=Delivery Map"
                                        alt="Delivery Map"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-medium mb-2">Delivery Address</h3>
                                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Person Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-medium mb-4">Delivery Person</h3>
                                <div className="flex items-center">
                                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                                        <img
                                            src="/placeholder.svg?height=64&width=64&text=DP"
                                            width={64}
                                            height={64}
                                            alt="Delivery Person"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{order.deliveryPerson.name}</div>
                                        <div className="text-sm text-muted-foreground mb-2">{order.deliveryPerson.vehicle}</div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="gap-1">
                                                <Phone className="h-4 w-4" />
                                                Call
                                            </Button>
                                            <Button size="sm" variant="outline" className="gap-1">
                                                <MessageSquare className="h-4 w-4" />
                                                Message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Details */}
                    <div className="md:w-[350px]">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                                        <img
                                            src={`/placeholder.svg?height=48&width=48&text=${order.restaurant}`}
                                            width={48}
                                            height={48}
                                            alt={order.restaurant}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-medium">{order.restaurant}</div>
                                        <div className="text-sm text-muted-foreground">{order.items.length} items</div>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                {/* Order Items */}
                                <div className="space-y-3 mb-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <div>
                                                <span className="font-medium">{item.quantity}x</span> {item.name}
                                            </div>
                                            <div>${item.price.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                {/* Order Totals */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <div>Subtotal</div>
                                        <div>${order.subtotal.toFixed(2)}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>Delivery Fee</div>
                                        <div>${order.deliveryFee.toFixed(2)}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>Tax</div>
                                        <div>${order.tax.toFixed(2)}</div>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <div>Discount</div>
                                            <div>-${order.discount.toFixed(2)}</div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-4" />

                                <div className="flex justify-between font-bold">
                                    <div>Total</div>
                                    <div>${order.total.toFixed(2)}</div>
                                </div>

                                <Separator className="my-4" />

                                {/* Payment Method */}
                                <div className="text-sm">
                                    <div className="font-medium mb-1">Payment Method</div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center mr-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                                <line x1="2" x2="22" y1="10" y2="10" />
                                            </svg>
                                        </div>
                                        <div>{order.paymentMethod}</div>
                                    </div>
                                </div>

                                <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600">Help & Support</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>

    )
}

// Order statuses with icons
import { CheckCircle, ChefHat, Package, Truck } from "lucide-react"
import { Link } from "react-router-dom"

const orderStatuses = [
    { label: "Confirmed", icon: CheckCircle },
    { label: "Preparing", icon: ChefHat },
    { label: "Ready", icon: Package },
    { label: "On the way", icon: Truck },
]

// Sample order data
const orderData = {
    id: "ORD-7829",
    restaurant: "Pizza Palace",
    items: [
        { name: "Pepperoni Pizza (Large)", quantity: 1, price: 14.99 },
        { name: "Garlic Bread", quantity: 1, price: 5.99 },
        { name: "Coke", quantity: 2, price: 2.99 },
    ],
    subtotal: 26.96,
    deliveryFee: 3.99,
    tax: 2.04,
    discount: 0,
    total: 32.99,
    status: "On the way",
    date: "Today, 12:30 PM",
    estimatedDelivery: "15-20 min",
    deliveryAddress: "1234 Main St, Apt 5B, Anytown, CA 12345",
    paymentMethod: "Visa •••• 4242",
    deliveryPerson: {
        name: "Michael Johnson",
        vehicle: "Red Honda Scooter",
        phone: "+1 555-123-4567",
    },
}
