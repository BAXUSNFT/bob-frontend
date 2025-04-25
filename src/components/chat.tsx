import { Button } from "@/components/ui/button";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useTransition, animated } from "@react-spring/web";
import { InfoIcon, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Content, UUID } from "@elizaos/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { cn, moment } from "@/lib/utils";
import { Avatar, AvatarImage } from "./ui/avatar";
import CopyButton from "./copy-button";
// import ChatTtsButton from "./ui/chat/chat-tts-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";
// import AIWriter from "react-aiwriter";
import { IAttachment } from "@/types";
import { AudioRecorder } from "./audio-recorder";
// import { Badge } from "./ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";
import ImageDialog from "./image-dialog";
import Markdown from "react-markdown"
import 'github-markdown-css'
import { useNavigate, useParams } from "react-router-dom";
import PromptSidebar from "./prompt-sidebar";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { WhiskeyRecommendations } from "./whiskey-recommendations";
import { parseRecommendationsFromText } from "@/lib/recommendations";

interface ExtraContentFields {
    user: string;
    createdAt: number;
    isLoading?: boolean;
}

type ContentWithUser = Content & ExtraContentFields;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0,
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function Page({ agentId }: { agentId: UUID }) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { roomId } = useParams();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [input, setInput] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const queryClient = useQueryClient();
    const wallet = useWallet();

    const getMessageVariant = (role: string) =>
        role !== "user" ? "received" : "sent";

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef?.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [queryClient.getQueryData(["messages", agentId])]);

    useEffect(() => {
        if (!userId) {
            setUserId(generateUUID());
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        if (roomId) {
            getRoomMemoriesMutation.mutate();
        }
    }, [roomId])

    useEffect(() => {
        // whenever wallet changes, navigate to base chat page
        // and set messages to empty
        if (!roomId) {
            navigate(`/chat/${agentId}`);
            queryClient.setQueryData(
                ["messages", agentId],
                () => []
            );
        }
    }, [wallet?.publicKey?.toBase58(), roomId])

    useEffect(() => {
        if (wallet.connected) {
            // let connectedWalletText = `Connected wallet: ${wallet.publicKey?.toBase58()} at ${Date.now()}`;
            // const newMessages = [
            //     {
            //         text: connectedWalletText,
            //         user: "user",
            //         createdAt: Date.now(),
            //     },
            //     {
            //         text: connectedWalletText,
            //         user: "system",
            //         isLoading: true,
            //         createdAt: Date.now(),
            //     },
            // ];
            // queryClient.setQueryData(
            //     ["messages", agentId],
            //     (old: ContentWithUser[] = []) => [...old, ...newMessages]
            // );

            // sendMessageMutation.mutate({
            //     message: connectedWalletText,
            //     selectedFile: null,
            // });
        }
    }, [wallet]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>, suggestedPrompt?: string) => {
        const userInput = suggestedPrompt ? suggestedPrompt : input;

        e.preventDefault();
        if (!userInput) return;

        let newRoomId;
        if (!roomId && wallet.publicKey?.toBase58()) { // only create and redirect to new room if wallet is connected
            const roomMutation = await createNewRoomMutation.mutateAsync();
            newRoomId = roomMutation.room;
        }

        scrollToBottom();

        const attachments: IAttachment[] | undefined = selectedFile
            ? [
                {
                    url: URL.createObjectURL(selectedFile),
                    contentType: selectedFile.type,
                    title: selectedFile.name,
                },
            ]
            : undefined;

        const newMessages = [
            {
                text: userInput,
                user: "user",
                createdAt: Date.now(),
                roomId: newRoomId !== undefined ? newRoomId : roomId,
                attachments,
            },
            {
                text: userInput,
                user: "system",
                isLoading: true,
                createdAt: Date.now(),
                roomId: newRoomId !== undefined ? newRoomId : roomId,
            },
        ];

        queryClient.setQueryData(
            ["messages", agentId],
            (old: ContentWithUser[] = []) => [...old, ...newMessages]
        );

        sendMessageMutation.mutate({
            message: userInput,
            selectedFile: selectedFile ? selectedFile : null,
            roomId: newRoomId !== undefined ? newRoomId : roomId,
        });

        setSelectedFile(null);
        setInput("");
        formRef.current?.reset();
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const createNewRoomMutation = useMutation({
        mutationFn: () => apiClient.createRoom(agentId),
        onSuccess: (data: any) => {
            navigate(`/chat/${agentId}/${data.room}`);
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Unable to create new room",
                description: e.message,
            });
        },
    })

    const sendMessageMutation = useMutation({
        mutationKey: ["send_message", agentId],
        mutationFn: ({
            message,
            selectedFile,
            roomId,
        }: {
            message: string;
            selectedFile?: File | null;
            wallet?: string;
            roomId?: string;
        }) => apiClient.sendMessage(agentId, message, selectedFile, wallet.publicKey?.toString(), roomId, userId!),
        onSuccess: (newMessages: ContentWithUser[]) => {
            queryClient.setQueryData(
                ["messages", agentId],
                (old: ContentWithUser[] = []) => {
                    // Remove loading messages
                    const filteredOld = old.filter(msg => !msg.isLoading);
                    
                    // Deduplicate messages based on content
                    const uniqueMessages = newMessages.reduce((acc: ContentWithUser[], curr) => {
                        // Only add message if it's not already in the accumulator with the same text
                        if (!acc.some(msg => msg.text === curr.text && msg.user === curr.user)) {
                            acc.push(curr);
                        }
                        return acc;
                    }, []);
                    
                    return [...filteredOld, ...uniqueMessages];
                }
            );
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Unable to send message",
                description: e.message,
            });
            // Remove loading message on error
            queryClient.setQueryData(
                ["messages", agentId],
                (old: ContentWithUser[] = []) => old.filter(msg => !msg.isLoading)
            );
        },
    });

    const getRoomMemoriesMutation = useMutation({
        mutationKey: ["get_room_memories", agentId],
        mutationFn: () => apiClient.getRoomMemories(agentId, roomId!),
        onSuccess: (data: any) => {
            console.log('get_room_memories', data.memories);
            // first set messages to empty
            queryClient.setQueryData(
                ["messages", agentId],
                () => []
            );
            // set messages to data.memories
            queryClient.setQueryData(
                ["messages", agentId],
                (old: ContentWithUser[] = []) => [
                    ...old,
                    ...data.memories.map((msg: any) => ({
                        ...msg,
                    })),
                ]
            );
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Unable to get room memories",
                description: e.message,
            });
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
        }
    };

    const messages =
        queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) ||
        [];

    const transitions = useTransition(messages, {
        keys: (message) =>
            `${message.createdAt}-${message.user}-${message.text}`,
        from: { opacity: 0, transform: "translateY(50px)" },
        enter: { opacity: 1, transform: "translateY(0px)" },
        leave: { opacity: 0, transform: "translateY(10px)" },
    });

    const handleSuggestedPromptClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        suggestedPrompt: string
    ) => {
        handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>, suggestedPrompt);
    }

    const suggestedPrompts = [
        {
            "prompt": "What is BONK?",
            "description": "Learn more about BONK and its ecosystem",
        },
        {
            "prompt": "I am new to BONK. Where do I start?",
            "description": "Get started in the BONK ecosystem",
        },
        {
            "prompt": "What are all the BONK products?",
            "description": "Explore the various products in the BONK ecosystem",
        },
        {
            "prompt": "How can I earn more BONK?",
            "description": "Discover ways to earn more BONK",
        },
        {
            "prompt": "Generate me a random image of BONK",
            "description": "Need some memes or images to show your support for BONK? Get a random image of BONK",
        },
        {
            "prompt": "Show me BONK whale trades",
            "description": "Want to know what the whales are doing? Get the latest whale trades",
        },
        {
            "prompt": "1d BONK chart",
            "header": "Daily BONK Price Chart Analytics",
            "description": "Generate key insights and potential price movements with Fridon AI! View and download your generated charts",
        },
        {
            "prompt": "Give me a BONK trading signal",
            "description": "Get a trading signal for BONK",
        },
    ]

    const bonkProducts = [
        {
            "name": "BONKrewards",
            "description": "BONKrewards is a platform that allows BONK token holders to lock their tokens for a set period (1, 3, 6, or 12 months) and earn a share of the BONK Rewards Pool.",
            "image": "/products/bonkrewards.png",
            "url": "https://bonkrewards.com",
            "steps": [
                "Select an amount of BONK to stake",
                "Select a duration to lock your BONK",
                "Verify and sign the transaction",
                "Claim your rewards at any time",
            ],
            "suggestedPrompts": [
                "How long can I lock my BONK for?",
                "What are the rewards for locking BONK?",
                "Are there other benefits to locking BONK?",
                "How do I claim my rewards?",
            ]
        },
        {
            "name": "BONKmark",
            "description": "BONKmark is a digital greeting card platform that allows users to send personalized e-cards to anyone, anywhere in the world.",
            "image": "/products/bonkmark.png",
            "url": "https://bonkmark.com",
            "steps": [
                "Connect your Solana wallet (like Phantom or Solflare)",
                "Pick a card design, customize your message, and choose how much $BONK to include",
                "Enter your recipient's email and hit send!@",
                "Recipients get a notification to view the card and claim the $BONK.",
            ],
            "suggestedPrompts": [
                "How do I send a BONKmark?",
                "How do I claim my BONK from a BONKmark?",
                "Can I send a BONKmark to someone without a wallet?",
                "What are the benefits of sending a BONKmark?",
            ]
        },
        {
            "name": "BONKlive",
            "description": "BONKLive is the official token launchpad for the BONK ecosystem, giving the BONK community early access to high-quality token launches.",
            "image": "/products/bonklive.png",
            "url": "https://bonk.live",
            "steps": [
                // "Select an amount of BONK to stake",
                // "Select a duration to lock your BONK",
                // "Verify and sign the transaction",
                // "Claim your rewards at the end of the lock period",
            ],
            "suggestedPrompts": [
                "What is BONKlive?",
                "How do I join a BONKlive launch?",
            ]
        },
        // {
        //     "name": "BONKbets",
        //     "description": "Sit sit sint sint nostrud aliqua. Ipsum esse mollit ex in culpa velit anim non cillum dolore voluptate ullamco laboris labore irure.",
        //     "image": "/products/bonkbets.png",
        //     "url": "https://bonkbets.io",
        //     "steps": [
        //         "Select an amount of BONK to stake",
        //         "Select a duration to lock your BONK",
        //         "Verify and sign the transaction",
        //         "Claim your rewards at the end of the lock period",
        //     ],
        //     "suggestedPrompts": [
        //         "How long can I stake my BONK for?",
        //         "What are the rewards for locking BONK?",
        //         "Are there other benefits to locking BONK?",
        //         "How do I claim my rewards?",
        //     ]
        // },
        {
            "name": "BONKscooper",
            "description": "BONKscooper is a tool that allows users to quickly and easily burn and convert unwanted Solana SPL tokens and account balances into BONK tokens.",
            "image": "/products/bonkscooper.png",
            "url": "https://bonkscooper.app",
            "steps": [
            ],
            "suggestedPrompts": [
                "What is BONKscooper?",
                "How do I use BONKscooper?",
                "How do I burn tokens with BONKscooper?",
            ]
        }
    ]

    console.log('messages', messages);

    return (
        <div className="grid md:grid-cols-[3fr_1fr] relative">
            <div className="flex flex-col w-full p-4 relative min-h-screen mx-auto max-w-3xl">
                <div className="flex-1 overflow-y-auto pb-[180px]">
                    <ChatMessageList ref={messagesContainerRef}>
                        {transitions((styles, message) => {
                            const variant = getMessageVariant(message?.user);
                            return (
                                // @ts-ignore
                                <animated.div
                                    style={styles}
                                    className="flex flex-col gap-2 sm:p-4 border-b-[0.5px] border-bonk-gray-light/50 dark:border-bonk-white/50 py-2"
                                >
                                    <ChatBubble
                                        variant={variant}
                                        className="flex flex-row items-start gap-4"
                                    >
                                        {message?.user !== "user" ? (
                                            <Avatar className="size-12 rounded-full select-none">
                                                <AvatarImage src="/bob_logo.png" />
                                            </Avatar>
                                        ) :
                                            <Avatar className="size-12 select-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-3/4 w-3/4 mx-auto"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
                                            </Avatar>
                                        }
                                        <div className="flex flex-col">
                                            <ChatBubbleMessage
                                                isLoading={message?.isLoading}
                                            >
                                                {message?.user !== "user" ? (
                                                    <div className='markdown-body'>
                                                        {message.text.includes("Based on your collection and preferences, here are my top 3 recommendations:") || 
                                                        message.text.includes("Here are my top recommendations under $") ? (
                                                            <WhiskeyRecommendations
                                                                recommendations={parseRecommendationsFromText(message.text)}
                                                            />
                                                        ) : (
                                                            <Markdown className={`max-w-xl`}>
                                                                {message?.text}
                                                            </Markdown>
                                                        )}
                                                    </div>
                                                ) : (
                                                    message?.text
                                                )}
                                                {/* Attachments */}
                                                <div>
                                                    {message?.attachments?.map(
                                                        (attachment, idx) => (
                                                            <div
                                                                className="flex flex-col gap-1 mt-2"
                                                                key={idx}
                                                            >
                                                                <ImageDialog
                                                                    imageUrl={attachment.url}
                                                                />
                                                                {attachment.text && <div className="pb-3">{attachment.text}</div>}
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span></span>
                                                                    <span></span>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </ChatBubbleMessage>
                                            <div className="flex items-center gap-4 w-full mt-1">
                                                {message?.text &&
                                                    !message?.isLoading ? (
                                                    <div className="flex items-center gap-1">
                                                        <CopyButton
                                                            text={message?.text}
                                                        />
                                                        {/* <ChatTtsButton
                                                            agentId={agentId}
                                                            text={message?.text}
                                                        /> */}
                                                    </div>
                                                ) : null}
                                                <div
                                                    className={cn([
                                                        message?.isLoading
                                                            ? "mt-2"
                                                            : "",
                                                        "flex items-center justify-between gap-4 select-none",
                                                    ])}
                                                >
                                                    {/* {message?.source ? (
                                                        <Badge variant="outline">
                                                            {message.source}
                                                        </Badge>
                                                    ) : null}
                                                    {message?.action ? (
                                                        <Badge variant="outline">
                                                            {message.action}
                                                        </Badge>
                                                    ) : null} */}
                                                    {message?.createdAt ? (
                                                        <ChatBubbleTimestamp
                                                            className="text-bonk-gray-light dark:text-bonk-white"
                                                            timestamp={moment(
                                                                message?.createdAt
                                                            ).format("LT")}
                                                        />
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </ChatBubble>
                                </animated.div>
                            );
                        }) as any}
                    </ChatMessageList>
                </div>
                <div className="sticky w-full bottom-0 py-4 bg-bonk-white dark:bg-bonk-gray-light">
                    <form
                        ref={formRef}
                        onSubmit={handleSendMessage}
                        className="relative rounded-md bg-bonk-white dark:bg-bonk-blue-dark shadow-xl focus-within:ring-1 ring-bonk-orange duration-300 transition-all"
                    >
                        {selectedFile ? (
                            <div className="p-3 flex">
                                <div className="relative rounded-md border p-2">
                                    <Button
                                        onClick={() => setSelectedFile(null)}
                                        className="absolute -right-2 -top-2 size-[22px] ring-2 ring-background"
                                        variant="outline"
                                        size="icon"
                                    >
                                        <X />
                                    </Button>
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        height="100%"
                                        width="100%"
                                        className="aspect-square object-contain w-16"
                                    />
                                </div>
                            </div>
                        ) : null}
                        <ChatInput
                            ref={inputRef}
                            onKeyDown={handleKeyDown}
                            value={input}
                            onChange={({ target }) => setInput(target.value)}
                            placeholder="Type your message here..."
                            className="min-h-12 resize-none rounded-md bg-transparent border-0 p-3 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex items-center p-3 pt-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.click();
                                                }
                                            }}
                                        >
                                            <Paperclip className="size-4" />
                                            <span className="sr-only">
                                                Attach file
                                            </span>
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>Attach file</p>
                                </TooltipContent>
                            </Tooltip>
                            <AudioRecorder
                                agentId={agentId}
                                onChange={(newInput: string) => setInput(newInput)}
                            />
                            <Button
                                disabled={!input || sendMessageMutation?.isPending}
                                type="submit"
                                size="sm"
                                className="ml-auto gap-1.5 h-[30px] bg-bonk-orange text-bonk-white"
                            >
                                {sendMessageMutation?.isPending
                                    ? "..."
                                    : "Send Message"}
                                <Send className="size-3.5" />
                            </Button>
                        </div>
                    </form>
                    <Dialog>
                        <DialogTrigger className="flex justify-center mx-auto mt-4">
                            <p className="text-xs">BOB is an alcoholic. Be sure to verify important information.</p>
                            <InfoIcon className="size-4 ml-2" />
                        </DialogTrigger>
                    </Dialog>
                </div>
            </div>
            <PromptSidebar 
                suggestedPrompts={suggestedPrompts}
                bonkProducts={bonkProducts}
                handleSuggestedPromptClick={handleSuggestedPromptClick}
                sendMessageMutation={sendMessageMutation}
            />
        </div>
    );
}
