import api from '@/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, Pencil, ShoppingBag, Star, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyRestaurants = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['own_restaurants'], queryFn: api.restaurant.getAllPendingRestaurantsByOwnerId });

  const menuButtonAction = (id: string) => {
    navigate(`../menu/restaurant/${id}`)
  }

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
      {/* page title */}
      <div className="flex justify-center w-full">
        <h1 className="text-4xl lg:text-5xl">My Restaurant Management</h1>
      </div>
      <div className="overflow-x-auto bg-slate-800 shadow-xl rounded-lg my-5">
        <Table className="min-w-full">
          <TableCaption className="py-4 text-sm text-slate-400">
            A list of all own restaurants.
          </TableCaption>
          <TableHeader className="bg-slate-700/50">
            <TableRow className="border-b border-slate-700">
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead className='max-w-'>Address</TableHead>
              <TableHead>PostalCode</TableHead>
              <TableHead>Registration No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className=''>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-700">
            {
              query.data && query.data.map((restaurant, index) => {
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
                          className="text-lime-400 border-lime-500/50 hover:bg-lime-500/10 hover:text-lime-300 hover:scale-[1.3]"
                          title="Manage Menu"
                          onClick={() => menuButtonAction(restaurant.id)}
                        >
                          <Utensils className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-400 border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300 hover:scale-[1.3]"
                          title="Modify Restaurant"
                          onClick={() => navigate(`/dashboard/restaurant/update/${restaurant.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          className="text-sky-400 border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300 hover:scale-[1.3]"
                          onClick={() => navigate(`/dashboard/restaurant/${restaurant.id}`)}
                          title="View Restaurant"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          className="text-orange-400 border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-300 hover:scale-[1.3]"
                          onClick={() => { navigate(`/dashboard/restaurant/orders/${restaurant.id}`) }}
                        >
                          Orders <ShoppingBag />
                        </Button>
                        <Button className='bg-orange-400 hover:bg-orange-500 hover:scale-[1.03]'
                          onClick={() => { navigate(`/dashboard/restaurant/promotions/${restaurant.id}`) }}
                        >
                          Promotions <Star />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>

                )
              })
            }
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default MyRestaurants