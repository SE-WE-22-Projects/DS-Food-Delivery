import client from "./client"

type RestaurantReview = {
    _id: string
    userId: string
    review: string
    rating: number
    createdAt: string
}

type AvgRating = {
    averageRating: { avg: number, reviews: number }
}

export const getRating = async (resID: string): Promise<RestaurantReview[]> => {
    const resp = await client.get("/review/review/restaurant/" + resID)

    return resp.data;
}

export const getAvgRating = async (resID: string): Promise<AvgRating> => {
    const resp = await client.get("/review/review/restaurant/" + resID + "/rating")

    return resp.data;
}

export const submitReview = async (restaurantId: string, userId: string, rating: number, review: string) => {
    await client.post("/review/review/", { userId, restaurantId, review, rating })
}