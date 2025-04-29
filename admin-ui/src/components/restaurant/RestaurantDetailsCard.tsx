import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, MapPin, Hash, Building } from 'lucide-react';
import { RestaurantType } from '@/api/restaurant';

interface RestaurantDetailsCardProps {
    restaurant: RestaurantType;
}

const formatTime = (hour: number): string => {
    if (hour < 0 || hour > 23) {
        return "Invalid Time"; // Basic validation
    }
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert 0 or 12 to 12
    // Assuming minutes are always 00 for simplicity based on the interface
    return `${formattedHour}:00 ${ampm}`;
};

const RestaurantDetailsCard: React.FC<RestaurantDetailsCardProps> = ({ restaurant }) => {
    const {
        name,
        description,
        registration_no, 
        address,         
        logo,            
        cover,           
        approved,        
        operation_time,
        tags,
    } = restaurant;

    // Format Address from the AddressType object
    const formattedAddress = `${address.no} ${address.street}, ${address.town}, ${address.city}`;
    const postalCode = address.postal_code;

    // Format Operation Time from the OperationTimeType object
    const openTimeFormatted = formatTime(operation_time.open);
    const closeTimeFormatted = formatTime(operation_time.close);

    // Determine badge variant and icon based on approval status
    const StatusIcon = approved ? CheckCircle2 : XCircle;
    const statusText = approved ? 'Approved' : 'Pending Approval';
    const statusBadgeStyle: React.CSSProperties = approved ? {
        backgroundColor: 'hsl(var(--success))',
        color: 'hsl(var(--success-foreground))',
    } : {};


    return (
        <Card className="w-full max-w-2xl overflow-hidden shadow-lg border border-border rounded-lg bg-card">
            {/* Cover Image Section */}
            <div className="relative h-48 w-full">
                <img
                    src={cover} 
                    alt={`${name} cover image`}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.src = `https://placehold.co/600x200/CCCCCC/FFFFFF?text=Cover+Not+Found`)}
                />
                {/* Logo Overlay */}
                <div className="absolute -bottom-10 left-6 ">
                    <Avatar className="h-20 w-20 border-4 border-card shadow-md">
                        <AvatarImage
                            src={logo} 
                            alt={`${name} logo`}
                            className="object-cover"
                            onError={(e) => (e.currentTarget.src = `https://placehold.co/150/EEEEEE/000000?text=Logo`)}
                        />
                        <AvatarFallback className="text-xl bg-muted">
                            {name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Spacer to push content below the overlaid avatar */}
            <div className="pt-12">
                <CardHeader className="pt-4 pb-2 px-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold text-foreground">{name}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mt-1">{description}</CardDescription>
                        </div>
                        <Badge
                            style={statusBadgeStyle}
                            className={`ml-auto flex items-center gap-1 px-2 py-1 text-xs rounded-md ${!approved ? 'bg-destructive text-destructive-foreground' : ''}`} // Use destructive colors directly if not approved
                        >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusText}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {/* Column 1: Address & Reg No */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-medium text-foreground">Address</p>
                                {/* Use formatted address and postal code */}
                                <p className="text-muted-foreground">{formattedAddress}</p>
                                <p className="text-muted-foreground">Postal Code: {postalCode}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-medium text-foreground">Registration No.</p>
                                {/* Use registration_no prop */}
                                <p className="text-muted-foreground">{registration_no}</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Operation Time & Type */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-medium text-foreground">Operating Hours</p>
                                {/* Use formatted times */}
                                <p className="text-muted-foreground">{openTimeFormatted} - {closeTimeFormatted}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-medium text-foreground">Type</p>
                                <p className="text-muted-foreground">Restaurant</p> {/* Placeholder */}
                            </div>
                        </div>
                        {/*
               {tags && tags.length > 0 && (
                 <div className="flex items-start gap-2">
                   <Tag className="h-4 w-4 mt-0.5 text-primary flex-shrink-0"/>
                   <div>
                     <p className="font-medium text-foreground">Tags</p>
                     <div className="flex flex-wrap gap-1 mt-1">
                       {tags.map(tag => (
                         <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                       ))}
                     </div>
                   </div>
                 </div>
               )}
               */}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};