import api from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { AlertTriangle, ChevronDown, ChevronUp, Eye, Filter, Loader2, Pencil, PlusCircle, Search, Trash2, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { RestaurantType } from '@/api/restaurant';
import toast from 'react-hot-toast';

const AllRestaurantTab = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [restaurantToDelete, setRestaurantToDelete] = useState<RestaurantType|null>(null); 

  const { data: restaurants, isLoading, isError, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: api.restaurant.getAllRestaurants,
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: api.restaurant.deleteRestaurantById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success("Successfully deleted restaurant.");
      console.log("Restaurant deleted successfully!");
      setRestaurantToDelete(null); 
    },
    onError: (error) => {
      toast.error("Failed to delete restaurant.");
      console.error("Error deleting restaurant:", error);
      setRestaurantToDelete(null); 
    }
  });

  const sortedRestaurants = React.useMemo(() => {
    if (!restaurants) return [];
    let sortableItems = [...restaurants];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [restaurants, sortConfig]);


  const filteredRestaurants = React.useMemo(() => {
    return sortedRestaurants
      .filter(restaurant => {
        if (filterStatus === 'all') return true;
        return filterStatus === 'approved' ? restaurant.approved : !restaurant.approved;
      })
      .filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${restaurant.address.no}, ${restaurant.address.street}, ${restaurant.address.town}, ${restaurant.address.city}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.address.postal_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [sortedRestaurants, searchTerm, filterStatus]);


  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleDeleteClick = (restaurant) => {
    setRestaurantToDelete(restaurant);
  };


  const confirmDelete = () => {
    if (restaurantToDelete) {
      deleteRestaurantMutation.mutate(restaurantToDelete.id);
    }
  };


  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05, 
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="h-4 w-4 opacity-30 hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-slate-50">
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

        <div className="flex items-center gap-3">
          
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
          <p className="ml-3 text-lg text-slate-300">Loading restaurants...</p>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-800 p-6 rounded-lg shadow-lg">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong.</h3>
          <p className="text-slate-400 mb-1">We couldn't load the restaurant data.</p>
          <p className="text-xs text-slate-500">Error: {error?.message || 'Unknown error'}</p>
          <Button
            onClick={() => queryClient.refetchQueries({ queryKey: ['restaurants'] })}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Table Display */}
      {!isLoading && !isError && restaurants && (
        <div className="overflow-x-auto bg-slate-800 shadow-xl rounded-lg">
          <Table className="min-w-full">
            <TableCaption className="py-4 text-sm text-slate-400">
              A list of all restaurants. {filteredRestaurants.length > 0 ? `Showing ${filteredRestaurants.length} of ${restaurants.length} total.` : 'No restaurants match your criteria.'}
            </TableCaption>
            <TableHeader className="bg-slate-700/50">
              <TableRow className="border-b border-slate-700">
                {['Name', 'Address', 'Postal Code', 'Status', 'Actions'].map((header, idx) => {
                  const key = header.toLowerCase().replace(/\s+/g, '');
                  return (
                    <TableHead
                      key={header}
                      className={`px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider ${['name'].includes(key) ? 'cursor-pointer hover:bg-slate-600/50 transition-colors' : ''}`}
                      onClick={() => ['name'].includes(key) && requestSort(key)}
                    >
                      <div className="flex items-center gap-1">
                        {header}
                        {['name', 'cuisine', 'rating'].includes(key) && getSortIcon(key)}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-700">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant, index) => (
                  <motion.tr
                    key={restaurant.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="hover:bg-slate-700/30 transition-colors duration-150 ease-in-out"
                  >
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">{restaurant.name}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm text-slate-300 max-w-xs truncate">
                      {`${restaurant.address.no}, ${restaurant.address.street}, ${restaurant.address.town}, ${restaurant.address.city}`}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm text-slate-300 whitespace-nowrap">{restaurant.address.postal_code}</TableCell>
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${restaurant.approved
                        ? 'bg-green-700/30 text-green-300 border border-green-600'
                        : 'bg-yellow-700/30 text-yellow-300 border border-yellow-600'
                        }`}>
                        {restaurant.approved ? "Approved" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center space-x-3">
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
                          className="text-amber-400 border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300 hover:scale-[1.3]"
                          onClick={() => navigate(`/dashboard/restaurant/update/${restaurant.id}`)}
                          title="Modify Restaurant"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-lime-400 border-lime-500/50 hover:bg-lime-500/10 hover:text-lime-300 hover:scale-[1.3]"
                          onClick={() => navigate(`/dashboard/menu/restaurant/${restaurant.id}`)}
                          title="Manage Menu"
                        >
                          <Utensils className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-500/50 hover:bg-red-500/10 hover:text-red-300 hover:scale-[1.3]"
                          onClick={() => handleDeleteClick(restaurant)}
                          title="Delete Restaurant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="h-12 w-12 text-slate-500 mb-3" />
                      <p className="text-lg font-medium text-slate-300">No Restaurants Found</p>
                      <p className="text-sm text-slate-400">
                        {searchTerm ? "Try adjusting your search or filter criteria." : "There are no restaurants to display yet."}
                      </p>
                      
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {restaurantToDelete && (
        <Dialog open={!!restaurantToDelete} onOpenChange={() => setRestaurantToDelete(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-400">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-slate-400 pt-2">
                Are you sure you want to delete the restaurant "{restaurantToDelete.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 sm:justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700 text-slate-300">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
                disabled={deleteRestaurantMutation.isPending}
              >
                {deleteRestaurantMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AllRestaurantTab