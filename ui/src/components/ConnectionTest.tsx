import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ORCHESTRATOR_ENDPOINT = 'http://localhost:5400';

export function ConnectionTest() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing backend connection...');
      const response = await fetch(`${ORCHESTRATOR_ENDPOINT}/health`);
      const data = await response.json();
      console.log('✅ Backend response:', data);
      setResults({ type: 'success', data });
    } catch (error) {
      console.error('❌ Backend error:', error);
      setResults({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testIntent = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing intent processing...');
      const response = await fetch(`${ORCHESTRATOR_ENDPOINT}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: 'Get BTC news and sentiment'
        })
      });
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (response.status === 402) {
        setResults({ type: 'success', data, message: 'Intent processing successful (402 is expected)' });
      } else {
        setResults({ type: 'error', error: `Unexpected status: ${response.status}`, data });
      }
    } catch (error) {
      console.error('❌ Intent error:', error);
      setResults({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testExecution = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing service execution...');
      
      // First get a plan
      const processResponse = await fetch(`${ORCHESTRATOR_ENDPOINT}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: 'Get BTC news and sentiment'
        })
      });
      
      const processData = await processResponse.json();
      console.log('📋 Plan:', processData.plan);
      
      if (processResponse.status === 402) {
        // Execute services
        const executeResponse = await fetch(`${ORCHESTRATOR_ENDPOINT}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: processData.plan
          })
        });
        
        const executeData = await executeResponse.json();
        console.log('🚀 Execution result:', executeData);
        setResults({ type: 'success', data: executeData, message: 'Service execution successful' });
      } else {
        setResults({ type: 'error', error: 'Failed to get plan', data: processData });
      }
    } catch (error) {
      console.error('❌ Execution error:', error);
      setResults({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🧪 Connection Test</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testBackend} disabled={loading}>
            Test Backend Health
          </Button>
          <Button onClick={testIntent} disabled={loading}>
            Test Intent Processing
          </Button>
          <Button onClick={testExecution} disabled={loading}>
            Test Service Execution
          </Button>
        </div>
        
        {loading && (
          <div className="text-blue-600">🔄 Testing...</div>
        )}
        
        {results && (
          <div className={`p-4 rounded-lg ${
            results.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h4 className={`font-semibold ${
              results.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {results.type === 'success' ? '✅ Success' : '❌ Error'}
            </h4>
            {results.message && (
              <p className="text-sm mt-1">{results.message}</p>
            )}
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}
