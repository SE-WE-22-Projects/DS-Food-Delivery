import api from '@/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

const menuCreateSchema = z.object({
  restaurant_id: z.string().min(1, "Restaurant id is required"),
  name: z.string().min(1, "Menu name is required"),
  description: z.string().min(1, "Menu description is required"),
  price: z.number().positive("Price must be positive"),
  image: z.string().url('Invalid URL format').min(1, "Image URL is required"),
})

const CreateMenuForm = ({ restaurant_id }: { restaurant_id: string }) => {
  const form = useForm<z.infer<typeof menuCreateSchema>>({
    resolver: zodResolver(menuCreateSchema),
    defaultValues: {
      restaurant_id: '',
      name: '',
      description: '',
      image: '',
      price: 0
    }
  });

  const queryClient = useQueryClient();
  const createMenu = useMutation({
    mutationFn: api.menu.createMenuItem,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['own_restaurant_menu'] }) },
  })

  const onSubmit = async (data: z.infer<typeof menuCreateSchema>) => {
    console.log("hello"); 
    console.log(data);
    try {
      await createMenu.mutateAsync({ ...data, restaurant_id: restaurant_id });
      form.reset();
      toast.success("Successfully created menu.")
    } catch (error) {
      toast.error("Failed to create menu.");
      console.error(error);
    }

  }
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 p-4 border rounded-lg shadow-sm bg-card text-card-foreground"
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
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://your-image-host.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Create Menu Item
          </Button>
        </form>
      </Form>
    </>
  )
}

export default CreateMenuForm