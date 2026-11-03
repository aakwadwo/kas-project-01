import type { ReactNode } from "react";
import { Brand } from "@/components/ui";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

/**
 * Split layout for login / register / verify.
 * Left: an ink "poster" panel. Right: the form on paper.
 */
export default function AuthShell({
    poster,
    children,
}: {
    poster: { kicker: string; headline: ReactNode; body: string };
    children: ReactNode;
}) {
    return (
        <main className="min-h-screen lg:grid lg:grid-cols-[0.95fr_1.05fr]">
            <section className="relative hidden overflow-hidden border-r-2 border-ink bg-ink text-card lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
                {/* Poster shapes */}
                <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-signal" />
                <div className="absolute right-20 top-1/3 h-24 w-24 rotate-12 rounded-2xl border-2 border-sun" />
                <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full border-2 border-card/20" />

                <div className="relative">
                    <Brand tone="paper" />
                </div>

                <div className="relative max-w-lg pb-24">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-sun">
                        {poster.kicker}
                    </p>
                    <h1 className="display mt-5 text-6xl xl:text-7xl">
                        {poster.headline}
                    </h1>
                    <p className="mt-6 max-w-md text-lg leading-8 text-card/70">
                        {poster.body}
                    </p>
                </div>
            </section>

            <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-10 lg:min-h-0 lg:px-16">
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden">
                        <Brand />
                    </div>
                    {children}
                </div>
            </section>
        </main>
    );
}

export function PasswordToggle({
    shown,
    onToggle,
    controls,
}: {
    shown: boolean;
    onToggle: () => void;
    controls: string;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-controls={controls}
            aria-pressed={shown}
            aria-label={shown ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper-deep hover:text-ink"
        >
            {shown ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
    );
}
