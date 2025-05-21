import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import { MapIcon, ToggleRight, ToggleLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import useUserStore from '@/store/user'

const DeliveryDriverStatus = ({ isOnline, toggleOnline }: { isOnline: boolean, toggleOnline: () => void }) => {
    const user = useUserStore()

    return (
        <Card className="mb-8">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.user?.profile_image} alt="Driver" />
                            <AvatarFallback>{user.user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{user.user?.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={isOnline ? "success" : "secondary" as any} className={isOnline ? "bg-green-500" : ""}>
                                    {isOnline ? "Online" : "Offline"}
                                </Badge>
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