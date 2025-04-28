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
import MyMenuManagement from './pages/MyMenuManagement';
import RestaurantDetails from './pages/RestaurantDetails';

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
      { path: "/dashboard/menu/:restaurantId", element: <MyMenuManagement /> },
      { path: "/dashboard/restaurant/:restaurantId", element: <RestaurantDetails /> }
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
