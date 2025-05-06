import MenuItem from './MenuItem'
import { useSuspenseQuery } from '@tanstack/react-query'
import api from '@/api'

const RestaurantMenu = ({ resId }: { resId: string }) => {
    const { data } = useSuspenseQuery({ queryKey: ['restaurant', 'menu', resId], queryFn: () => api.menu.getRestaurantItems(resId) })

    return (
        <div className="relative flex">
            <div className="flex-1">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.map((item) => (
                            <MenuItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RestaurantMenu