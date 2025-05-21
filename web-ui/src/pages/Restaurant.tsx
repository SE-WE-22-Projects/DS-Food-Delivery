import { Pizza, Star } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useParams } from "react-router-dom"
import RestaurantReviews from "@/components/restaurant/RestaurantReviews"
import RestaurantMenu from '@/components/restaurant/RestaurantMenu'
import { useSuspenseQuery } from '@tanstack/react-query'
import api from '@/api'
import { Suspense } from 'react'
import CartDialog from '@/components/cart/CartDialog'
import RestaurantHeader from '@/components/restaurant/RestaurantHeader'

export default function RestaurantDetailsPage() {
    const { restaurantId } = useParams();

    const { data: restaurant } = useSuspenseQuery({
        queryKey: ['restaurant', restaurantId],
        queryFn: () => api.restaurant.getRestaurantById(restaurantId!)
    })

    return (
        <main className="flex-1 pb-12 bg-gray-50">
            <CartDialog>

                {/* Restaurant Header*/}
                <RestaurantHeader restaurant={restaurant} />

                {/* Restaurant page menu */}
                <div className="pb-8 w-full">
                    <Tabs defaultValue="menu" className='gap-0' >
                        <TabsList className="w-full h-11">
                            <div className='grid grid-cols-2 h-11 pb-0 mb-0 w-md mx-auto'>
                                <TabsTrigger className='text-lg font-semibold' value="menu">
                                    <Pizza className='text-orange-500 w-20 h-20' />
                                    Menu
                                </TabsTrigger>
                                <TabsTrigger className='text-lg font-semibold' value="reviews">
                                    <Star className='text-orange-500 w-20 h-20' />
                                    Reviews
                                </TabsTrigger>

                            </div>
                        </TabsList>
                        <Separator className='mb-6' />
                        <div className='container  mx-auto px-12 py-6'>
                            <TabsContent value='menu'>
                                <Suspense>
                                    <h1 className="text-2xl font-bold tracking-tight mb-4">Menu</h1>
                                    <RestaurantMenu resId={restaurant.id} />
                                </Suspense>
                            </TabsContent>
                            <TabsContent value="reviews">
                                <h1 className="text-2xl font-bold tracking-tight mb-4">Reviews & Ratings</h1>
                                <RestaurantReviews restaurant={restaurant.id} name={restaurant.name} />
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </CartDialog>
        </main >
    )
}