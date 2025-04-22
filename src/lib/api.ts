import { type UUID, type Character } from "@elizaos/core";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const fetcher = async ({
    url,
    method,
    body,
    headers,
}: {
    url: string;
    method?: "GET" | "POST";
    body?: object | FormData;
    headers?: HeadersInit;
}) => {
    const options: RequestInit = {
        method: method ?? "GET",
        headers: headers
            ? headers
            : {
                  Accept: "application/json",
                  "Content-Type": "application/json",
              },
    };

    if (method === "POST") {
        if (body instanceof FormData) {
            // @ts-expect-error - Supressing potentially undefined options header
            delete options.headers["Content-Type"];
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }
    
    return fetch(`${BASE_URL}${url}`, options).then(async (resp) => {
        if (resp.ok) {
            const contentType = resp.headers.get("Content-Type");

            if (contentType === "audio/mpeg") {
                return await resp.blob();
            }
            return resp.json();
        }

        const errorText = await resp.text();
        console.error("Error: ", errorText);

        let errorMessage = "An error occurred.";
        try {
            const errorObj = JSON.parse(errorText);
            errorMessage = errorObj.message || errorMessage;
        } catch {
            errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
    });
};

// Import the BoozappItem type
export interface BoozappItem {
  id: number;
  bar_id: number;
  fill_percentage: number;
  product: {
    name: string;
    image_url: string;
    brand: string;
    spirit: string;
    proof: number;
    size: string;
    average_msrp: number;
  };
}

export const apiClient = {
    sendMessage: (
        agentId: string,
        message: string,
        selectedFile?: File | null,
        wallet?: string,
        roomId?: string,
        userId?: string
    ) => {
        const formData = new FormData();
        formData.append("text", message);
        formData.append("user", "user");
        if (wallet) {
            formData.append("wallet", wallet);
        }

        if (userId) {
            formData.append("userId", userId);
        }
        
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        if (roomId) {
            formData.append("roomId", roomId);
        }

        return fetcher({
            url: `/${agentId}/message`,
            method: "POST",
            body: formData,
        });
    },
    getAgents: () => fetcher({ url: "/agents" }),
    getAgent: (agentId: string): Promise<{ id: UUID; character: Character }> =>
        fetcher({ url: `/agents/${agentId}` }),
    tts: (agentId: string, text: string) =>
        fetcher({
            url: `/${agentId}/tts`,
            method: "POST",
            body: {
                text,
            },
            headers: {
                "Content-Type": "application/json",
                Accept: "audio/mpeg",
                "Transfer-Encoding": "chunked",
            },
        }),
    whisper: async (agentId: string, audioBlob: Blob) => {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");
        return fetcher({
            url: `/${agentId}/whisper`,
            method: "POST",
            body: formData,
        });
    },
    getRooms: (agentId: string, walletAddress: string) => fetcher({ url: `/rooms/${agentId}/${walletAddress}` }),
    createRoom: (agentId: string) => fetcher({ url: `/room/create/${agentId}`, method: "POST" }),
    getRoomMemories: (agentId: string, roomId: string) => fetcher({ url: `/agents/${agentId}/${roomId}/memories` }),
    getBoozappCollection: async (username: string): Promise<BoozappItem[]> => {
        try {
            const apiUrl = `https://services.baxus.co/api/bar/user/${username}`;
            return await fetcher({ url: apiUrl });
        } catch (error) {
            console.error("Error fetching Boozapp collection:", error);
            throw error;
        }
    },
};
