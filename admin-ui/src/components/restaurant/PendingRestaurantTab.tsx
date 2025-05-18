import api from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { BadgeInfo, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';

const PendingRestaurantTab = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['restaurants', 'pending'], queryFn: api.restaurant.getAllPendingRestaurants });
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRestaurants = React.useMemo(() => {
    return query.data?.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${restaurant.address.no}, ${restaurant.address.street}, ${restaurant.address.town}, ${restaurant.address.city}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.postal_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [query.data, searchTerm]);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-800 rounded-lg shadow-md">
        <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
          <input
            type="text"
            placeholder="Search restaurants..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-700 bg-slate-900 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
        </div>
      </div>
      
      <Table>
        <TableCaption>A list of all pending restaurants.</TableCaption>
        <TableHeader className="bg-slate-700/50">
          <TableRow>
            <TableHead className="px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>Address</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>PostalCode</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>Registration No.</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            filteredRestaurants && filteredRestaurants.map(restaurant => {
              return (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell>{`${restaurant.address.no},${restaurant.address.street},${restaurant.address.town},${restaurant.address.city}`}</TableCell>
                  <TableCell>{restaurant.address.postal_code}</TableCell>
                  <TableCell>{restaurant.registration_no}</TableCell>
                  <TableCell className='flex gap-3'>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sky-400 border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300 hover:scale-[1.3]"
                      onClick={() => navigate(`/dashboard/restaurant/${restaurant.id}`)}
                      title="View Restaurant"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-400 border-green-500/50 hover:bg-green-500/10 hover:text-green-300 hover:scale-[1.3]"
                      onClick={() => { handleApproveRestaurant(restaurant.id) }}
                      title="Approve Restaurant"
                    >
                      <BadgeInfo className="h-4 w-4" />
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