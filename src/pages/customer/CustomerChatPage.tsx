/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import ReactPlayer from 'react-player';
import { 
  MessageCircle, 
  Search, 
  Send, 
  ArrowLeft, 
  Paperclip, 
  Image as ImageIcon,
  FileText,
  X,
  Download,
  ArrowDown
} from "lucide-react";
import { ChatMessage, getCustomerAgents, getMessages, isTypingCall, MessageFormData, readAgentMessages, sentMessage, UnreadCountMap, unreadMessagesCountCustomer } from "@/api/customer/customerMessages";
import { useAuth } from "@/context/AuthContext";
import { formatTime } from "@/helpers/customer_helper";
import echo from "@/lib/echo";
import { Agent } from "@/types";

const CustomerChatPage = () => {
  const { user } = useAuth();

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>();
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountMap>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "file" | "video">("file");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const selectedChatRef = useRef<number | null>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);

  // mobile UI
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileChatOpen, setMobileChatOpen] = useState<boolean>(false);

  // conversations & messages
  const [conversations, setConversations] = useState<Agent[]>();
  const [messagesByConversation, setMessagesByConversation] = useState<ChatMessage[]>();

  // refs
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAgents = async () => {
    const data = await getCustomerAgents();    
    setConversations(data.agents);
  }

  const fetchMessages = async (agentId: number) => {    
    const response = await getMessages(agentId);
    setMessagesByConversation(response.data);
  }

  useEffect(() => {    
    if (!user?.id) return;

    echo.private(`send-message.${user?.id}`)
    .listen(".message.sent", async (data: any) => {
      if(data.sender_user_id == selectedChatRef.current){
        fetchMessages(data.sender_user_id);
        await readAgentMessages(data.sender_user_id);
      }

      if(data?.from_inquiry){
        fetchAgents();
      }

      fetchUnreadCounts();
    });

    echo.private(`is-typing.${user?.id}`)
    .listen(".is-typing", (data: any) => {      
      if(data.sender_user_id == selectedChatRef.current){
        setIsTyping(true);
  
        setTimeout(() => {
          setIsTyping(false);
        }, 1500);
      }
    });
  }, [user?.id]);

  useEffect(() => {    
    if(!selectedChat) return;    
    selectedChatRef.current = selectedChat;
    fetchMessages(Number(selectedChat));
  }, [selectedChat]);

  const fetchUnreadCounts = async () => {
    const res = await unreadMessagesCountCustomer();
    setUnreadCounts(res.data);
  }

  // handle responsive detection
  useEffect(() => {
    fetchAgents();
    fetchUnreadCounts();

    function check() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileChatOpen(false);
      }
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (chatScrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100; // 100px threshold
        setShowScrollToBottom(!isAtBottom);
      }
    };

    const scrollContainer = chatScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messagesByConversation, selectedChat]);

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // auto-scroll messages to bottom when messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messagesByConversation, isTyping, selectedChat]);

  // handle selecting conversation
  const handleSelectConversation = async (agentId: number) => {
    await readAgentMessages(agentId);
    fetchUnreadCounts();
    setSelectedChat(agentId);
    setSelectedFile(null);
    if (isMobile) {
      setMobileChatOpen(true);
    }
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Determine file type
    if (file.type.startsWith("image/")) {
      setFileType("image");
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
    } else {
      setFileType("file");
      setFilePreview(null);
      return;
    }

    // Only run preview logic for image & video
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || selectedChat == null || isSending) return;

    const agentId = selectedChat;
    const text = messageInput.trim();

    // Create form data for API call
    const formData: MessageFormData = {
      receiver_id: agentId,
      type: selectedFile ? fileType : "text",
      message: text,
      file: selectedFile,
      property_id: null,
      meta: null
    };

    setMessageInput("");
    setIsSending(true);
    emitTyping(false);

    try {
      // Call Laravel API
      const response = await sentMessage(formData);
      
      if (response.success) {
        console.log("Message sent successfully");
        // Clear file selection after successful send
        removeSelectedFile();
      } else {
        console.error("Failed to send message:", response.message);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
      fetchMessages(Number(selectedChat));
    }
  };

  // typing events
  const emitTyping = async (typing: boolean) => {
    if (typing) {
      await isTypingCall(Number(selectedChat));
    }
  };

  // input change (emit typing start/stop)
  const handleInputChange = (value: string) => {
    setMessageInput(value);
    if (!selectedChat) return;
    
    emitTyping(true);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      emitTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'file':
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedConversation = conversations?.find((c) => c.id === selectedChat);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 h-full">
        {/* LEFT: Conversations list */}
        <div
          className={`col-span-12 md:col-span-4 border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-0 ${
            isMobile ? (mobileChatOpen ? "hidden" : "block") : "block"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
                <MessageCircle className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Messages
              </h2>
            </div>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-full placeholder-gray-500"
              />
            </div>
          </div>

          {/* Scrollable conversations list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {conversations
            ?.filter((agent) => agent.name.toLowerCase().includes(searchQuery.toLowerCase())).map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleSelectConversation(agent.id)}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all ${
                  selectedChat === agent.id
                    ? "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-600 dark:border-l-emerald-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {agent.name.charAt(0)}
                      </div>
                      {agent.is_active && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {agent.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {"Real Estate Agent"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end w-10 h-10">
                    {unreadCounts && unreadCounts[agent?.id] > 0 && (
                      <p className="ml-2 px-2 py-0.5 bg-blue-600 dark:bg-emerald-600 text-white text-xs font-bold rounded-full">
                        {unreadCounts[agent?.id]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Chat area */}
        <div
          className={`col-span-12 md:col-span-8 flex flex-col min-h-0 ${
            isMobile ? (mobileChatOpen ? "block" : "hidden") : "block"
          }`}
        >
          {selectedChat ? (
            <>
              {/* Header with back button on mobile */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
                      onClick={() => setMobileChatOpen(false)}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {selectedConversation?.name?.charAt(0) ?? "A"}
                    </div>
                    {selectedConversation?.is_active && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation?.name ?? "Agent"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {"Real Estate Agent"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Messages */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/30 min-h-0"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {messagesByConversation?.map((message) => (
                  <div key={message.id} className={`flex ${message.sender_id == user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${message.sender_id == user.id ? "order-2" : "order-1"}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender_id == user.id
                            ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white"
                            : "bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                        }`}
                        style={{ maxWidth: "100%", maxHeight: "35rem", overflow: "auto" }}
                      >
                        {/* Text Message */}
                        {message.type === 'text' && (
                          <p className="text-sm break-words whitespace-pre-wrap">{message.message}</p>
                        )}
                        
                        {/* Image Message */}
                        {message.type === 'image' && message.file_url && (
                          <div className="space-y-2">
                            <div className="relative group">
                              <img 
                                src={message.file_url} 
                                alt={message.file_name || 'Shared image'}
                                className="max-w-full max-h-64 rounded-lg object-cover"
                              />
                              <a target="_blank"
                                href={message.file_url} 
                                download={message.file_name}
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Download size={16} />
                              </a>
                            </div>
                            {message.file_name && (
                              <p className="text-xs text-gray-300 dark:text-gray-400 truncate">
                                {message.file_name.length > 30
                                ? message.file_name.substring(0, 30) + "..."
                                : message.file_name}
                              </p>
                            )}

                            {message.message && (
                              <p className="text-sm break-words whitespace-pre-wrap mt-2">{message.message}</p>
                            )}
                          </div>
                        )}

                        {/* Video Message */}
                        {message.type === 'video' && message.file_url && (
                          <div className="space-y-2">
                            <div className="relative group">
                              <ReactPlayer
                                src={message?.file_url ?? ''}
                                width="100%"
                                height="100%"
                                controls
                                style={{ borderRadius: '12px' }}
                              />
                              <a target="_blank"
                                href={message.file_url} 
                                download={message.file_name}
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Download size={16} />
                              </a>
                            </div>
                            {message.file_name && (
                            <p className="text-xs text-gray-300 dark:text-gray-400 truncate">
                              {message.file_name.length > 30
                              ? message.file_name.substring(0, 30) + "..."
                              : message.file_name}
                            </p>
                            )}

                            {message.message && (
                              <p className="text-sm break-words whitespace-pre-wrap mt-2">{message.message}</p>
                            )}
                          </div>
                        )}
                        
                        {/* File Message */}
                        {message.type === 'file' && message.file_url && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                              <FileText className="w-8 h-8" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {message?.file_name && message?.file_name.length > 30
                                  ? message?.file_name.substring(0, 30) + "..."
                                  : message.file_name || 'Document'}
                                </p>
                                <p className="text-xs capitalize">
                                  {message.type || 'File'}
                                </p>
                              </div>
                              <a 
                                href={message?.file_url ?? ""}
                                download={message.file_name}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
                              >
                                <Download size={16} />
                              </a>
                            </div>

                            {message.message && (
                              <p className="text-sm break-words whitespace-pre-wrap mt-2">{message.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.sender_id == user.id ? "text-right" : "text-left"}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}

                {showScrollToBottom && (
                  <button
                    ref={scrollButtonRef}
                    onClick={scrollToBottom}
                    className="fixed bottom-36 right-8 cursor-pointer md:right-6 p-3 bg-gray-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                    title="Scroll to bottom"
                  >
                    <ArrowDown size={20} />
                  </button>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[60%]">
                      <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedConversation?.name || "Agent"} is typing...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Preview */}
              {selectedFile && (
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        {getFileIcon(fileType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(selectedFile.size)} • {fileType}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeSelectedFile}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Image Preview */}
                  {filePreview && fileType === 'image' && (
                    <div className="mt-2">
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="max-w-48 max-h-32 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  {/* File Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.mp4,.mov,.avi,.mkv,.webm"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    title="Attach file"
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && !selectedFile) || isSending}
                    className="p-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select an agent to start messaging</p>
                <p className="text-sm text-gray-400 mt-2">
                  Choose from your connected real estate agents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChatPage;