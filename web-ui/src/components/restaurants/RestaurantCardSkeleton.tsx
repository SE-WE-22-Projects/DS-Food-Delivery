import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const RestaurantCardSkeleton: React.FC = () => {
    return (
        <Card className="rounded-2xl overflow-hidden shadow-md">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </div>
        </Card>
    );
};

export default RestaurantCardSkeleton;
