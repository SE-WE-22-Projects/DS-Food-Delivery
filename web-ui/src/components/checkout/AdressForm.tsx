import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const FormSchema = z.object({
    no: z.string().min(1, { message: "No is required" }),
    street: z.string().min(1, { message: "Street is required" }),
    town: z.string().min(1, { message: "Town is required" }),
    city: z.string().min(1, { message: "City is required" }),
    postal_code: z.string().min(1, { message: "Postal code is required" }),
});

type FormData = z.infer<typeof FormSchema>;

export default function AddressForm() {
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

    function onSubmit(values: FormData) {
        console.log(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mx-16 p-8 bg-white">
                <h1>Delivery Details</h1>
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

                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </form>
        </Form>
    );
}
