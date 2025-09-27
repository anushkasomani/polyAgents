"use client";
import React, { useState } from 'react';

type Message = { id: string; role: 'user' | 'assistant' | 'system'; text: string };

export default function ChatUI({ onSubmit, response }:{ onSubmit:(text:string)=>Promise<void> | void, response?: any }){
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    const t = text.trim();
    if (!t) return;
    const m: Message = { id: String(Date.now()), role: 'user', text: t };
    setMessages((s) => [...s, m]);
    setText('');
    setLoading(true);
    try {
      await onSubmit(t);
      // show placeholder assistant reply until backend populates response panel
      setMessages((s) => [...s, { id: String(Date.now()+1), role: 'assistant', text: 'Processing... (response will appear in the right panel)' }]);
    } catch (e) {
      setMessages((s) => [...s, { id: String(Date.now()+2), role: 'assistant', text: 'Failed to process request' }]);
    } finally {
      setLoading(false);
    }
  }

  // append assistant message when `response` prop changes
  React.useEffect(() => {
    if (!response) return;
    // extract a readable string from response
    let text = '';
    try {
      if (typeof response === 'string') text = response;
      else if (response?.text) text = response.text;
      else if (response?.json) text = typeof response.json === 'string' ? response.json : JSON.stringify(response.json);
      else text = JSON.stringify(response);
    } catch (e) {
      text = String(response);
    }
    // remove previous 'Processing...' placeholder if present
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.text !== 'Processing... (response will appear in the right panel)');
      return [...filtered, { id: String(Date.now()), role: 'assistant', text }];
    });
  }, [response]);

  return (
    <div className="flex flex-col h-full">
      <div className="h-[420px] overflow-auto p-4 bg-panel rounded-lg shadow-soft flex-1" style={{border:'1px solid rgba(255,255,255,0.03)'}}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-sm text-gray-500">Ask me anything about payments, networks, or the demo.</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-3 py-2 rounded-md max-w-[85%] ${m.role === 'user' ? 'bg-[color:var(--accent)] text-white' : 'bg-white/5 text-gray-200'}`}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="What would you like to know?" className="flex-1 px-3 py-2 rounded-md bg-white/5 text-sm"/>
        <button onClick={submit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60">Send</button>
      </div>
    </div>
  );
}
