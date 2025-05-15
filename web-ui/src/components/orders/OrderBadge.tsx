import { OrderStatus } from '@/api/order'
import { Badge } from '../ui/badge';
const formatStatus = (s?: string) => {
    return s && s.split("_").map(s => s.slice(0, 1).toUpperCase() + s.slice(1)).join(" ")
}

export const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
        case 'payment_pending':
            return "bg-gray-500";

        case 'payment_failed':
        case 'canceled':
            return "bg-red-500";

        case 'pending_restaurant_accept':
            return "bg-yellow-500";
        case 'restaurant_rejected':
            return "bg-red-500";
        case 'preparing_order':
            return "bg-blue-500";
        case 'awaiting_pickup':
            return "bg-purple-500";
        case 'delivering':
            return "bg-orange-500";
        case 'delivered':
            return "bg-green-500"

        default:
            return "bg-gray-500"
    }
};

const OrderBadge = ({ status }: { status: OrderStatus }) => {
    return (
        <Badge className={getStatusBadge(status)}>{formatStatus(status)}</Badge>
    )
}

export default OrderBadge