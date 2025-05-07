import api from '@/api';
import { Button } from '@/components/ui/button';
import useUserStore from '@/store/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CouponSelector from '@/components/cart/CouponSelector';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import DeliveryForm from '@/components/checkout/DeliveryForm';

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
    const queryClient = useQueryClient();
    const [error, setError] = useState<string>()

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


    const cart = useQuery({
        queryKey: ['cart', userId],
        queryFn: async () => await api.cart.getCart(userId)
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
            return;
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

    const cartSize = cart.data?.items?.reduce((r, v) => r + v.amount, 0) ?? 0;
    useEffect(() => {
        if (cartSize === 0) {
            setError("Cart is empty")
        } else if (cartSize > 100) {
            setError("An order must have at most 100 items")
        } else if (cart.data && cart.data.total < 500) {
            setError("Minimum order price is LKR 500")
        } else if (cart.data && cart.data.total > 20000) {
            setError("Maximum order price is LKR 20,000")
        } else {
            setError(undefined)
        }
    }, [cart.data])

    return (
        <div className='container mx-auto'>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mx-16 p-8 rounded-lg mt-4 bg-white">
                    <h1 className='font-semibold text-2xl pb-2'>Checkout</h1>
                    <div className='flex flex-col grow gap-y-6'>
                        <div className='grow'>
                            <DeliveryForm />
                        </div>

                        <div >
                            <div className='mx-2 border p-6 rounded-2xl'>
                                <h1 className='font-semibold text-lg mb-4'>Order Summary</h1>

                                <div className='grid grid-cols-9 gap-4 items-center border-2 px-2 py-4 rounded-2xl overflow-scroll'>
                                    <span className='col-span-4 md:col-span-6 font-bold'>Item</span>
                                    <span className='col-span-2 md:col-span-1 font-bold'>Price</span>
                                    <span className='col-span-1 font-bold'>Qty</span>
                                    <span className='col-span-2 md:col-span-1 font-bold'>Total</span>
                                    <Separator className='col-span-9' />
                                    {cart.data?.items?.map(item =>
                                        <>
                                            <span className='col-span-4 md:col-span-6'>{item.name}</span>
                                            <span className='col-span-2 md:col-span-1'>Rs {item.price}</span>
                                            <span className='col-span-1'>{item.amount}</span>
                                            <span className='col-span-2 md:col-span-1'>Rs {item.price * item.amount}</span>
                                        </>
                                    )}
                                </div>

                                <div className='flex flex-col mt-4'>
                                    <div className='grid grid-cols-2 font-semibold'>
                                        <CouponSelector className='col-span-2' />
                                        <Separator className='col-span-2 mt-2' />
                                        <span className='px-1'>Subtotal</span>
                                        <span className='text-right'> {cart.data ? `LKR ${cart.data.sub_total}` : <Skeleton className='h-4 w-full mt-1' />}</span>
                                        <span className='px-1'>Discount</span>
                                        <span className='text-right'>
                                            {!cart.data && <Skeleton className='h-4 w-full' />}
                                            {!!cart.data && (discount ? <span className='text-green-300 font-semibold pl-4'>-{discount}%</span> : "--")}
                                        </span>
                                        <Separator className='col-span-2 mt-2' />
                                        <span className='px-1'>Total</span>
                                        <span className='text-right'> {cart.data ? `LKR ${cart.data.total}` : <Skeleton className='h-4 w-full mt-1' />}</span>
                                    </div>
                                </div>
                                <div className='text-destructive my-2'>{error}</div>
                                <div className='ml-auto '>
                                    <Button
                                        size="lg"
                                        type='submit'
                                        disabled={!!error || !cart.data || cart.data.items?.length == 0 || !form.formState.isValid}
                                    >
                                        <ShoppingBag />
                                        Place Order
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div >
    )
}

export default Checkout