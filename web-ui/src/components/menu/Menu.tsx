import api from '@/api'
import { useQuery } from '@tanstack/react-query'
import MenuItem from './MenuItem'
import CartDialog from '../cart/CartDialog'

type RestaurantMenuProps = {
    restaurant: string
}


const RestaurantMenu = (props: RestaurantMenuProps) => {
    const query = useQuery({
        queryKey: ['menu', props.restaurant],
        queryFn: async () => await api.menu.getRestaurantItems(props.restaurant)
    });

    return (
        <CartDialog>
            <div className='flex flex-wrap gap-4 mx-6 justify-center'>
                {query.data?.map((e) => <MenuItem item={e} />)}
            </div>
        </CartDialog>
    )
}

export default RestaurantMenu