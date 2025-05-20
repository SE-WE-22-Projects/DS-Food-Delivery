import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import { Star, MapIcon, ToggleRight, ToggleLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

const DeliveryDriverStatus = ({ isOnline, toggleOnline }: { isOnline: boolean, toggleOnline: () => void }) => {
    return (
        <Card className="mb-8">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src="/placeholder.svg" alt="Driver" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">John Driver</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={isOnline ? "success" : "secondary" as any} className={isOnline ? "bg-green-500" : ""}>
                                    {isOnline ? "Online" : "Offline"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">ID: DRV-7829</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Rating</span>
                        <div className="flex items-center">
                            <span className="text-xl font-bold mr-2">4.92</span>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-4 w-4 fill-orange-500 text-orange-500" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Button variant="outline" className="gap-2">
                            <MapIcon className="h-4 w-4" />
                            View Map
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 gap-2" onClick={(toggleOnline)}>
                            {isOnline ? (
                                <>
                                    <ToggleRight className="h-4 w-4" />
                                    Go Offline
                                </>
                            ) : (
                                <>
                                    <ToggleLeft className="h-4 w-4" />
                                    Go Online
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}

export default DeliveryDriverStatus