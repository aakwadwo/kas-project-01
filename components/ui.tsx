"use client";

import Link from "next/link";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    AlertIcon,
    ArrowLeftIcon,
    CheckIcon,
    InfoIcon,
    XIcon,
} from "@/components/icons";
import { dateStub, type EventStatus } from "@/lib/ui/format";

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export function BrandMark({ size = 36 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            aria-hidden="true"
            focusable="false"
        >
            <g transform="rotate(-8 20 20)">
                <path
                    d="M6 9h28v7a4 4 0 0 0 0 8v7H6v-7a4 4 0 0 0 0-8V9Z"
                    fill="var(--color-signal)"
                    stroke="var(--color-ink)"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
                <path
                    d="M15 11v18"
                    stroke="var(--color-ink)"
                    strokeWidth="2"
                    strokeDasharray="2.5 2.5"
                />
                <path
                    d="m21.5 20 2.5 2.5 5-6"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
}

export function Brand({
    href = "/",
    tone = "ink",
}: {
    href?: string;
    tone?: "ink" | "paper";
}) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-2.5"
            aria-label="Campus Events home"
        >
            <span className="transition-transform duration-200 group-hover:-rotate-6">
                <BrandMark />
            </span>
            <span
                className={`font-display text-[1.15rem] font-extrabold leading-none tracking-tight ${
                    tone === "paper" ? "text-card" : "text-ink"
                }`}
            >
                campus
                <span className="text-signal">/</span>
                events
            </span>
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

const STATUS: Record<
    EventStatus,
    { label: string; className: string }
> = {
    PUBLISHED: {
        label: "Open",
        className: "bg-moss-wash text-moss border-moss",
    },
    DRAFT: {
        label: "Draft",
        className: "bg-sun-wash text-ink border-ink border-dashed",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "bg-signal-wash text-signal-deep border-signal-deep",
    },
    COMPLETED: {
        label: "Wrapped",
        className: "bg-paper-deep text-ink-soft border-ink-soft",
    },
};

export function StatusStamp({
    status,
    className = "",
}: {
    status: EventStatus;
    className?: string;
}) {
    const s = STATUS[status] ?? STATUS.DRAFT;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border-[1.5px] px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${s.className} ${className}`}
        >
            {status === "PUBLISHED" && (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
            {s.label}
        </span>
    );
}

export function Tag({
    children,
    tone = "ink",
}: {
    children: ReactNode;
    tone?: "ink" | "sky" | "moss" | "sun" | "signal" | "mute";
}) {
    const tones = {
        ink: "bg-ink text-card border-ink",
        sky: "bg-sky-wash text-sky border-sky",
        moss: "bg-moss-wash text-moss border-moss",
        sun: "bg-sun text-ink border-ink",
        signal: "bg-signal-wash text-signal-deep border-signal-deep",
        mute: "bg-paper-deep text-ink-soft border-line",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border-[1.5px] px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}
        >
            {children}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Date stub (the tear-off part of a ticket)                           */
/* ------------------------------------------------------------------ */

export function DateStub({
    value,
    muted = false,
    className = "",
}: {
    value: string;
    muted?: boolean;
    className?: string;
}) {
    const d = dateStub(value);
    return (
        <div
            className={`flex flex-col items-center justify-center text-center ${className}`}
        >
            <span
                className={`font-mono text-[0.68rem] font-semibold tracking-[0.18em] ${
                    muted ? "text-ink-mute" : "text-signal-deep"
                }`}
            >
                {d.weekday}
            </span>
            <span
                className={`font-display text-[2.6rem] font-extrabold leading-[0.9] tracking-tighter ${
                    muted ? "text-ink-mute" : "text-ink"
                }`}
            >
                {d.day}
            </span>
            <span className="font-mono text-[0.72rem] font-semibold tracking-[0.18em] text-ink-soft">
                {d.month}
            </span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page scaffolding                                                    */
/* ------------------------------------------------------------------ */

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
                <p className="eyebrow">{eyebrow}</p>
                <h1 className="display mt-3 text-[2.6rem] sm:text-6xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 text-base leading-7 text-ink-soft sm:text-lg">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
            )}
        </header>
    );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
            <ArrowLeftIcon
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
            />
            {children}
        </Link>
    );
}

export function Notice({
    tone,
    title,
    children,
    action,
}: {
    tone: "error" | "success" | "info";
    title?: string;
    children: ReactNode;
    action?: ReactNode;
}) {
    const styles = {
        error: {
            box: "border-signal-deep bg-signal-wash",
            icon: "bg-signal-deep text-white",
            Icon: AlertIcon,
        },
        success: {
            box: "border-moss bg-moss-wash",
            icon: "bg-moss text-white",
            Icon: CheckIcon,
        },
        info: {
            box: "border-ink bg-sun-wash",
            icon: "bg-ink text-sun",
            Icon: InfoIcon,
        },
    }[tone];

    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 ${styles.box}`}
        >
            <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
            >
                <styles.Icon size={15} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1 text-sm leading-6 text-ink">
                {title && <p className="font-bold">{title}</p>}
                <div className={title ? "text-ink-soft" : ""}>{children}</div>
                {action && <div className="mt-2">{action}</div>}
            </div>
        </div>
    );
}

