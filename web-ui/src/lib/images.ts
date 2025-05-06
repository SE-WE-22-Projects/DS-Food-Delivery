const getImageUrl = (image: string | undefined, size?: { width: number, height: number }) => {

    if (image && image.startsWith("/api/v1/uploads/")) {
        return image
    }
    return `https://placehold.co/${size?.width ?? 64}X${size?.height ?? 64}/bcbcbc/000000/svg?text=Image Not Found`
}

export default getImageUrl;