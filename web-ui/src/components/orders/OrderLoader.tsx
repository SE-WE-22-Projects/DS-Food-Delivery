import { Skeleton } from '../ui/skeleton';

const cards = Array.from({ length: 8 }).map((_, index) => index);

const OrderLoader = () => {
    return (
        <div className='flex flex-col gap-y-2'>
            {cards.map(i => <Skeleton key={i} className='h-[300px] w-full' />)}

        </div>
    )
}

export default OrderLoader