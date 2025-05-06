import { MenuItemType } from "@/api/menu";
import getImageUrl from "@/lib/images";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const MenuItem = ({ item }: { item: MenuItemType }) => {
    return (
        <div className="flex gap-3 group bg-card border p-4 rounded-md">
            <div className="w-24 h-24 flex-shrink-0">
                <img
                    src={getImageUrl(item.image, { width: 96, height: 96 })}
                    width={96}
                    height={96}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md"
                />
            </div>
            <div className="flex-1">
                <div className="font-medium group-hover:text-orange-500 transition-colors">{item.name}</div>
                <div className={cn("text-sm text-muted-foreground mt-1 max-w-[50ch] line-clamp-2")}>{item.description}</div>
                <div className="mt-2 flex items-center justify-between">
                    <div className="font-medium">Rs {item.price.toFixed(2)}</div>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">Add</Button>
                </div>
            </div>

        </div>
    )
}

export default MenuItem;