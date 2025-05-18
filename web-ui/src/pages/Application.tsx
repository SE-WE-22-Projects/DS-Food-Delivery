import type React from "react"
import { useState, useRef } from "react"
import { CheckCircle, AlertCircle, ArrowLeft, Car, Bike, Truck, FileText, Camera, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import api from "@/api"
import useUserStore from "@/store/user"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import Image from "@/components/common/Image"
import { ApplicationForm } from "@/api/driver"


type FileUploadState = {
    file: File | null
    preview: string | null
    uploading: boolean
    error: string | null
}

export default function DriverApplicationPage() {
    const { user } = useUserStore()
    const navigate = useNavigate()

    // Check if user is already a driver
    const isAlreadyDriver = user?.roles?.includes("user_driver1")

    // Form state
    const [form, setForm] = useState<Omit<ApplicationForm, "vehicle_image" | "driver_license">>({
        nic_no: "",
        vehicle_number: "",
        vehicle_type: "motorbike",
    })

    // File upload states
    const [vehicleImage, setVehicleImage] = useState<FileUploadState>({
        file: null,
        preview: null,
        uploading: false,
        error: null,
    })

    const [driverLicense, setDriverLicense] = useState<FileUploadState>({
        file: null,
        preview: null,
        uploading: false,
        error: null,
    })

    // Form submission state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [formSuccess, setFormSuccess] = useState(false)

    // Refs for file inputs
    const vehicleImageInputRef = useRef<HTMLInputElement>(null)
    const driverLicenseInputRef = useRef<HTMLInputElement>(null)

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    // Handle vehicle type selection
    const handleVehicleTypeChange = (value: "motorbike" | "three_wheel" | "car") => {
        setForm((prev) => ({ ...prev, vehicle_type: value }))
    }

    // Handle file selection for vehicle image
    const handleVehicleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type and size
        if (!file.type.startsWith("image/")) {
            setVehicleImage((prev) => ({ ...prev, error: "Please upload an image file" }))
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setVehicleImage((prev) => ({ ...prev, error: "Image must be less than 5MB" }))
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setVehicleImage({
                file,
                preview: reader.result as string,
                uploading: false,
                error: null,
            })
        }
        reader.readAsDataURL(file)
    }

    // Handle file selection for driver license
    const handleDriverLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type and size
        if (!file.type.startsWith("image/")) {
            setDriverLicense((prev) => ({ ...prev, error: "Please upload an image file" }))
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setDriverLicense((prev) => ({ ...prev, error: "Image must be less than 5MB" }))
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setDriverLicense({
                file,
                preview: reader.result as string,
                uploading: false,
                error: null,
            })
        }
        reader.readAsDataURL(file)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Reset errors
        setFormError(null)

        // Validate form
        if (!form.nic_no || !form.vehicle_number || !vehicleImage.file || !driverLicense.file) {
            setFormError("Please fill in all required fields and upload all required documents")
            return
        }

        setIsSubmitting(true)

        try {
            // Upload vehicle image
            setVehicleImage((prev) => ({ ...prev, uploading: true }))
            const vehicleImageUrl = await api.upload.uploadPrivateFile(user?.id!, vehicleImage.file)
            setVehicleImage((prev) => ({ ...prev, uploading: false }))

            // Upload driver license
            setDriverLicense((prev) => ({ ...prev, uploading: true }))
            const driverLicenseUrl = await api.upload.uploadPrivateFile(user?.id!, driverLicense.file)
            setDriverLicense((prev) => ({ ...prev, uploading: false }))

            // Submit application
            await api.driver.createApplication(user?.id!, {
                ...form,
                vehicle_image: vehicleImageUrl,
                driver_license: driverLicenseUrl,
            })

            // Show success message
            setFormSuccess(true)
            toast.success("Your driver application has been submitted successfully. We'll review it and get back to you soon.")

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate("/")
            }, 3000)
        } catch (error) {
            console.error("Application submission failed:", error)
            setFormError("Failed to submit application. Please try again later.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // If user is already a driver, show a message and redirect
    if (isAlreadyDriver) {
        return (
            <main className="flex-1 container py-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Already a Driver</CardTitle>
                        <CardDescription>You are already registered as a driver with QuickEats.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>You're all set!</AlertTitle>
                            <AlertDescription>You can access your driver dashboard to start accepting deliveries.</AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => navigate("/")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate("/driver")}>
                            Go to Driver Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        )
    }

    // If application was successful, show success message
    if (formSuccess) {
        return (
            <main className="flex-1 container py-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Application Submitted</CardTitle>
                        <CardDescription>Thank you for applying to be a QuickEats driver.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="rounded-full bg-green-100 p-3 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Application Received</h3>
                            <p className="text-muted-foreground mb-4">
                                We've received your application and will review it shortly. You'll be notified once your application
                                is approved.
                            </p>
                            <p className="text-sm text-muted-foreground">Redirecting to home page...</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        )
    }

    // Main application form
    return (

        <main className="flex-1 container py-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Become a Driver</h1>
                    <p className="text-muted-foreground mt-1">
                        Fill out the form below to apply as a delivery driver for QuickEats.
                    </p>
                </div>

                {formError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Please provide your personal details for verification purposes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nic_no">National ID Card Number</Label>
                                <Input
                                    id="nic_no"
                                    name="nic_no"
                                    placeholder="Enter your NIC number"
                                    value={form.nic_no}
                                    onChange={handleInputChange}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    This will be used for identity verification and background checks.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Vehicle Information</CardTitle>
                            <CardDescription>Tell us about the vehicle you'll be using for deliveries.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_number">Vehicle Registration Number</Label>
                                <Input
                                    id="vehicle_number"
                                    name="vehicle_number"
                                    placeholder="Enter your vehicle registration number"
                                    value={form.vehicle_number}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Vehicle Type</Label>
                                <RadioGroup
                                    value={form.vehicle_type}
                                    onValueChange={handleVehicleTypeChange}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                                >
                                    <div>
                                        <RadioGroupItem value="motorbike" id="motorbike" className="peer sr-only" />
                                        <Label
                                            htmlFor="motorbike"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                                        >
                                            <Bike className="mb-3 h-6 w-6" />
                                            Motorbike
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="three_wheel" id="three_wheel" className="peer sr-only" />
                                        <Label
                                            htmlFor="three_wheel"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                                        >
                                            <Truck className="mb-3 h-6 w-6" />
                                            Three Wheeler
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="car" id="car" className="peer sr-only" />
                                        <Label
                                            htmlFor="car"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                                        >
                                            <Car className="mb-3 h-6 w-6" />
                                            Car
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Vehicle Photo</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer ${vehicleImage.error ? "border-red-300" : "border-muted"
                                            }`}
                                        onClick={() => vehicleImageInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={vehicleImageInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleVehicleImageChange}
                                        />
                                        {!vehicleImage.preview ? (
                                            <div className="py-4">
                                                <Camera className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm font-medium">Upload Vehicle Photo</p>
                                                <p className="text-xs text-muted-foreground mt-1">Click to browse or drag and drop</p>
                                                <p className="text-xs text-muted-foreground mt-1">(Max 5MB, JPG or PNG)</p>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Image
                                                    src={vehicleImage.preview || "/placeholder.svg"}
                                                    alt="Vehicle preview"
                                                    width={300}
                                                    height={200}
                                                    className="mx-auto rounded-md object-cover"
                                                    style={{ maxHeight: "200px", width: "auto" }}
                                                />
                                                <p className="text-xs text-muted-foreground mt-2">Click to change</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Clear photo of your vehicle</li>
                                            <li>• All sides of the vehicle should be visible</li>
                                            <li>• License plate should be clearly visible</li>
                                            <li>• Good lighting and focus</li>
                                        </ul>
                                        {vehicleImage.error && <p className="text-sm text-red-500 mt-2">{vehicleImage.error}</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Upload the required documents for verification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Driver's License</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer ${driverLicense.error ? "border-red-300" : "border-muted"
                                            }`}
                                        onClick={() => driverLicenseInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={driverLicenseInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleDriverLicenseChange}
                                        />
                                        {!driverLicense.preview ? (
                                            <div className="py-4">
                                                <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm font-medium">Upload Driver's License</p>
                                                <p className="text-xs text-muted-foreground mt-1">Click to browse or drag and drop</p>
                                                <p className="text-xs text-muted-foreground mt-1">(Max 5MB, JPG or PNG)</p>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Image
                                                    src={driverLicense.preview}
                                                    alt="License preview"
                                                    width={300}
                                                    height={200}
                                                    className="mx-auto rounded-md object-cover"
                                                    style={{ maxHeight: "200px", width: "auto" }}
                                                />
                                                <p className="text-xs text-muted-foreground mt-2">Click to change</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Valid driver's license</li>
                                            <li>• Both sides of the license</li>
                                            <li>• All details should be clearly visible</li>
                                            <li>• No glare or shadows</li>
                                        </ul>
                                        {driverLicense.error && <p className="text-sm text-red-500 mt-2">{driverLicense.error}</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Terms & Conditions</CardTitle>
                            <CardDescription>Please read and agree to our terms before submitting.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-4">
                                <p>By submitting this application, you agree to the following:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>You are at least 18 years of age</li>
                                    <li>You have a valid driver's license</li>
                                    <li>Your vehicle is in good working condition</li>
                                    <li>You have valid vehicle insurance</li>
                                    <li>You consent to a background check</li>
                                    <li>You will comply with all local transportation laws</li>
                                </ul>
                                <p>
                                    QuickEats reserves the right to reject applications that do not meet our requirements or
                                    standards.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" type="button" onClick={() => navigate("/")}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-orange-500 hover:bg-orange-600"
                                disabled={isSubmitting || vehicleImage.uploading || driverLicense.uploading}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </main>
    )
}
