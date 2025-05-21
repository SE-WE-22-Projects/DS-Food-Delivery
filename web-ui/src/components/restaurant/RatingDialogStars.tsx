"use client"

import { useState } from "react"
import { Star } from 'lucide-react'
import { cn } from "@/lib/utils"

interface StarRatingProps {
    value: number | null
    onChange: (value: number) => void
    size?: "small" | "medium" | "large"
    readOnly?: boolean
    className?: string
}

export const RatingDialogStars = ({
    value,
    onChange,
    size = "medium",
    readOnly = false,
    className
}: StarRatingProps) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const stars = 5

    // Determine star size based on prop
    const starSizeClass = {
        small: "h-4 w-4",
        medium: "h-5 w-5",
        large: "h-7 w-7"
    }[size]

    // Determine spacing based on size
    const spacingClass = {
        small: "gap-1",
        medium: "gap-1.5",
        large: "gap-2"
    }[size]

    const handleMouseEnter = (index: number) => {
        if (!readOnly) {
            setHoverValue(index)
        }
    }

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverValue(null)
        }
    }

    const handleClick = (index: number) => {
        if (!readOnly) {
            onChange(index)
        }
    }

    return (
        <div
            className={cn(
                "flex items-center",
                spacingClass,
                className
            )}
            onMouseLeave={handleMouseLeave}
        >
            {[...Array(stars)].map((_, index) => {
                const starValue = index + 1
                const isActive = (hoverValue !== null ? starValue <= hoverValue : starValue <= (value || 0))

                return (
                    <Star
                        key={index}
                        className={cn(
                            starSizeClass,
                            "cursor-pointer transition-all",
                            isActive
                                ? "fill-orange-500 text-orange-500"
                                : "fill-muted text-muted-foreground",
                            !readOnly && "hover:scale-110"
                        )}
                        onMouseEnter={() => handleMouseEnter(starValue)}
                        onClick={() => handleClick(starValue)}
                    />
                )
            })}
        </div>
    )
}
