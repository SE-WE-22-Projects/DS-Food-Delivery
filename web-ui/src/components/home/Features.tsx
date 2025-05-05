import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Flame, ShoppingBag, Star, Clock, MapPin, Truck } from 'lucide-react'

const featureList = [
    { icon: Flame, title: "Hot & Fresh", desc: "Every dish is made fresh and delivered while it's still hot." },
    { icon: ShoppingBag, title: "Diverse Menu", desc: "Explore meals from Indian, Italian, Chinese and more." },
    { icon: Star, title: "Top Rated", desc: "Thousands of satisfied users rate us 5 stars daily." },
    { icon: Clock, title: "Fast Delivery", desc: "Average delivery time under 30 minutes." },
    { icon: MapPin, title: "Live Tracking", desc: "Track your meal live from kitchen to doorstep." },
    { icon: Truck, title: "No Contact Delivery", desc: "Safe and hygienic doorstep delivery options." }
]

const Features = ({ className }: { className?: string }) => {
    return (
        <section className={cn("w-full py-12 md:py-24 lg:py-32", className)}>
            <div className=" px-4 md:px-6 container mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold md:text-4xl">Why Choose QuickEats?</h2>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto mt-6'>
                    {featureList.map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="p-6 bg-orange-100 rounded-xl shadow hover:shadow-md text-center"
                        >
                            {<item.icon className="mx-auto text-orange-500 w-12 h-12 mb-4" />}
                            <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                            <p>{item.desc}</p>
                        </motion.div>
                    ))}
                </div></div>
        </section>
    )
}

export default Features