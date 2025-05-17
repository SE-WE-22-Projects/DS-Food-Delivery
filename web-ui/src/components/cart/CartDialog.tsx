import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '@radix-ui/react-label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { MenuItemType } from '@/api/menu'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/api'
import toast from 'react-hot-toast'
import useUserStore from '@/store/user'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'
import { Cart } from '@/api/cart'
import { useNavigate } from 'react-router-dom'

interface cartContext {
    addToCart: (item: MenuItemType) => void
}

const CartDialogContext = createContext<cartContext>({ addToCart: () => { } })

const CartDialog = ({ children }: { children: ReactNode | ReactNode[] }) => {
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState<MenuItemType>();
    const [amount, setAmount] = useState('0');
    const [error, setError] = useState<string>();
    const navigate = useNavigate()

    const queryClient = useQueryClient();
    const userId = useUserStore((state) => state.userId);

    const cart = useQuery({
        queryKey: ['cart', userId],
        queryFn: async (): Promise<Cart> => {
            if (userId === undefined) return { items: [], sub_total: 0, total: 0 };
            return await api.cart.getCart(userId)
        }
    });

    const cartMutator = useMutation({
        mutationFn: api.cart.addToCart,
        onSuccess: (data) => queryClient.setQueriesData({ queryKey: ["cart"] }, data),
    });

    const openDialog = (item: MenuItemType) => {
        if (userId === undefined) {
            toast.error("Login required");
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setOpen(true);
        setItem(item);
        setAmount('1');
    }

    useEffect(() => {
        const parsedAmount = Number.parseInt(amount);
        const cartSize = cart.data?.items?.reduce((r, v) => r + v.amount, 0) ?? 0;

        if (cartSize > 100) {
            setError("Cart is full. Maximum 100 items in cart")
        } else if (isNaN(parsedAmount)) {
            setError("Item amount must be a number");
        } else if (parsedAmount < 1) {
            setError("You must order at least 1 item");
        } else if (parsedAmount > 100) {
            setError("You must cannot order more than 100 items");
        } else if (parsedAmount + cartSize > 100) {
            setError("Cart cannot contain more than 100 items");
        } else {
            setError(undefined)
        }

    }, [amount, cart.data])


    const addToCartHandler = async () => {
        if (error) return;
        const parsedAmount = Number.parseInt(amount);

        try {
            await cartMutator.mutateAsync({ userId: userId!, amount: parsedAmount, itemId: item!.id });
            toast.success("Item added to cart");
            setOpen(false);
        } catch (e) {
            console.error(e);
            toast.success("Failed to add item to cart");
        }
    }

    return (
        <>
            <CartDialogContext.Provider value={{ addToCart: openDialog }}>
                {children}
            </CartDialogContext.Provider>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle>Add item to cart?</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <Separator />
                        <div className='text-lg font-semibold'>{item?.name}</div >
                        <div >{item?.description}</div>
                        <div className="grid grid-cols-4 items-center gap-4 mt-2">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input id="amount"
                                defaultChecked
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={1}
                                max={100}
                                className={cn("col-span-2 col-start-3", error ? "border-red-500" : "")}
                                type='number' />

                            <span className='text-destructive col-span-4'>{error}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={addToCartHandler} disabled={!!error || cartMutator.isPending}>
                            Add To Cart
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}

/**
 * Displays the add to cart dialog for the given item
 */
export const useCartDialog = () => {
    return useContext(CartDialogContext).addToCart
}

export default CartDialog

