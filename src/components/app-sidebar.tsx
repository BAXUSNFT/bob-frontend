import { useQuery, useQueryClient } from "@tanstack/react-query";
// import info from "@/lib/info.json";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";
import { NavLink, useLocation, useNavigate } from "react-router";
// import { type UUID } from "@elizaos/core";
import { MessageCircle, Moon, PencilLine, Sun } from "lucide-react";
// import ConnectionStatus from "./connection-status";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export function AppSidebar() {
    const wallet = useWallet();
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle("dark");
    }

    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.agents;

    const queryRooms = useQuery({
        queryKey: ["rooms", agents ? agents[0]?.id : "", wallet ? wallet?.publicKey?.toBase58() : ""],
        queryFn: () => {
            if (!wallet) {
                return Promise.resolve([]);
            }
            return apiClient.getRooms(agents[0]?.id, wallet?.publicKey?.toBase58() || "");
        },
        refetchInterval: 5_000,
        enabled: !!wallet?.publicKey?.toBase58(), // This line ensures the query is only enabled if the wallet is present
    });

    const rooms = queryRooms?.data?.rooms;
    console.log('rooms,', rooms);

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-full">
                            <NavLink to="/">
                                <div className="relative">
                                    <img
                                        src="/baxus_logo.svg"
                                        className="object-contain p-2 w-1/2 h-1/2"
                                    />
                                </div>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="scrollbar">
                <SidebarGroup>
                    {query?.isSuccess && (
                        <button
                            onClick={() => {
                                navigate(`/chat/${agents[0].id}`);
                                queryClient.setQueryData(
                                    ["messages", agents[0].id],
                                    () => []
                                );
                            }}
                            className={`max-w-max`}
                        >
                            <SidebarMenuButton
                                className="bg-bonk-orange text-bonk-white max-w-max px-4 duration-300 transition-all"
                            >
                                <PencilLine />
                                Start New Chat
                            </SidebarMenuButton>
                        </button>
                    )}
                    <SidebarGroupLabel>Chat History</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            { !wallet?.publicKey?.toBase58() ? (
                                <p className="mx-2 text-xs italic">Connect your wallet to save your chat history</p>
                            ) : queryRooms?.isPending ? (
                                <div>
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <SidebarMenuItem key={index}>
                                                <SidebarMenuSkeleton />
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {agents && rooms?.map(
                                        (room: string) => (
                                            <SidebarMenuItem key={room}>
                                                <NavLink
                                                    to={`/chat/${agents[0]?.id}/${room}`}
                                                >
                                                    <SidebarMenuButton
                                                        isActive={location.pathname.includes(
                                                            room
                                                        )}
                                                    >
                                                        <MessageCircle />
                                                        <span>
                                                            {room}
                                                        </span>
                                                    </SidebarMenuButton>
                                                </NavLink>
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {agents?.length > 0 && (
                    <WalletMultiButton />
                )}
                <div className="flex gap-2 items-center text-xs justify-between select-none">
                    <label
                        htmlFor="DarkMode"
                        className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-bonk-orange/80 transition [-webkit-tap-highlight-color:_transparent] dark:bg-bonk-blue-light"
                    >
                        <input
                            type="checkbox"
                            id="DarkMode"
                            className="peer sr-only [&:checked_+_span_svg[data-checked-icon]]:block [&:checked_+_span_svg[data-unchecked-icon]]:hidden"
                            onClick={handleDarkMode}
                        />

                        <span
                            className="absolute inset-y-0 start-0 z-10 m-1 inline-flex size-6 items-center justify-center rounded-full transition-all dark:start-6 text-bonk-white dark:text-bonk-orange"
                        >
                            { isDarkMode ? <Moon /> : <Sun />  }
                        </span>
                    </label>
                    { isDarkMode ? "Dark Mode" : "Light Mode" }
                </div>
                {/* <SidebarMenu>
                    <SidebarMenuItem>
                        <NavLink
                            to="https://elizaos.github.io/eliza/docs/intro/"
                            target="_blank"
                        >
                            <SidebarMenuButton>
                                <Book /> Documentation
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton disabled>
                            <Cog /> Settings
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <ConnectionStatus />
                </SidebarMenu> */}
            </SidebarFooter>
        </Sidebar>
    );
}
