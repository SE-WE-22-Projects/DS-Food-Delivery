import { ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import RestaurantCard from '../restaurants/RestaurantCard'
import { useSuspenseQuery } from '@tanstack/react-query'
import api from '@/api'
import { Suspense } from 'react'
import RestaurantLoader from '../restaurants/RestaurantLoader'
import { Link } from 'react-router-dom'


const FeaturedRestaurants = ({ className }: { className?: string }) => {
    return (
        <section className={cn("w-full py-12 md:py-24 lg:py-32", className)}>
            <div className="px-4 md:px-6 container mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Restaurants</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl">Discover the best food in your area</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8 mx-8">
                    <Suspense fallback={<RestaurantLoader onlyCards />}>
                        <RestaurantGrid />
                    </Suspense>
                </div>

                <div className="flex justify-center mt-8">
                    <Link to="/restaurant">
                        <Button variant="outline" className="gap-1">
                            View All Restaurants
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section >
    )
}

const RestaurantGrid = () => {
    const { data } = useSuspenseQuery({
        queryKey: ["featured-restaurant"],
        queryFn: api.restaurant.getAllApprovedRestaurants
    })

    return data.slice(0, 4).map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} compact />
    ))
}

export default FeaturedRestaurants