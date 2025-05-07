import getImageUrl from '@/lib/images';
import { cn } from '@/lib/utils';
import { ComponentProps, useEffect, useState } from 'react'

type ImageProps = ComponentProps<"img"> & { placeholder?: { width: number, height: number } };

const Image = (props: ImageProps) => {
    const [isError, setError] = useState(false);

    useEffect(() => {
        setError(false)
    }, [props.src]);

    return (
        <img
            {...props}
            src={getImageUrl(isError ? "" : props.src)}
            className={cn(props.className, isError ? "object-cover" : undefined)}
            onError={() => setError(true)}
        />
    )
}

export default Image