export function EmptyState({
    icon,
    eyebrow,
    title,
    children,
    action,
}: {
    icon: ReactNode;
    eyebrow?: string;
    title: string;
    children?: ReactNode;
    action?: ReactNode;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-ink/40 bg-card/60 px-6 py-16 text-center">
            <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
                <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border-2 border-ink bg-sun shadow-[var(--shadow-hard-sm)]">
                    {icon}
                </div>
                {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
                <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
                    {title}
                </h2>
                {children && (
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
                        {children}
                    </p>
                )}
                {action && <div className="mt-7">{action}</div>}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

/**
 * Thin wrapper around native <dialog>: gives us focus trapping,
 * Escape-to-close and an inert background for free.
 */
export function Sheet({
    open,
    onClose,
    labelledBy,
    children,
    className = "",
}: {
    open: boolean;
    onClose: () => void;
    labelledBy: string;
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={labelledBy}
            className={`sheet ${className}`}
            onClose={onClose}
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {open && children}
        </dialog>
    );
}

type ConfirmOptions = {
    title: string;
    body: string;
    confirmLabel: string;
    cancelLabel?: string;
    destructive?: boolean;
};

/**
 * Promise-based confirm dialog replacing window.confirm().
 * const { confirm, dialog } = useConfirm(); ... {dialog}
 * if (await confirm({...})) { ... }
 */
export function useConfirm() {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolver = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const settle = useCallback((value: boolean) => {
        resolver.current?.(value);
        resolver.current = null;
        setOptions(null);
    }, []);

    const dialog = (
        <Sheet
            open={options !== null}
            onClose={() => settle(false)}
            labelledBy="confirm-title"
            className="!max-w-md"
        >
            {options && (
                <div className="p-6 sm:p-7">
                    <div
                        className={`mb-5 flex h-11 w-11 -rotate-6 items-center justify-center rounded-xl border-2 border-ink ${
                            options.destructive ? "bg-signal text-white" : "bg-sun text-ink"
                        }`}
                    >
                        {options.destructive ? (
                            <AlertIcon size={20} strokeWidth={2.5} />
                        ) : (
                            <InfoIcon size={20} strokeWidth={2.5} />
                        )}
                    </div>
                    <h2
                        id="confirm-title"
                        className="font-display text-2xl font-extrabold tracking-tight"
                    >
                        {options.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                        {options.body}
                    </p>
                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => settle(false)}
                            autoFocus
                        >
                            {options.cancelLabel ?? "Keep it"}
                        </button>
                        <button
                            type="button"
                            className={`btn ${options.destructive ? "btn-signal" : "btn-primary"}`}
                            onClick={() => settle(true)}
                        >
                            {options.confirmLabel}
                        </button>
                    </div>
                </div>
            )}
        </Sheet>
    );

    return { confirm, dialog };
}

export function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-transparent text-ink-soft transition hover:border-ink hover:bg-paper hover:text-ink"
        >
            <XIcon size={20} />
        </button>
    );
}
