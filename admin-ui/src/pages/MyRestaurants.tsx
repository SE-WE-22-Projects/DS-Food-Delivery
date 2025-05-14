import api from '@/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, ShoppingBag, Star, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyRestaurants = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['own_restaurants'], queryFn: api.restaurant.getAllPendingRestaurantsByOwnerId });

  const menuButtonAction = (id: string) => {
    navigate(`../menu/restaurant/${id}`)
  }

  return (
    <>
      {/* page title */}
      <div className="flex justify-center w-full">
        <h1 className="text-4xl lg:text-5xl">My Restaurant Management</h1>
      </div>
      <Table>
        <TableCaption>A list of all own restaurants.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead className='max-w-'>Address</TableHead>
            <TableHead>PostalCode</TableHead>
            <TableHead>Registration No.</TableHead>
            <TableHead className=''>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            query.data && query.data.map(restaurant => {
              return (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell>{`${restaurant.address.no},${restaurant.address.street},${restaurant.address.town},${restaurant.address.city}`}</TableCell>
                  <TableCell>{restaurant.address.postal_code}</TableCell>
                  <TableCell>{restaurant.registration_no}</TableCell>
                  <TableCell className="px-4 py-3.5 text-sm font-medium whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Button
                        type="submit"
                        onClick={() => menuButtonAction(restaurant.id)}
                        className="text-lime-400 border-lime-500/50 hover:bg-lime-500/10 hover:text-lime-300 hover:scale-[1.3]"
                      >
                        <Utensils className="h-4 w-4" />
                      </Button>

                      <Button
                        type="submit"
                        className="text-amber-400 border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300 hover:scale-[1.3]"
                        onClick={() => navigate(`/dashboard/restaurant/update/${restaurant.id}`)}
                        title="Modify Restaurant"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        className="text-sky-400 border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300 hover:scale-[1.3]"
                        onClick={() => navigate(`/dashboard/restaurant/${restaurant.id}`)}
                        title="View Restaurant"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        className="text-orange-400 border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-300 hover:scale-[1.3]"
                        onClick={() => { navigate(`/dashboard/restaurant/orders/${restaurant.id}`) }}
                      >
                        Orders <ShoppingBag />
                      </Button>
                      <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                        onClick={() => { navigate(`/dashboard/restaurant/promotions/${restaurant.id}`) }}
                      >
                        Promotions <Star />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </>
  )
}

export default MyRestaurants