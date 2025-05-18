import client from "@/api/client";
import NotFound from "@/assets/NotFound.svg";
import { cn } from '@/lib/utils';
import { ComponentProps, useEffect, useState } from 'react'

type ImageProps = ComponentProps<"img"> & { placeholder?: { width: number, height: number } };

const Image = (props: ImageProps) => {
    const [isError, setError] = useState(false);
    const [src, setSrc] = useState<string>()

    useEffect(() => {
        let image = props.src;
        setError(false)
        setSrc(undefined);

        if (!image || (
            !image.startsWith("/api/v1/")
            && !image.startsWith("data:"))) {
            setSrc(NotFound);
            return;
        }

        if (image.startsWith("/api/v1/uploads/user")) {
            client.get(image.slice(8), {
                responseType: "blob",
            }).then((res) => {
                setSrc(URL.createObjectURL(res.data as Blob));
                console.log(res)
            }).catch(e => {
                setError(true);
                console.error(e);
            })
        }

    }, [props.src])



    return (
        <img
            {...props}
            src={isError ? NotFound : src}
            className={cn(props.className, isError ? "object-cover" : undefined)}
            onError={() => setError(true)}
        />
    )
}

export default Image