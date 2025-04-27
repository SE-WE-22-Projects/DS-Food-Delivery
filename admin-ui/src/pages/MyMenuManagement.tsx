import api from '@/api';
import DynamicModal from '@/components/DynamicModal';
import CreateMenuForm from '@/components/restaurant/CreateMenuForm';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, PlusCircle } from 'lucide-react';
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const MyMenuManagement = () => {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();
  const queryMenu = useQuery({ queryKey: ['own_restaurant_menu'], queryFn: ()=>api.menu.getRestaurantMenuItems(restaurantId!) });
  const queryRestaurant = useQuery({ queryKey: ['own_restaurant'], queryFn: ()=>api.restaurant.getRestaurantById(restaurantId!) });

  // create modal handling 
  const [createOpen,setCreateOpen] = useState<boolean>(false);

  const handleAddMenuButton= ()=> {
    setCreateOpen(true);
  }


  return (
    <>
      <div className="flex justify-center w-full">
        <h1 className="text-4xl lg:text-5xl">My Menu Management</h1>
      </div>
      <div className="flex justify-center w-full my-5">
        <h1 className="text-4xl lg:text-2xl">Restaurant Name: {queryRestaurant.data?.name}</h1>
      </div>
      <div className='w-full flex justify-end'>
        <Button onClick={handleAddMenuButton}>
          Add Menu Item {<PlusCircle/>}
        </Button>
      </div>
      <Table>
        <TableCaption>A list of all own restaurant Menu Items.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead className='max-w-'>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className=''>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            queryMenu.data && queryMenu.data.map(menu => {
              return (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>{menu.description}</TableCell>
                  <TableCell>{menu.price}</TableCell>
                  <TableCell>{
                    <>
                      <Button type="submit" className="bg-yellow-400 hover:bg-amber-600">
                        Modify {<Pencil/>}
                      </Button>
                    </>
                  }</TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
      {/* Create Modal */}
      <DynamicModal open={createOpen} setOpen={setCreateOpen} title='Create Menu Item'>
        <CreateMenuForm restaurant_id={restaurantId!} setOpen={setCreateOpen}/>
      </DynamicModal>
    </>
  )
}

export default MyMenuManagement