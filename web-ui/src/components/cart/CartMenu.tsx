import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/api'
import { Button } from '../ui/button'
import { ShoppingBasket, Trash2 } from "lucide-react"
import useUserStore from '@/store/user';
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenu } from '../ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'
import { ScrollArea } from '../ui/scroll-area'
import CartItem from './CartItem'

const CartMenu = () => {
    const userId = useUserStore(state => state.userId);
    const client = useQueryClient();
    const navigate = useNavigate();

    const cart = useQuery({
        queryKey: ['cart'],
        queryFn: async () => await api.cart.getCart(userId)
    });

    const clearCart = useMutation({
        mutationFn: api.cart.clearCart,
        mutationKey: ["cart"],
        onSuccess: (data) => client.setQueryData(['cart'], data)
    });

    return (
        <DropdownMenu >
            <DropdownMenuTrigger className='bg-transparent flex mx-2' >
                <ShoppingBasket />
                Cart
            </DropdownMenuTrigger>
            <DropdownMenuContent className='left-0 w-[360px] pb-4 bg-white '>
                <div className='flex text-lg mt-1 mb-2 px-4 font-bold justify-between'>
                    Items In Cart
                    <Button variant="ghost" size="icon" onClick={() => clearCart.mutate(userId)} >
                        <Trash2 />
                    </Button>
                </div>
                {!cart.data?.items.length ? <div className='text-lg my-4 px-4'> Cart is empty</div> : null}
                <ScrollArea className="flex flex-col w-[340px] max-h-[50vh] rounded-md border mx-1">
                    {cart.data?.items.map(i =>
                        <CartItem item={i} key={i.cart_id} />
                    )}
                </ScrollArea>
                <div className='flex flex-col text-lg mt-4 px-4'>
                    <div>
                        Total:
                        <span>LKR {cart.data?.total}</span>
                        {cart.data?.coupon ? <span className='text-green-300 inline px-1'>(-{cart.data.coupon.discount}%)</span> : ""}
                    </div>
                    <Button className='bg-green-600 mt-1' onClick={() => navigate("/checkout")} disabled={!cart.data || !cart.data.items.length} >
                        Checkout
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default CartMenu