import React, { useState } from 'react';

const ORCHESTRATOR_ENDPOINT = 'http://localhost:5400';

export function SimpleIntentTest() {
  const [userIntent, setUserIntent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userIntent.trim()) return;

    console.log('🚀 Starting simple intent test:', userIntent);
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      // Test backend connection
      console.log('📡 Testing backend connection...');
      const healthResponse = await fetch(`${ORCHESTRATOR_ENDPOINT}/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Backend health:', healthData);

      // Test intent processing
      console.log('📡 Processing intent...');
      const processResponse = await fetch(`${ORCHESTRATOR_ENDPOINT}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: userIntent
        })
      });

      console.log('📡 Process response status:', processResponse.status);
      const processData = await processResponse.json();
      console.log('📊 Process response data:', processData);

      if (processResponse.status === 402) {
        console.log('✅ Intent processing successful (402 is expected)');
        
        // Test service execution
        console.log('🚀 Executing services...');
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
        console.log('📊 Execute response:', executeData);

        setResults({
          processData,
          executeData,
          success: true
        });
      } else {
        throw new Error(`Unexpected response status: ${processResponse.status}`);
      }
    } catch (error) {
      console.error('❌ Error in simple intent test:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Simple Intent Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Enter your intent:
        </label>
        <textarea
          value={userIntent}
          onChange={(e) => setUserIntent(e.target.value)}
          placeholder="Get BTC news and sentiment analysis"
          style={{ width: '100%', height: '100px', padding: '10px', marginBottom: '10px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          style={{
            padding: '10px 20px',
            backgroundColor: isProcessing ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? 'Processing...' : 'Test Intent'}
        </button>
      </div>

      {isProcessing && (
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>🔄 Processing...</h3>
          <p>Testing backend connection and intent processing...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div style={{ padding: '20px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
          <h3>✅ Success!</h3>
          <div style={{ marginBottom: '20px' }}>
            <h4>Intent Processing Results:</h4>
            <p><strong>Services identified:</strong> {results.processData.plan?.services?.length || 0}</p>
            <p><strong>Total cost:</strong> ${results.processData.price || 0}</p>
            <p><strong>Services:</strong> {results.processData.plan?.services?.map((s: any) => s.service).join(', ') || 'None'}</p>
          </div>
          
          <div>
            <h4>Service Execution Results:</h4>
            <p><strong>Services executed:</strong> {results.executeData.results?.length || 0}</p>
            <p><strong>Total cost:</strong> ${results.executeData.totalCost || 0}</p>
            
            {results.executeData.results?.map((result: any, index: number) => (
              <div key={index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                <p><strong>{result.service}:</strong> {result.success ? '✅ Success' : '❌ Failed'}</p>
                {result.data && (
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
