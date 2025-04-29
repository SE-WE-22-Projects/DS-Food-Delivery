import {
    Table,
    TableHeader,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { Button } from "../ui/button";
import { ReactNode } from "react";
import { Order } from "@/api/order";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/timeUtil";

export const formatStatus = (s?: string) => {
    return s && s.split("_").map(s => s.slice(0, 1).toUpperCase() + s.slice(1)).join(" ")
}

interface TableProps {
    restaurantId?: string
    buttons: {
        action: string,
        icon?: ReactNode,
        className?: string,
        handle: (o: Order) => void
        enabled?: (o: Order) => boolean
    }[]
}


const OrderTable = (props: TableProps) => {
    const query = useQuery({
        queryKey: ["orders", props.restaurantId],
        queryFn: () => {
            if (props.restaurantId) {
                return api.order.getRestaurantOrders(props.restaurantId)
            }
            return api.order.getAllOrders()
        }
    })


    return (
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-950">
                    <TableHead className="w-[100px]">Order Id</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Ordered At</TableHead>
                    <TableHead></TableHead>
                </TableHeader>
                <TableBody>
                    {
                        query.data && query.data.map(order => {
                            return (
                                <TableRow key={order.order_id}>
                                    <TableCell className="font-medium">{order.order_id}</TableCell>
                                    <TableCell>{formatStatus(order.status)}</TableCell>
                                    <TableCell>LKR {order.total}</TableCell>
                                    <TableCell>{formatDate(order.created_at)}</TableCell>
                                    <TableCell className='flex gap-3 flex-row-reverse'>
                                        {
                                            props.buttons.map(b => {
                                                return !b.enabled || b.enabled(order) ?
                                                    <Button className={cn('hover:scale-[1.03]', b.className)}
                                                        onClick={() => { b.handle(order) }}
                                                        disabled={b.enabled && !b.enabled(order)}
                                                    >
                                                        {b.action}{b.icon}
                                                    </Button> : null
                                            })
                                        }

                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }

                </TableBody>
            </Table>
        </div>
    );
};

export default OrderTable;