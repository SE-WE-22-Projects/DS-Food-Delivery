import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from './ui/navigation-menu'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/api'
import { Button } from './ui/button'
import { Plus, Minus, Trash } from "lucide-react"
import useUserStore from '@/store/user';

const CartMenu = () => {
    const userId = useUserStore(state => state.userId);
    const client = useQueryClient();

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
        onSuccess: () => client.invalidateQueries({ queryKey: ["cart"] })
    });

    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger disabled={!cart.data || !cart.data.items.length}>Cart</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="flex flex-col p-4 w-[360px] max-h-[70vh] overflow-y-scroll bg-white">
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
            </NavigationMenuContent>
        </NavigationMenuItem>
    )
}

export default CartMenu