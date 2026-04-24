import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateOpenaiConversation, useListOpenaiMessages } from "@workspace/api-client-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createConv = useCreateOpenaiConversation();
  
  // Load history if we have an ID
  const { data: history } = useListOpenaiMessages(conversationId || 0, {
    query: { enabled: !!conversationId }
  });

  useEffect(() => {
    if (history && history.length > 0) {
      const formatted = history.map(h => ({
        id: String(h.id),
        role: h.role as "user" | "assistant",
        content: h.content
      }));
      // Keep optimistic messages if they exist, otherwise use history
      setMessages(prev => prev.length > formatted.length ? prev : formatted);
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!conversationId) {
      try {
        const conv = await createConv.mutateAsync({ data: { title: "Chat OralCare" } });
        setConversationId(conv.id);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Hola. Soy el asistente virtual de A&E OralCare. ¿En qué te puedo ayudar hoy?"
          }
        ]);
      } catch (e) {
        console.error("Failed to create conversation", e);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    const userMessage = inputValue;
    setInputValue("");
    
    // Optimistic update
    const tempUserId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempUserId, role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const tempAsstId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: tempAsstId, role: "assistant", content: "" }]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.trim() && l.startsWith('data: '));
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantMessage += data.content;
              setMessages(prev => 
                prev.map(m => m.id === tempAsstId ? { ...m, content: assistantMessage } : m)
              );
            }
            if (data.done) break;
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    } catch (e) {
      console.error("Failed to send message", e);
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all group"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0 0 0 0 rgba(139, 26, 42, 0.4)", "0 0 0 15px rgba(139, 26, 42, 0)"]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full"
            />
            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-50 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Asistente Virtual</h3>
                  <p className="text-xs text-white/80">A&E OralCare</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={scrollRef}>
              {createConv.isPending && messages.length === 0 && (
                <div className="flex justify-center items-center h-full text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-primary/10 text-primary"
                    }`}>
                      {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.role === "user" 
                        ? "bg-primary text-white rounded-tr-sm" 
                        : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 rounded-tl-sm shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 shrink-0">
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="pr-10 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-primary"
                  disabled={!conversationId || isTyping}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1 w-8 h-8 rounded-full text-primary hover:bg-primary/10 hover:text-primary"
                  disabled={!inputValue.trim() || isTyping || !conversationId}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
