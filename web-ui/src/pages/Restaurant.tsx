import { ArrowLeft, Building, Pizza, Star } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Link, useParams } from "react-router-dom"
import RestaurantReviews from "@/components/restaurant/RestaurantReviews"
import RestaurantMenu from '@/components/restaurant/RestaurantMenu'
import { useSuspenseQuery } from '@tanstack/react-query'
import api from '@/api'
import { Badge } from '@/components/ui/badge'
import { Suspense } from 'react'
import RestaurantDetails from '@/components/restaurant/RestaurantDetails'
import getImageUrl from '@/lib/images'
import CartDialog from '@/components/cart/CartDialog'

export default function RestaurantDetailsPage() {
    const { restaurantId } = useParams();

    const { data: restaurant } = useSuspenseQuery({
        queryKey: ['restaurant', restaurantId],
        queryFn: () => api.restaurant.getRestaurantById(restaurantId!)
    })

    return (
        <main className="flex-1">
            <CartDialog>

                {/* Restaurant Header*/}
                <div className="relative h-[200px] md:h-[300px]">
                    <img
                        src={getImageUrl(restaurant.cover, { height: 200, width: 300 })}
                        alt={restaurant.name}
                        className="object-cover h-[200px] overflow-clip"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-500/70 to-transparent flex items-end">
                        <div className="container px-4 pb-6 text-white mx-auto">
                            <Link to="/restaurant" className="flex items-center gap-1 text-white/80 mb-2">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to restaurants</span>
                            </Link>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
                                    <Badge className="text-white/80">{restaurant.tags}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restaurant page menu */}
                <div className="pb-8 w-full">
                    <Tabs defaultValue="menu" className='gap-0' >
                        <TabsList className="w-full h-11">
                            <div className='grid grid-cols-3 h-11 pb-0 mb-0 w-md mx-auto'>
                                <TabsTrigger className='text-lg font-semibold' value="menu">
                                    <Pizza className='text-orange-500 w-20 h-20' />
                                    Menu
                                </TabsTrigger>
                                <TabsTrigger className='text-lg font-semibold' value="reviews">
                                    <Star className='text-orange-500 w-20 h-20' />
                                    Reviews
                                </TabsTrigger>
                                <TabsTrigger className='text-lg font-semibold' value="info">
                                    <Building className='text-orange-500 w-20 h-20' />
                                    Restaurant
                                </TabsTrigger>
                            </div>
                        </TabsList>
                        <Separator className='mb-6' />
                        <div className='container mx-auto px-4 py-6'>
                            <TabsContent value='menu'>
                                <Suspense>
                                    <RestaurantMenu resId={restaurant.id} />
                                </Suspense>
                            </TabsContent>
                            <TabsContent value="reviews">
                                <RestaurantReviews />
                            </TabsContent>
                            <TabsContent value="info">
                                <RestaurantDetails restaurant={restaurant} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </CartDialog>
        </main >
    )
}