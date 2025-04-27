import { MenuItemType } from '@/api/menu'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import useUserStore from '@/store/user';
import toast from 'react-hot-toast';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogHeader, DialogTrigger } from './ui/dialog';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';

const fallbackImage = ""

const MenuItem = ({ item }: { item: MenuItemType }) => {
    const queryClient = useQueryClient();
    const userId = useUserStore((state) => state.userId);
    const [open, setOpen] = useState(false);

    const addToCart = useMutation({
        mutationFn: api.cart.addToCart,
        onSuccess: (data) => queryClient.setQueriesData({ queryKey: ["cart"] }, data),
    })

    const addToCartHandler = async () => {
        try {
            await addToCart.mutateAsync({ userId: userId, amount: 1, itemId: item.id });
            toast.success("Item added to cart");
        } catch (e) {
            console.error(e);
            toast.success("Failed to add item to cart");
        }
    }

    let image = item.image ?? "";
    if (!image.startsWith("/")) {
        image = fallbackImage;
    }

    return (
        <>
            <Card className='mx-2 my-2 w-2xs pt-0'>
                <CardHeader className='px-0 pt-0'>
                    <CardDescription className='w-2xs h-[160px] bg-cover bg-no-repeat rounded-t-xl' style={{ backgroundImage: `url(${image})` }} />
                    <CardTitle className='px-2'>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {item.description}
                </CardContent>
                <CardFooter>
                    <Button className='ml-auto' onClick={() => setOpen(true)} >Add to cart</Button>
                </CardFooter>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add item to cart?</DialogTitle>
                        <DialogDescription>
                            <div className='text-lg'>{item.name}</div >
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input id="amount" defaultChecked defaultValue={1} min={1} max={100} className="col-span-3" type='number' />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={addToCartHandler}>Add To Cart</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>

    )
}

export default MenuItem