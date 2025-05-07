import api from '@/api';
import useUserStore from '@/store/user';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Trash, TicketPercent } from 'lucide-react';
import { useState } from 'react'
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { DialogHeader, DialogFooter, Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

const CouponSelector = ({ className }: { className?: string }) => {
    const userId = useUserStore(state => state.userId);
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const queryClient = useQueryClient();

    const cart = useQuery({ queryKey: ['cart', userId], queryFn: async () => await api.cart.getCart(userId) });

    const applyCoupon = useMutation({
        mutationFn: async (coupon: string) => api.cart.applyCoupon({ coupon: coupon, userId: userId }),
        onSuccess: (data) => {
            queryClient.setQueryData(['cart', userId], data);
            toast.success("Applied coupon")
        },
        onError: (error) => {
            toast.error("Failed to apply coupon")
            console.error(error)
        }
    });

    const removeCoupon = useMutation({
        mutationFn: async () => api.cart.removeCoupon(userId),
        onSuccess: (data) => {
            queryClient.setQueryData(['cart', userId], data);
            toast.success("Remove coupon successfully")
        },
        onError: (error) => {
            toast.error("Failed to remove coupon")
            console.error(error)
        }
    });


    const handleApply = () => {
        applyCoupon.mutate(code);
        setCode("")
        setOpen(false);
    }

    return (
        <>
            <div className={cn('flex px-1 items-center', className)}>Coupon
                <Button variant="ghost" disabled={!cart.data || !cart.data?.coupon}
                    onClick={(e) => {
                        e.preventDefault();
                        removeCoupon.mutate()
                    }}>
                    <Trash />
                </Button>
                <Button variant="ghost" disabled={!cart.data} onClick={(e) => {
                    e.preventDefault()
                    setOpen(true)
                }}>
                    <TicketPercent />
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-sm" onSubmit={console.log}>
                        <DialogHeader>
                            <DialogTitle>Apply Coupon</DialogTitle>
                            <DialogDescription>
                                Enter a coupon code to receive a discount.
                            </DialogDescription>
                        </DialogHeader>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
                        <DialogFooter>
                            <Button type="submit" disabled={code.length < 4} onClick={handleApply}>Apply</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <span className='text-right ml-auto'>
                    <span className={cn('font-bold', "text-green-500")}>{cart?.data?.coupon?.name ?? ""}</span>
                </span>
            </div>
        </>
    )
}

export default CouponSelector