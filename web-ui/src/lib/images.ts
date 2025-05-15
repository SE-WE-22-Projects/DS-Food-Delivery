import NotFound from "@/assets/NotFound.svg";

const getImageUrl = (image: string | undefined) => {

    if (image && image.startsWith("/api/v1/")) {
        return image
    }
    return NotFound;
}

export default getImageUrl;