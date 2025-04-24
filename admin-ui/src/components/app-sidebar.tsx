import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

interface SidebarItem {
    itemName: string;
    url: string;
    icon: React.ElementType;
}

export interface AppSidebarProps {
    groupTitle: string;
    itemList: SidebarItem[];
}

export function AppSidebar({ props }: { props: AppSidebarProps[] }) {
    return (
        <Sidebar>
            <SidebarHeader>Delivery App</SidebarHeader>
            <SidebarContent>
                {props.map((group, groupIdx) => (
                    <SidebarGroup key={groupIdx}>
                        <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.itemList.map((item, itemIdx) => {
                                    const Icon = item.icon;
                                    return (
                                        <SidebarMenuItem key={itemIdx}>
                                            <SidebarMenuButton asChild>
                                                <a href={item.url} className="flex items-center gap-2">
                                                    <Icon />
                                                    <span>{item.itemName}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>Sidebar footer</SidebarFooter>
        </Sidebar>
    );
}
