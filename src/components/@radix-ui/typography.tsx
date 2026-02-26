import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    className?: string;
}

function TypographyH1({ children, className }: Props) {
    return <h1 className={`scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance ${className}`}>{children}</h1>;
}

function TypographyH2({ children, className }: Props) {
    return <h2 className={`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${className}`}>{children}</h2>;
}

function TypographyH3({ children, className }: Props) {
    return <h3 className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}>{children}</h3>;
}

function TypographyH4({ children, className }: Props) {
    return <h4 className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}>{children}</h4>;
}

function TypographyP({ children, className }: Props) {
    return <p className={`leading-7 not-first:mt-6 ${className}`}>{children}</p>;
}

function TypographyBlockquote({ children, className }: Props) {
    return <blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`}>{children}</blockquote>;
}

function TypographyTable({ children, className }: Props) {
    return (
        <div className={`my-6 w-full overflow-y-auto ${className}`}>
            <table className="w-full">{children}</table>
        </div>
    );
}

function TypographyThead({ children, className }: Props) {
    return (
        <thead className={className}>
            <TypographyTr>{children}</TypographyTr>
        </thead>
    );
}

function TypographyTbody({ children, className }: Props) {
    return <tbody className={className}>{children}</tbody>;
}

function TypographyTh({ children, className }: Props) {
    return (
        <th className={`border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right ${className}`}>
            {children}
        </th>
    );
}

function TypographyTr({ children, className }: Props) {
    return <tr className={`even:bg-muted m-0 border-t p-0 ${className}`}>{children}</tr>;
}

function TypographyTd({ children, className }: Props) {
    return <td className={`border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right ${className}`}>{children}</td>;
}

function TypographyList({ children, className }: Props) {
    return <ul className={`my-6 ml-6 list-disc [&>li]:mt-2 ${className}`}>{children}</ul>;
}

function TypographyInlineCode({ children, className }: Props) {
    return <code className={`bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ${className}`}>{children}</code>;
}

function TypographyLead({ children, className }: Props) {
    return <p className={`text-muted-foreground text-xl ${className}`}>{children}</p>;
}

function TypographyLarge({ children, className }: Props) {
    return <div className={`text-lg font-semibold ${className}`}>{children}</div>;
}

function TypographySmall({ children, className }: Props) {
    return <small className={`text-sm leading-none font-medium ${className}`}>{children}</small>;
}

function TypographyMuted({ children, className }: Props) {
    return <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>;
}

export const Typography = {
    H1: TypographyH1,
    H2: TypographyH2,
    H3: TypographyH3,
    H4: TypographyH4,
    P: TypographyP,
    Blockquote: TypographyBlockquote,
    Table: TypographyTable,
    Thead: TypographyThead,
    Tbody: TypographyTbody,
    Th: TypographyTh,
    Tr: TypographyTr,
    Td: TypographyTd,
    List: TypographyList,
    InlineCode: TypographyInlineCode,
    Lead: TypographyLead,
    Large: TypographyLarge,
    Small: TypographySmall,
    Muted: TypographyMuted,
};
