import api from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllRestaurantTab = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['restaurants'], queryFn: api.restaurant.getAllRestaurants });

  const deleteRestaurant = useMutation({
    mutationFn: api.restaurant.deleteRestaurantById,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurants'] }) },
  })


  return (
    <>
      <div>AllRestaurantTab</div>

      <Table>
        <TableCaption>A list of all restaurants.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead className='max-w-'>Address</TableHead>
            <TableHead>PostalCode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
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
                  <TableCell>{restaurant.approved ? "Approved" : "Pending"}</TableCell>
                  <TableCell className='flex gap-3'>
                    <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                      onClick={() => { navigate(`/dashboard/restaurant/${restaurant.id}`) }}
                    >
                      View <Eye />
                    </Button>
                    <Button type="submit" className="bg-yellow-400 hover:bg-amber-600"
                      onClick={() => navigate(`/dashboard/restaurant/update/${restaurant.id}`)}
                    >
                      Modify {<Pencil />}
                    </Button>
                    <Button type="submit" onClick={() => navigate(`/dashboard/menu/restaurant/${restaurant.id}`)}>
                      Menu
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

export default AllRestaurantTab