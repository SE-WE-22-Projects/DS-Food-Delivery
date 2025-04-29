import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import toast from 'react-hot-toast';
import { MenuTypeUpdate } from '@/api/menu';
import { useEffect } from 'react';
import DeleteButton from '../DeleteButton';
import { DeleteIcon } from 'lucide-react';

const menuCreateSchema = z.object({
    name: z.string().min(1, "Menu name is required"),
    description: z.string().min(1, "Menu description is required"),
    price: z.number().positive("Price must be positive"),
    image: z.instanceof(FileList, { message: "image is required" }).refine(f => f.length == 1, { message: "image is required" }).optional()
})

const ModifyMenuForm = ({ menuId, setOpen }: { menuId: string, setOpen: (v: boolean) => void }) => {
    const queryClient = useQueryClient();
    const queryMenu = useQuery({ queryKey: ['own_restaurant_menu', menuId], queryFn: () => api.menu.getMenuItemById(menuId!) });

    const form = useForm<z.infer<typeof menuCreateSchema>>({
        resolver: zodResolver(menuCreateSchema),
        defaultValues: {
            name: queryMenu.data?.name,
            description: queryMenu.data?.description,
            price: queryMenu.data?.price,
            image: undefined
        }
    });


    const modifyMenu = useMutation({
        mutationFn: (data: MenuTypeUpdate) => api.menu.updateMenuItemById(queryMenu.data?.id!, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['own_restaurant_menu'] }) },
    })

    const deleteMenu = useMutation({
        mutationFn: (menuId: string) => api.menu.deleteMenuItemById(menuId),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['own_restaurant_menu'] }) },
    })

    const onDelete = async (menuId: string) => {
        try {
            await deleteMenu.mutateAsync(queryMenu.data?.id!);
            toast.success("Successfully deleted menu.");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to delete menu.");
            console.error(error);
        }
    }

    const onSubmit = async (data: z.infer<typeof menuCreateSchema>) => {
        console.log(data);
        try {
            let imgURL: string | undefined = undefined;
            if (data.image){
                 imgURL = await api.upload.uploadPublicFile(data.image[0]);
            }
            await modifyMenu.mutateAsync({ ...data, image: imgURL });
            form.reset();
            toast.success("Successfully updated menu.");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update menu.");
            console.error(error);
        }
    }

    useEffect(() => {
        if (queryMenu.data) {
            form.reset({
                name: queryMenu.data?.name,
                description: queryMenu.data?.description,
                price: queryMenu.data?.price,
                image: undefined
            })
        }
    }, [queryMenu.data])

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 p-4 border rounded-lg shadow-sm bg-card text-card-foreground w-[400px]"
                >
                    {/* Name Field */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Menu Item Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter menu item name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description Field */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter item description"
                                        rows={4} // Set initial rows
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Price Field */}
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Enter menu item price"
                                        step="0.01"
                                        {...field}
                                        onChange={event => field.onChange(+event.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Image URL Field */}

                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                            <Input type="file"  {...form.register("image")}
                            />
                        </FormControl>
                        <p className='text-destructive text-sm'> {form.formState.errors.image?.message}</p>
                    </FormItem>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full hover:scale-[1.03]">
                        Update Menu Item
                    </Button>
                    {/* Delete Button */}
                    <DeleteButton action={() => onDelete(queryMenu.data?.id!)}>
                        Delete Menu {<DeleteIcon />}
                    </DeleteButton>
                </form>
            </Form>
        </div>
    )
}

export default ModifyMenuForm