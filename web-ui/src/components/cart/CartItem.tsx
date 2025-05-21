import { CartItemType } from '@/api/cart';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api'
import { Button } from '../ui/button'
import { Plus, Minus, Trash } from "lucide-react"
import useUserStore from '@/store/user';
import { cn } from '@/lib/utils';

const CartItem = ({ item, noHover }: { item: CartItemType, noHover?: boolean }) => {
    const client = useQueryClient();
    const userId = useUserStore(state => state.userId);

    const deleteItem = useMutation({
        mutationFn: api.cart.removeItem,
        onSuccess: () => client.invalidateQueries({ queryKey: ["cart", userId] })
    });

    const editItem = useMutation({
        mutationFn: api.cart.updateItem,
        mutationKey: ["cart", "edit"],
        onSuccess: (data) => client.setQueryData(['cart', userId], data)
    });


    return (
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className='border-b-2'>
            <a
                className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                    noHover ? "bg-white text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                )}
            >
                <div className="text-md font-medium leading-none w-full flex">{item.name}
                    <Button className='ml-auto' variant="ghost" size="icon" onClick={() => deleteItem.mutate({ userId: userId!, cartItemId: item.cart_id })}>
                        <Trash />
                    </Button>
                </div>
                <div className="line-clamp-2 text-sm leading-snug text-muted-foreground w-full flex items-center">
                    <Button variant="ghost" size="icon"
                        onClick={() => editItem.mutate({ userId: userId!, cartItemId: item.cart_id, amount: item.amount + 1 })}
                        disabled={item.amount >= 100}
                    >
                        <Plus />
                    </Button>
                    {item.amount}
                    <Button variant="ghost" size="icon"
                        onClick={() => editItem.mutate({ userId: userId!, cartItemId: item.cart_id, amount: item.amount - 1 })}
                        disabled={item.amount <= 1}
                    >
                        <Minus />
                    </Button>
                    <div className='ml-auto'>LKR {item.price * item.amount}</div>
                </div>

            </a>
        </div>
    )
}

export default CartItem