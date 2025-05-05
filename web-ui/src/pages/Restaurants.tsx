import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api';
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, AlertTriangle, Inbox } from 'lucide-react';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import RestaurantCardSkeleton from '@/components/restaurants/RestaurantCardSkeleton';
import { RestaurantType } from '@/api/restaurant';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


const Restaurants = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: restaurants, isLoading, isError, error } = useQuery<RestaurantType[], Error>({
        queryKey: ["approved_restaurants"],
        queryFn: api.restaurant.getAllApprovedRestaurants,
    });

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredRestaurants = useMemo(() => {
        if (!restaurants) return [];
        if (!searchTerm) return restaurants;

        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        return restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            restaurant.description.toLowerCase().includes(lowerCaseSearchTerm) ||
            restaurant.address.city.toLowerCase().includes(lowerCaseSearchTerm) ||
            restaurant.address.town.toLowerCase().includes(lowerCaseSearchTerm) ||
            (restaurant.tags && restaurant.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)))
        );
    }, [restaurants, searchTerm]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <RestaurantCardSkeleton key={index} />
                    ))}
                </div>
            );
        }

        if (isError) {
            return (
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Failed to Load Restaurants</AlertTitle>
                    <AlertDescription>
                        {error?.message || "Could not fetch restaurant data. Please check your connection and try again."}
                    </AlertDescription>
                </Alert>
            );
        }

        if (restaurants?.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Inbox className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Nearby Restaurants</h3>
                    <p>Check back later for available restaurants.</p>
                </div>
            );
        }

        if (filteredRestaurants.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Search className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Matches Found</h3>
                    <p>Try adjusting your search term.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
        );
    };

    return (
        <section className="from-white to-gray-50 bg-gradient-to-br outline-0 flex grow">
            <div className="container px-6 py-12 mx-auto p-6 my-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
                        <p className="text-muted-foreground mt-1">Discover restaurants in your area</p>
                    </div>
                    <div className="w-full md:w-auto flex gap-2">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search restaurants..."
                                className="pl-9 w-full md:w-[300px] rounded-full border-orange-200 focus-visible:ring-orange-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                aria-label="Search restaurants"
                            />
                        </div>
                    </div></div>

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
                {renderContent()}
            </div>
        </section>
    );
};

export default Restaurants;