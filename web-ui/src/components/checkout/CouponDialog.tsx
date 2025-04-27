import { DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import useUserStore from '@/store/user';
import toast from 'react-hot-toast';

interface CouponDialogProps {
    open: boolean
    setOpen: (v: boolean) => void
}

const CouponDialog = (props: CouponDialogProps) => {
    const [code, setCode] = useState("");
    const queryClient = useQueryClient();
    const userId = useUserStore(state => state.userId);

    const applyCoupon = useMutation({
        mutationFn: async (coupon: string) => api.cart.applyCoupon({ coupon: coupon, userId: userId }),
        onSuccess: (data) => {
            queryClient.setQueryData(['cart'], data);
            toast.success("Applied coupon")
        },
        onError: (error) => {
            toast.error("Failed to apply coupon")
            console.error(error)
        }
    });

    const handleApply = () => {
        applyCoupon.mutate(code);
        setCode("")
        props.setOpen(false);
    }

    return (
        <Dialog open={props.open} onOpenChange={props.setOpen}>
            <DialogContent className="sm:max-w-md" onSubmit={console.log}>
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
    )
}

export default CouponDialog
