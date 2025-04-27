import api from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const AllRestaurantTab = () => {
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
                  <TableCell>{ }</TableCell>
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