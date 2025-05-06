import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { Button } from '../ui/button'
import food from '@/assets/land_food.png'
import pizza from '@/assets/landing/pizza.webp'
import burger from "@/assets/landing/burger.webp"
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const texts = [
    { name: "Food" },
    { name: "Burgers", image: burger },
    { name: "Pizza", image: pizza },
    { name: "Pasta", image: food }
]

const imageSize = "md:w-sm md:h-[var(--container-sm)] w-xs h-[var(--container-xs)]"

const Welcome = ({ className }: { className?: string }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setTimeout(() => {
            let newIndex = 0;
            while (newIndex === 0 || newIndex == index) {
                newIndex = Math.floor(Math.random() * texts.length)
            }

            setIndex(newIndex);
        }, 2500);

        return () => clearTimeout(interval);
    }, [index]);

    const current = texts[index % texts.length]

    return (
        <section className={cn("w-full py-12 md:py-24 lg:py-32", className)}>
            <div className="flex md:flex-row flex-col w-fit mx-auto">
                <div className="flex flex-col w justify-center space-y-4 md:mx-12">
                    <motion.h1 className="text-orange-500 hover:text-orange-600 hover:scale-105 text-4xl font-bold sm:text-6xl xl:text-7xl/none mb-12 mx-auto md:mx-0">
                        <MapPin className="md:h-16 md:w-16 h-12 w-12 mr-5 inline-block" />
                        QuickEats
                    </motion.h1>
                    <h1 className="text-3xl font-bold  sm:text-5xl xl:text-6xl/none mt-auto md:max-w-full max-w-[80vw] md:mx-0 mx-auto">
                        <span className="block">
                            Delicious
                            &nbsp;
                            <AnimatePresence>
                                <motion.span
                                    key={current.name}
                                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                    animate={{ opacity: 100, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inline-block text-orange-500 hover:text-orange-600 hover:scale-105 z-10">
                                    {current.name}
                                </motion.span>
                            </AnimatePresence>

                        </span>
                        <span>
                            Delivered To Your Door
                        </span>
                        <p className="text-[1rem] font-normal max-w-[60vw] mt-6">
                            Order from your favorite restaurants and get food delivered in minutes.
                        </p>
                    </h1>
                    <div className="mt-10 md:block hidden">
                        <Link to="/restaurant">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:scale-105" size="lg">
                                Order Now
                                <ArrowRight />
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="md:mx-0 mx-auto">
                    <motion.div initial={{ x: 120, opacity: 0, rotate: 90, }}
                        animate={{ x: 0, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.8 }}
                        className={cn(imageSize, "flex")}
                    >
                        <AnimatePresence>
                            <motion.img
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 100, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                key={current.name}
                                src={current.image ?? food}
                                alt="Delicious Food"
                                className={cn(imageSize, " absolute z-0")}
                                layout
                            />
                        </AnimatePresence>
                    </motion.div>

                </div>
                <div className="md:hidden mx-auto mt-4">
                    <Link to="/restaurant">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:scale-105" size="lg">
                            Order Now
                            <ArrowRight />
                        </Button>
                    </Link>
                </div>
            </div >
        </section >

    )
}

export default Welcome