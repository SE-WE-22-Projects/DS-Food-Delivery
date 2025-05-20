import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { LocationMap } from './LocationMap'
import { useEffect } from 'react'
import api from '@/api'
import { useQuery } from '@tanstack/react-query'
import useUserStore from '@/store/user'

const DeliveryForm = () => {
    const form = useFormContext();
    const userId = useUserStore(state => state.userId);

    const user = useQuery({ queryKey: [userId], queryFn: async () => await api.user.getUserById(userId) })
    useEffect(() => {
        form.reset({
            no: user.data?.address.no,
            street: user.data?.address.street,
            town: user.data?.address.town,
            city: user.data?.address.city,
            postal_code: user.data?.address.postal_code,
        })
    }, [user.data])

    return (
        <div className='mx-2 border p-6 rounded-2xl'>
            <h2 className='font-semibold text-lg  '>Delivery Details</h2>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-4 mt-4 md:flex-row flex-col'>
                    <FormField
                        control={form.control}
                        name="no"
                        render={({ field }) => (
                            <FormItem className='md:w-[20ch]'>
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
                            <FormItem className='grow'>
                                <FormLabel>Street</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Street" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex gap-4 mt-4 md:flex-row flex-col '>
                    <FormField
                        control={form.control}
                        name="town"
                        render={({ field }) => (
                            <FormItem className='grow'>
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
                            <FormItem className='grow'>
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
                            <FormItem className='md:w-[10ch]'>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Postal Code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

            </div>

            <div className='my-4'>
            </div>


            <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <LocationMap style={{ width: "100%", height: "500px" }}
                                onChange={(l) => {
                                    field.onChange(l)
                                }} value={field.value} />
                        </FormControl>
                    </FormItem>
                )} />
        </div>
    )
}

export default DeliveryForm