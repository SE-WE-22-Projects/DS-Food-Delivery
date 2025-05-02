import { useState } from "react"
import { ChevronDown, Clock, Filter, MapPin, Search, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"

export default function RestaurantsPage() {
    const [activeFilters, setActiveFilters] = useState([])

    const addFilter = (filter) => {
        if (!activeFilters.includes(filter)) {
            setActiveFilters([...activeFilters, filter])
        }
    }

    const removeFilter = (filter) => {
        setActiveFilters(activeFilters.filter((f) => f !== filter))
    }

    return (
        <main className="flex-1">
            <div className="container px-4 py-8 md:px-6 md:py-12 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
                        <p className="text-muted-foreground mt-1">Discover restaurants in your area</p>
                    </div>
                    <div className="w-full md:w-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search restaurants or cuisines..."
                                className="pl-9 w-full md:w-[300px] rounded-full border-orange-200 focus-visible:ring-orange-500"
                            />
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Filter className="h-4 w-4" />
                                    <span className="sr-only">Filter</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="pl-6">
                                <SheetHeader>
                                    <SheetTitle>Filter Restaurants</SheetTitle>
                                    <SheetDescription>Customize your restaurant search with these filters.</SheetDescription>
                                </SheetHeader>
                                <div className="py-6 space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="font-medium">Cuisine Type</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {cuisineTypes.map((cuisine) => (
                                                <div key={cuisine} className="flex items-center space-x-2">
                                                    <Checkbox id={`cuisine-${cuisine}`} onCheckedChange={() => addFilter(cuisine)} />
                                                    <Label htmlFor={`cuisine-${cuisine}`}>{cuisine}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h3 className="font-medium">Price Range</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="price-$" onCheckedChange={() => addFilter("$")} />
                                                <Label htmlFor="price-$">$ (Inexpensive)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="price-$$" onCheckedChange={() => addFilter("$$")} />
                                                <Label htmlFor="price-$$">$$ (Moderate)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="price-$$$" onCheckedChange={() => addFilter("$$$")} />
                                                <Label htmlFor="price-$$$">$$$ (Expensive)</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <h3 className="font-medium">Delivery Time</h3>
                                            <span className="text-sm text-muted-foreground">Under 30 min</span>
                                        </div>
                                        <Slider defaultValue={[30]} max={60} step={5} />
                                    </div>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h3 className="font-medium">Dietary Options</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {dietaryOptions.map((option) => (
                                                <div key={option} className="flex items-center space-x-2">
                                                    <Checkbox id={`diet-${option}`} onCheckedChange={() => addFilter(option)} />
                                                    <Label htmlFor={`diet-${option}`}>{option}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <SheetFooter>
                                    <SheetClose asChild>
                                        <Button className="w-full bg-orange-500 hover:bg-orange-600">Apply Filters</Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {activeFilters.map((filter) => (
                            <Badge key={filter} variant="secondary" className="px-3 py-1">
                                {filter}
                                <button onClick={() => removeFilter(filter)} className="ml-2">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])}>
                            Clear all
                        </Button>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-muted-foreground">Showing 24 restaurants</div>
                    <Select defaultValue="recommended">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recommended">Recommended</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            <SelectItem value="delivery">Fastest Delivery</SelectItem>
                            <SelectItem value="distance">Nearest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.name} restaurant={restaurant} />
                    ))}
                </div>

                <div className="flex justify-center mt-10">
                    <Button variant="outline" className="gap-1">
                        Load More
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </main>
    )
}

function RestaurantCard({ restaurant }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
                <img
                    src={`/placeholder.svg?height=200&width=400&text=${restaurant.name}`}
                    width={400}
                    height={200}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                />
                {restaurant.promotion && <Badge className="absolute top-2 right-2 bg-orange-500">{restaurant.promotion}</Badge>}
                {restaurant.isNew && <Badge className="absolute top-2 left-2 bg-green-500">New</Badge>}
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
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{restaurant.deliveryTime} min</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{restaurant.distance} km</span>
                    </div>
                    <div className="text-sm font-medium">{restaurant.priceRange}</div>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">Order Now</Button>
            </CardContent>
        </Card>
    )
}

const cuisineTypes = ["Italian", "Chinese", "Mexican", "Japanese", "Indian", "Thai", "American", "Mediterranean"]

const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "Organic"]

const allRestaurants = [
    {
        name: "Pizza Palace",
        cuisine: "Italian • Pizza • Pasta",
        rating: 4.8,
        deliveryTime: 25,
        distance: 1.2,
        promotion: "20% OFF",
        priceRange: "$$",
    },
    {
        name: "Burger Joint",
        cuisine: "American • Burgers • Fries",
        rating: 4.5,
        deliveryTime: 30,
        distance: 0.8,
        priceRange: "$",
    },
    {
        name: "Sushi World",
        cuisine: "Japanese • Sushi • Asian",
        rating: 4.7,
        deliveryTime: 35,
        distance: 1.5,
        promotion: "Free Delivery",
        priceRange: "$$$",
    },
    {
        name: "Taco Fiesta",
        cuisine: "Mexican • Tacos • Burritos",
        rating: 4.3,
        deliveryTime: 20,
        distance: 0.5,
        priceRange: "$",
    },
    {
        name: "Green Bowl",
        cuisine: "Healthy • Salads • Bowls",
        rating: 4.6,
        deliveryTime: 15,
        distance: 0.7,
        promotion: "New",
        priceRange: "$$",
        isNew: true,
    },
    {
        name: "Spice Garden",
        cuisine: "Indian • Curry • Naan",
        rating: 4.4,
        deliveryTime: 40,
        distance: 1.8,
        priceRange: "$$",
    },
    {
        name: "Noodle House",
        cuisine: "Chinese • Noodles • Dumplings",
        rating: 4.2,
        deliveryTime: 35,
        distance: 2.0,
        priceRange: "$",
    },
    {
        name: "Mediterranean Delight",
        cuisine: "Mediterranean • Kebab • Falafel",
        rating: 4.5,
        deliveryTime: 45,
        distance: 1.6,
        priceRange: "$$",
    },
    {
        name: "Seafood Harbor",
        cuisine: "Seafood • Fish • Oysters",
        rating: 4.8,
        deliveryTime: 50,
        distance: 2.5,
        priceRange: "$$$",
        promotion: "10% OFF",
    },
    {
        name: "Vegan Paradise",
        cuisine: "Vegan • Healthy • Organic",
        rating: 4.7,
        deliveryTime: 30,
        distance: 1.3,
        priceRange: "$$",
        isNew: true,
    },
    {
        name: "Breakfast Club",
        cuisine: "Breakfast • Brunch • Coffee",
        rating: 4.6,
        deliveryTime: 25,
        distance: 0.9,
        priceRange: "$$",
    },
    {
        name: "BBQ Smokehouse",
        cuisine: "BBQ • Ribs • Brisket",
        rating: 4.9,
        deliveryTime: 45,
        distance: 3.0,
        priceRange: "$$$",
    },
]
