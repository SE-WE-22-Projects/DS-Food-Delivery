import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/button'
import food from '@/assets/land_food.png'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const texts = ["Food", "Burgers", "Pizza"]

const TextSwitcher = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setTimeout(() => {
            setIndex(index + 1);
        }, 2500);

        return () => clearTimeout(interval);
    }, [index])



    return <span className="text-orange-500 hover:text-orange-600">{texts[index % texts.length]}</span>
}

const Welcome = ({ className }: { className?: string }) => {
    return (
        <section className={cn("w-full py-12 md:py-24 lg:py-32", className)}>
            <div className=" px-4 md:px-6 w-full mx-auto">
                <div className="flex container mx-auto">
                    <div className="flex flex-col justify-center space-y-4 w-fit mx-12 grow">
                        <h1 className="text-3xl font-bold  sm:text-5xl xl:text-6xl/none">
                            <span className="block">
                                Delicious <TextSwitcher />
                            </span>
                            <span>
                                Delivered To Your Door
                            </span>
                        </h1>
                        <p className="text-muted-foreground md:text-xl">
                            Order from your favorite restaurants and get food delivered in minutes.
                        </p>
                        <div className="mt-4">
                            <Link to="/restaurant">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:scale-105" size="lg">
                                    Order Now
                                    <ArrowRight />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative hidden lg:block">
                        <motion.img
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1, rotate: 180 }}
                            transition={{ duration: 0.8 }}
                            src={food}
                            alt="Delicious Food"
                            className=""
                        />

                    </div>
                </div>
            </div>
        </section>

    )
}

export default Welcome