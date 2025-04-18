import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./routes/chat";
import Overview from "./routes/overview";
import Home from "./routes/home";
import useVersion from "./hooks/use-version";
import { useMemo } from "react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import {
    PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";
import { WebSocketProvider } from "./providers/WebSocketProvider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            gcTime: Infinity,
        },
    },
});

function App() {
    useVersion();

    const network = "https://rpc.ironforge.network/mainnet?apiKey=01HS93SE15GA6HQYZ03A4PHWC8";

    const endpoint = useMemo(() => network, [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            // new GlowWalletAdapter(),
            // new SlopeWalletAdapter(),
            // new TorusWalletAdapter(),
            // new SolflareWalletAdapter(),
            // new SolletWalletAdapter(),
            // new BackpackWalletAdapter(),
        ],
        [network]
    );

    return (
        <QueryClientProvider client={queryClient}>
            <div
                className="antialiased bg-whiskey-cream dark:bg-whiskey-mahogany text-whiskey-oak"
            >
                <BrowserRouter>
                    <ConnectionProvider endpoint={endpoint}>
                        <WalletProvider wallets={wallets} autoConnect>
                            <WalletModalProvider>
                                <WebSocketProvider>
                                    <TooltipProvider delayDuration={0}>
                                        <SidebarProvider>
                                            <SidebarTrigger className="fixed shadow-lg left-0 top-4 z-50 sm:hidden flex bg-whiskey-caramel text-whiskey-cream rounded-l-none" />
                                            {/* <AppSidebar /> */}
                                            <SidebarInset className="bg-transparent"> {/* set to transparent to share parent bg class */}
                                                <div className="flex flex-1 flex-col gap-4 size-full">
                                                    <Routes>
                                                        <Route path="/" element={<Home />} />
                                                        <Route
                                                            path="chat/:agentId"
                                                            element={<Chat />}
                                                        />
                                                        <Route
                                                            path="chat/:agentId/:roomId"
                                                            element={<Chat />}
                                                        />
                                                        <Route
                                                            path="settings/:agentId"
                                                            element={<Overview />}
                                                        />
                                                    </Routes>
                                                </div>
                                            </SidebarInset>
                                        </SidebarProvider>
                                        <Toaster />
                                    </TooltipProvider>
                                </WebSocketProvider>
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                </BrowserRouter>
            </div>
        </QueryClientProvider>
    );
}

export default App;
