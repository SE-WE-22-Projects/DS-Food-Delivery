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
import { cn } from "@/lib/utils";
import { DeliveryType } from "@/api/delivery";


interface TableProps {
    buttons: {
        action: string,
        icon?: ReactNode,
        className?: string,
        handle: (o: DeliveryType) => void
        enabled?: (o: DeliveryType) => boolean
    }[]
}


const DeliveryTable = (props: TableProps) => {
    const query = useQuery({
        queryKey: ["orders"],
        queryFn: () => {
            return api.delivery.getNearbyDeliveries()
        }
    })


    return (
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
            <Table>
                <TableCaption>Orders</TableCaption>
                <TableHeader className="bg-gray-950">
                    <TableHead className="w-[100px]">Order Id</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Destination</TableHead>
                </TableHeader>
                <TableBody>
                    {
                        query.data && query.data.map(order => {
                            return (
                                <TableRow key={order.order_id}>
                                    <TableCell className="font-medium">{order.order_id}</TableCell>
                                    <TableCell>{order.pickup.name}</TableCell>
                                    <TableCell>{order.destination.street}, {order.destination.city}</TableCell>
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

export default DeliveryTable;