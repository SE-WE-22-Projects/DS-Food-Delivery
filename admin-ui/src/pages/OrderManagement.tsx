import { OrderStatus } from "@/api/order";
import OrderTable from "@/components/order/OrderTable"
import { Cross, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom"

const canCancel = (s: OrderStatus): boolean => {
    return s === "pending_restaurant_accept" || s === "payment_pending"
}

const OrderManagement = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="flex justify-center mb-6">
                <h1 className="text-4xl lg:text-5xl">Order Management</h1>
            </div>
            <OrderTable buttons={[
                { action: "Show", handle: (o) => navigate("./" + o.order_id), icon: <Eye /> },
                // {
                //     action: "Cancel",
                //     handle: (o) => console.log(o),
                //     enabled: (o) => canCancel(o.status),
                //     className: "bg-red-400 hover:bg- red - 600",
                //     icon: <Trash2 />
                // }
            ]} />
        </>
    )
}

export default OrderManagement