import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/api"
import toast from "react-hot-toast"
import { useEffect, useState } from "react"
import { DeleteIcon, X } from "lucide-react"
import type { AddressType, RestaurantUpdate } from "@/api/restaurant"
import { convertFromNs, convertToNs } from "@/lib/timeUtil"
import { useNavigate, useParams } from "react-router-dom"
import MapSelectorInput from "@/components/LocationMap"
import DeleteButton from "@/components/DeleteButton"

// Schemas using Zod
const addressSchema: z.ZodSchema<AddressType> = z.object({
  no: z.string().min(1, "Street is required"),
  street: z.string().min(1, "City is required"),
  town: z.string().min(1, "State is required"),
  city: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "ZIP code is required"),
  position: z.object({ lat: z.number(), lng: z.number() }),
})

const operationTimeSchema = z.object({
  open: z.string().min(1, "Open time is required"),
  close: z.string().min(1, "Close time is required"),
})

const restaurantUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: addressSchema,
  logo: z
    .instanceof(FileList, { message: "image is required" })
    .refine((f) => f.length == 1, { message: "logo is required" })
    .optional(),
  cover: z
    .instanceof(FileList, { message: "image is required" })
    .refine((f) => f.length == 1, { message: "cover is required" })
    .optional(),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  operation_time: operationTimeSchema,
})

const UpdateRestaurant = () => {
  const navigate = useNavigate()
  const { restaurantId } = useParams()
  const queryClient = useQueryClient()
  const queryRestaurant = useQuery({
    queryKey: ["restaurants", "own_restaurants", restaurantId],
    queryFn: () => api.restaurant.getRestaurantById(restaurantId!),
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof restaurantUpdateSchema>>({
    resolver: zodResolver(restaurantUpdateSchema),
    defaultValues: {
      name: queryRestaurant.data?.name,
      address: queryRestaurant.data?.address,
      logo: undefined,
      cover: undefined,
      description: queryRestaurant.data?.description,
      tags: queryRestaurant.data?.tags || [],
      operation_time: {
        open: convertFromNs(queryRestaurant.data?.operation_time.open!),
        close: convertFromNs(queryRestaurant.data?.operation_time.close!),
      },
    },
  })

  useEffect(() => {
    if (queryRestaurant.data) {
      form.reset({
        name: queryRestaurant.data?.name,
        address: queryRestaurant.data?.address,
        logo: undefined,
        cover: undefined,
        description: queryRestaurant.data?.description,
        tags: queryRestaurant.data?.tags || [],
        operation_time: {
          open: convertFromNs(queryRestaurant.data?.operation_time.open!),
          close: convertFromNs(queryRestaurant.data?.operation_time.close!),
        },
      })

      // Set existing image URLs if available
      if (queryRestaurant.data.logo) {
        setLogoPreview(queryRestaurant.data.logo)
      }
      if (queryRestaurant.data.cover) {
        setCoverPreview(queryRestaurant.data.cover)
      }
    }
  }, [queryRestaurant.data, form])

  const modifyRestaurant = useMutation({
    mutationFn: (data: RestaurantUpdate) => api.restaurant.updateRestaurantById(queryRestaurant.data?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own_restaurant_menu"] })
    },
  })

  const onSubmit = async (data: z.infer<typeof restaurantUpdateSchema>) => {
    console.log(data)
    const open = convertToNs(data.operation_time.open)
    const close = convertToNs(data.operation_time.close)
    try {
      let logoURL: string | undefined = undefined
      let coverURL: string | undefined = undefined
      if (data.logo) {
        logoURL = await api.upload.uploadPublicFile(data.logo[0])
      }
      if (data.cover) {
        coverURL = await api.upload.uploadPublicFile(data.cover[0])
      }
      await modifyRestaurant.mutateAsync({
        ...data,
        operation_time: { close: close, open: open },
        logo: logoURL,
        cover: coverURL,
      })
      toast.success("Successfully updated restaurant.")
      navigate(-1)
    } catch (error) {
      toast.error("Failed to update restaurant.")
      console.error(error)
    }
  }

  const deleteRestaurant = useMutation({
    mutationFn: (restaurantId: string) => api.restaurant.deleteRestaurantById(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own_restaurant_menu"] })
    },
  })

  const onDelete = async () => {
    try {
      await deleteRestaurant.mutateAsync(queryRestaurant.data?.id!)
      toast.success("Successfully deleted restaurant.")
      navigate(-1)
    } catch (error) {
      toast.error("Failed to delete restaurant.")
      console.error(error)
    }
  }

  if (queryRestaurant.isLoading) {
    return <div className="text-center py-10">Loading restaurant data...</div>
  }

  if (queryRestaurant.isError) {
    return <div className="text-center py-10 text-red-500">Error loading restaurant data</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-2xl mx-auto">
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
          )}
        />

        {/* Logo and Cover */}
        <div className="grid grid-cols-2 gap-6">
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Input
                  type="file"
                  {...form.register("logo", {
                    onChange: (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setLogoPreview(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    },
                  })}
                />
                {logoPreview && (
                  <div className="relative w-32 h-32 mx-auto border rounded-md overflow-hidden">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                      onClick={() => {
                        setLogoPreview(null)
                        form.setValue("logo", undefined as any)
                      }}
                    >
                      <span className="sr-only">Remove</span>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </FormControl>
            <p className="text-destructive text-sm">{form.formState.errors.logo?.message}</p>
          </FormItem>

          <FormItem>
            <FormLabel>Cover</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Input
                  type="file"
                  {...form.register("cover", {
                    onChange: (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setCoverPreview(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    },
                  })}
                />
                {coverPreview && (
                  <div className="relative w-full h-32 mx-auto border rounded-md overflow-hidden">
                    <img
                      src={coverPreview || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                      onClick={() => {
                        setCoverPreview(null)
                        form.setValue("cover", undefined as any)
                      }}
                    >
                      <span className="sr-only">Remove</span>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </FormControl>
            <p className="text-destructive text-sm">{form.formState.errors.cover?.message}</p>
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
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {field.value.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                    >
                      <span>{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2"
                        onClick={() => {
                          const newTags = [...field.value]
                          newTags.splice(index, 1)
                          field.onChange(newTags)
                        }}
                      >
                        <span className="sr-only">Remove</span>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !field.value.includes(value)) {
                          field.onChange([...field.value, value])
                          e.currentTarget.value = ""
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling as HTMLInputElement
                      const value = input.value.trim()
                      if (value && !field.value.includes(value)) {
                        field.onChange([...field.value, value])
                        input.value = ""
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Popular tags:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Italian", "Mexican", "American", "Chinese", "Indian", "Thai", "Japanese", "French"].map(
                      (tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!field.value.includes(tag)) {
                              field.onChange([...field.value, tag])
                            }
                          }}
                          className="h-7"
                        >
                          {tag}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              </div>
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
        <DeleteButton action={onDelete}>
          Delete Restaurant <DeleteIcon className="ml-2" />
        </DeleteButton>
      </form>
    </Form>
  )
}

export default UpdateRestaurant
