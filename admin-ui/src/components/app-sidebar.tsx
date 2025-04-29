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
import useUserStore from "@/store/user";
import { ReactElement } from "react";
import { Link } from "react-router-dom";

interface SidebarItem {
    itemName?: string;
    url: string;
    icon?: React.ElementType;
    element: ReactElement
}

export interface AppSidebarProps {
    groupTitle: string;
    role: 'admin' | "driver" | "owner",
    itemList: SidebarItem[];
}

export function AppSidebar({ props }: { props: AppSidebarProps[] }) {
    const state = useUserStore()

    return (
        <Sidebar>
            <SidebarHeader>QuickEats</SidebarHeader>
            <SidebarContent>
                {props.filter(e => e.role == state.user).map((group, groupIdx) => (
                    <SidebarGroup key={groupIdx}>
                        <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.itemList.filter((i) => !!i.itemName).map((item, itemIdx) => {
                                    const Icon = item.icon!;
                                    return (
                                        <SidebarMenuItem key={itemIdx}>
                                            <SidebarMenuButton asChild>
                                                <Link to={item.url} className="flex items-center gap-2">
                                                    <Icon />
                                                    <span>{item.itemName}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            {/* <SidebarFooter>Sidebar footer</SidebarFooter> */}
        </Sidebar>
    );
}
