import api from '@/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyRestaurants = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['own_restaurants'], queryFn: api.restaurant.getAllPendingRestaurantsByOwnerId });

  const menuButtonAction = (id: string)=> {
    navigate(`../menu/${id}`)
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
                  <TableCell>{
                    <>
                      <Button type="submit" className='mx-3' onClick={()=>menuButtonAction(restaurant.id)}>
                        Menu
                      </Button>
                      <Button  type="submit" className="bg-yellow-400 hover:bg-amber-600">
                        Modify {<Pencil />}
                      </Button>
                    </>
                  }</TableCell>
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