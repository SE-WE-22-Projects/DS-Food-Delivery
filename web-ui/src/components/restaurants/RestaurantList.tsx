import { useSuspenseQuery } from '@tanstack/react-query';
import { Inbox, Search } from 'lucide-react';
import { useMemo } from 'react'
import RestaurantCard from './RestaurantCard';
import api from '@/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const RestaurantList = ({ search }: { search?: string }) => {
    const { data } = useSuspenseQuery({
        queryKey: ["restaurants"],
        queryFn: api.restaurant.getAllApprovedRestaurants,
    });


    const filteredRestaurants = useMemo(() => {
        if (!search) return data;

        const query = search.toLowerCase().trim();
        return data.filter(res =>
            res.name.toLowerCase().includes(query) ||
            res.description.toLowerCase().includes(query) ||
            res.address.city.toLowerCase().includes(query) ||
            res.address.town.toLowerCase().includes(query) ||
            (res.tags && res.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    }, [data, search]);

    const noRestaurants = data.length == 0;
    const noResults = !noRestaurants && filteredRestaurants.length == 0;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground">Showing {filteredRestaurants.length} restaurants</div>
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

            {noRestaurants && <NoRestaurants />}
            {noResults && <NoResults />}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
        </>
    )
}

const NoRestaurants = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Inbox className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Nearby Restaurants</h3>
            <p>Check back later for available restaurants.</p>
        </div>
    )
}


const NoResults = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Matches Found</h3>
            <p>Try adjusting your search term.</p>
        </div>
    );
}

export default RestaurantList