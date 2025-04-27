import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddressType } from '@/api/restaurant';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { convertToNs } from '@/lib/timeUtil';
import api from '@/api';
import toast from 'react-hot-toast';



// Schemas using Zod
const addressSchema: z.ZodSchema<AddressType> = z.object({
  no: z.string().min(1, 'Street is required'),
  street: z.string().min(1, 'City is required'),
  town: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'ZIP code is required'),
});

const operationTimeSchema = z.object({
  open: z.string().min(1, 'Open time is required'),
  close: z.string().min(1, 'Close time is required'),
});

const restaurantCreateSchema = z.object({
  registration_no: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Name is required'),
  address: addressSchema,
  logo: z.string().url('Invalid URL format').min(1, "Logo URL is required"),
  cover: z.string().url('Invalid URL format').min(1, "Cover URL is required"),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).min(1, 'At least one tag is required'),
  operation_time: operationTimeSchema,
});

// React component using React Hook Form and Shadcn UI
const CreateRestaurantForm = () => {
  const form = useForm<z.infer<typeof restaurantCreateSchema>>({
    resolver: zodResolver(restaurantCreateSchema),
    defaultValues: {
      registration_no: '',
      name: '',
      address: {
        no: '',
        street: '',
        town: '',
        city: '',
        postal_code: '',
      },
      logo: '',
      cover: '',
      description: '',
      tags: [],
      operation_time: {
        open: "",
        close: "",
      },
    },
  });

  const onSubmit = async (data: z.infer<typeof restaurantCreateSchema>) => {
    console.log(data);
    const open = convertToNs(data.operation_time.open);
    const close = convertToNs(data.operation_time.close);
    try {
      await createRestaurant.mutateAsync({ ...data, operation_time: { close: close, open: open } })
      form.reset();
      toast.success("Successfully registered restaurant.")
    } catch (error) {
      toast.error("Failed to register restaurant.");
      console.error(error);
    }
  };

  const queryClient = useQueryClient()
  const createRestaurant = useMutation({
    mutationFn: api.restaurant.createRestaurant,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurants'] }) },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full max-w-2xl mx-auto"
      >
        {/* Registration Number and Owner */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="registration_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter registration number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Restaurant Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter restaurant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="address.no"
              render={({ field }) => (
                <FormItem className="col-span-4">
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter no" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="col-span-4">
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.town"
              render={({ field }) => (
                <FormItem className="col-span-4">
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter town" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.postal_code"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Logo and Cover */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter logo URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter cover image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter restaurant description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(value.split(','))}
                  value={field.value?.join(',')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select or type tags..." />
                  </SelectTrigger>
                  <SelectContent>
                    {['Italian', 'Mexican', 'American', 'Chinese', 'Indian', 'Thai', 'Japanese', 'French'].map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Enter comma-separated tags (e.g., Italian, Mexican, American).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Operation Time */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Operation Time</h2>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="operation_time.open"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Open Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="operation_time.close"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Close Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Create Restaurant
        </Button>
      </form>
    </Form>
  );
};

export default CreateRestaurantForm;
