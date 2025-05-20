import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, LayoutDashboard, ShoppingBag, Utensils, Home, MapPin, Users, Percent, Truck, CreditCard, FileText, Calendar, Settings, ArrowRight, Orbit } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, 
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 }, 
    visible: {
        opacity: 1,
        y: 0, 
        transition: {
            type: "spring", 
            damping: 12,
            stiffness: 100,
        },
    },
};

const DashboardHome = () => {
    return (
        <main className="flex-1">
            <motion.section 
                className="w-full py-12 md:py-16"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <div className="container px-4 md:px-6">
                    {/* Header Section with Animation */}
                    <motion.div
                        className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }} 
                    >
                        <div className="space-y-2">
                            <motion.div
                                className={`inline-flex items-center justify-center`}
                                animate={{ rotate: 360 }}
                                transition={{
                                    repeat: Infinity, 
                                    ease: 'linear', 
                                    duration: 15, 
                                }}
                            >
                                {/* Optional: Add a subtle pulse effect */}
                                <motion.div
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 4,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Orbit
                                        className={`text-white/80`} 
                                        style={{ height: `${18 / 4}rem`, width: `${18 / 4}rem` }}
                                        strokeWidth={1.5} 
                                    />
                                </motion.div>
                            </motion.div>
                            <div className="w-full">
                                <span className="font-semibold text-center">Welcome to FoodDash Admin</span>
                            </div>
                            
                            <motion.h1 
                                className="text-3xl font-bold tracking-tighter text-white sm:text-5xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                Your Food Delivery Dashboard
                            </motion.h1>
                            <motion.p 
                                className="max-w-[700px] text-white/70 md:text-xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                Manage your restaurant, track orders, and grow your business with our comprehensive tools.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Grid with Staggered Animation */}
                    <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible" 
                    >
                        {/* Card 1: Orders */}
                        <motion.div 
                            variants={cardVariants} 
                            whileHover={{ y: -8, scale: 1.03 }} 
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col"> 
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <ShoppingBag className="h-5 w-5" />
                                        Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow"> 
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        Manage incoming orders, track status, and process deliveries.
                                    </p>
                                    <motion.div 
                                        whileHover={{ scale: 1.10 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                            Manage Orders
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Card 2: Menu Management */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Utensils className="h-5 w-5" />
                                        Menu Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        Create, edit and organize your food menu items and categories.
                                    </p>
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">Manage Menu</Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Card 3: Restaurant Profile */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Home className="h-5 w-5" />
                                        Restaurant Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        Update your restaurant details, hours, and contact information.
                                    </p>
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">Edit Profile</Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Card 4: Customers */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Users className="h-5 w-5" />
                                        Customers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        View customer profiles, order history, and manage relationships.
                                    </p>
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                            View Customers
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Card 5: Promotions */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Percent className="h-5 w-5" />
                                        Promotions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        Create and manage discounts, special offers, and loyalty programs.
                                    </p>
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                            Manage Promotions
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Card 6: Delivery Staff */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Truck className="h-5 w-5" />
                                        Delivery Staff
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        Manage your delivery personnel, assignments, and performance.
                                    </p>
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">Manage Staff</Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Card 7: Reports */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <FileText className="h-5 w-5" />
                                        Reports
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        Generate detailed reports on sales, orders, and customer activity.
                                    </p>
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">View Reports</Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Card 8: Settings */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Card className="bg-white/10 border-white/10 text-white h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Settings className="h-5 w-5" />
                                        Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-sm text-white/70 mb-4 flex-grow">
                                        Configure your account, notifications, and system preferences.
                                    </p>
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                            Open Settings
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>
        </main>
    );
};

export default DashboardHome;