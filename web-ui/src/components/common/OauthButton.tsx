import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import api from "@/api"
import useUserStore from "@/store/user"
import toast from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"

interface OAuthButtonProps {
    provider: string
    icon?: React.ReactNode
    text?: string
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function OAuthButton({
    provider,
    icon,
    text = "Continue with",
    className,
    variant = "outline",
}: OAuthButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { setUser } = useUserStore()
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const handleOAuthLogin = async () => {
        try {
            setIsLoading(true)

            // get the OAuth redirect URL
            const url = await api.auth.oauthStart(provider)

            // open popup window
            const width = 600
            const height = 700
            const left = window.screenX + (window.outerWidth - width) / 2
            const top = window.screenY + (window.outerHeight - height) / 2
            const popup = window.open(
                url,
                `oauth-${provider}`,
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
            )

            // check if popup was blocked
            if (!popup || popup.closed || typeof popup.closed === "undefined") {
                toast.error("Popup blocked. Please allow popups for this site.")
                return;
            }

            // check for popup closure
            const checkPopup = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopup)
                    setIsLoading(false)
                }
            }, 500)

            // Listen for messages from the popup
            const handleMessage = async (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return

                if (event.data?.type === "oauth-success" && event.data?.code && event.data?.state) {


                    clearInterval(checkPopup)
                    window.removeEventListener("message", handleMessage)
                    if (!popup.closed) popup.close()


                    await api.auth.oauthComplete(provider, event.data.code, event.data.state).then(resp => {
                        setIsLoading(false)
                        setUser(resp.token, resp.user)
                    })

                    let redirect = params.get("redirect");
                    if (!redirect) redirect = "/";
                    navigate(redirect);
                }
            }

            window.addEventListener("message", handleMessage);



        } catch (error) {
            console.error(`OAuth login failed:`, error)
            setIsLoading(false)
        }
    }

    return (
        <Button variant={variant} className={className} onClick={handleOAuthLogin} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : icon && <span className="mr-2">{icon}</span>}
            {text}
        </Button>
    )
}
