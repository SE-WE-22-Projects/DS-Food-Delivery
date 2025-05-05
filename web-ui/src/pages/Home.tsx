import Welcome from "@/components/home/Welcome"
import Features from "@/components/home/Features"
import OrderProcess from "@/components/home/OrderProcess"
import FeaturedRestaurants from "@/components/home/FeaturedRestaurants"

const HomePage = () => {
    return (
        <main className="flex-1">
            <Welcome className="bg-gradient-to-br from-orange-200 to-gray-200 min-h-[95vh]" />
            <Features className=" bg-gradient-to-b from-gray-50 to-orange-50" />
            <FeaturedRestaurants className="from-orange-50 to-amber-50 bg-gradient-to-b" />
            <OrderProcess className="from-amber-50 to-orange-100 bg-gradient-to-b" />
        </main >
    )
}

export default HomePage;


