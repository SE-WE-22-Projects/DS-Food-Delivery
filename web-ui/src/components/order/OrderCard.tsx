import { Clock, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import { Order } from "@/api/order"
import { formatDate } from "@/lib/timeUtil"
import { Badge } from "../ui/badge"
import { formatStatus } from "./Order"

const OrderCard = ({ order }: { order: Order }) => {
    const isComplete = order.status === "delivered" || order.status === "canceled"

    return (
        <Card className="pb-0">
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="font-bold text-lg">Order  <span className="text-sm font-thin"> #{order.order_id}</span></div>
                            <Badge className={isComplete ? "bg-gray-500" : "bg-green-500"}>{formatStatus(order.status)}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{formatDate(order.created_at)}</div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <img
                                src={`/api/v1/restaurants/${order.restaurant.id}/logo`}
                                width={80}
                                height={80}
                                alt={order.restaurant.name}
                                className="rounded-md object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{order.restaurant.name}</h3>
                            <div className="text-sm text-muted-foreground mb-4">{order.items.slice(0, 3).map(i => i.name + " x " + i.amount).join(", ")}</div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="font-bold">LKR {order.total.toFixed(2)}</div>
                                {!isComplete && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm">Estimated delivery: {order.eta ?? "Unknown"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-4 flex justify-between items-center bg-muted/30">
                    <div className="text-sm">
                        {!isComplete ? (
                            <span className="text-orange-500 font-medium">Track your order in real-time</span>
                        ) : (
                            <span>Order completed</span>
                        )}
                    </div>
                    <Link to={`./${order.order_id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                            View Details
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default OrderCard