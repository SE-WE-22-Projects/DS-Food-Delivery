import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LockIcon, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom"
import MyIcon from "@/assets/login_icon.svg"
import useUserStore from "@/store/user"
import toast from "react-hot-toast"
import { useState } from "react"
import api from "@/api"

const Login = () => {
  const navigate = useNavigate();
  const state = useUserStore();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handleLogin = () => {
    if (!email || email.length < 6 || !password || password.length < 6) {
      toast.error("Invalid email or password")
    } else {
      api.auth.login(email, password).then(resp => {
        state.setUser(resp.token, resp.user);
        navigate("/dashboard")
      }).catch(err => {
        console.error(err);
        toast.error("Invalid email or password")
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br px-4">

      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center space-y-2">
          <img
            src={MyIcon}
            alt="Login illustration"
            className="h-44 mx-auto"
          />
          <CardTitle className="text-3xl font-bold text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-50">
            Login to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              Email
            </Label>
            <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <LockIcon className="h-5 w-5 text-gray-500" />
              Password
            </Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {/* Login Button */}
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-800 text-white font-semibold text-lg hover:brightness-110 transition-all rounded-xl py-6"
            size="lg"
            onClick={() => handleLogin()}
          >
            Login
          </Button>
        </CardContent>

        <CardFooter className="text-center flex flex-col space-y-3">
          <p className="text-gray-500 text-sm">
            Don't have an account?
            <a href="/register" className="text-purple-600 hover:underline ml-1">
              Sign up
            </a>
          </p>
          <a href="/forgot-password" className="text-sm text-green-400 hover:underline">
            Forgot Password?
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login