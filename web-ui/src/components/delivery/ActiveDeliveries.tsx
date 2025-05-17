import { Progress } from '@radix-ui/react-progress'
import { Separator } from '@radix-ui/react-separator'
import { Package, MapPin, Navigation, Phone, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { DeliveryType } from '@/api/delivery'
import { Badge } from '../ui/badge'
import api from '@/api'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const ActiveDeliveries = ({ setActive }: { setActive: (v: number) => void }) => {
    const { data } = useSuspenseQuery({ queryKey: ["myDeliveries"], queryFn: api.delivery.getMyDeliveries, })
    const activeDeliveries = data.filter((delivery) => delivery.state !== "done")
    const queryClient = useQueryClient()

    // Pickup delivery mutation
    const pickupMutation = useMutation({
        mutationFn: api.delivery.pickupDelivery,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myDeliveries"] })
            toast.success("Delivery marked as picked up")
        },
        onError: (error) => {
            console.error("Failed to update delivery status:", error)
            toast.error("Failed to update status. Please try again.")
        },
    })

    // Complete delivery mutation
    const completeMutation = useMutation({
        mutationFn: api.delivery.completeDelivery,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myDeliveries"] })
            toast.success("Delivery completed successfully")
        },
        onError: (error) => {
            console.error("Failed to complete delivery:", error)
            toast.error("Failed to complete delivery. Please try again.")
        },
    });

    useEffect(() => setActive(activeDeliveries.length), [activeDeliveries.length])

    return activeDeliveries.length === 0 ? (
        <div className="text-center py-12">
            <p className="text-muted-foreground">You don't have any active deliveries</p>
        </div>
    ) : (
        <div className="space-y-6">
            {activeDeliveries.map((delivery) => (
                <ActiveDeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onComplete={() => completeMutation.mutate(delivery.id)}
                    onPickup={() => pickupMutation.mutate(delivery.id)}
                    isLoading={
                        (completeMutation.isPending && completeMutation.variables === delivery.id) ||
                        (pickupMutation.isPending && pickupMutation.variables === delivery.id)
                    }
                />
            ))}
        </div>
    )
}

const ActiveDeliveryCard = ({
    delivery,
    onComplete,
    onPickup,
    isLoading,
}: {
    delivery: DeliveryType
    onComplete: () => void
    onPickup: () => void
    isLoading: boolean
}) => {
    // Format address
    const deliveryAddress = `${delivery.destination.no} ${delivery.destination.street}, ${delivery.destination.city}, ${delivery.destination.postal_code}`

    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">Order #{delivery.order_id}</h3>
                                <Badge className="bg-purple-500">Delivering</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">In progress</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold text-green-600">
                                LKR {delivery.delivery_earnings ?? "??"}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                                {delivery.delivery_distance ?? "??"} km
                            </Badge>
                        </div>
                    </div>

                    {/* Order Progress */}
                    <div className="mb-6">
                        <Progress value={50} className="h-2 mb-2" />
                        <div className="grid grid-cols-2 gap-2">
                            {["Picked Up", "Delivered"].map((status, index) => {
                                const isActive = index === 0
                                return (
                                    <div key={status} className="flex flex-col items-center text-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isActive ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {index === 0 && <Package className="h-4 w-4" />}
                                            {index === 1 && <MapPin className="h-4 w-4" />}
                                        </div>
                                        <div className={`text-xs ${isActive ? "font-medium" : "text-muted-foreground"}`}>{status}</div>
                                    </div>
                                )
                            })}
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
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Navigation className="h-3 w-3" />
                                                Navigate
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Phone className="h-3 w-3" />
                                                Call
                                            </Button>
                                        </div>
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
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Navigation className="h-3 w-3" />
                                                Navigate
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <Phone className="h-3 w-3" />
                                                Call
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                Message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-4 flex justify-between items-center bg-muted/30">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Order ID: </span>
                        <span>{delivery.order_id}</span>
                    </div>
                    {delivery.state === "waiting" ?
                        <Button className="bg-orange-500 hover:bg-orange-600" onClick={onPickup} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                "Mark as Picked Up"
                            )}
                        </Button> :
                        <Button className="bg-orange-500 hover:bg-orange-600" onClick={onComplete} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                "Mark as Delivered"
                            )}
                        </Button>}
                </div>
            </CardContent>
        </Card>
    )
}

export default ActiveDeliveries