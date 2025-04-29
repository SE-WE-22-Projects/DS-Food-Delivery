import React from 'react';

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DriverRequestStatus } from '@/api/driver';
import { Button } from '../../components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { useParams } from 'react-router-dom';
import { formatDate } from '@/lib/timeUtil';


const getStatusVariant = (status?: DriverRequestStatus) => {
    switch (status) {
        case DriverRequestStatus.approved:
            return "default";
        case DriverRequestStatus.pending:
            return "secondary";
        case DriverRequestStatus.rejected:
            return "destructive";
        case DriverRequestStatus.withdrawn:
            return "outline";
        default:
            return "secondary";
    }
};



const ViewDriverApplication = () => {
    const client = useQueryClient();
    const { applicationId } = useParams();

    const request = useQuery({
        queryKey: ["application", applicationId],
        queryFn: () => api.driver.getApplicationById(applicationId!),
    });

    const approve = useMutation({
        mutationFn: () => api.driver.approveApplicationById(applicationId!),
        onSuccess: () => client.invalidateQueries({ queryKey: ["application"] })
    });

    const reject = useMutation({
        mutationFn: (reason: string) => api.driver.denyApplicationById(applicationId!, reason),
        onSuccess: () => client.invalidateQueries({ queryKey: ["application"] })
    });

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className='text-2xl mb-4'>Driver Application</CardTitle>
                <CardDescription>
                    <div>
                        Request ID:
                        <span className="ml-1 font-mono text-xs">
                            {request.data?.id ?? "-"}
                        </span>
                    </div>
                    <div className='mt-2'>
                        <span>Status:</span>
                        <Badge variant={getStatusVariant(request.data?.status)} className="ml-2 align-middle">
                            {request.data?.status ?? "Unknown"}
                        </Badge>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <section>
                    <h3 className="text-lg font-semibold mb-3">Applicant Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="User ID" value={request.data?.user_id ?? "-"} />
                        <InfoItem label="NIC Number" value={request.data?.nic_no ?? "-"} />
                        <InfoItem label="Driver License" value={request.data?.driver_license ?? "-"} />
                    </div>
                </section>

                <Separator />

                <section>
                    <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                        <InfoItem label="Vehicle Number" value={request.data?.vehicle_number ?? "-"} />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Vehicle Type</p>
                            <Badge variant="outline">{request.data?.vehicle_type ?? "Unknown"}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Vehicle Image</p>
                            <Avatar className="h-24 w-24 rounded-md border">
                                <AvatarImage src={request.data?.vehicle_image} alt={`Vehicle ${request.data?.vehicle_number ?? ""}`} />
                                <AvatarFallback>IMG</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </section>

                <Separator />

                <section>
                    <h3 className="text-lg font-semibold mb-3">Request History & Admin</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {request.data?.admin_remark && (
                            <InfoItem label="Admin Remark" value={request.data?.admin_remark} fullWidth />
                        )}
                        {request.data?.handled_by && (
                            <InfoItem label="Handled By (Admin ID)" value={request.data?.handled_by} />
                        )}
                        <InfoItem label="Created At" value={formatDate(request.data?.created_at)} />
                        <InfoItem label="Last Updated At" value={formatDate(request.data?.updated_at)} />
                    </div>
                </section>

            </CardContent>
            <CardFooter>
                <Button disabled={!!request.data?.handled_by} onClick={() => approve.mutate()}>Approve</Button>
                <Button disabled={!!request.data?.handled_by} onClick={() => reject.mutate("Rejected")} variant="destructive" className="ml-2">Reject</Button>
            </CardFooter>
        </Card>
    );
};

export default ViewDriverApplication;

interface InfoItemProps {
    label: string;
    value?: string;
    fullWidth?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className={`text-sm`}>
            {value}
        </p>
    </div>
);