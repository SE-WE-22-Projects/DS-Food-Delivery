import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { sidebarData } from '@/lib/sidebarData';
import { Outlet } from 'react-router-dom';



const MainLayout = () => {
  return (
      <SidebarProvider>
          <AppSidebar props={sidebarData} />
          <main className='grow mx-20 my-10'>
              <SidebarTrigger />
              <Outlet/>
          </main>
      </SidebarProvider>
  )
}

export default MainLayout