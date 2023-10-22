import { Providers } from "./providers";

export const metadata = {
    title: "Welcome to Lottery",
    description: "Decentralized lottery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
