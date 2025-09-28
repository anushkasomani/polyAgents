#!/usr/bin/env node

/**
 * Simple test script to verify frontend-backend integration
 * Run this after starting the backend services
 */

const ORCHESTRATOR_URL = 'http://localhost:5400';

async function testOrchestratorConnection() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing orchestrator health...');
    const healthResponse = await fetch(`${ORCHESTRATOR_URL}/healthz`);
    const healthData = await healthResponse.json();
    console.log('✅ Orchestrator is healthy:', healthData);

    // Test 2: Process intent (should return 402)
    console.log('\n2️⃣ Testing intent processing...');
    const processResponse = await fetch(`${ORCHESTRATOR_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userText: 'Get BTC sentiment and latest news'
      })
    });

    console.log('📡 Process response status:', processResponse.status);

    if (processResponse.status === 402) {
      console.log('✅ Intent processing successful (402 Payment Required)');
      const processData = await processResponse.json();
      console.log('📊 Services identified:', processData.plan?.services?.length || 0);
      console.log('💰 Price calculated:', processData.price);
      console.log('💳 Payment requirements:', processData.accepts?.length || 0);

      // Test 3: Execute without payment (should fail)
      console.log('\n3️⃣ Testing execution without payment...');
      const executeResponse = await fetch(`${ORCHESTRATOR_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: processData.plan
        })
      });

      console.log('📡 Execute response status:', executeResponse.status);

      if (executeResponse.status === 402) {
        console.log('✅ Execution correctly requires payment (402)');
      } else {
        console.log('⚠️ Unexpected execute response:', executeResponse.status);
      }

    } else {
      console.log('❌ Unexpected process response:', processResponse.status);
      const errorData = await processResponse.json();
      console.log('Error data:', errorData);
    }

    console.log('\n🎉 Backend integration test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend: cd demo/scripts && ./start-interactive-demo.sh');
    console.log('2. Open frontend: http://localhost:8000');
    console.log('3. Connect MetaMask to Polygon Amoy testnet');
    console.log('4. Click "Launch Intent" and try the Simple Client Agent');
    console.log('5. Enter an intent like: "Get BTC sentiment and latest news"');
    console.log('6. Sign the payment transaction when prompted');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend services are running');
    console.log('2. Check that orchestrator is on port 5400');
    console.log('3. Verify all services are healthy');
  }
}

// Run the test
testOrchestratorConnection();
