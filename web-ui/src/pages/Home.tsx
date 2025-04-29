import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame, ShoppingBag, Star, Clock, MapPin, Truck } from "lucide-react";
import food from '../assets/land_food.png'
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 text-gray-900">
            {/* Hero Section */}
            <main className="flex flex-col lg:flex-row items-center justify-between px-10 py-20 gap-10">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl space-y-6"
                >
                    <h1 className="text-5xl font-extrabold leading-tight">
                        Fresh, Fast, and Flavorful 🍕🚀
                    </h1>
                    <p className="text-lg text-gray-700">
                        Get your favorite meals from top restaurants delivered in minutes. Enjoy exclusive discounts, real-time tracking, and lightning-fast service.
                    </p>
                    <div className="flex gap-4">
                        <Button className="bg-red-500 hover:bg-red-600 text-white">Order Now</Button>
                        <Button onClick={()=>navigate('/restaurant')} variant="outline">Browse Menu</Button>
                    </div>
                </motion.div>

                <motion.img
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, rotate: 180 }}
                    transition={{ duration: 0.8 }}
                    src={food}
                    alt="Delicious Food"
                    className=""
                />
            </main>

            {/* Features Section */}
            <section id="features" className="bg-white py-20 px-10">
                <h2 className="text-4xl font-bold text-center mb-14">Why Choose QuickEats?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {[{
                        icon: <Flame className="mx-auto text-red-500 w-12 h-12 mb-4" />, title: "Hot & Fresh", desc: "Every dish is made fresh and delivered while it's still hot."
                    },
                    { icon: <ShoppingBag className="mx-auto text-red-500 w-12 h-12 mb-4" />, title: "Diverse Menu", desc: "Explore meals from Indian, Italian, Chinese and more." },
                    { icon: <Star className="mx-auto text-red-500 w-12 h-12 mb-4" />, title: "Top Rated", desc: "Thousands of satisfied users rate us 5 stars daily." },
                    { icon: <Clock className="mx-auto text-red-500 w-12 h-12 mb-4" />, title: "Fast Delivery", desc: "Average delivery time under 30 minutes." },
                    { icon: <MapPin className="mx-auto text-red-500 w-12 h-12 mb-4" />, title: "Live Tracking", desc: "Track your meal live from kitchen to doorstep." },
                    { icon: <Truck className="mx-auto text-red-500 w-12 h-12 mb-4" />, title: "No Contact Delivery", desc: "Safe and hygienic doorstep delivery options." }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="p-6 bg-red-50 rounded-xl shadow hover:shadow-md text-center"
                        >
                            {item.icon}
                            <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                            <p>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-gradient-to-r from-red-50 to-orange-100">
                <h2 className="text-4xl font-bold text-center mb-12">Loved By Thousands ❤️</h2>
                <div className="max-w-4xl mx-auto space-y-10">
                    {[{
                        name: "Sarah W.", text: "QuickEats is my go-to app for food delivery. Super fast and always reliable!",
                        img: "https://randomuser.me/api/portraits/women/44.jpg"
                    }, {
                        name: "Jason K.", text: "I love the variety. I can order sushi, pizza, and biryani all in one place!",
                        img: "https://randomuser.me/api/portraits/men/36.jpg"
                    }].map((review, index) => (
                        <motion.div key={index} whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
                            <img src={review.img} alt={review.name} className="w-14 h-14 rounded-full object-cover" />
                            <div>
                                <p className="text-lg font-semibold">{review.name}</p>
                                <p className="text-gray-600">{review.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Download App */}
            <section id="download" className="py-20 bg-white text-center">
                <h2 className="text-4xl font-bold mb-6">Get The App</h2>
                <p className="text-lg mb-6">Order in just a few taps. Download the QuickEats app for a faster, smoother experience.</p>
                <div className="flex justify-center gap-6">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play"
                        className="h-14 cursor-pointer"
                    />
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg"
                        alt="App Store"
                        className="h-14 cursor-pointer"
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-red-600 text-white py-10 px-10 text-center">
                <p className="mb-2">&copy; {new Date().getFullYear()} QuickEats. All rights reserved.</p>
                <div className="space-x-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">Help Center</a>
                </div>
            </footer>
        </div>
    );
}

export default Home