import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api';
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, AlertTriangle, Inbox } from 'lucide-react';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import RestaurantCardSkeleton from '@/components/restaurants/RestaurantCardSkeleton';

interface RestaurantType {
    id: string;
    name: string;
    registration_no: string;
    address: {
        no: string;
        street: string;
        town: string;
        city: string;
        postal_code: string;
    };
    logo: string;
    cover: string;
    description: string;
    tags: string[];
    operation_time: {
        open: number;
        close: number;
    };
    approved: boolean;
}

const Restaurants: React.FC = () => {
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
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Restaurants Yet</h3>
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
        <section className="container mx-auto max-w-[85vw] px-6 mt-4 py-8 md:py-12 bg-white rounded-2xl">
            <header className="mb-8 md:mb-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    Discover Restaurants
                </h1>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search restaurants..."
                        className="w-full pl-10 border-2 shadow"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        aria-label="Search restaurants"
                    />
                </div>
            </header>

            {renderContent()}
        </section>
    );
};

export default Restaurants;