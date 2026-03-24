'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ChatMessage } from '@/lib/db';
import { getChatHistory, addChatMessage } from '@/actions/chat';
import { getRecentSymptoms } from '@/actions/symptoms';
import { getRecentSleep } from '@/actions/sleep';
import { getRecentFood } from '@/actions/food';
import { getRecentMood } from '@/actions/mood';
import { getRecentCycle } from '@/actions/cycle';

export default function CompanionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const stored = await getChatHistory();
      setMessages(stored);
    }
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function getRecentData() {
    const [symptoms, sleep, food, mood, cycle] = await Promise.all([
      getRecentSymptoms(7),
      getRecentSleep(7),
      getRecentFood(7),
      getRecentMood(7),
      getRecentCycle(7),
    ]);
    return { symptoms, sleep, food, mood, cycle };
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      id: '',
      timestamp: Date.now(),
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMsg]);
    await addChatMessage({ timestamp: Date.now(), role: 'user', content: text });

    setSending(true);
    try {
      const context = await getRecentData();
      const history = messages.slice(-20).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, context }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: '',
        timestamp: Date.now(),
        role: 'assistant',
        content: data.reply,
      };

      setMessages(prev => [...prev, assistantMsg]);
      await addChatMessage({ timestamp: Date.now(), role: 'assistant', content: data.reply });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  const suggestions = [
    'How am I doing this week?',
    'What foods should I avoid?',
    'Explain my sleep score',
    'Help me prepare for my doctor visit',
  ];

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[100dvh] bg-bg">
      {/* Header */}
      <div className="bg-bg border-b border-border px-4 pt-4 pb-3 flex items-center gap-3 z-10">
        <Link href="/" className="w-8 h-8 rounded-lg bg-bg-secondary border border-border flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-primary">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Guta</h1>
            <p className="text-[10px] text-text-tertiary font-medium">Your wellness companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">Hi! I&apos;m Guta</p>
              <p className="text-sm text-text-secondary mt-1 max-w-[260px]">
                Your personal wellness companion. I know your history and I&apos;m here to help.
              </p>
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-[300px] space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-xs text-left font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0 mr-2 mt-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[78%] rounded-xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-[#7C3AED] text-white rounded-br-md'
                : 'bg-bg-secondary border border-border text-text-primary rounded-bl-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0 mr-2 mt-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl rounded-bl-md px-5 py-3.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-bg border border-red-200 rounded-xl px-4 py-3 animate-slide-up">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-3 bg-bg border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Guta anything..."
            className="flex-1 px-5 py-3 rounded-xl bg-bg-secondary border border-border text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-xl bg-[#7C3AED] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
