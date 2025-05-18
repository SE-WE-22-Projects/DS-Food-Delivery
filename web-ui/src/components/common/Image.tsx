import NotFound from "@/assets/NotFound.svg";
import { cn } from '@/lib/utils';
import { ComponentProps, useEffect, useState } from 'react'

type ImageProps = ComponentProps<"img"> & { placeholder?: { width: number, height: number } };

const Image = (props: ImageProps) => {
    const [isError, setError] = useState(false);

    let image = props.src;

    if (!image || (
        !image.startsWith("/api/v1/")
        && !image.startsWith("data:"))) {
        image = NotFound;
    }


    useEffect(() => {
        setError(false)
    }, [props.src]);

    return (
        <img
            {...props}
            src={isError ? NotFound : image}
            className={cn(props.className, isError ? "object-cover" : undefined)}
            onError={() => setError(true)}
        />
    )
}

export default Image