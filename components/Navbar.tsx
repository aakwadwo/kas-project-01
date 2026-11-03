"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/ui";
import {
    LogoutIcon,
    MenuIcon,
    PlusIcon,
    XIcon,
} from "@/components/icons";
import { initials } from "@/lib/ui/format";

const LINKS = [
    { href: "/events", label: "What's on" },
    { href: "/registrations", label: "My tickets" },
    { href: "/events/my-events", label: "Hosting" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [userName, setUserName] = useState("");
    // The menu is "open for" a specific path, so navigating closes it.
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
    const menuOpen = menuOpenFor === pathname;

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch("/api/auth/me", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    setUserName("");
                    return;
                }

                const data = await response.json();
                setUserName(data.user?.name ?? "");
            } catch {
                setUserName("");
            }
        }

        loadUser();

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                loadUser();
            }
        };

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

    async function handleLogout() {
        try {
            await fetch("/api/logout", {
                method: "POST",
                cache: "no-store",
            });
        } finally {
            window.location.replace("/login");
        }
    }

    function isActive(href: string) {
        if (href === "/events") {
            return (
                pathname === "/events" ||
                (pathname.startsWith("/events/") &&
                    !pathname.startsWith("/events/my-events") &&
                    !pathname.startsWith("/events/create") &&
                    !pathname.startsWith("/events/edit"))
            );
        }
        if (href === "/events/my-events") {
            return (
                pathname.startsWith("/events/my-events") ||
                pathname.startsWith("/events/edit")
            );
        }
        return pathname.startsWith(href);
    }

    return (
        <nav
            aria-label="Main"
            className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur-md"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
                <Brand href="/events" />

                {/* Desktop */}
                <div className="hidden items-center gap-1 md:flex">
                    {LINKS.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                    active
                                        ? "text-ink"
                                        : "text-ink-soft hover:bg-paper-deep hover:text-ink"
                                }`}
                            >
                                {link.label}
                                {active && (
                                    <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-signal" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        href="/events/create"
                        className="btn btn-primary btn-sm"
                    >
                        <PlusIcon size={16} strokeWidth={2.5} />
                        Post an event
                    </Link>

                    {userName && (
                        <span
                            title={userName}
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-sun font-display text-sm font-extrabold"
                        >
                            {initials(userName)}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="btn btn-ghost btn-sm !px-2.5"
                        aria-label="Log out"
                        title="Log out"
                    >
                        <LogoutIcon size={18} />
                    </button>
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    className="btn btn-outline btn-sm !px-2.5 md:hidden"
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMenuOpenFor(menuOpen ? null : pathname)}
                >
                    {menuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div
                    id="mobile-menu"
                    className="border-t-2 border-ink bg-card px-4 pb-5 pt-3 md:hidden"
                >
                    {userName && (
                        <div className="mb-3 flex items-center gap-3 border-b border-line pb-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-sun font-display text-sm font-extrabold">
                                {initials(userName)}
                            </span>
                            <span className="truncate font-semibold">
                                {userName}
                            </span>
                        </div>
                    )}
                    <ul className="space-y-1">
                        {LINKS.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={active ? "page" : undefined}
                                        className={`flex min-h-12 items-center rounded-lg px-3 font-display text-lg font-bold ${
                                            active
                                                ? "bg-ink text-card"
                                                : "text-ink hover:bg-paper-deep"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link href="/events/create" className="btn btn-primary">
                            <PlusIcon size={16} strokeWidth={2.5} />
                            Post event
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="btn btn-outline"
                        >
                            <LogoutIcon size={16} />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
