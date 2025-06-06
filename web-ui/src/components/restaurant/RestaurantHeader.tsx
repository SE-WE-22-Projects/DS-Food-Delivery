import { RestaurantType } from '@/api/restaurant'
import { Badge } from '../ui/badge'
import { MapPin, Clock, Star, ArrowLeft } from 'lucide-react'
import { convertFromNs } from '@/lib/timeUtil'
import { Link } from 'react-router-dom'
import Image from '../common/Image'
import { useQuery } from '@tanstack/react-query'
import api from '@/api'

const RestaurantHeader = ({ restaurant }: { restaurant: RestaurantType }) => {
    const openTime = convertFromNs(restaurant.operation_time.open);
    const closeTime = convertFromNs(restaurant.operation_time.close);
    const fullAddress = `${restaurant.address.street}, ${restaurant.address.town}`;

    const data = useQuery({
        queryKey: ["reviews", restaurant, 'avg'],
        queryFn: () => api.rating.getAvgRating(restaurant.id)
    })

    return (
        <div className="relative flex md:flex-row flex-col w-full bg-gradient-to-bl from-orange-50 via-gray-50 to-orange-50 rounded-t-2xl p-4 pt-16">
            <Link to="/restaurant" className="absolute top-0 pt-6 flex items-center gap-1 font-semibold mb-4 md:mb-4 md:mt-0">
                <ArrowLeft className="h-6 w-6" />
                <span>Back to restaurants</span>
            </Link>
            <div className='my-auto md:block hidden md:h-[350px] h-[250px] aspect-video overflow-hidden'>
                <Image
                    src={restaurant.cover}
                    placeholder={{ height: 350, width: 533 }}
                    className="object-contain object-right md:h-[300px] h-[200px] aspect-video overflow-clip"
                />

            </div>
            <div className="container px-4 pb-6 mx-auto md:pt-0">
                <div className="flex flex-col h-full">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                        <div className='w-12 h-12 mx-2 rounded-full overflow-clip'>
                            <Image
                                src={restaurant.logo}
                                placeholder={{ width: 48, height: 48 }}
                                alt={`${restaurant.name} logo`}
                                className="w-12  h-12 rounded-full border-2 border-accent object-cover shadow-md"
                            />
                        </div>
                        <div>
                            {restaurant.name}
                            <div className="flex items-center mt-1 text-orange-600 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(data.data?.averageRating.avg ?? 0) ? 'star-rating fill-current' : 'text-white stroke-gray-400'}`}
                                    />
                                ))}
                                <span className='text-gray-900 font-thin px-1'>
                                    ({data.data?.averageRating.reviews ?? 0} reviews)
                                </span>
                            </div>
                        </div>
                    </h1>
                    <div className='mt-2 mb-6'>
                        {restaurant.tags.map(tag => <Badge className="text-white/80 mr-1">{tag}</Badge>)}
                        <p className='line-clamp-4'>
                            {restaurant.description}
                        </p>
                    </div>
                    <div className='mt-12' />

                    {/* Address with Icon */}
                    <div className="flex items-start gap-2 my-0.5">
                        <MapPin className="w-5 h-5 flex-shrink-0" />
                        <span className="italic line-clamp-2">{fullAddress}</span>
                    </div>


                    {/* Operating Hours with Styled Box */}
                    <div className="flex items-center gap-2 rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{openTime} - {closeTime}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RestaurantHeader