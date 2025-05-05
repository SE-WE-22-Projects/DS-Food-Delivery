import { ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

const steps = [
    {
        title: "Sign up to QuickEats",
        description: "Create an account to see restaurants that deliver to you.",
    },
    {
        title: "Choose a restaurant",
        description: "Browse menus and reviews to find your perfect meal.",
    },
    {
        title: "Get it delivered",
        description: "Your order will be delivered to your door in minutes.",
    },
]

const OrderProcess = ({ className }: { className?: string }) => {
    return <section className={cn("w-full py-12 md:py-24 lg:py-32", className)}>
        <div className=" px-4 md:px-6 container mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl">
                            Get your favorite food in 3 simple steps
                        </p>
                    </div>
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={step.title} className="flex items-start">
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-900 font-bold">
                                    {index + 1}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Button className="bg-orange-500 hover:bg-orange-600 mt-4">
                            Order Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="relative hidden lg:block">
                    <img
                        src="/placeholder.svg?height=500&width=500"
                        width={500}
                        height={500}
                        alt="Food delivery process"
                        className="mx-auto rounded-lg object-cover"
                    />
                </div>
            </div>
        </div>
    </section>
}

export default OrderProcess