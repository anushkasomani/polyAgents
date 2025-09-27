"use client";
import React, { useState } from 'react';

interface TextInputPanelProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

export default function TextInputPanel({ onSubmit, loading }: TextInputPanelProps) {
  const [userText, setUserText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userText.trim()) {
      onSubmit(userText.trim());
    }
  };

  const exampleQueries = [
    "Get me the latest news on BTC and ETH",
    "What's the weather like in London tomorrow?",
    "I want news about DOGE and weather in New York",
    "Get me crypto news and weather forecast for Tokyo"
  ];

  return (
    <div className="p-4 bg-panel rounded-lg shadow-soft">
      <h4 className="font-medium mb-3">Request Services</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="userText" className="block text-sm font-medium mb-2">
            Describe what you need:
          </label>
          <textarea
            id="userText"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="e.g., Get me the latest news on BTC and weather in London..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !userText.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Request Services'}
        </button>
      </form>

      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Example queries:</p>
        <div className="space-y-1">
          {exampleQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => setUserText(query)}
              className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-gray-50"
              disabled={loading}
            >
              "{query}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
