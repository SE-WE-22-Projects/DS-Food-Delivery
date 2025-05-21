import { Plus, Star } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { useQuery } from '@tanstack/react-query'
import api from '@/api'
import { Button } from '../ui/button'
import { RatingDialog } from './RatingDialog'
import { formatDate } from '@/lib/timeUtil'


const RestaurantReviews = ({ restaurant, name }: { restaurant: string, name: string }) => {
    const data = useQuery({
        queryKey: ["reviews", restaurant, 'all'],
        queryFn: () => api.rating.getRating(restaurant)
    })

    const reviews = data.data ? data.data.length : 0
    const avg = data.data && reviews > 0 ? data.data.reduce((a, v) => a + v.rating, 0) / reviews : 0

    return (<>
        <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold">{avg}</div>
            <div>
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`h-5 w-5 ${star <= Math.floor(avg)
                                ? "fill-orange-500 text-orange-500"
                                : "fill-muted stroke-muted-foreground"
                                }`}
                        />
                    ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Based on {reviews}+ reviews</div>
            </div>
            <div className='ml-auto bg-'>
                <RatingDialog restaurantId={restaurant} restaurantName={name} trigger={
                    <Button className='bg-orange-500 hover:bg-orange-600'>
                        <Plus />
                        Add Review</Button>
                } />
            </div>
        </div>
        <div className="space-y-4">
            {data.data?.map((review) => (
                <Card key={review._id}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
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
                        <p className="text-sm">{review.review}</p>
                        <div className="text-sm text-muted-foreground mb-2">{formatDate(review.createdAt)}</div>
                    </CardContent>
                </Card>
            ))}
        </div>

    </>
    )
}

export default RestaurantReviews