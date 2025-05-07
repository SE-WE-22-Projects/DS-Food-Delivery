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
import NewLayout from './layout/NewLayout';
import Order2 from './pages/Order2';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient(
  {
    defaultOptions: {
      queries: {
        experimental_prefetchInRender: true,
      },
    },
  }
);

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
          path: "/order",
          element: <Orders />
        },
        {
          path: "/order/:orderId",
          element: <Order2 />
        },
        {
          path: "/order-old/:orderId",
          element: <ViewOrder />
        },
        {
          path: "*",
          element: <NotFound />,
        }
      ]
    },

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
