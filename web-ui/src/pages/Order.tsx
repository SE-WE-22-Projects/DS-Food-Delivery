import { ArrowLeft, Loader2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import OrderProgress from "@/components/order/OrderProgress"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import api from "@/api"
import Image from "@/components/common/Image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OrderStatus } from "@/api/order"
import OrderMap from "@/components/order/OrderMap"
import toast from "react-hot-toast"

const shouldRefresh = (s?: OrderStatus) => {
    return s === "awaiting_pickup" || s === "delivering" || s === "pending_restaurant_accept" || s === "preparing_order" || s === "payment_pending"
}

const canCancelOrder = (s?: OrderStatus) => {
    return s === "payment_pending" || s === "payment_failed" || s === "pending_restaurant_accept"
}

export default function OrderTrackingPage() {
    const { orderId } = useParams();
    const client = useQueryClient();

    const order = useSuspenseQuery({
        queryKey: ["order", orderId],
        queryFn: () => api.order.getOrderById(orderId!),
        refetchInterval: (query) => shouldRefresh(query.state.data?.status) ? 2000 : false
    });




    const cancelOrder = useMutation({
        mutationFn: api.order.cancelOrder,
        onSuccess: () => {
            toast.success("Cancelled Order Successfully.")
            client.invalidateQueries({ queryKey: ["order", orderId] })
        },
        onError: () => toast.error("Failed to cancel order")
    });



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
                        <h1 className="text-3xl font-bold tracking-tight mb-6">Tracking Order  <span className="text-sm font-thin">#{order.data.order_id}</span></h1>

                        {/* Order Status Card */}
                        <OrderProgress status={order.data.status} estimatedTime={order.data.eta} />


                        {/* Map Card */}
                        <Card className="mb-8">
                            <CardContent className="p-0">
                                <div className="relative w-full h-[300px] bg-muted">
                                    <OrderMap dest={order.data.destination.position} start={order.data.restaurant.location} />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-medium mb-2">Delivery Address</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {order.data.destination.no},&nbsp;
                                        {order.data.destination.street},&nbsp;
                                        {order.data.destination.town},&nbsp;
                                        {order.data.destination.city}.&nbsp;
                                        {order.data.destination.postal_code}
                                    </p>
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
                                        <Image
                                            src={`/api/v1/restaurants/${order.data.restaurant.id}/logo`}
                                            width={48}
                                            height={48}
                                            alt={order.data.restaurant.name}
                                            className="object-cover"
                                        />

                                    </div>
                                    <div>
                                        <div className="font-medium">{order.data.restaurant.name}</div>
                                        <div className="text-sm text-muted-foreground">{order.data.items.length} items</div>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                {/* Order Items */}
                                <div className="space-y-3 mb-4">
                                    {order.data.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <div>
                                                <span className="font-medium">{item.amount}x</span> {item.name}
                                            </div>
                                            <div>LKR {item.price}</div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                {/* Order Totals */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <div>Subtotal</div>
                                        <div>LKR {order.data.subtotal.toFixed(2)}</div>
                                    </div>
                                    {order.data.delivery_fee &&
                                        <div className="flex justify-between">
                                            <div>Delivery Fee</div>
                                            <div>LKR {order.data.delivery_fee.toFixed(2)}</div>
                                        </div>}
                                    {order.data.coupon && (
                                        <div className="flex justify-between text-green-600">
                                            <div>Discount</div>
                                            <div>-{order.data.coupon.name}</div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-4" />

                                <div className="flex justify-between font-bold">
                                    <div>Total</div>
                                    <div>LKR {order.data.total.toFixed(2)}</div>
                                </div>

                                <Separator className="my-4" />
                                {canCancelOrder(order.data.status) &&
                                    <Button className="w-full mt-6 bg-gray-500" onClick={() => cancelOrder.mutate(orderId!)} >
                                        {cancelOrder.isPending ? <><Loader2 /> Cancelling Order</> : "Cancel Order"}
                                    </Button>}
                                <Button className="w-full mt-1 bg-orange-500 hover:bg-orange-600">Help & Support</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>

    )
}


