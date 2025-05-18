import api from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ApprovedRestaurantTab = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const query = useQuery({ queryKey: ['restaurants', 'approved'], queryFn: api.restaurant.getAllApprovedRestaurants });

  const filteredRestaurants = React.useMemo(() => {
    return query.data?.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${restaurant.address.no}, ${restaurant.address.street}, ${restaurant.address.town}, ${restaurant.address.city}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.postal_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [query.data, searchTerm]);

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

      <Table className="min-w-full">
        <TableCaption>A list of all approved restaurants.</TableCaption>
        <TableHeader className="bg-slate-700/50">
          <TableRow>
            <TableHead className="px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>Address</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>PostalCode</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>Registration No.</TableHead>
            <TableHead className='px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-700">
          {
            filteredRestaurants && filteredRestaurants.map((restaurant, index) => {
              return (
                <motion.tr
                  key={restaurant.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="hover:bg-slate-700/30 transition-colors duration-150 ease-in-out"
                >
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell>{`${restaurant.address.no},${restaurant.address.street},${restaurant.address.town},${restaurant.address.city}`}</TableCell>
                  <TableCell>{restaurant.address.postal_code}</TableCell>
                  <TableCell>{restaurant.registration_no}</TableCell>
                  <TableCell className="px-4 py-3.5 text-sm font-medium whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sky-400 border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300"
                        onClick={() => navigate(`/dashboard/restaurant/${restaurant.id}`)}
                        title="View Restaurant"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              )
            })
          }
        </TableBody>
      </Table>
    </>
  )
}

export default ApprovedRestaurantTab