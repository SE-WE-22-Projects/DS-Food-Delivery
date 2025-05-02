import { useState } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, Clock, Heart, Info, MapPin, Search, Share2, Star } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from "react-router-dom"

export default function RestaurantDetailsPage() {
    // In a real app, you would fetch the restaurant data based on the ID
    const restaurant = restaurantData
    const [activeCategory, setActiveCategory] = useState("popular")

    return (
        <main className="flex-1">
            {/* Restaurant Hero Section */}
            <div className="relative h-[200px] md:h-[300px]">
                <img
                    src={`/placeholder.svg?height=300&width=1200&text=${restaurant.name}`}
                    alt={restaurant.name}
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="container px-4 pb-6 text-white mx-auto">
                        <Link to="/restaurants" className="flex items-center gap-1 text-white/80 mb-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to restaurants</span>
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
                                <p className="text-white/80">{restaurant.cuisine}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="rounded-full bg-black/20 border-white/20 text-white">
                                    <Heart className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full bg-black/20 border-white/20 text-white">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full bg-black/20 border-white/20 text-white">
                                    <Info className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Restaurant Info */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center">
                            <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                            <span className="ml-1 font-medium">{restaurant.rating}</span>
                            <span className="ml-1 text-muted-foreground">({restaurant.reviewCount}+ reviews)</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{restaurant.deliveryTime} min</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{restaurant.distance} km</span>
                        </div>
                        <Badge variant="outline" className="font-normal">
                            {restaurant.priceRange}
                        </Badge>
                    </div>
                    {restaurant.promotion && (
                        <Badge className="bg-orange-500">{restaurant.promotion}</Badge>
                    )}
                </div>
            </div>

            <Separator />

            {/* Menu Section */}
            <div className="container mx-auto px-4 py-6">
                <div className="relative flex">
                    {/* Category Sidebar - Desktop */}
                    <div className="hidden md:block w-[200px] flex-shrink-0 pr-4">
                        <div className="sticky top-[80px]">
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search menu"
                                        className="pl-9 rounded-full border-orange-200 focus-visible:ring-orange-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                {restaurant.menuCategories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={activeCategory === category.id ? "default" : "ghost"}
                                        className={`w-full justify-start ${activeCategory === category.id ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                                        onClick={() => setActiveCategory(category.id)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Menu Content */}
                    <div className="flex-1">
                        {/* Category Tabs - Mobile */}
                        <ScrollArea className="md:hidden whitespace-nowrap pb-4">
                            <div className="flex space-x-2">
                                {restaurant.menuCategories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={activeCategory === category.id ? "default" : "outline"}
                                        className={activeCategory === category.id ? "bg-orange-500 hover:bg-orange-600" : ""}
                                        onClick={() => setActiveCategory(category.id)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Menu Items */}
                        <div className="space-y-8">
                            {restaurant.menuCategories.map((category) => (
                                <div key={category.id} id={category.id} className="scroll-mt-20">
                                    <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {category.items.map((item) => (
                                            <MenuItem key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-muted/30 py-8">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="reviews">
                        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            <TabsTrigger value="info">Restaurant Info</TabsTrigger>
                        </TabsList>
                        <TabsContent value="reviews" className="space-y-6">
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
                                {restaurant.reviews.map((review) => (
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
                        </TabsContent>
                        <TabsContent value="info">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Address</h3>
                                        <p className="text-sm">{restaurant.address}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-medium mb-2">Hours</h3>
                                        <div className="space-y-1 text-sm">
                                            {restaurant.hours.map((hour, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span>{hour.day}</span>
                                                    <span>{hour.time}</span>
                                                </div>
                                            ))}
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
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </main>
    )
}

function MenuItem({ item }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="flex gap-3 group">
            <div className="flex-1">
                <div className="font-medium group-hover:text-orange-500 transition-colors">{item.name}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</div>
                {item.description.length > 100 && (
                    <button
                        className="text-xs text-orange-500 mt-1 flex items-center"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? (
                            <>
                                Show less <ChevronUp className="h-3 w-3 ml-1" />
                            </>
                        ) : (
                            <>
                                Show more <ChevronDown className="h-3 w-3 ml-1" />
                            </>
                        )}
                    </button>
                )}
                <div className="mt-2 flex items-center justify-between">
                    <div className="font-medium">${item.price.toFixed(2)}</div>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">Add</Button>
                </div>
            </div>
            <div className="w-24 h-24 flex-shrink-0">
                <img
                    src={`/placeholder.svg?height=96&width=96&text=${item.name}`}
                    width={96}
                    height={96}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md"
                />
            </div>
        </div>
    )
}

// Sample restaurant data
const restaurantData = {
    id: "pizza-palace",
    name: "Pizza Palace",
    cuisine: "Italian • Pizza • Pasta",
    rating: 4.8,
    reviewCount: 320,
    deliveryTime: 25,
    distance: 1.2,
    promotion: "20% OFF",
    priceRange: "$$",
    address: "123 Main Street, Anytown, CA 12345",
    phone: "(555) 123-4567",
    email: "info@pizzapalace.com",
    hours: [
        { day: "Monday - Thursday", time: "11:00 AM - 10:00 PM" },
        { day: "Friday - Saturday", time: "11:00 AM - 11:00 PM" },
        { day: "Sunday", time: "12:00 PM - 9:00 PM" },
    ],
    menuCategories: [
        {
            id: "popular",
            name: "Popular Items",
            items: [
                {
                    id: "item1",
                    name: "Margherita Pizza",
                    description: "Classic pizza with tomato sauce, mozzarella, fresh basil, salt, and extra-virgin olive oil.",
                    price: 12.99,
                    popular: true,
                },
                {
                    id: "item2",
                    name: "Pepperoni Pizza",
                    description: "Traditional pizza topped with tomato sauce, mozzarella cheese, and pepperoni.",
                    price: 14.99,
                    popular: true,
                },
                {
                    id: "item3",
                    name: "Garlic Bread",
                    description: "Freshly baked bread with garlic butter and herbs.",
                    price: 5.99,
                    popular: true,
                },
            ],
        },
        {
            id: "pizza",
            name: "Pizza",
            items: [
                {
                    id: "item4",
                    name: "Margherita Pizza",
                    description: "Classic pizza with tomato sauce, mozzarella, fresh basil, salt, and extra-virgin olive oil.",
                    price: 12.99,
                },
                {
                    id: "item5",
                    name: "Pepperoni Pizza",
                    description: "Traditional pizza topped with tomato sauce, mozzarella cheese, and pepperoni.",
                    price: 14.99,
                },
                {
                    id: "item6",
                    name: "Vegetarian Pizza",
                    description: "Fresh vegetables including bell peppers, mushrooms, onions, olives, and tomatoes on a bed of mozzarella cheese and tomato sauce.",
                    price: 13.99,
                },
                {
                    id: "item7",
                    name: "Hawaiian Pizza",
                    description: "Ham and pineapple toppings with tomato sauce and cheese. A sweet and savory combination that's surprisingly delicious.",
                    price: 15.99,
                },
                {
                    id: "item8",
                    name: "Meat Lovers Pizza",
                    description: "For the carnivore in you. Pepperoni, sausage, bacon, and ground beef on a bed of cheese and tomato sauce.",
                    price: 16.99,
                },
                {
                    id: "item9",
                    name: "Supreme Pizza",
                    description: "The ultimate combination of pepperoni, sausage, bell peppers, onions, olives, and mushrooms.",
                    price: 17.99,
                },
            ],
        },
        {
            id: "pasta",
            name: "Pasta",
            items: [
                {
                    id: "item10",
                    name: "Spaghetti Bolognese",
                    description: "Spaghetti served with a rich meat sauce made with ground beef, tomatoes, and herbs.",
                    price: 13.99,
                },
                {
                    id: "item11",
                    name: "Fettuccine Alfredo",
                    description: "Fettuccine pasta tossed in a rich and creamy Parmesan cheese sauce.",
                    price: 14.99,
                },
                {
                    id: "item12",
                    name: "Lasagna",
                    description: "Layers of pasta, ricotta cheese, ground beef, and tomato sauce, topped with mozzarella and baked to perfection.",
                    price: 15.99,
                },
                {
                    id: "item13",
                    name: "Penne Arrabbiata",
                    description: "Penne pasta in a spicy tomato sauce with garlic, tomatoes, and red chili peppers.",
                    price: 12.99,
                },
            ],
        },
        {
            id: "salads",
            name: "Salads",
            items: [
                {
                    id: "item14",
                    name: "Caesar Salad",
                    description: "Crisp romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.",
                    price: 8.99,
                },
                {
                    id: "item15",
                    name: "Greek Salad",
                    description: "Fresh cucumbers, tomatoes, red onion, olives, and feta cheese with olive oil dressing.",
                    price: 9.99,
                },
                {
                    id: "item16",
                    name: "Caprese Salad",
                    description: "Fresh mozzarella, tomatoes, and basil, drizzled with balsamic glaze and olive oil.",
                    price: 10.99,
                },
            ],
        },
        {
            id: "desserts",
            name: "Desserts",
            items: [
                {
                    id: "item17",
                    name: "Tiramisu",
                    description: "Classic Italian dessert made with layers of coffee-soaked ladyfingers and mascarpone cream.",
                    price: 7.99,
                },
                {
                    id: "item18",
                    name: "Chocolate Lava Cake",
                    description: "Warm chocolate cake with a molten chocolate center, served with vanilla ice cream.",
                    price: 8.99,
                },
                {
                    id: "item19",
                    name: "Cannoli",
                    description: "Crispy pastry shells filled with sweet ricotta cream and chocolate chips.",
                    price: 6.99,
                },
            ],
        },
        {
            id: "drinks",
            name: "Drinks",
            items: [
                {
                    id: "item20",
                    name: "Soft Drinks",
                    description: "Coca-Cola, Diet Coke, Sprite, or Fanta.",
                    price: 2.99,
                },
                {
                    id: "item21",
                    name: "Italian Soda",
                    description: "Sparkling water with your choice of flavored syrup.",
                    price: 3.99,
                },
                {
                    id: "item22",
                    name: "Bottled Water",
                    description: "500ml bottle of still or sparkling water.",
                    price: 1.99,
                },
            ],
        },
    ],
    reviews: [
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
    ],
}

