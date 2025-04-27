import api from '@/api'
import { useQuery } from '@tanstack/react-query'
import MenuItem from './MenuItem'
import CartDialog from './cart/CartDialog'

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
            <div className='grid grid-flow-col'>{query.data?.map((e) => <MenuItem item={e} />)}</div>
        </CartDialog>
    )
}

export default RestaurantMenu