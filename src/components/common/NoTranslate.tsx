import type { ReactNode } from 'react';

type NoTranslateProps = {
    children: ReactNode;
};

export const NoTranslate = ({ children }: NoTranslateProps) => {
    return (
        <span translate="no" className="notranslate">
            {children}
        </span>
    );
};
