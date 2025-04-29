import { OrderStatus } from "@/api/order";
import { default as OrderView2 } from "@/components/order/Order";
import OrderTable from "@/components/order/OrderTable"
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cross, Eye, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"

const canCancel = (s: OrderStatus): boolean => {
    return s === "pending_restaurant_accept" || s === "payment_pending"
}

const OrderView = () => {
    const navigate = useNavigate();
    const { orderId } = useParams()

    return (
        <>
            <h1 className="text-2xl mb-2">
                <Button variant='ghost' size="lg" onClick={() => navigate(-1)}><ArrowLeft /></Button>
                View Order</h1>
            <OrderView2 orderId={orderId!} />
        </>
    )
}

export default OrderView