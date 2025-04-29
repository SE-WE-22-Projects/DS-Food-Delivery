import './App.css'
import MainLayout from './layout/MainLayout'
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { sidebarData } from './lib/sidebarData';
import Login from './pages/Login';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import MenuManagement from './pages/MenuManagement';
import RestaurantDetails from './pages/RestaurantDetails';
import UpdateRestaurant from './pages/UpdateRestaurant';
import MenuDetails from './pages/MenuDetails';

const queryClient = new QueryClient();

function App() {
  const routes: RouteObject[] = [
    {
      element: <Login />,
      index: true
    },
    {
      path: "/dashboard/",
      element: <MainLayout />,
      children: [...sidebarData.map(e =>
        e.itemList.map(item => {
          return { element: item.element, path: item.url }
        })
      ).flat(),
      { path: "/dashboard/menu/restaurant/:restaurantId", element: <MenuManagement /> },
      { path: "/dashboard/restaurant/:restaurantId", element: <RestaurantDetails /> },
      { path: "/dashboard/menu/:menuId", element: <MenuDetails /> },
      { path: "/dashboard/restaurant/update/:restaurantId", element: <UpdateRestaurant /> },
      ]
    }
  ];

  const router = createBrowserRouter(routes);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
      <Toaster />
    </>
  )
}

export default App
