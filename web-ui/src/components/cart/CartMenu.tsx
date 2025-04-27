import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/api'
import { Button } from '../ui/button'
import { Plus, Minus, Trash, ShoppingBasket } from "lucide-react"
import useUserStore from '@/store/user';
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenu } from '../ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'

const CartMenu = () => {
    const userId = useUserStore(state => state.userId);
    const client = useQueryClient();
    const navigate = useNavigate();

    const cart = useQuery({
        queryKey: ['cart'],
        queryFn: async () => await api.cart.getCart(userId)
    });

    const deleteItem = useMutation({
        mutationFn: api.cart.removeItem,
        onSuccess: () => client.invalidateQueries({ queryKey: ["cart"] })
    });

    const editItem = useMutation({
        mutationFn: api.cart.updateItem,
        mutationKey: ["cart", "edit"],
        onSuccess: (data) => client.setQueryData(['cart'], data)
    });

    return (
        <DropdownMenu >
            <DropdownMenuTrigger className='bg-transparent flex mx-2' >
                <ShoppingBasket />
                Cart
            </DropdownMenuTrigger>
            <DropdownMenuContent className='left-0 w-[360px] p-4 '>
                {!cart.data?.items.length ? <div className='text-lg my-4'> Cart is empty</div> : null}
                <ul className="flex flex-col w-[320px] max-h-[60vh] overflow-y-scroll ">
                    {cart.data?.items.map(i =>
                        <li key={i.cart_id} onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className='border-b-2'>
                            <a
                                className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                )}
                            >
                                <div className="text-md font-medium leading-none w-full flex">{i.name}
                                    <Button className='ml-auto' variant="ghost" size="icon" onClick={() => deleteItem.mutate({ userId, cartItemId: i.cart_id })}>
                                        <Trash />
                                    </Button>
                                </div>
                                <div className="line-clamp-2 text-sm leading-snug text-muted-foreground w-full flex items-center">
                                    <Button variant="ghost" size="icon"
                                        onClick={() => editItem.mutate({ userId, cartItemId: i.cart_id, amount: i.amount + 1 })}
                                        disabled={i.amount >= 100}
                                    >
                                        <Plus />
                                    </Button>
                                    {i.amount}
                                    <Button variant="ghost" size="icon"
                                        onClick={() => editItem.mutate({ userId, cartItemId: i.cart_id, amount: i.amount - 1 })}
                                        disabled={i.amount <= 1}
                                    >
                                        <Minus />
                                    </Button>
                                    <div className='ml-auto'>LKR {i.price * i.amount}</div>
                                </div>

                            </a>
                        </li>
                    )}
                </ul>
                <div className='flex flex-col text-lg mt-4'>
                    <div>
                        Total: LKR {cart.data?.total}
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