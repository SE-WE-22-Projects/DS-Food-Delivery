import React, { useState, Suspense } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import RestaurantLoader from '@/components/restaurants/RestaurantLoader';
import RestaurantList from '@/components/restaurants/RestaurantList';
import { ErrorBoundary } from 'react-error-boundary'
import NetworkError from '@/components/common/NetworkError';

const Restaurants = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
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
                    </div>
                </div>

                <ErrorBoundary fallback={<NetworkError what='Restaurants' />}>
                    <Suspense fallback={<RestaurantLoader />}>
                        <RestaurantList search={searchTerm} />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </section>
    );
};


export default Restaurants;