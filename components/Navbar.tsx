"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [userName, setUserName] = useState("");

    useEffect(() => {
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

            if (data.user?.name) {
                setUserName(data.user.name);
            } else {
                setUserName("");
            }
        } catch {
            setUserName("");
        }
    }

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

    return (
        <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

                {/* Brand */}
                <Link
                    href="/events"
                    className="group flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                        CE
                    </div>

                    <div className="hidden sm:block">
                        <div className="text-[15px] font-bold tracking-tight text-gray-950">
                            Campus Event
                        </div>

                        <div className="text-xs font-medium text-gray-500">
                            Platform
                        </div>
                    </div>
                </Link>

                {/* Desktop navigation */}
                <div className="flex items-center gap-1">
                    <Link
                        href="/events"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
                    >
                        All Events
                    </Link>

                    <Link
                        href="/events/my-events"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
                    >
                        My Events
                    </Link>

                    <Link
                        href="/events/create"
                        className="ml-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                    >
                        + Create Event
                    </Link>

                    {userName && (
                        <div className="ml-3 hidden items-center gap-2 border-l border-gray-200 pl-4 md:flex">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                                {userName.charAt(0).toUpperCase()}
                            </div>

                            <span className="max-w-[140px] truncate text-sm font-medium text-gray-700">
                                {userName}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="ml-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}