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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import MapSelectorInput from '@/components/cart/LocationMap';

const FormSchema = z.object({
    no: z.string().min(1, { message: "No is required" }),
    street: z.string().min(1, { message: "Street is required" }),
    town: z.string().min(1, { message: "Town is required" }),
    city: z.string().min(1, { message: "City is required" }),
    postal_code: z.string().min(1, { message: "Postal code is required" }),
    position: z.object({ lat: z.number(), lng: z.number() }),
});

type FormData = z.infer<typeof FormSchema>;

const Checkout = () => {
    const userId = useUserStore(state => state.userId);
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const user = useQuery({ queryKey: [userId], queryFn: async () => await api.user.getUserById(userId) })

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            no: "",
            street: "",
            town: "",
            city: "",
            postal_code: "",
        },
    });

    useEffect(() => {
        if (user.data)
            console.log(user.data)
        form.reset({
            no: user.data?.address.no,
            street: user.data?.address.street,
            town: user.data?.address.town,
            city: user.data?.address.city,
            postal_code: user.data?.address.postal_code,
        })
    }, [user.data])

    const cart = useQuery({
        queryKey: ['cart'],
        queryFn: async () => await api.cart.getCart(userId)
    });


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

    const onSubmit = async (values: FormData) => {
        let orderId: string = ""
        try {
            orderId = await api.cart.createOrder(userId, values);
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success("Created order successfully");
        } catch (e) {
            toast.error("Failed to create order");
            console.error(e);
        }

        try {
            const payUrl = await api.cart.makePayment(orderId);

            // @ts-expect-error a string can be assigned to location
            window.location = payUrl;
        } catch (e) {
            toast.error("Failed to make payment. Order has been canceled");
            console.error(e);
            await api.cart.cancelOrder(orderId);
        }

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mx-16 p-8 rounded-lg mt-4 bg-white">
                <h1 className='font-semibold text-lg border-b pb-2'>Checkout</h1>
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
                        <Button className='mx-4' type='submit' disabled={!cart.data || cart.data.items.length == 0}>Place Order</Button>
                    </div>
                    <div className='grow'>
                        <div className='mx-auto max-w-lg flex space-y-6 flex-col'>
                            <h2 className='font-semibold my-2'>Delivery Details</h2>
                            <FormField
                                control={form.control}
                                name="no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter No" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Street" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="town"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Town</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Town" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter City" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="postal_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Postal Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Postal Code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <MapSelectorInput {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />

                        </div>
                    </div>
                </div>
                <CouponDialog open={open} setOpen={setOpen} />
            </form>
        </Form>
    )
}

export default Checkout