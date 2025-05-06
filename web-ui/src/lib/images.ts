const getImageUrl = (image: string | undefined, size: { width: number, height: number }) => {

    if (image && image.startsWith("/api/v1/uploads/")) {
        return image
    }
    return `https://placehold.co/${size.width}X${size.height}/bcbcbc/000000/png?text=Image Not Found`
}

export default getImageUrl;