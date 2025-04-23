import { AppSidebar, AppSidebarProps } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Home, User, Settings } from 'lucide-react';

const sidebarData: AppSidebarProps[] = [
    {
        groupTitle: "Application",
        itemList: [
            { itemName: "Dashboard", url: "/dashboard", icon: Home },
            { itemName: "Profile", url: "/profile", icon: User },
        ]
    },
    {
        groupTitle: "Settings",
        itemList: [
            { itemName: "Preferences", url: "/settings", icon: Settings },
        ]
    }
];

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