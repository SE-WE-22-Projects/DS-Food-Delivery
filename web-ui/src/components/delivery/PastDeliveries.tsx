import { Badge } from '../ui/badge'
import { DeliveryType } from '@/api/delivery'
import { Package, MapPin } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import api from '@/api'

const PastDeliveries = () => {
    const { data } = useSuspenseQuery({ queryKey: ["myDeliveries"], queryFn: api.delivery.getMyDeliveries })
    const completedDeliveries = data.filter((delivery) => delivery.state === "done")

    return completedDeliveries.length === 0 ? (
        <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't completed any deliveries yet</p>
        </div>
    ) : (
        <div className="space-y-4">
            {completedDeliveries.map((delivery) => (
                <CompletedDeliveryCard key={delivery.id} delivery={delivery} />
            ))}
        </div>
    )

}

const CompletedDeliveryCard = ({ delivery }: { delivery: DeliveryType }) => {
    const deliveryAddress = `${delivery.destination.no} ${delivery.destination.street}, ${delivery.destination.city}, ${delivery.destination.postal_code}`

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">Order #{delivery.order_id}</h3>
                            <Badge className="bg-green-500">Completed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Delivered today</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold text-green-600">
                            LKR {delivery.delivery_earnings ?? "?"}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                            {delivery.delivery_distance ?? "?"} km
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-orange-500" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">{delivery.pickup.name}</p>
                                    <p className="text-sm text-muted-foreground">Pickup location</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-green-500" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">Customer</p>
                                    <p className="text-sm text-muted-foreground">{deliveryAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


export default PastDeliveries