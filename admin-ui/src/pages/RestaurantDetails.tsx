import api from '@/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { convertFromNs } from '@/lib/timeUtil';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building, CheckCircle2, Clock, Hash, MapPin, XCircle } from 'lucide-react';
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const RestaurantDetails = () => {
    const navigate = useNavigate();
    const {restaurantId} = useParams();

    const query = useQuery({ queryKey: ['restaurant'], queryFn: ()=>api.restaurant.getRestaurantById(restaurantId!) });

    // Format address and time
    const formattedAddress = `${query.data?.address.no} ${query.data?.address.street}, ${query.data?.address.town}, ${query.data?.address.city}`;
    const postalCode = query.data?.address.postal_code;
    const openTimeFormatted = convertFromNs(query.data?.operation_time.open!);
    const closeTimeFormatted = convertFromNs(query.data?.operation_time.close!);

    const StatusIcon = query.data?.approved ? CheckCircle2 : XCircle;
    const statusText = query.data?.approved ? 'Approved' : 'Pending Approval';
    const statusBadgeStyle: React.CSSProperties = query.data?.approved ? {
        backgroundColor: 'hsl(var(--success))',
        color: 'hsl(var(--success-foreground))',
    } : {};

  return (
      <div className="bg-background min-h-screen">
          <div className="flex justify-center w-full mb-5">
              <h1 className="text-4xl lg:text-4xl">Restaurant Details</h1>
          </div>
          {/* 1. Cover Image Section */}
          <div className="relative h-64 md:h-80 w-full bg-muted">
              <img
                  src={query.data?.cover}
                  alt={`${query.data?.name} cover image`}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.src = `https://placehold.co/1200x320/CCCCCC/FFFFFF?text=Cover+Not+Found`)}
              />
          </div>

          {/* 2. Main Content Section */}
          <div className="container mx-auto px-4 -mt-16 md:-mt-20 relative pb-16">
              <div className="bg-card p-6 md:p-8 rounded-lg shadow-xl border border-border">
                  {/* Header: Logo, Name, Status, Description */}
                  <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                      {/* Logo */}
                      <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md flex-shrink-0 -mt-12 md:-mt-16 bg-muted">
                          <AvatarImage
                              src={query.data?.logo}
                              alt={`${query.data?.name} logo`}
                              className="object-cover"
                              onError={(e) => (e.currentTarget.src = `https://placehold.co/128/EEEEEE/000000?text=Logo`)}
                          />
                          <AvatarFallback className="text-3xl">
                              {query.data?.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                      </Avatar>

                      {/* Name, Status, Description */}
                      <div className="flex-grow mt-4 md:mt-0">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{query.data?.name}</h1>
                              <Badge
                                  style={statusBadgeStyle}
                                  className={`flex-shrink-0 mt-1 sm:mt-0 flex items-center gap-1 px-3 py-1 text-sm rounded-md ${!query.data?.approved ? 'bg-destructive text-destructive-foreground' : ''}`}
                              >
                                  <StatusIcon className="h-4 w-4" />
                                  {statusText}
                              </Badge>
                          </div>
                          <p className="text-muted-foreground text-base">{query.data?.description}</p>
                      </div>
                  </div>

                  {/* Tags Section */}
                  {query.data?.tags && query.data?.tags.length > 0 && (
                      <div className="mb-6 border-t pt-4">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                              {query.data?.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
                              ))}
                          </div>
                      </div>
                  )}


                  {/* Details Grid Section */}
                  <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                      {/* Column 1 */}
                      <div className="space-y-4">
                          <DetailItem icon={MapPin} label="Address">
                              <p>{formattedAddress}</p>
                              <p>Postal Code: {postalCode}</p>
                          </DetailItem>
                          <DetailItem icon={Hash} label="Registration No.">
                              <p>{query.data?.registration_no}</p>
                          </DetailItem>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-4">
                          <DetailItem icon={Clock} label="Operating Hours">
                              <p>{openTimeFormatted} - {closeTimeFormatted}</p>
                          </DetailItem>
                          <DetailItem icon={Building} label="Type">
                              <p>Restaurant</p> {/* Placeholder or add to data */}
                          </DetailItem>
                      </div>
                  </div>

                  {/* Placeholder for Menu Section or other content */}
                  <div className="border-t mt-8 pt-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">Menu Highlights</h2>
                      <p className="text-muted-foreground">Menu section coming soon...</p>
                      {/* You would typically map over menu items here */}
                      <section className="relative h-[20vh] w-full bg-cover bg-center" style={{ backgroundImage: "url('/images/restaurant-hero.jpg')" }}>
                          <div className="absolute inset-0 bg-black/50" />
                          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
                              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Our Menu</h1>
                              <p className="text-lg md:text-xl mb-6">Explore a variety of dishes crafted to delight your taste buds.</p>
                              <Button
                                  variant="default"
                                  size="lg"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => navigate(`/dashboard/menu/restaurant/${restaurantId}`)}
                              >
                                  Explore Menu
                              </Button>
                          </div>
                      </section>
                  </div>
              </div>
          </div>
      </div>
  )
}

export default RestaurantDetails;

interface DetailItemProps {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
}
const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
            <p className="font-semibold text-foreground mb-0.5">{label}</p>
            <div className="text-muted-foreground">{children}</div>
        </div>
    </div>
);
