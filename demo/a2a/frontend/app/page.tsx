"use client";
import React, { useEffect, useState } from 'react';
import StartDemoButton from '../components/StartDemoButton';
import ArtifactPanel from '../components/ArtifactPanel';
import LogViewer from '../components/LogViewer';
import ConnectionDiagram from '../components/ConnectionDiagram';
import Toast from '../components/Toast';
import TextInputPanel from '../components/TextInputPanel';
import WalletConnectButton from '../components/WalletConnectButton';
import ChatUI from '../components/ChatUI';

export default function Page() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState('(no logs)');
  const [status, setStatus] = useState('idle');
  const [agentCard, setAgentCard] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [artifactActive, setArtifactActive] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState('');
  const [lastStart, setLastStart] = useState<string>('');
  const [lastNetwork, setLastNetwork] = useState<string>('');
  const [userText, setUserText] = useState<string>('');
  const [plan, setPlan] = useState<any>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const prevStep = React.useRef<string>('idle');

  useEffect(() => {
    let t = setInterval(async () => {
      try {
        const s = await fetch('/api/orchestrate/status').then((r) => r.json());
        const newStep = s.step || 'idle';
        setStatus(newStep);
        // When transitioning into these states, refresh artifacts — but do not overwrite
        // existing artifacts with negative results. Retry a few times to allow logs to flush.
        const shouldFetchArtifacts = ['payment_created', 'verified', 'settled', 'done'];
        if (prevStep.current !== newStep && shouldFetchArtifacts.includes(newStep)) {
          const fetchWithRetries = async (url: string, attempts = 3, delayMs = 700) => {
            for (let i = 0; i < attempts; i++) {
              try {
                const res = await fetch(url);
                if (!res.ok) { await new Promise((r) => setTimeout(r, delayMs)); continue; }
                const js = await res.json().catch(() => null);
                // If endpoint explicitly says not found, retry
                if (js && js.found === false) { await new Promise((r) => setTimeout(r, delayMs)); continue; }
                return js;
              } catch (e) {
                await new Promise((r) => setTimeout(r, delayMs));
              }
            }
            return null;
          };

          try {
            const pay = await fetchWithRetries('/api/artifacts/payment', 4, 600);
            if (pay) setPayment(pay);
          } catch (_) { }
          try {
            const resp = await fetchWithRetries('/api/artifacts/response', 4, 600);
            if (resp) {
              setResponse(resp);
              // ensure artifacts panel shows response
              setArtifactActive('response');
            }
          } catch (_) { }
          // Notify user on completion states
          if (newStep === 'settled' || newStep === 'done') {
            // show toast with action to open artifacts
            setToast('Demo completed');
            // toast action will be provided below when rendering Toast
          }
        }
        prevStep.current = newStep;
        if (s.tx) setResponse((r) => r || { json: { transaction: s.tx } });

        const l = await fetch('/api/orchestrate/logs').then((r) => r.text());
        setLogs(l || '(no logs)');

        const acRes = await fetch('/api/artifacts/agent-card');
        const ac = acRes.ok ? await acRes.json().catch(() => null) : null;
        setAgentCard(ac || null);

      } catch (e) {
        // ignore
      }
    }, 1400);
    return () => clearInterval(t);
  }, []);

  async function processUserText(text: string) {
    setRunning(true);
    setUserText(text);
    setToast('Processing your request...');
    setStatus('processing');

    try {
      // Step 1: Send text to orchestrator to get plan and payment requirements
      const res = await fetch('http://localhost:5400/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userText: text })
      });

      if (res.status === 402) {
        // Payment required
        const data = await res.json();
        setPlan(data.plan);
        setPrice(data.price);
        setStatus('payment_required');
        setToast(`Payment required: ${data.price} wei`);

        // For demo purposes, we'll simulate payment and proceed
        setTimeout(async () => {
          await executeWithPayment(data.plan, text);
        }, 2000);

      } else if (res.ok) {
        const data = await res.json();
        setResponse(data);
        setStatus('completed');
        setToast('Request completed');
      } else {
        setToast('Failed to process request');
        setStatus('error');
      }
    } catch (e) {
      setToast('Error processing request');
      setStatus('error');
      console.error('Error:', e);
    } finally {
      setRunning(false);
      setTimeout(() => setToast(''), 3000);
    }
  }

  async function executeWithPayment(plan: any, originalText: string) {
    setStatus('executing');
    setToast('Executing services...');

    try {
      // Simulate payment header (in real implementation, this would come from wallet)
      const mockPaymentHeader = 'mock_payment_' + Date.now();

      const res = await fetch('http://localhost:5400/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment': mockPaymentHeader
        },
        body: JSON.stringify({ plan })
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        setStatus('completed');
        setToast('Services executed successfully');
        setArtifactActive('response');
      } else {
        setToast('Failed to execute services');
        setStatus('error');
      }
    } catch (e) {
      setToast('Error executing services');
      setStatus('error');
      console.error('Error:', e);
    }
  }

  async function startDemo() {
    setRunning(true);
    setToast('Starting demo...');
    try {
      const res = await fetch('/api/orchestrate/start', { method: 'POST' });
      let js: any = null;
      try {
        js = await res.json().catch(() => null);
      } catch (e) {
        js = null;
      }

      // expose network result to UI for debugging
      try {
        const text = JSON.stringify(js) || await res.text().catch(() => '');
        setLastNetwork(`status=${res.status} body=${text}`);
      } catch (_) {
        setLastNetwork(`status=${res.status}`);
      }

      if (res.ok) {
        setToast(js && js.pid ? `Started (pid: ${js.pid})` : 'Started');
        setStatus('starting');
        setLastStart(js && js.pid ? `Started pid=${js.pid}` : 'Started');
      } else {
        setToast('Failed to start demo');
        setLastStart(`failed: ${res.status}`);
      }
    } catch (e) {
      setToast('Failed to start demo');
      setLastStart(`error: ${String(e)}`);
    } finally {
      setRunning(false);
      setTimeout(() => setToast(''), 2200);
    }
  }

  async function hardRefresh() {
    // call API to remove logs/pids
    await fetch('/api/orchestrate/hard-refresh', { method: 'POST' }).then((r) => r.json()).then(() => {
      // reset UI state
      setLogs('(no logs)');
      setAgentCard(null);
      setPayment(null);
      setResponse(null);
      setStatus('idle');
      setToast('Cleared demo logs');
      setTimeout(() => setToast(''), 1800);
    }).catch(() => {
      // ignore
    });
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">A2A x402 Demo Dashboard</h1>
          <div className="text-sm text-muted">Demo orchestration & artifacts</div>
        </div>
        <div className="flex items-center gap-3">
          <WalletConnectButton onConnect={(addr) => { setToast(`Wallet: ${addr}`); setWalletAddress(addr); }} />
          <StartDemoButton running={running} onStart={() => startDemo()} onHardRefresh={() => hardRefresh()} />
        </div>
      </header>

      {lastStart ? (
        <div className="mb-4 text-sm text-gray-700">Last start: {lastStart}</div>
      ) : null}
      {lastNetwork ? (
        <div className="mb-2 text-sm text-gray-600">Network: {lastNetwork}</div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3 space-y-4">
          <TextInputPanel onSubmit={processUserText} loading={running} />
          <div className="p-4 bg-panel rounded-lg shadow-soft">
            <ConnectionDiagram />
          </div>
          <div className="p-4 bg-panel rounded-lg shadow-soft">
            <ArtifactPanel agentCard={agentCard} payment={payment} response={response} active={artifactActive} onActiveChange={(id: string) => setArtifactActive(id)} />
          </div>
        </aside>

        <main className="col-span-6">
          <h3 className="mb-2 text-lg font-medium">Assistant</h3>
          <div className="p-4 bg-panel rounded-lg shadow-soft">
            <ChatUI onSubmit={processUserText} response={response} />
          </div>

          <div className="mt-4 p-4 bg-panel rounded-lg shadow-soft">
            <h4 className="font-medium mb-2">Logs</h4>
            <LogViewer logs={logs} />
          </div>

          {userText && (
            <div className="mt-4 p-4 bg-panel rounded-lg shadow-soft">
              <h4 className="font-medium mb-2">User Request</h4>
              <p className="text-sm text-gray-700 mb-2">"{userText}"</p>
              {plan && (
                <div className="text-sm">
                  <p className="font-medium">Identified Services:</p>
                  <ul className="list-disc list-inside mt-1">
                    {plan.services?.map((service: any, index: number) => (
                      <li key={index} className="text-gray-600">{service.service}: {service.description}</li>
                    ))}
                  </ul>
                </div>
              )}
              {price && (
                <p className="text-sm mt-2 text-blue-600">Price: {price} wei</p>
              )}
            </div>
          )}
        </main>

        <aside className="col-span-3">
          <div className="mt-0 p-4 bg-panel rounded-lg shadow-soft">
            <h4 className="font-medium mb-2">Details</h4>
            <div className="text-sm text-muted">Network: polygon-amoy (80002)</div>
            <div className="text-sm text-muted">Payment: 0.01 USDC</div>
            <div className="text-sm text-muted">Status: {status}</div>
          </div>
        </aside>
      </div>

      <Toast message={toast} onClose={() => setToast('')} action={response ? { label: 'View Response', onClick: () => setArtifactActive('response') } : undefined} />
    </div>
  );
} 