import { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import deliver from "@/assets/landing/delivery.svg";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import api from "@/api"
import useUserStore from "@/store/user"
import { useShallow } from "zustand/shallow"
import { OAuthButton } from "@/components/common/OauthButton";
import toast from "react-hot-toast";
import google from "@/assets/google.svg";


export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [setUser] = useUserStore(useShallow(s => [s.setUser]));
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const handleLogin = async (e: Event) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Please enter both email and password")
            return
        }

        setIsLoading(true);

        api.auth.login(email, password).then(resp => {
            setUser(resp.token, resp.user);
            setIsLoading(false)
            let redirect = params.get("redirect");
            if (!redirect) redirect = "/";
            navigate(redirect);
        }).catch(e => {
            toast.error("Failed to login");
            setIsLoading(false)
            console.error(e);
        })
    }



    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-orange-200 via-gray-200 to-orange-200 animated-gradient-bg">
            <div className="relative hidden lg:block mx-6">
                <img
                    src={deliver}
                    width={500}
                    height={500}
                    alt="Food delivery process"
                    className="mx-auto rounded-lg object-cover"
                />
            </div>
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold">Welcome Back</h1>
                        <p className="text-sm text-muted-foreground mt-1">Sign in to continue to QuickEats</p>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleLogin as any} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-xs text-orange-500 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <Separator />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-background px-2 text-xs text-muted-foreground">OR CONTINUE WITH</span>
                        </div>
                    </div>

                    <OAuthButton provider="google"
                        className="w-full flex items-center gap-2"
                        icon={<img src={google} />} text="Sign in with Google">
                    </OAuthButton>



                    <div className="text-center mt-6">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link to="/register" className="text-orange-500 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>

        </div>)

}
