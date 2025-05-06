import { Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

const reviews = [
    {
        id: "review1",
        name: "John D.",
        rating: 5,
        date: "2 days ago",
        comment: "Best pizza in town! The crust is perfect and the toppings are always fresh. Delivery was quick too.",
    },
    {
        id: "review2",
        name: "Sarah M.",
        rating: 4,
        date: "1 week ago",
        comment: "Really good food. The pasta was delicious and arrived hot. Would order again.",
    },
    {
        id: "review3",
        name: "Michael T.",
        rating: 5,
        date: "2 weeks ago",
        comment: "Amazing pizza and great service. The delivery person was very friendly and the food was still hot when it arrived.",
    },
    {
        id: "review4",
        name: "Emily R.",
        rating: 3,
        date: "3 weeks ago",
        comment: "The food was good but delivery took longer than expected. Would still recommend though.",
    },
]

const restaurant = { rating: 3.5, reviewCount: 200 }

const RestaurantReviews = () => {
    return (<>
        <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold">{restaurant.rating}</div>
            <div>
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`h-5 w-5 ${star <= Math.floor(restaurant.rating)
                                ? "fill-orange-500 text-orange-500"
                                : "fill-muted stroke-muted-foreground"
                                }`}
                        />
                    ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Based on {restaurant.reviewCount}+ reviews</div>
            </div>
        </div>
        <div className="space-y-4">
            {reviews.map((review) => (
                <Card key={review.id}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{review.name}</div>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? "fill-orange-500 text-orange-500" : "fill-muted stroke-muted-foreground"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{review.date}</div>
                        <p className="text-sm">{review.comment}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <Button variant="outline" className="w-full">Load More Reviews</Button>
    </>
    )
}

export default RestaurantReviews