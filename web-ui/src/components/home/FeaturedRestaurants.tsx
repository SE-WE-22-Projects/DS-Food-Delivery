import { Badge, Star, Clock, MapPin, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { cn } from '@/lib/utils'

const restaurants = [
    {
        name: "Pizza Palace",
        cuisine: "Italian • Pizza • Pasta",
        rating: 4.8,
        deliveryTime: 25,
        distance: 1.2,
        promotion: "20% OFF",
    },
    {
        name: "Burger Joint",
        cuisine: "American • Burgers • Fries",
        rating: 4.5,
        deliveryTime: 30,
        distance: 0.8,
    },
    {
        name: "Sushi World",
        cuisine: "Japanese • Sushi • Asian",
        rating: 4.7,
        deliveryTime: 35,
        distance: 1.5,
        promotion: "Free Delivery",
    },
    {
        name: "Taco Fiesta",
        cuisine: "Mexican • Tacos • Burritos",
        rating: 4.3,
        deliveryTime: 20,
        distance: 0.5,
    },
    {
        name: "Green Bowl",
        cuisine: "Healthy • Salads • Bowls",
        rating: 4.6,
        deliveryTime: 15,
        distance: 0.7,
        promotion: "New",
    },
    {
        name: "Spice Garden",
        cuisine: "Indian • Curry • Naan",
        rating: 4.4,
        deliveryTime: 40,
        distance: 1.8,
    },
]


const FeaturedRestaurants = ({ className }: { className?: string }) => {
    return (
        <section className={cn("w-full py-12 md:py-24 lg:py-32", className)}>
            <div className=" px-4 md:px-6 container mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Restaurants</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl">Discover the best food in your area</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {restaurants.map((restaurant) => (
                        <Card key={restaurant.name} className="overflow-hidden">
                            <div className="relative">
                                <img
                                    src={`/placeholder.svg?height=200&width=400&text=${restaurant.name}`}
                                    width={400}
                                    height={200}
                                    alt={restaurant.name}
                                    className="w-full h-48 object-cover"
                                />
                                {restaurant.promotion && (
                                    <Badge className="absolute top-2 right-2 bg-orange-500">{restaurant.promotion}</Badge>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold">{restaurant.name}</h3>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 fill-orange-500 text-orange-500 mr-1" />
                                        <span className="text-sm font-medium">{restaurant.rating}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{restaurant.cuisine}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>{restaurant.deliveryTime} min</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span>{restaurant.distance} km</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="flex justify-center mt-8">
                    <Button variant="outline" className="gap-1">
                        View All Restaurants
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default FeaturedRestaurants