import { RestaurantType } from "@/api/restaurant"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"

const RestaurantDetails = ({ restaurant }: { restaurant: RestaurantType }) => {
    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div>
                    <h3 className="font-medium mb-2">Address</h3>
                    <p className="text-sm">{restaurant.address.city}</p>
                </div>
                <Separator />
                <div>
                    <h3 className="font-medium mb-2">Hours</h3>
                    <div className="space-y-1 text-sm">
                        {/* {restaurant.hours.map((hour, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span>{hour.day}</span>
                                                    <span>{hour.time}</span>
                                                </div>
                                            ))} */}
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="font-medium mb-2">Contact</h3>
                    <p className="text-sm">{restaurant.phone}</p>
                    <p className="text-sm">{restaurant.email}</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default RestaurantDetails