import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { VehicleType, DriverRequestStatus, getApplicationById } from "@/api/driver"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { AlertTriangle,  ChevronLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "@/components/Image"
import { Badge } from "@/components/ui/badge"

const DriverApplication = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const {
        data: application,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["driverApplication", id],
        queryFn: () => getApplicationById(id as string),
        enabled: !!id,
    })

    const getStatusBadgeClass = (status: DriverRequestStatus) => {
        switch (status) {
            case DriverRequestStatus.approved:
                return "bg-green-700/30 text-green-300 border border-green-600"
            case DriverRequestStatus.pending:
                return "bg-yellow-700/30 text-yellow-300 border border-yellow-600"
            case DriverRequestStatus.rejected:
                return "bg-red-700/30 text-red-300 border border-red-600"
            case DriverRequestStatus.withdrawn:
                return "bg-slate-700/30 text-slate-300 border border-slate-600"
            default:
                return "bg-slate-700/30 text-slate-300 border border-slate-600"
        }
    }

    const getVehicleTypeLabel = (type: VehicleType) => {
        switch (type) {
            case VehicleType.Car:
                return "Car"
            case VehicleType.Van:
                return "Van"
            case VehicleType.Motorbike:
                return "Motorbike"
            default:
                return type
        }
    }

    const formatDate = (dateString: string | Date) => {
        try {
            const date = typeof dateString === "string" ? new Date(dateString) : dateString
            return format(date, "PPP p")
        } catch (e) {
            return "Invalid date"
        }
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-slate-50">
            <div className="mb-6 flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-300 border-slate-700 hover:bg-slate-700/50"
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-slate-100">Driver Application Details</h1>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                    <p className="ml-3 text-lg text-slate-300">Loading application details...</p>
                </div>
            )}

            {isError && !isLoading && (
                <div className="flex flex-col items-center justify-center h-64 bg-slate-800 p-6 rounded-lg shadow-lg">
                    <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong.</h3>
                    <p className="text-slate-400 mb-1">We couldn't load the driver application data.</p>
                    <p className="text-xs text-slate-500">Error: {error?.message || "Unknown error"}</p>
                </div>
            )}

            {!isLoading && !isError && application && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-800 border-slate-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl text-slate-100">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <p className="text-sm text-slate-400">User ID</p>
                                    <p className="text-slate-200 font-medium">{application.user_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">NIC Number</p>
                                    <p className="text-slate-200 font-medium">{application.nic_no}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Driver License</p>
                                    {application.driver_license ? (
                                        <div className="mt-2 relative h-48 w-full overflow-hidden rounded-md">
                                            <Image
                                                src={application.driver_license}
                                                alt="Vehicle"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic">No image available</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Application Status</p>
                                    <div className="flex">
                                        <Badge className={`mt-1 ${getStatusBadgeClass(application.status)}`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </Badge>
                                    </div>

                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl text-slate-100">Vehicle Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <p className="text-sm text-slate-400">Vehicle Number</p>
                                    <p className="text-slate-200 font-medium">{application.vehicle_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Vehicle Type</p>
                                    <p className="text-slate-200 font-medium">{getVehicleTypeLabel(application.vehicle_type)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Vehicle Image</p>
                                    {application.vehicle_image ? (
                                        <div className="mt-2 relative h-48 w-full overflow-hidden rounded-md">
                                            <Image
                                                src={application.vehicle_image}
                                                alt="Vehicle"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic">No image available</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 shadow-lg md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl text-slate-100">Application Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">Created At</p>
                                    <p className="text-slate-200 font-medium">{formatDate(application.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Updated At</p>
                                    <p className="text-slate-200 font-medium">{formatDate(application.updated_at)}</p>
                                </div>

                                {application.status !== DriverRequestStatus.pending && (
                                    <>
                                        <div>
                                            <p className="text-sm text-slate-400">Handled By</p>
                                            <p className="text-slate-200 font-medium">{application.handled_by || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Admin Remark</p>
                                            <p className="text-slate-200 font-medium">{application.admin_remark || "No remarks provided"}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default DriverApplication