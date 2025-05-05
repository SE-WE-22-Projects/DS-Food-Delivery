import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, MapPin } from 'lucide-react';
import { RestaurantType } from '@/api/restaurant';
import { convertFromNs } from '@/lib/timeUtil';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

interface Props {
    restaurant: RestaurantType;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
    const navigate = useNavigate();
    const openTime = convertFromNs(restaurant.operation_time.open);
    const closeTime = convertFromNs(restaurant.operation_time.close);
    const fullAddress = `${restaurant.address.street}, ${restaurant.address.town}`;

    // Random rating for demo purposes (in a real app, this would come from data)
    const rating = (Math.random() * 2 + 3).toFixed(1); // Random between 3.0 and 5.0

    return (
        <Card className="food-card rounded-2xl overflow-hidden border-2 border-border bg-card">
            {/* Cover Image with Gradient Overlay */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img
                    src={restaurant.cover}
                    alt={`${restaurant.name} cover`}
                    className="object-cover w-full h-full transform hover:scale-110 transition-transform duration-700"
                />
                {/* Tags positioned over the image */}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 z-20">
                    {restaurant.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                            key={index}
                            className="bg-cyan-400 p-1"
                        >
                            {tag}
                        </Badge>
                    ))}
                    {restaurant.tags.length > 3 && (
                        <Badge className="bg-black/50 text-white backdrop-blur-sm rounded-full text-xs">
                            +{restaurant.tags.length - 3}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Logo and Name with Rating */}
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className='w-14 h-14 rounded-full overflow-clip'>
                            <img
                                src={restaurant.logo}
                                alt={`${restaurant.name} logo`}
                                className="w-14 h-14 rounded-full border-2 border-accent object-cover shadow-md"
                            />
                        </div>
                        <div className="absolute z-10 -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-orange-300 text-orange-600">
                            {rating}
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-foreground">{restaurant.name}</CardTitle>
                        <div className="flex items-center mt-1 text-orange-600">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(Number(rating)) ? 'star-rating fill-current' : 'text-muted stroke-current'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Description and Info */}
            <CardContent className="px-4 pb-4 space-y-3">
                <p className="text-sm text-foreground line-clamp-2">{restaurant.description}</p>

                {/* Address with Icon */}
                <div className="flex items-start gap-2 text-xs text-foreground/70">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-foreground/70" />
                    <span className="italic line-clamp-2">{fullAddress}</span>
                </div>


                {/* Operating Hours with Styled Box */}
                <div className="flex items-center gap-2 text-xs font-medium p-2 rounded-lg bg-primary/10 text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{openTime} - {closeTime}</span>
                </div>


                {/* Action Button */}
                <Button
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    className="btn-hover-effect w-full mt-2 py-2 px-4 rounded-xl text-primary-foreground font-medium bg-orange-500 hover:bg-orange-600"
                >
                    View Restaurant
                </Button>
            </CardContent>
        </Card>
    );
};

export default RestaurantCard;