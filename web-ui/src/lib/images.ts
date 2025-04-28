const fallbackImage = ""

const getImageUrl = (image: string | undefined) => {
    if (!image) return fallbackImage;

    if (!image.startsWith("uploads/")) {
        image = fallbackImage;
    }

    return "/api/v1/" + image
}

export default getImageUrl;