"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mail, Send, Headphones, X } from "lucide-react";

export default function HelpPage() {
  // WhatsApp
  const [waPhone, setWaPhone] = useState<string>("+15551234567"); // edit to your support number
  const [waMessage, setWaMessage] = useState<string>("Hello, I need help with my order.");

  // Email note
  const [emailTo, setEmailTo] = useState<string>("support@example.com");
  const [emailSubject, setEmailSubject] = useState<string>("Support request");
  const [emailBody, setEmailBody] = useState<string>("");

  // Support bot modal
  const [botOpen, setBotOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: "bot" | "user"; text: string }>>([
    { from: "bot", text: "مرحباً! أنا هنا لمساعدتك. كيف أستطيع خدمتك اليوم؟" },
  ]);
  const [botInput, setBotInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, botOpen]);

  const openWhatsApp = () => {
    // wa.me requires phone in international format without + or dashes
    const phone = waPhone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(waMessage);
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, "_blank");
  };

  const sendMail = () => {
    const to = encodeURIComponent(emailTo);
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  const sendBotMessage = () => {
    const text = botInput.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setBotInput("");

    // simple canned bot response after a short delay
    setTimeout(() => {
      const reply = generateBotReply(text);
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 700 + Math.random() * 800);
  };

  const generateBotReply = (userText: string) => {
    const t = userText.toLowerCase();
    if (t.includes("order") || t.includes("طلب") || t.includes("status") || t.includes("حالة")) {
      return "يمكنك متابعة حالة الطلب من صفحة 'Orders'، أو أعطني رقم الطلب وسأتحقق لك.";
    }
    if (t.includes("refund") || t.includes("استرجاع") || t.includes("refund")) {
      return "لإجراء استرجاع، يرجى تزويدي برقم الطلب وسأوجهك خلال الخطوات.";
    }
    return "شكراً لسؤالك — فريق الدعم سيتواصل معك قريباً. هل تود إرسال ملاحظة عبر البريد أيضاً؟";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 ">
      <h1 className="text-2xl font-bold mb-6">Support / Help</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp card */}
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="text-green-600" />
            <h2 className="text-lg font-semibold">Contact on WhatsApp</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Open a WhatsApp chat with our support team.</p>
          <label className="text-xs text-muted-foreground">Phone</label>
          <Input value={waPhone} onChange={(e) => setWaPhone(e.target.value)} className="mb-2" />
          <label className="text-xs text-muted-foreground">Message</label>
          <textarea value={waMessage} onChange={(e) => setWaMessage(e.target.value)} className="w-full p-2 border rounded mb-3 min-h-[88px]" />
          <div className="flex gap-2">
            <Button onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700">
              <span className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48a11.93 11.93 0 10-16.94 16.94L2 22l1.58-1.58A11.93 11.93 0 0020.52 3.48zm-8.52 17.02a9.96 9.96 0 01-5.48-1.6l-.39-.26-3.27.86.87-3.18-.26-.4A9.96 9.96 0 1112 20.5zM17.6 14.22c-.28-.14-1.66-.82-1.92-.92-.26-.11-.45-.14-.64.14-.19.28-.74.92-.9 1.11-.16.19-.31.21-.59.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.46.14-.15.19-.26.28-.43.09-.16.05-.31-.02-.45-.07-.14-.64-1.54-.88-2.1-.23-.55-.47-.48-.64-.49-.16-.01-.35-.01-.54-.01s-.45.07-.69.33c-.24.26-.92.9-.92 2.2 0 1.29.94 2.54 1.07 2.72.13.19 1.85 2.86 4.49 4.01 3.03 1.33 3.03 0 3.57-.99.09-.18.54-.9.62-1.05.08-.15.16-.27.05-.42-.11-.15-.39-.51-.67-.66z"/></svg>WhatsApp</span>
            </Button>
            <Button variant="secondary" onClick={() => { setWaMessage(""); setWaPhone(""); }}>
              Clear
            </Button>
          </div>
        </div>

        {/* Email note */}
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="text-primary" />
            <h2 className="text-lg font-semibold">Send a note by Email</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Write a note and open your mail client to send it to support.</p>
          <label className="text-xs text-muted-foreground">To</label>
          <Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="mb-2" />
          <label className="text-xs text-muted-foreground">Subject</label>
          <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="mb-2" />
          <label className="text-xs text-muted-foreground">Message</label>
          <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full p-2 border rounded mb-3 min-h-[120px]" />
          <div className="flex gap-2">
            <Button onClick={sendMail}><span className="flex items-center gap-2"><Send size={14}/> Send Email</span></Button>
            <Button variant="ghost" onClick={() => { setEmailBody(""); setEmailSubject(""); }}>
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Support bot floating trigger */}
      <div className="fixed bottom-28 right-6">
        <button aria-label="Open support chat" onClick={() => setBotOpen(true)} className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
          <Headphones size={20} />
        </button>
      </div>

      {/* Bot Modal */}
      {botOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBotOpen(false)} />
          <div className="relative bg-card w-full md:w-96 max-h-[80vh] rounded-t-lg md:rounded-lg p-4 shadow-lg z-10 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare />
                <div className="font-semibold">Support Bot</div>
              </div>
              <button onClick={() => setBotOpen(false)} className="p-1 rounded-md hover:bg-accent"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-auto mb-3 p-2 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`px-3 py-2 rounded-lg max-w-[80%] ${m.from === 'bot' ? 'bg-gray-100 text-gray-900' : 'bg-primary text-primary-foreground'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input value={botInput} onChange={(e) => setBotInput(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a message..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendBotMessage(); } }} />
              <Button onClick={sendBotMessage}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
