import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { sidebarData } from '@/lib/sidebarData';



const MainLayout = () => {
  return (
      <SidebarProvider>
          <AppSidebar props={sidebarData} />
          <main>
              <SidebarTrigger />
              <h1>Hello</h1>
          </main>
      </SidebarProvider>
  )
}

export default MainLayout