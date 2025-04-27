import { createContext, ReactNode, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from '@radix-ui/react-label'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { MenuItemType } from '@/api/menu'


type Handler = (item: MenuItemType, number: number) => void

interface cartContext {
    addToCart: (item: MenuItemType, handler: Handler) => void
}

const CartDialogContext = createContext<cartContext>({ addToCart: () => { } })


type ShownItem = { item: MenuItemType, handler: Handler }

const CartDialog = ({ children }: { children: ReactNode | ReactNode[] }) => {
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState<ShownItem>();


    const addToCart = () => {
        if (!item) return;

        item.handler(item.item, 1);

    }

    return (
        <>
            <CartDialogContext.Provider value={{
                addToCart: (item, handler) => {
                    setItem({ handler, item });
                    setOpen(true);
                }
            }}>
                {children}
            </CartDialogContext.Provider>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add item to cart?</DialogTitle>
                        <DialogDescription>
                            <div className='text-lg'>{item?.item.name}</div >
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
                        <Button type="submit" onClick={addToCart}>Add To Cart</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default CartDialog