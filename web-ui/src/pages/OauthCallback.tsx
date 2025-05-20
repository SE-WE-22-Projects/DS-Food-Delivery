import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "react-router-dom"

export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<"processing" | "error">("processing")
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const completeOAuth = async () => {
            try {
                // Get all the params from the URL
                const code = searchParams.get("code") || ""
                const state = searchParams.get("state") || ""
                const error = searchParams.get("error") || ""

                // Check for errors in the callback
                if (error) {
                    throw new Error(error)
                }

                if (!code || !state) {
                    throw new Error("Missing required OAuth parameters")
                }


                // Send the user data back to the opener window
                if (!window.opener || window.opener.closed) {
                    throw new Error("Cannot access main window")
                }

                window.opener.postMessage(
                    {
                        type: "oauth-success",
                        code: code,
                        state: state
                    },
                    window.location.origin,
                )

                window.close()
            } catch (error) {
                console.error("OAuth completion failed:", error)
                setStatus("error")
                setErrorMessage(error instanceof Error ? error.message : "Authentication failed")

                // Notify opener about the error
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage(
                        {
                            type: "oauth-error",
                            error: errorMessage,
                        },
                        window.location.origin,
                    )
                }
            }
        }

        completeOAuth()
    }, [searchParams])

    return (
        <div className="flex container min-h-screen flex-col items-center justify-center p-4 text-center">
            {status === "processing" && (
                <>
                    <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                    <h1 className="text-xl font-bold mb-2">Completing authentication...</h1>
                    <p className="text-muted-foreground">Please wait while we finish the login process.</p>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="rounded-full bg-red-100 p-3 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-red-600"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold mb-2">Authentication failed</h1>
                    <p className="text-muted-foreground">{errorMessage || "An error occurred during authentication."}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                        onClick={() => window.close()}
                    >
                        Close Window
                    </button>
                </>
            )}
        </div>
    )
}
