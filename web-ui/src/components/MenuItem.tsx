import { MenuItemType } from '@/api/menu'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button';
import { useCartDialog } from './cart/CartDialog';

const fallbackImage = ""

const MenuItem = ({ item }: { item: MenuItemType }) => {
    const cartDialog = useCartDialog();

    let image = item.image ?? "";
    if (!image.startsWith("/")) {
        image = fallbackImage;
    }

    return (
        <>
            <Card className='mx-2 my-2 w-2xs pt-0'>
                <CardHeader className='px-0 pt-0'>
                    <CardDescription className='w-2xs h-[160px] bg-cover bg-no-repeat rounded-t-xl' style={{ backgroundImage: `url(${image})` }} />
                    <CardTitle className='px-2'>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {item.description}
                </CardContent>
                <CardFooter>
                    <Button className='ml-auto' onClick={() => cartDialog(item)} >Add to cart</Button>
                </CardFooter>
            </Card>
        </>

    )
}

export default MenuItem