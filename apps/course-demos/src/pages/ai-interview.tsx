import React, { useState } from 'react';
import { NewText, CTALinkOrButton } from '@bluedot/ui';
import { useCompletion } from '@ai-sdk/react';

const DemoPage: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'student' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [view, setView] = useState<'prompt' | 'display'>('prompt');

  const {
    completion: aiResponse,
    complete,
    isLoading: loading,
    error,
  } = useCompletion({
    api: '/api/ai-interview',
    onResponse: () => setView('display'),
  });

  // When AI responds, add its message to the conversation
  React.useEffect(() => {
    if (aiResponse && view === 'display') {
      setMessages((prev) => [...prev, { role: 'ai', text: aiResponse }]);
      setView('prompt');
    }
  }, [aiResponse, view]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'student', text: input }]);
    complete(input);
    setInput('');
    setView('display');
  };

  return (
    <main className="mx-auto px-4 max-w-xl">
      <NewText.H1 className="mb-4">AI Interview</NewText.H1>
      <div className="border rounded p-4 bg-white min-h-[300px] mb-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <NewText.P className="text-gray-500">Start the conversation by asking a question or answering the AI.</NewText.P>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === 'student'
                ? 'bg-blue-100 self-end text-right'
                : 'bg-stone-200 self-start text-left'
            }`}
          >
            <span className="font-semibold">{msg.role === 'student' ? 'You' : 'AI'}: </span>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="p-2 rounded bg-stone-100 self-start text-left text-gray-500">
            AI is typing...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <CTALinkOrButton type="submit" disabled={loading || !input.trim()}>
          Send
        </CTALinkOrButton>
      </form>
      {error && (
        <div className="mt-4 text-red-500">
          Error: {error.message}
        </div>
      )}
    </main>
  );
};

export default DemoPage;
