import { Check, CheckCircle, ChefHat, Clock, CreditCard, Package, Truck } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Progress } from '../ui/progress'
import { OrderStatus } from '@/api/order'
import OrderBadge from '../orders/OrderBadge'

const orderStatuses = [
    { label: "Payment", icon: CreditCard },
    { label: "Accepted", icon: CheckCircle },
    { label: "Preparing", icon: ChefHat },
    { label: "Ready", icon: Package },
    { label: "On the way", icon: Truck },
    { label: "Delivered", icon: Check },
]

export const getOrderStep = (status: OrderStatus) => {
    switch (status) {
        case 'payment_pending':
        case 'payment_failed':
        case 'canceled':
            return 0;

        case 'pending_restaurant_accept':
            return 1;
        case 'restaurant_rejected':
            return 2;

        case 'preparing_order':
            return 3;
        case 'awaiting_pickup':
            return 4;
        case 'delivering':
            return 5;
        case 'delivered':
            return 6;
    }
}

const OrderProgress = ({ status, estimatedTime }: { status: OrderStatus, estimatedTime?: number }) => {

    const orderStep = getOrderStep(status);
    const orderProgress = Math.min(orderStep == 6 ? 100 : (orderStep) * 100 / 6, 100)

    return (
        <Card className="mb-8">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">Order Status
                        <OrderBadge status={status} />
                    </h2>
                    {estimatedTime && <div className="flex items-center text-orange-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                            {Math.ceil(estimatedTime)} min{Math.ceil(estimatedTime) !== 1 ? "s" : ""}
                        </span>
                    </div>}
                </div>

                <Progress value={orderProgress} className="h-2 mb-8" />

                <div className="grid grid-cols-6 gap-2">
                    {orderStatuses.map((status, index) => {
                        const isActive = index < orderStep
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
    )
}

export default OrderProgress