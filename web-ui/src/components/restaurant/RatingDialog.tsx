import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import api from "@/api"
import toast from "react-hot-toast"
import { RatingDialogStars } from "./RatingDialogStars"
import useUserStore from "@/store/user"
import { useQueryClient } from "@tanstack/react-query"

interface RatingDialogProps {
    restaurantId: string
    restaurantName: string
    trigger: React.ReactNode
}

export function RatingDialog({ restaurantId, restaurantName, trigger, }: RatingDialogProps) {
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState<number | null>(null)
    const [reviewText, setReviewText] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const userId = useUserStore().user?.id
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate form
        if (!rating) {
            setError("Please select a rating")
            return
        }

        if (!reviewText.trim()) {
            setError("Please enter your review")
            return
        }

        setIsSubmitting(true)

        try {
            await api.rating.submitReview(
                restaurantId,
                userId!,
                rating,
                reviewText,
            )

            toast.success("Review submitted")

            // Reset form
            setRating(null)
            setReviewText("")

            // Close dialog
            setOpen(false)

            queryClient.invalidateQueries({ queryKey: ["reviews", restaurantId, "all"] })
            queryClient.invalidateQueries({ queryKey: ["reviews", restaurantId, "avg"] })


        } catch (err) {
            setError("Failed to submit review. Please try again.")
            console.error("Error submitting review:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                        Share your experience at {restaurantName}. Your feedback helps others make better choices.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rating">Your Rating</Label>
                            <div className="flex justify-center py-2">
                                <RatingDialogStars
                                    value={rating}
                                    onChange={setRating}
                                    size="large"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review">Your Review</Label>
                            <Textarea
                                id="review"
                                placeholder="Tell us about your experience..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={5}
                            />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-red-500">{error}</div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Review"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
