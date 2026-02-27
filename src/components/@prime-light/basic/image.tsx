import Image from "next/image";
import { ComponentProps } from "react";

export function ThemedImage({ src, alt, ...props }: ComponentProps<typeof Image>) {
    return (
        <>
            <Image src={`/assets/image/light/${src}`} alt={alt} className="h-full w-full object-cover dark:hidden" {...props} />
            <Image src={`/assets/image/dark/${src}`} alt={alt} className="hidden h-full w-full object-cover dark:block" {...props} />
        </>
    );
}
