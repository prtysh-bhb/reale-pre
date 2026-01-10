// src/hooks/useChatSocket.ts
import { useEffect, useRef, useState } from "react";
import { createSocket, getSocket, closeSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

type ChatMessage = {
  id: string | number;
  conversationId: number;
  sender: "me" | "them" | "system";
  text: string;
  time?: string;
};

type UseChatSocketReturn = {
  connected: boolean;
  sendMessage: (payload: { conversationId: number; text: string }) => void;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  setTyping: (conversationId: number, isTyping: boolean) => void;
  onMessage: (cb: (msg: ChatMessage) => void) => void;
  onTyping: (cb: (conversationId: number, isTyping: boolean) => void) => void;
  disconnect: () => void;
};

export const useChatSocket = (serverUrl: string, authToken?: string): UseChatSocketReturn => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageHandlers = useRef<((m: ChatMessage) => void)[]>([]);
  const typingHandlers = useRef<((convId: number, t: boolean) => void)[]>([]);

  useEffect(() => {
    const socket = createSocket(serverUrl, authToken);
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Incoming message event from server
    socket.on("chat:message", (payload: ChatMessage) => {
      messageHandlers.current.forEach((h) => h(payload));
    });

    // Typing indicator event
    socket.on("chat:typing", (payload: { conversationId: number; typing: boolean }) => {
      typingHandlers.current.forEach((h) => h(payload.conversationId, payload.typing));
    });

    return () => {
      // cleanup
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat:message");
      socket.off("chat:typing");
      // do not close socket globally here if reused across pages. If you want strict lifecycle, call disconnect().
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, authToken]);

  const sendMessage = (payload: { conversationId: number; text: string }) => {
    const socket = socketRef.current ?? getSocket();
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }
    // emit message to server
    socket.emit("chat:send", payload);
  };

  const joinConversation = (conversationId: number) => {
    const socket = socketRef.current ?? getSocket();
    if (!socket) return;
    socket.emit("chat:join", { conversationId });
  };

  const leaveConversation = (conversationId: number) => {
    const socket = socketRef.current ?? getSocket();
    if (!socket) return;
    socket.emit("chat:leave", { conversationId });
  };

  const setTyping = (conversationId: number, isTyping: boolean) => {
    const socket = socketRef.current ?? getSocket();
    if (!socket) return;
    socket.emit("chat:typing", { conversationId, typing: isTyping });
  };

  const onMessage = (cb: (m: ChatMessage) => void) => {
    messageHandlers.current.push(cb);
    return () => {
      messageHandlers.current = messageHandlers.current.filter((c) => c !== cb);
    };
  };

  const onTyping = (cb: (conversationId: number, isTyping: boolean) => void) => {
    typingHandlers.current.push(cb);
    return () => {
      typingHandlers.current = typingHandlers.current.filter((c) => c !== cb);
    };
  };

  const disconnect = () => {
    const socket = socketRef.current ?? getSocket();
    if (socket) {
      socket.disconnect();
      closeSocket();
      socketRef.current = null;
    }
  };

  return {
    connected,
    sendMessage,
    joinConversation,
    leaveConversation,
    setTyping,
    onMessage,
    onTyping,
    disconnect,
  };
};
