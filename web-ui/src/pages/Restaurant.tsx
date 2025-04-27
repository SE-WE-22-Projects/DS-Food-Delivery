import api from '@/api';
import RestaurantMenu from '@/components/Menu'
import getImageUrl from '@/lib/images';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom'
import { MapPin } from "lucide-react"
import { Badge } from '@/components/ui/badge';

const Restaurant = () => {
    const { restaurantId } = useParams();

    const restaurant = useQuery({
        queryKey: ["restaurant", restaurantId],
        queryFn: () => api.restaurant.getRestaurantById(restaurantId!)
    })

    return (
        <>
            <div className='w-full bg-amber-600 flex px-6 py-6 items-start min-h-[360px]'>
                <div className='w-[30vw] h-[320px] bg-gray-200 bg-cover bg-no-repeat' style={{ borderImage: `url(${getImageUrl(restaurant.data?.cover)})` }} >
                </div>
                <div className='flex flex-col mx-4'>
                    <div className='flex'>
                        <div className="w-20 h-20 bg-gray-100 mx-2 bg-cover bg-no-repeat" style={{ borderImage: `url(${getImageUrl(restaurant.data?.logo)})` }} />
                        <div>
                            <div className='text-lg font-medium'>
                                {restaurant.data?.name}
                            </div>
                            <div className='flex items-center font-medium gap-2'>
                                <MapPin size={20} />
                                {restaurant.data?.address.town}, {restaurant.data?.address.city}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='my-2'>
                            {restaurant.data?.tags.map(t => <Badge>{t}</Badge>)}
                        </div>
                        {restaurant.data?.description}
                    </div>
                </div>
            </div>
            <RestaurantMenu restaurant={restaurantId!} />
        </>
    )
}

export default Restaurant