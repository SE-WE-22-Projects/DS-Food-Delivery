import api from '@/api';
import CartItem from '@/components/cart/CartItem';
import CouponDialog from '@/components/checkout/CouponDialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import useUserStore from '@/store/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TicketPercent, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const userId = useUserStore(state => state.userId);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();


    const cart = useQuery({
        queryKey: ['cart'],
        queryFn: async () => await api.cart.getCart(userId)
    });


    useEffect(() => {
        if (cart.data && cart.data.items.length === 0) {
            toast.error("Cart is empty")
            navigate("/");
        }
    }, [cart]);

    const removeCoupon = useMutation({
        mutationFn: async () => api.cart.removeCoupon(userId),
        onSuccess: (data) => {
            queryClient.setQueryData(['cart'], data);
            toast.success("Remove coupon successfully")
        },
        onError: (error) => {
            toast.error("Failed to remove coupon")
            console.error(error)
        }
    });

    const discount = cart.data?.coupon?.discount ?? "";

    return (
        <>
            <div className='flex flex-row-reverse grow'>
                <div className='bg-white flex flex-col pb-4 pt-3 '>
                    <h1 className='font-semibold py-1 px-2 pb-3'>Order Items</h1>
                    <ScrollArea className='w-[20vw] min-w-[260px] max-h-[60vh] border rounded-lg'>
                        {cart.data?.items.map(item => <CartItem item={item} key={item.cart_id} noHover />)}
                    </ScrollArea>
                    <div className='grow-1 border-b-2' />
                    <h2 className='w-full font-semibold py-1 px-2'>
                        Subtotal: LKR {cart.data?.sub_total}
                    </h2>
                    <h2 className='border-b font-semibold py-1 flex items-center px-2'>
                        Discount: {discount ? <span className='text-green-300 font-semibold pl-4'>-{discount}%</span> : "--"}
                        <div className='grow' />
                        <Button variant="ghost" disabled={!cart.data?.coupon} onClick={() => removeCoupon.mutate()}>
                            <Trash />
                        </Button>
                        <Button variant="ghost" onClick={() => setOpen(true)}>
                            <TicketPercent />
                        </Button>
                    </h2>
                    <h2 className=' font-semibold py-1 border-b-2 mb-4 px-2'>
                        Total: LKR {cart.data?.total}
                    </h2>
                    <Button className='mx-4'>Place Order</Button>
                </div>
                <div className='grow'>Checkout</div>
            </div>
            <CouponDialog open={open} setOpen={setOpen} />
        </>
    )
}

export default Checkout