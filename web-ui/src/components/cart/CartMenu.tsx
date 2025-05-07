import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/api'
import { Button } from '../ui/button'
import { ShoppingBasket, Trash2 } from "lucide-react"
import useUserStore from '@/store/user';
import { useNavigate } from 'react-router-dom'
import { ScrollArea } from '../ui/scroll-area'
import CartItem from './CartItem'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import AutoSizer from "react-virtualized-auto-sizer";
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import CouponSelector from './CouponSelector';
import { Skeleton } from '../ui/skeleton';

const CartMenu = () => {
    const userId = useUserStore(state => state.userId);
    const client = useQueryClient();
    const navigate = useNavigate();
    const cart = useQuery({
        queryKey: ['cart', userId],
        queryFn: () => api.cart.getCart(userId)
    });

    const discount = cart.data?.coupon?.discount ?? "";

    const clearCart = useMutation({
        mutationFn: api.cart.clearCart,
        mutationKey: ["cart"],
        onSuccess: () => client.invalidateQueries({ queryKey: ['cart'] })
    });

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <div>
                        <ShoppingBasket className='mr-2' />
                        Cart
                    </div>
                </SheetTrigger>
                <SheetContent className='overflow-y-scroll'>
                    <SheetHeader>
                        <SheetTitle className='text-2xl'>
                            Shopping Cart
                        </SheetTitle>
                        <SheetDescription>
                            The items in your cart. Click the checkout button to complete the order.
                        </SheetDescription>
                    </SheetHeader>

                    {!cart.data?.items?.length ? <div className='text-lg my-4 px-4'> Cart is empty</div> : null}

                    {!!cart.data?.items?.length && <div className='grow mx-4'>
                        <AutoSizer>
                            {({ height, width }: { height: number, width: number }) => {
                                return <>
                                    <div className='flex flex-col' style={{ width: width }}>
                                        <div className='ml-auto'>
                                            <Button variant="ghost" onClick={() => clearCart.mutate(userId)} >
                                                <Trash2 /> Clear
                                            </Button>
                                        </div>
                                        <ScrollArea className="flex flex-col bg-white rounded-md border" style={{ maxHeight: height - 20, width: width }}>
                                            {cart.data?.items?.map(i =>
                                                <CartItem item={i} key={i.cart_id} />
                                            )}
                                        </ScrollArea>
                                    </div>
                                </>
                            }}
                        </AutoSizer>

                    </div>
                    }

                    <SheetFooter>
                        <div className='flex flex-col text-lg mt-4 font-semibold'>
                            <div className='grid grid-cols-2'>
                                <CouponSelector />
                                <span className='text-right'>
                                    <span className={cn('font-bold', "text-green-500")}>{cart?.data?.coupon?.name ?? ""}</span>

                                </span>
                                <Separator className='col-span-2 mt-2' />
                                <Separator className='col-span-2 mt-2' />
                                <span className='px-1'>Subtotal</span>
                                <span className='text-right'> {cart.data ? `LKR ${cart.data.sub_total}` : <Skeleton className='h-4 w-full mt-1' />}</span>
                                <span className='px-1'>Discount</span>
                                <span className='text-right'>
                                    {!cart.data && <Skeleton className='h-4 w-full' />}
                                    {!!cart.data && (discount ? <span className='text-green-300 font-semibold pl-4'>-{discount}%</span> : "--")}
                                </span>
                                <Separator className='col-span-2 mt-2' />
                                <span className='px-1'>Total</span>
                                <span className='text-right'> {cart.data ? `LKR ${cart.data.total}` : <Skeleton className='h-4 w-full mt-1' />}</span>
                            </div>
                        </div>
                        <SheetClose asChild>
                            <Button className='bg-green-600 mt-1' onClick={() => navigate("/checkout")} disabled={!cart.data || !cart.data?.items?.length} >
                                Checkout
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>

    )
}




export default CartMenu