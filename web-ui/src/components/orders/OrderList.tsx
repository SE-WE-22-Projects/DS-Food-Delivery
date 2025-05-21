import api from '@/api';
import useUserStore from '@/store/user';
import { useSuspenseQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react';
import OrderCard from './OrderCard';
import { OrderStatus } from '@/api/order';
import { useMemo } from 'react';

const isActiveOrder = (s: OrderStatus) => s === "awaiting_pickup" || s === "delivering" || s === "payment_pending" || s === "pending_restaurant_accept" || s === "preparing_order"

const OrderList = ({ active }: { active?: boolean }) => {
    const user = useUserStore().userId!;
    const { data } = useSuspenseQuery({ queryKey: ["orders", user, !!active], queryFn: () => api.order.getOrdersByUserId(user) })

    const orders = useMemo(() => {
        if (active) {
            return data.filter((o) => isActiveOrder(o.status))
        }
        return data.filter((o) => !isActiveOrder(o.status))

    }, [data, active])

    return (
        <div className='flex flex-col gap-y-2'>
            {orders.map((order) => (
                <OrderCard key={order.order_id} order={order} />
            ))}
            {orders.length === 0 && <NoResults active={active} />}
        </div>
    )
}

const NoResults = ({ active }: { active?: boolean }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Found</h3>
            <p>{active ? "Current" : "Past"} orders will appear here</p>
        </div>
    );
}

export default OrderList