import './App.css'
import MainLayout from './layout/MainLayout'
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { sidebarData } from './lib/sidebarData';
import Login from './pages/Login';

function App() {
  const routes: RouteObject[] = [
    {
      element: <Login/>,
      index: true
    },
    {
      path: "/dashboard/",
      element:    <MainLayout />,
      children: sidebarData.map(e => 
        e.itemList.map(item => {
          return { element: item.element,path: item.url}
        })
      ).flat()
    }
  ];

  const router = createBrowserRouter(routes);

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
