import { MenuItemType } from '@/api/menu'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import useUserStore from '@/store/user';

const fallbackImage = ""

const MenuItem = ({ item }: { item: MenuItemType }) => {
    let image = item.image ?? "";
    if (!image.startsWith("/")) {
        image = fallbackImage;
    }

    const queryClient = useQueryClient();
    const userId = useUserStore((state) => state.userId);

    const addToCart = useMutation({ mutationFn: api.cart.addToCart, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }) })

    return (
        <Card className='mx-2 my-2 w-2xs pt-0'>
            <CardHeader className='px-0 pt-0'>
                <CardDescription className='w-2xs h-[160px] bg-cover bg-no-repeat rounded-t-xl' style={{ backgroundImage: `url(${image})` }} />
                <CardTitle className='px-2'>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
                {item.description}
            </CardContent>
            <CardFooter>
                <Button className='ml-auto' onClick={() => addToCart.mutate({ userId: userId, amount: 100, itemId: item.id })} >Add to cart</Button>
            </CardFooter>
        </Card>
    )
}

export default MenuItem