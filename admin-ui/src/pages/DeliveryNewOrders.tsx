import DeliveryTable from "@/components/delivery/DeliveryTable";
import { Check, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom"


const DeliveryNewOrders = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="flex justify-center mb-6">
                <h1 className="text-4xl lg:text-5xl">Nearby Deliveries</h1>
            </div>
            <DeliveryTable buttons={[
                { action: "Show", handle: (o) => navigate("./" + o.order_id), icon: <Eye /> },
                { action: "Claim", handle: (o) => navigate("./" + o.order_id), icon: <Check /> },
            ]} />
        </>
    )
}

export default DeliveryNewOrders