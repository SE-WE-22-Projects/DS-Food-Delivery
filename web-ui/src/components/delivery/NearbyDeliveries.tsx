import api from '@/api'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Loader2, MapPin, Package, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Input } from '../ui/input'
import { DeliveryType } from '@/api/delivery'
import { Separator } from '@radix-ui/react-separator'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

const NearbyDeliveries = ({ setAvailable }: { setAvailable: (v: number) => void }) => {
    const [searchQuery, setSearchQuery] = useState("")
    const queryClient = useQueryClient()
    const { data } = useSuspenseQuery({ queryKey: ["nearbyDeliveries"], queryFn: api.delivery.getNearbyDeliveries, refetchInterval: 2000 })

    const claimMutation = useMutation({
        mutationFn: api.delivery.claimDelivery,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nearbyDeliveries"] })
            queryClient.invalidateQueries({ queryKey: ["myDeliveries"] })
            toast.success("Delivery claimed successfully")
        },
        onError: (error) => {
            console.error("Failed to claim delivery:", error)
            toast.error("Failed to claim delivery. Please try again.")
        },
    })

    // filter available deliveries based on search query
    const filtered = data.filter((delivery) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                delivery.order_id.toLowerCase().includes(query) ||
                delivery.pickup.name.toLowerCase().includes(query) ||
                delivery.destination.street.toLowerCase().includes(query) ||
                delivery.destination.city.toLowerCase().includes(query)
            )
        }

        return true
    });

    useEffect(() => setAvailable(filtered.length), [filtered.length])


    return (
        <>
            <div className="relative flex-1 max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search orders..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No available deliveries match your search</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((delivery) => (

                        <AvailableDeliveryCard
                            key={delivery.id}
                            delivery={delivery}
                            claim={() => claimMutation.mutate(delivery.id)}
                            loading={claimMutation.isPending && claimMutation.variables === delivery.id}
                        />
                    ))}
                </div>
            )}
        </>
    )
}


function AvailableDeliveryCard({ delivery, claim, loading }: { delivery: DeliveryType, claim: () => void, loading: boolean }) {
    const deliveryAddress = `${delivery.destination.no} ${delivery.destination.street}, ${delivery.destination.city}, ${delivery.destination.postal_code}`

    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">Order #{delivery.order_id}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Ready for pickup • {delivery.delivery_time} min delivery
                            </p>
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
                </div>

                <Separator />

                <div className="p-4 flex justify-between items-center bg-muted/30">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Order ID: </span>
                        <span>{delivery.order_id}</span>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={claim} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Claiming...
                            </>
                        ) : (
                            "Claim Order"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default NearbyDeliveries