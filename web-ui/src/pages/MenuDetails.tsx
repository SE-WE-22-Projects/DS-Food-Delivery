import api from '@/api';
import CartDialog, { useCartDialog } from '@/components/cart/CartDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Info } from 'lucide-react';
import { useParams } from 'react-router-dom';

const MenuDetails = () => {
    const { menuId } = useParams();
    const {data} = useQuery({ queryKey: [menuId], queryFn: () => api.menu.getMenuItemById(menuId!) });
    const cartDialog = useCartDialog();
  return (
      <CartDialog>
      <div className="p-6 md:p-10 max-w-5xl mx-auto flex flex-col items-center">
          <div className="flex justify-center w-full mb-5">
              <h1 className="text-4xl lg:text-4xl">Menu Details</h1>
          </div>

          {/* Menu Image */}
          <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg mb-8">
              <img
                  src={data?.image || "https://via.placeholder.com/800x400?text=No+Image"}
                  alt={data?.name}
                  className="w-full h-full object-cover"
              />
          </div>

          {/* Title + Badge */}
          <div className="flex flex-col items-center text-center mb-6 space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {data?.name}
              </h1>

              <Badge
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text- px-4 py-2 rounded-full text-lg"
              >
                  <DollarSign className="h-5 w-5" />
                  ${data?.price.toFixed(2)}
              </Badge>
          </div>

          {/* Description */}
          <div className="bg-muted p-6 rounded-xl shadow-md text-center text-black mb-10 w-full md:w-4/5">
              <div className="flex justify-center mb-4">
                  <Info className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg leading-relaxed">
                  {data?.description}
              </p>
          </div>
          <Button size='lg' onClick={() => cartDialog(data!)} >Add to cart</Button>
      </div>
          
    </CartDialog>
  )
}

export default MenuDetails;