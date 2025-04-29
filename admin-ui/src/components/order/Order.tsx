import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderItem, OrderStatus } from '@/api/order';
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { formatDate } from "@/lib/timeUtil";
import { formatStatus } from "./OrderTable";

const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
        case 'payment_pending':
            return { variant: "secondary", color: "text-white" };
        case 'payment_failed':
            return { variant: "destructive", color: "text-red-500" };
        case 'canceled':
            return { variant: "destructive", color: "text-red-500" };
        case 'pending_restaurant_accept':
            return { variant: "outline", color: "text-yellow-500 border-yellow-500" };
        case 'restaurant_rejected':
            return { variant: "destructive", color: "text-red-500" };
        case 'preparing_order':
            return { variant: "outline", color: "text-blue-500 border-blue-500" };
        case 'awaiting_pickup':
            return { variant: "outline", color: "text-purple-500 border-purple-500" };
        case 'delivering':
            return { variant: "outline", color: "text-orange-500 border-orange-500" };
        case 'delivered':
            return { variant: "success", color: "text-green-500" };
        default:
            return { variant: "secondary", color: "text-gray-500" };
    }
};

const OrderItemDisplay = ({ item }: { item: OrderItem }) => {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">{item.name}</span>
            <span className="text-sm ">LKR {item.price} x {item.amount}</span>
        </div>
    );
};

const OrderView = ({ orderId, forAdmin, hideRestaurant }: {
    orderId: string,
    forAdmin?: boolean
    hideRestaurant?: boolean
}) => {
    const order = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => api.order.getOrderById(orderId)
    })

    const statusBadge = getStatusBadge(order.data?.status ?? "unknown");

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Order Details</CardTitle>
                <CardDescription>Order ID: {order.data?.order_id}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Status:</span>
                        <Badge
                            variant={statusBadge.variant as any}
                            className={cn(statusBadge.color)}
                        >
                            {formatStatus(order.data?.status)}
                        </Badge>
                    </div>
                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-md font-semibold">Customer Details</h3>
                        <p>User ID: {order.data?.user_id}</p>
                        <p>
                            Destination: {order.data?.destination.no}, {order.data?.destination.street}, {order.data?.destination.town}, {order.data?.destination.city}  {order.data?.destination.postal_code}
                        </p>
                    </div>
                    <Separator />

                    {!hideRestaurant ?
                        <>
                            <div className="space-y-2">
                                <h3 className="text-md font-semibold">Restaurant Details</h3>
                                {forAdmin ? <p>Id: {order.data?.restaurant.id}</p> : null}
                                <p>Name: {order.data?.restaurant.name}</p>
                            </div>
                            <Separator />
                        </> : null
                    }

                    <div className="space-y-2">
                        <h3 className="text-md font-semibold">Order Items</h3>
                        <ScrollArea className="h-max-[500px] w-full rounded-md border p-4">
                            {order.data?.items.map((item, index) => (
                                <OrderItemDisplay key={index} item={item} />
                            ))}
                        </ScrollArea>

                        <Separator />
                        <div className="flex justify-between">
                            <span className="font-semibold">Subtotal:</span>
                            <span>LKR {order.data?.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Coupon/Discount:</span>
                            <span>{order.data?.coupon ? order.data.coupon.name || (`LKR ${order.data.total - order.data.subtotal}`) : 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Total:</span>
                            <span className="text-lg font-bold">LKR {order.data?.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-md font-semibold">Delivery Details</h3>
                        <p>Delivery ID: {order.data?.delivery_id || 'N/A'}</p>
                        <p>Driver: {order.data?.assigned_driver || 'N/A'}</p>
                        {forAdmin ? <p>Transaction ID: {order.data?.transaction_id || 'N/A'}</p> : null}

                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="text-md font-semibold">Timestamps</h3>
                        <p>Created At: {formatDate(order.data?.created_at)}</p>
                        <p>Updated At: {formatDate(order.data?.updated_at)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderView;
