import { createContext, ReactNode, useContext, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '@radix-ui/react-label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { MenuItemType } from '@/api/menu'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api'
import toast from 'react-hot-toast'
import useUserStore from '@/store/user'

interface cartContext {
    addToCart: (item: MenuItemType) => void
}

const CartDialogContext = createContext<cartContext>({ addToCart: () => { } })

const CartDialog = ({ children }: { children: ReactNode | ReactNode[] }) => {
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState<MenuItemType>();
    const [amount, setAmount] = useState('0');

    const queryClient = useQueryClient();
    const userId = useUserStore((state) => state.userId);

    const cartMutator = useMutation({
        mutationFn: api.cart.addToCart,
        onSuccess: (data) => queryClient.setQueriesData({ queryKey: ["cart"] }, data),
    });

    const parsedAmount = Number.parseInt(amount);
    const validAmount = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount < 101

    const addToCartHandler = async () => {
        if (!validAmount) return;

        try {
            await cartMutator.mutateAsync({ userId: userId, amount: parsedAmount, itemId: item!.id });
            toast.success("Item added to cart");
            setOpen(false);
        } catch (e) {
            console.error(e);
            toast.success("Failed to add item to cart");
        }
    }

    return (
        <>
            <CartDialogContext.Provider value={{
                addToCart: (item) => {
                    setItem(item);
                    setOpen(true);
                    setAmount('1');
                }
            }}>
                {children}
            </CartDialogContext.Provider>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add item to cart?</DialogTitle>
                        <DialogDescription>
                            <div className='text-lg'>{item?.name}</div >
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input id="amount"
                                defaultChecked
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                }}
                                defaultValue={1}
                                min={1}
                                max={100}
                                className="col-span-3"
                                type='number' />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={addToCartHandler} disabled={!validAmount}>Add To Cart</Button>
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