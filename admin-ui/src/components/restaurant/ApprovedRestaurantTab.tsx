import api from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApprovedRestaurantTab = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['restaurants', 'approved'], queryFn: api.restaurant.getAllApprovedRestaurants });
  return (
    <>
      ApprovedRestaurantTab
      <Table>
        <TableCaption>A list of all restaurants.</TableCaption>
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
                  <TableCell>
                    <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                      onClick={() => { navigate(`/dashboard/restaurant/${restaurant.id}`) }}
                    >
                      View <Eye />
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

export default ApprovedRestaurantTab