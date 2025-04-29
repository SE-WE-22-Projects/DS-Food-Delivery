import api from "@/api";
import { OrderStatus } from "@/api/order";
import OrderTable from "@/components/order/OrderTable"
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Check, Cross, Eye, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"


const RestaurantOrders = () => {
    const navigate = useNavigate();
    const { restaurantId } = useParams();

    const client = useQueryClient();
    const accept = useMutation({
        mutationKey: ["orders"],
        mutationFn: api.order.acceptOrderById,
        onSuccess: () => client.invalidateQueries({ queryKey: ["orders"] })
    })

    const reject = useMutation({
        mutationKey: ["orders"],
        mutationFn: (orderId: string) => api.order.rejectOrderById(orderId, "rejected"),
        onSuccess: () => client.invalidateQueries({ queryKey: ["orders"] })
    })

    const finish = useMutation({
        mutationKey: ["orders"],
        mutationFn: api.order.finishOrderById,
        onSuccess: () => client.invalidateQueries({ queryKey: ["orders"] })
    })

    return (
        <>
            <div className="flex justify-center mb-6">
                <h1 className="text-4xl lg:text-5xl">Orders</h1>
            </div>
            <OrderTable
                restaurantId={restaurantId}
                buttons={[
                    { action: "Show", handle: (o) => navigate("./view/" + o.order_id), icon: <Eye /> },
                    {
                        action: "Reject",
                        handle: (o) => reject.mutate(o.order_id),
                        enabled: (o) => o.status === "pending_restaurant_accept",
                        className: "bg-red-400 hover:bg- red - 600",
                        icon: <Trash2 />
                    },
                    {
                        action: "Accept",
                        handle: (o) => accept.mutate(o.order_id),
                        enabled: (o) => o.status === "pending_restaurant_accept",
                        className: "bg-green-400 hover:bg-green-600",
                        icon: <Check />
                    },
                    {
                        action: "Complete",
                        handle: (o) => finish.mutate(o.order_id),
                        enabled: (o) => o.status === "preparing_order",
                        className: "bg-green-400 hover:bg-green-600",
                        icon: <Check />
                    }

                ]} />
        </>
    )
}

export default RestaurantOrders