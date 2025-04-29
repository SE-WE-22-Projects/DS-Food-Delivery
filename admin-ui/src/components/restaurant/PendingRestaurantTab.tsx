import api from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { BadgeInfo, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PendingRestaurantTab = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['restaurants', 'pending'], queryFn: api.restaurant.getAllPendingRestaurants });

  const approveRestaurant = useMutation({
    mutationFn: (restaurantId: string) => api.restaurant.approveRestaurantById(restaurantId, true),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurants'] }) }
  })

  const handleApproveRestaurant = async (restaurantId: string) => {
    try {
      await approveRestaurant.mutateAsync(restaurantId);
      toast.success("Successfully approved restaurant.");
    } catch (error) {
      toast.error("Failed to approve restaurant.");
      console.error(error);
    }
  }

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
                  <TableCell className='flex gap-3'>
                    <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                      onClick={() => { navigate(`/dashboard/restaurant/${restaurant.id}`) }}
                    >
                      View <Eye />
                    </Button>
                    <Button className='bg-green-400 hover:bg-green-500 hover:scale-[1.03]'
                      onClick={() => { handleApproveRestaurant(restaurant.id) }}
                    >
                      Approve <BadgeInfo />
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

export default PendingRestaurantTab