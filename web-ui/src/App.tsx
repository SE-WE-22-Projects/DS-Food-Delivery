import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { Toaster } from 'react-hot-toast';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Restaurant from './pages/Restaurant';
import Checkout from './pages/Checkout';
import Restaurants from './pages/Restaurants';
import AboutUs from './pages/AboutUs';
import MenuDetails from './pages/MenuDetails';
import ViewOrder from './components/order/Order';
import Orders from './pages/Orders';
import Restaurant2 from './pages/Restaurant2';
import NewLayout from './layout/NewLayout';
import Order2 from './pages/Order2';
import Home from './pages/Home';

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <NewLayout />,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: "/restaurant/",
          element: <Restaurants />
        },
        {
          path: "/restaurant/:restaurantId",
          element: <Restaurant />
        },
        {
          path: "/restaurant2/:restaurantId",
          element: <Restaurant2 />
        },
        {
          path: "/checkout",
          element: <Checkout />
        },
        {
          path: "/about",
          element: <AboutUs />
        },
        {
          path: "/menu/:menuId",
          element: <MenuDetails />
        },
        {
          path: "/orders",
          element: <Orders />
        },
        {
          path: "/order2/:orderId",
          element: <Order2 />
        },
        {
          path: "/order/:orderId",
          element: <ViewOrder />
        },
      ]
    }
  ])

  return (
    <>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  )
}

export default App
