import { useQuery } from '@tanstack/react-query'
import api from '../api'

type RestaurantListProps = {
    query?: string
}

const RestaurantList = (props: RestaurantListProps) => {
    const query = useQuery({
        queryKey: ['restaurants', props.query],
        queryFn: async () => await api.restaurant.getAllRestaurants(props.query)
    });

    return (
        JSON.stringify(query.data)
    )
}

export default RestaurantList