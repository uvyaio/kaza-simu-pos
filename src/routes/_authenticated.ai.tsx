import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Mic } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai")({
  head: () => ({ meta: [{ title: "AI Assistant — KaliPOS" }, { name: "description", content: "Ask anything about your shop in plain language." }] }),
  component: AI,
});

type Msg = { role: "user" | "ai"; text: string };

const seed: Msg[] = [
  { role: "ai", text: "Habari Joseph! 👋 I'm your KaliPOS assistant. Ask me anything about your shop — sales, stock, customers, profits. I can also draft WhatsApp reports for you." },
  { role: "user", text: "What products made the least profit this week?" },
  { role: "ai", text: "**Cooking Fat** and **Mumias Sugar** had the lowest margin this week — both dropped ~12% due to wholesale price increases.\n\n💡 Suggestion: Negotiate with Bidco Africa or raise sugar shelf price by KSh 15 to recover margin." },
  { role: "user", text: "What stock should I reorder today?" },
  { role: "ai", text: "Based on sales velocity, reorder these within 3 days:\n\n• **Daawat Rice 2kg** — 2 days left\n• **Brookside Milk 500ml** — 3 days\n• **Supa Loaf Bread** — 1 day\n• **Coca-Cola 500ml** — 3 days\n\nWant me to create a draft purchase order?" },
];

const prompts = [
  "Summarize today's sales",
  "Which cashier sold the most this week?",
  "Predict tomorrow's busiest hours",
  "Send WhatsApp report to my partner",
];

function AI() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  const send = (t: string) => {
    if (!t.trim()) return;
    setMsgs(m => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMsgs(m => [...m, { role: "ai", text: "Let me check your shop data... ✨\n\nAnalysing sales patterns and inventory in real-time. Here's what I found: your evening sales (5–8 PM) drive 42% of daily revenue. Consider running a flash promo on slow-moving items between 2–4 PM to balance footfall." }]);
    }, 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-3xl mx-auto w-full">
      <div className="px-4 sm:px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <h1 className="font-bold text-lg">KaliPOS AI</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />Trained on your shop's last 90 days</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
              m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border rounded-bl-sm shadow-soft"
            }`}>
              {m.text.split("**").map((part, idx) => idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part)}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 sm:px-6 py-3 border-t bg-card/50">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompts.map(p => (
            <button key={p} onClick={() => send(p)} className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-muted transition-colors">
              {p}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 items-center">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your shop..." className="h-11" />
          <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0"><Mic className="h-4 w-4" /></Button>
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0 gradient-primary border-0"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  );
}
