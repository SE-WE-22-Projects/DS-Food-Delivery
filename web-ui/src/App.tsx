import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { Toaster } from 'react-hot-toast';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import Checkout from './pages/Checkout';
import Restaurants from './pages/Restaurants';
import AboutUs from './pages/AboutUs';
import MenuDetails from './pages/MenuDetails';
import ViewOrder from './components/order/Order';

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
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
