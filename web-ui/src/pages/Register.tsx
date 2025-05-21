import { useState } from "react"
import { User, Mail, Phone, Lock, Eye, EyeOff, Home, Loader2 } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import api from "@/api"
import { Link, useNavigate } from "react-router-dom"
import MapSelectorInput from "@/components/checkout/LocationMap"


// Define the form schema with zod
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    mobile_no: z.string().min(1, "Mobile number is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
    position: z.any(),
    address: z.object({
        no: z.string().min(1, "House/Building number is required"),
        street: z.string().min(1, "Street is required"),
        town: z.string().min(1, "Town is required"),
        city: z.string().min(1, "City is required"),
        postal_code: z.string().min(1, "Postal code is required"),

    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Define the form data type based on the schema
type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    // Initialize the form
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            mobile_no: "",
            email: "",
            password: "",
            confirmPassword: "",
            position: undefined,
            address: {
                no: "",
                street: "",
                town: "",
                city: "",
                postal_code: "",

            },
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const { confirmPassword, position, ...dataToSubmit } = data
            await api.auth.register({ ...dataToSubmit, address: { ...dataToSubmit.address, position: { type: "point", coordinates: [position.lng, position.lat] } } })
            navigate("/login")
        } catch (err) {
            console.error("Registration failed:", err)
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex-1 container py-8">
            {JSON.stringify(form.formState.errors)}
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
                    <p className="text-muted-foreground mt-1">Join FoodExpress and start ordering delicious food</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Please provide your personal details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Full Name</FormLabel>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your full name"
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mobile_no"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Mobile Number</FormLabel>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input
                                                        type="tel"
                                                        placeholder="Enter your mobile number"
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Email Address</FormLabel>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Password</FormLabel>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Create a password"
                                                        className="pl-10 pr-10"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Confirm Password</FormLabel>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm your password"
                                                        className="pl-10 pr-10"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Delivery Address</CardTitle>
                                <CardDescription>Where would you like your food delivered?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address.no"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel>House/Building Number</FormLabel>
                                                <div className="relative">
                                                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter house/building number"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address.street"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel>Street</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter street name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address.town"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel>Town/Area</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter town or area"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address.city"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter city"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address.postal_code"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter postal code"
                                                    {...field}
                                                />
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Separator className="my-6" />

                        <div className="flex flex-col md:flex-row gap-4 justify-end">
                            <Button variant="outline" type="button" onClick={() => navigate("/")}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link to="/login" className="text-orange-500 hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </Form>
            </div>
        </main>

    )
}
