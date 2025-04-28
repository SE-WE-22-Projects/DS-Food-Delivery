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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import toast from 'react-hot-toast';
import { MenuTypeUpdate } from '@/api/menu';
import { useEffect } from 'react';
import { DeleteIcon } from 'lucide-react';
import { AddressType, RestaurantUpdate } from '@/api/restaurant';
import { convertFromNs, convertToNs } from '@/lib/timeUtil';
import { useParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MapSelectorInput from '@/components/LocationMap';

// Schemas using Zod
const addressSchema: z.ZodSchema<AddressType> = z.object({
  no: z.string().min(1, 'Street is required'),
  street: z.string().min(1, 'City is required'),
  town: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'ZIP code is required'),
  position: z.object({ lat: z.number(), lng: z.number() }),
});

const operationTimeSchema = z.object({
  open: z.string().min(1, 'Open time is required'),
  close: z.string().min(1, 'Close time is required'),
});

const restaurantUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: addressSchema,
  logo: z.instanceof(FileList, { message: "image is required" }).refine(f => f.length == 1, { message: "logo is required" }).optional(),
    cover:z.instanceof(FileList, { message: "image is required" }).refine(f => f.length == 1, { message: "cover is required" }).optional(),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).min(1, 'At least one tag is required'),
  operation_time: operationTimeSchema,
});

const UpdateRestaurant = () => {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();
  const queryRestaurant = useQuery({ queryKey: ['restaurants', 'own_restaurants', restaurantId], queryFn: () => api.restaurant.getRestaurantById(restaurantId!) });

  const form = useForm<z.infer<typeof restaurantUpdateSchema>>({
    resolver: zodResolver(restaurantUpdateSchema),
    defaultValues: {
      name: queryRestaurant.data?.name,
      address: queryRestaurant.data?.address,
      logo: undefined,
      cover: undefined,
      description: queryRestaurant.data?.description,
      tags: queryRestaurant.data?.tags,
      operation_time: {
        open: convertFromNs(queryRestaurant.data?.operation_time.open!),
        close: convertFromNs(queryRestaurant.data?.operation_time.close!),
      }
    }
  });

  useEffect(() => {
    if (queryRestaurant.data) {
      form.reset({
        name: queryRestaurant.data?.name,
        address: queryRestaurant.data?.address,
        logo: undefined,
        cover: undefined,
        description: queryRestaurant.data?.description,
        tags: queryRestaurant.data?.tags,
        operation_time: {
          open: convertFromNs(queryRestaurant.data?.operation_time.open!),
          close: convertFromNs(queryRestaurant.data?.operation_time.close!),
        }
      });
    }
  }, [queryRestaurant.data]);

  const modifyRestaurant = useMutation({
    mutationFn: (data: RestaurantUpdate) => api.restaurant.updateRestaurantById(queryRestaurant.data?.id!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['own_restaurant_menu'] }) },
  });

  const onSubmit = async (data: z.infer<typeof restaurantUpdateSchema>) => {
    console.log(data);
    const open = convertToNs(data.operation_time.open);
        const close = convertToNs(data.operation_time.close);
    try {
      let logoURL: string | undefined = undefined;
      let coverURL: string | undefined = undefined;
      if (data.logo) {
        logoURL = await api.upload.uploadPublicFile(data.logo[0]);
      }
      if (data.cover) {
        coverURL = await api.upload.uploadPublicFile(data.cover[0]);
      }
      await modifyRestaurant.mutateAsync({ ...data, operation_time: { close: close, open: open }, logo: logoURL, cover: coverURL });
      form.reset();
      toast.success("Successfully updated restaurant.");
    } catch (error) {
      toast.error("Failed to update restaurant.");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full max-w-2xl mx-auto"
      >
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
                  <FormLabel>No.</FormLabel>
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
                  <FormLabel>Town</FormLabel>
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

        {/* Location  */}
        <FormField
          control={form.control}
          name="address.position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <MapSelectorInput {...field} />
              </FormControl>
            </FormItem>
          )} />

        {/* Logo and Cover */}
        <div className="grid grid-cols-2 gap-6">
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <Input type="file"  {...form.register("logo")}
              />
            </FormControl>
            <p className='text-destructive text-sm'> {form.formState.errors.logo?.message}</p>
          </FormItem>

          <FormItem>
            <FormLabel>Cover</FormLabel>
            <FormControl>
              <Input type="file"  {...form.register("cover")}
              />
            </FormControl>
            <p className='text-destructive text-sm'> {form.formState.errors.cover?.message}</p>
          </FormItem>
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
          Update Restaurant
        </Button>
      </form>
    </Form>
  )
}

export default UpdateRestaurant;