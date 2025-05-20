import api from '@/api';
import useUserStore from '@/store/user';
import { useSuspenseQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react';
import OrderCard from './OrderCard';

const OrderList = ({ active }: { active?: boolean }) => {
    const user = useUserStore().userId;
    const { data } = useSuspenseQuery({ queryKey: ["orders", user, !!active], queryFn: () => api.order.getOrdersByUserId(user) })

    return (
        <div className='flex flex-col gap-y-2'>
            {data.map((order) => (
                <OrderCard key={order.order_id} order={order} />
            ))}
            {data.length === 0 && <NoResults active={active} />}
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