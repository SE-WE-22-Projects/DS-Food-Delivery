import NotFound from "@/assets/NotFound.svg";

const getImageUrl = (image: string | undefined) => {
    if (!image) return NotFound;


    if (image.startsWith("/api/v1/") || image.startsWith("data:")) {
        return image
    }

    return NotFound;
}

export default getImageUrl;