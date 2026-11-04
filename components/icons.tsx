import type { SVGProps } from "react";

/**
 * Small inline stroke icon set (24px grid, 2px stroke).
 * Decorative by default — pass `aria-label` + role="img" when an icon
 * carries meaning on its own.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden={props["aria-label"] ? undefined : true}
            focusable="false"
            {...props}
        >
            {children}
        </svg>
    );
}

export const CalendarIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </Svg>
);

export const ClockIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </Svg>
);

export const PinIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
);

export const UsersIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6" />
    </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M4 12h15M13 6l6 6-6 6" />
    </Svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M20 12H5M11 18l-6-6 6-6" />
    </Svg>
);

export const PlusIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 5v14M5 12h14" />
    </Svg>
);

export const CheckIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
);

export const XIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
);

export const AlertIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 3.5 2.5 20h19L12 3.5Z" />
        <path d="M12 10v4.5M12 17.5v.01" />
    </Svg>
);

export const InfoIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5.5M12 7.5v.01" />
    </Svg>
);

export const EditIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
        <path d="m13.5 6.5 4 4" />
    </Svg>
);

export const MegaphoneIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1Z" />
        <path d="M15 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" />
    </Svg>
);

export const TicketIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" />
        <path d="M14 6v2.5M14 11v2M14 15.5V18" />
    </Svg>
);

export const LogoutIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5M21 12H9" />
    </Svg>
);

export const MenuIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M4 7h16M4 12h16M4 17h10" />
    </Svg>
);

export const EyeIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
);

export const EyeOffIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </Svg>
);

export const GradCapIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="m2 9 10-5 10 5-10 5L2 9Z" />
        <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" />
    </Svg>
);

export const ClipboardIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </Svg>
);

export const SearchIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </Svg>
);

export const SpinnerIcon = ({ className = "", ...p }: IconProps) => (
    <Svg {...p} className={`animate-spin ${className}`}>
        <path d="M21 12a9 9 0 1 1-6.2-8.56" />
    </Svg>
);
