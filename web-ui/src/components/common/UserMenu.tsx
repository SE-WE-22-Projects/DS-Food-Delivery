import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuGroup } from '@/components/ui/dropdown-menu'
import { LogOut, Settings, ShoppingBag, UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router';
import useUserStore from '@/store/user';

function UserMenu() {
    const user = useUserStore();
    const navigate = useNavigate()

    const handleLogout = async () => {
        user.clear();
        toast.success("Logged out successfully")
        navigate("/")
    }

    if (!user.loggedIn) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className='md:w-fit w-full justify-start'>
                <Button variant="ghost" className="relative h-8 md:w-fit w-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user.profile_image || ""} alt={user.user.name} />
                        <AvatarFallback>{user.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {user.user.name}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <Link to="/order">
                        <DropdownMenuItem>
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            <span>My Orders</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserMenu