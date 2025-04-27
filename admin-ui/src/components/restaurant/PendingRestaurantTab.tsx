import api from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const PendingRestaurantTab = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['restaurants', 'pending'], queryFn: api.restaurant.getAllPendingRestaurants });

  return (
    <>
      PendingRestaurantTab
      <Table>
        <TableCaption>A list of all pending restaurants.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead className='max-w-'>Address</TableHead>
            <TableHead>PostalCode</TableHead>
            <TableHead>Registration No.</TableHead>
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
                  <TableCell>{restaurant.registration_no}</TableCell>
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

export default PendingRestaurantTab