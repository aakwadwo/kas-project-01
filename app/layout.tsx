import type { Metadata, Viewport } from "next";
import {
    Bricolage_Grotesque,
    Instrument_Sans,
    JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
    variable: "--font-display-face",
    subsets: ["latin"],
    display: "swap",
});

const body = Instrument_Sans({
    variable: "--font-body",
    subsets: ["latin"],
    display: "swap",
});

const mono = JetBrains_Mono({
    variable: "--font-mono-face",
    subsets: ["latin"],
    weight: ["500", "600"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Campus Events",
        template: "%s · Campus Events",
    },
    description:
        "The campus noticeboard: find what's on, grab a spot, run your own events.",
};

export const viewport: Viewport = {
    themeColor: "#f3eee3",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col font-sans">
                {children}
            </body>
        </html>
    );
}
