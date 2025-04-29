import api from '@/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, ShoppingBag, Star } from 'lucide-react';
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
                  <TableCell className='flex gap-3'>
                    <Button type="submit" onClick={() => menuButtonAction(restaurant.id)}>
                      Menu
                    </Button>
                    <Button type="submit" className="bg-yellow-400 hover:bg-amber-600"
                      onClick={() => navigate(`/dashboard/restaurant/update/${restaurant.id}`)}
                    >
                      Modify {<Pencil />}
                    </Button>

                    <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                      onClick={() => { navigate(`/dashboard/restaurant/${restaurant.id}`) }}
                    >
                      View <Eye />
                    </Button>
                    <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                      onClick={() => { navigate(`/dashboard/restaurant/orders/${restaurant.id}`) }}
                    >
                      Orders <ShoppingBag />
                    </Button>
                    <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                      onClick={() => { navigate(`/dashboard/restaurant/promotions/${restaurant.id}`) }}
                    >
                      Promotions <Star />
                    </Button>
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