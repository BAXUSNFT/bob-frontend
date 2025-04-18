import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { NavLink } from "react-router";

export default function Home() {
    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000
    });

    const agents = query?.data?.agents

    return (
        <div className="flex flex-col gap-4 h-full p-4">
            <div className="my-auto mx-auto max-w-xl flex flex-col gap-4 items-center text-center">
                <img
                    src="/logo.png"
                    className="object-contain p-2"
                />
                <p>BOB is always tipsy but never drunk.. but we all know the truth. Nevertheless, BOB is here to help you get tipsy.</p>
                {agents && agents[0]?.id && (
                    <NavLink
                        to={`/chat/${agents[0].id}`}
                        className="w-full grow"
                    >
                        <Button
                            variant="outline"
                            className="w-full bg-bonk-orange border-0 text-bonk-white py-8"
                        >
                            Say hi to Drunk BOB
                        </Button>
                    </NavLink>
                )}
            </div>
        </div>
    );
}
