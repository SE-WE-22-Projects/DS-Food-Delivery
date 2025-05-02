import { Search, ChevronRight, Star, Clock, MapPin, ArrowRight, Apple, PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

export default function HomePage() {
    return (

        <main className="flex-1">
            <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-orange-50 to-white ">
                <div className=" px-4 md:px-6 container mx-auto">
                    <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                    Delicious Food Delivered To Your Door
                                </h1>
                                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                    Order from your favorite restaurants and get food delivered in minutes.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <div className="flex-1 flex items-center relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter your delivery address"
                                        className="pl-9 pr-24 py-6 rounded-full border-orange-200 focus-visible:ring-orange-500"
                                    />
                                    <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-full">
                                        Find Food
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <img
                                src="/placeholder.svg?height=550&width=550"
                                width={550}
                                height={550}
                                alt="Food delivery"
                                className="mx-auto aspect-square rounded-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className=" px-4 md:px-6 container mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Popular Categories</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl">
                                Explore our wide variety of cuisines and dishes
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
                        {categories.map((category) => (
                            <Link
                                to="#"
                                key={category.name}
                                className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="rounded-full bg-orange-100 p-3 mb-3">
                                    <img
                                        src={`/placeholder.svg?height=40&width=40&text=${category.name}`}
                                        width={40}
                                        height={40}
                                        alt={category.name}
                                        className="h-10 w-10 object-cover"
                                    />
                                </div>
                                <span className="text-sm font-medium">{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-50">
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

            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className=" px-4 md:px-6 container mx-auto">
                    <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
                                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                    Get your favorite food in 3 simple steps
                                </p>
                            </div>
                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <div key={step.title} className="flex items-start">
                                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-900 font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">{step.title}</h3>
                                            <p className="text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <Button className="bg-orange-500 hover:bg-orange-600 mt-4">
                                    Order Now <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <img
                                src="/placeholder.svg?height=500&width=500"
                                width={500}
                                height={500}
                                alt="Food delivery process"
                                className="mx-auto rounded-lg object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-500 text-white">
                <div className=" px-4 md:px-6 container mx-auto">
                    <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Download Our App</h2>
                            <p className="max-w-[600px] md:text-xl">
                                Get the full experience with our mobile app. Order food, track delivery, and get exclusive offers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <Button variant="outline" className="bg-black text-white border-white hover:bg-gray-900 gap-2">
                                    <Apple className="h-5 w-5" />
                                    App Store
                                </Button>
                                <Button variant="outline" className="bg-black text-white border-white hover:bg-gray-900 gap-2">
                                    <PlayCircle className="h-5 w-5" />
                                    Google Play
                                </Button>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <img
                                src="/placeholder.svg?height=600&width=300"
                                width={300}
                                height={600}
                                alt="Mobile app"
                                className="mx-auto rounded-lg object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>

    )
}

const categories = [
    { name: "Pizza" },
    { name: "Burgers" },
    { name: "Sushi" },
    { name: "Salads" },
    { name: "Desserts" },
    { name: "Indian" },
    { name: "Chinese" },
    { name: "Mexican" },
    { name: "Italian" },
    { name: "Thai" },
    { name: "Vegan" },
    { name: "Breakfast" },
]

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

const steps = [
    {
        title: "Enter your address",
        description: "Enter your delivery address to see restaurants that deliver to you.",
    },
    {
        title: "Choose a restaurant",
        description: "Browse menus and reviews to find your perfect meal.",
    },
    {
        title: "Get it delivered",
        description: "Your order will be delivered to your door in minutes.",
    },
]
