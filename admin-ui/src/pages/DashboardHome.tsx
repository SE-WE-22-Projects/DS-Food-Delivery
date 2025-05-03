import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle, LayoutDashboard, ShoppingBag, Utensils, Home, MapPin, Users, Percent, Truck, CreditCard, FileText, Calendar, Settings, ArrowRight } from "lucide-react"


const DashboardHome = () => {
    return <main className="flex-1">
        <section className="w-full py-12 md:py-16">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <div className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Welcome to FoodDash Admin
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl">
                            Your Food Delivery Dashboard
                        </h1>
                        <p className="max-w-[700px] text-white/70 md:text-xl">
                            Manage your restaurant, track orders, and grow your business with our comprehensive tools.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <ShoppingBag className="h-5 w-5" />
                                Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                Manage incoming orders, track status, and process deliveries.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                Manage Orders
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Utensils className="h-5 w-5" />
                                Menu Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                Create, edit and organize your food menu items and categories.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">Manage Menu</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Home className="h-5 w-5" />
                                Restaurant Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                Update your restaurant details, hours, and contact information.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">Edit Profile</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Users className="h-5 w-5" />
                                Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                View customer profiles, order history, and manage relationships.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                View Customers
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Percent className="h-5 w-5" />
                                Promotions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                Create and manage discounts, special offers, and loyalty programs.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                Manage Promotions
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Truck className="h-5 w-5" />
                                Delivery Staff
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                Manage your delivery personnel, assignments, and performance.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">Manage Staff</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <FileText className="h-5 w-5" />
                                Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                Generate detailed reports on sales, orders, and customer activity.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">View Reports</Button>
                        </CardContent>
                    </Card>


                    <Card className="bg-white/10 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Settings className="h-5 w-5" />
                                Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-white/70 mb-4">
                                Configure your account, notifications, and system preferences.
                            </p>
                            <Button className="w-full bg-white text-[oklch(18%_0.04_260)] hover:bg-white/90">
                                Open Settings
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </section>
    </main>
}

export default DashboardHome;