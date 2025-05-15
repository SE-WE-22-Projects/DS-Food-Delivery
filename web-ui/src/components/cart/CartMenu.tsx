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
import CouponSelector from './CouponSelector';
import { Skeleton } from '../ui/skeleton';
import { Cart } from '@/api/cart';
import { Suspense, use, useEffect, useState } from 'react';

const CartMenu = () => {
    const userId = useUserStore(state => state.userId);
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const cart = useQuery({
        queryKey: ['cart', userId],
        queryFn: async (): Promise<Cart> => {
            if (userId === undefined) return { items: [], sub_total: 0, total: 0 };
            return await api.cart.getCart(userId)
        }
    });

    const discount = cart.data?.coupon?.discount ?? "";
    const cartSize = cart.data?.items?.reduce((r, v) => r + v.amount, 0) ?? 0;

    useEffect(() => {
        if (cartSize > 100) {
            setError("An order must have at most 100 items")
        } else if (cart.data && cart.data.total < 500) {
            setError("Minimum order price is LKR 500")
        } else if (cart.data && cart.data.total > 20000) {
            setError("Maximum order price is LKR 20,000")
        } else {
            setError(undefined)
        }
    }, [cart.data])


    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button className=' bg-orange-500 rounded-md relative'>
                        <ShoppingBasket className='text-white scale-140 my-auto' />
                        Cart
                    </Button>
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

                    <Suspense fallback={<Skeleton className='grow mx-4' />}>
                        <CartContent data={cart.promise} />
                    </Suspense>

                    <SheetFooter>
                        {!!cart.data?.items?.length && <span className='mx-6 mt-1 text-destructive'>{error}</span>}
                        <div className='flex flex-col mt-4'>
                            <div className='grid grid-cols-2 text-lg font-semibold'>
                                <CouponSelector className='col-span-2' />
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
                            <Button className='bg-green-600 mt-1' onClick={() => navigate("/checkout")} disabled={!!error || !cart.data || !cart.data?.items?.length} >
                                Checkout
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>

    )
}


export const CartContent = ({ data }: { data: Promise<Cart> }) => {
    const cart = use(data);
    const userId = useUserStore(state => state.userId);
    const client = useQueryClient();
    const clearCart = useMutation({
        mutationFn: api.cart.clearCart,
        mutationKey: ["cart", userId],
        onSuccess: () => client.invalidateQueries({ queryKey: ['cart', userId] })
    });


    return (
        <>
            {!cart.items?.length ? <div className='text-lg my-4 px-4'> Cart is empty</div> : null}
            {!!cart.items?.length && <div className='grow mx-4'>
                <AutoSizer>
                    {({ height, width }: { height: number, width: number }) => {
                        return <>
                            <div className='flex flex-col' style={{ width: width }}>
                                <div className='ml-auto'>
                                    <Button variant="ghost" onClick={() => clearCart.mutate(userId!)} >
                                        <Trash2 /> Clear
                                    </Button>
                                </div>
                                <ScrollArea className="flex flex-col bg-white rounded-md border" style={{ maxHeight: height - 20, width: width }}>
                                    {cart.items?.map(i =>
                                        <CartItem item={i} key={i.cart_id} />
                                    )}
                                </ScrollArea>
                            </div>
                        </>
                    }}
                </AutoSizer>
            </div>
            }
        </>
    )
}



export default CartMenu