import { useWallet } from "@solana/wallet-adapter-react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Transaction } from '@solana/web3.js';
import { useToast } from "@/hooks/use-toast";
import { Buffer } from 'buffer';

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const wallet = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (wallet.publicKey) {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("Connected to WebSocket server");
        ws.send(JSON.stringify({ type: "register", wallet: wallet.publicKey?.toBase58() }));

        setSocket(ws);
        console.log(ws);
      };

      ws.onmessage = (event) => {
        console.log(`wallet.publicKey: ${wallet.publicKey?.toBase58()}`);
        const data = JSON.parse(event.data);
        console.log(`message data`, data);
        if (data && data.type === "sign_message") {
          async function handleSignMessage() {
            await wallet!.signMessage!(new TextEncoder().encode(data.message));
          }
          handleSignMessage();

          console.log("Received sign_message request from server");
        }

        if (data && data.type === "lock_bonk") {
          async function handleLockBonk(serializedTx: string) {
            // Step 1: Convert base64 string back to Buffer
            const transactionBuffer = Buffer.from(serializedTx, 'base64');

            // Step 2: Deserialize the transaction
            const transaction = Transaction.from(transactionBuffer);

            const signedTx = await wallet!.signTransaction!(transaction);
            ws.send(JSON.stringify({ type: "lock_tx_success", wallet: wallet.publicKey?.toString(), transaction: signedTx.serialize() }));
            toast({
              title: "Locked successfully!",
            });
          }
          handleLockBonk(data.transaction);

          console.log("Received lock_bonk request from server");
        }

        if (data && data.type === "claim_bonk") {
          async function handleClaimBonk(serializedTxs: string[]) {
            let deserializeTransactions = [];

            // Step 1: Convert base64 string back to Buffer
            for (const serializedTx of serializedTxs) {
              const transactionBuffer = Buffer.from(serializedTx, 'base64');

              // Step 2: Deserialize the transaction
              const transaction = Transaction.from(transactionBuffer);
              deserializeTransactions.push(transaction);
            }

            const signedTxs = await wallet!.signAllTransactions!(deserializeTransactions);
            ws.send(JSON.stringify({ type: "claim_tx_success", wallet: wallet.publicKey?.toString(), transaction: signedTxs.map(tx => tx.serialize()) }));
            toast({
              title: "Claimed successfully!",
            });
          }
          handleClaimBonk(data.transaction);

          console.log("Received claim_bonk request from server");
        }

        console.log("Received from server:", JSON.parse(event.data));
      };

      ws.onclose = () => {
        console.log("Disconnected from WebSocket server");
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      return () => {
        ws.close();
      };
    }
  }, [wallet]);

  const sendMessage = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
