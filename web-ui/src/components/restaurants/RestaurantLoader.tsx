import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const cards = Array.from({ length: 8 }).map((_, index) => index);
interface RestaurantLoaderProps {
    onlyCards?: boolean
}

const RestaurantLoader = ({ onlyCards }: RestaurantLoaderProps) => {
    if (onlyCards)
        return cards.map(index => (
            <LoaderCard key={index} />
        ))

    return <>
        <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground flex items-center">Showing <Skeleton className='h-[2ch] w-[4ch] inline-block mx-2' /> restaurants</div>
            <Skeleton className='w-[180px] h-5' />

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(index => (
                <LoaderCard key={index} />
            ))}
        </div>
    </>
};

const LoaderCard = () => {
    return <Card className="rounded-2xl overflow-hidden shadow-md pt-0">
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
}

export default RestaurantLoader;
