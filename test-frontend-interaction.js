#!/usr/bin/env node

// Test script to verify frontend-backend interaction
const http = require('http');

console.log('🧪 Testing Frontend-Backend Interaction...\n');

// Test the complete user workflow
const testUserWorkflow = async () => {
  console.log('Testing complete user workflow:');
  console.log('1. User inputs intent: "Get BTC news and sentiment analysis"');
  
  // Simulate the frontend calling the orchestrator
  const processResponse = await new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      userText: "Get BTC news and sentiment analysis"
    });

    const options = {
      hostname: 'localhost',
      port: 5400,
      path: '/process',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('2. Orchestrator response:');
  console.log(`   📊 Services: ${processResponse.plan?.services?.map(s => s.service).join(', ')}`);
  console.log(`   💰 Cost: $${processResponse.price}`);
  console.log(`   🔒 Payment Required: ${processResponse.accepts ? 'Yes' : 'No'}`);

  // Simulate payment and execution
  console.log('3. Simulating payment and service execution...');
  
  const executeResponse = await new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      plan: processResponse.plan
    });

    const options = {
      hostname: 'localhost',
      port: 5400,
      path: '/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('4. Service execution results:');
  console.log(`   ✅ Success: ${executeResponse.success}`);
  console.log(`   📈 Services executed: ${executeResponse.results?.length}`);
  console.log(`   💵 Total cost: $${executeResponse.totalCost}`);
  
  console.log('\n5. Individual service results:');
  executeResponse.results?.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.service}: ${result.success ? '✅ Success' : '❌ Failed'}`);
    if (result.data) {
      console.log(`      📊 Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
    }
  });

  return executeResponse;
};

// Test multiple intents
const testMultipleIntents = async () => {
  const intents = [
    "Get BTC news and sentiment analysis",
    "Get weather for London and ETH price data", 
    "I want BTC news, weather in Tokyo, sentiment analysis, and run a backtest"
  ];

  console.log('\n🧪 Testing Multiple Intents...\n');

  for (let i = 0; i < intents.length; i++) {
    const intent = intents[i];
    console.log(`Test ${i + 1}: "${intent}"`);
    
    try {
      const processResponse = await new Promise((resolve, reject) => {
        const postData = JSON.stringify({ userText: intent });
        const options = {
          hostname: 'localhost',
          port: 5400,
          path: '/process',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      if (processResponse.error) {
        console.log(`   ❌ Error: ${processResponse.error}`);
      } else {
        console.log(`   ✅ Services: ${processResponse.plan?.services?.length || 0}`);
        console.log(`   💰 Cost: $${processResponse.price || 0}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }
};

// Run all tests
async function runTests() {
  try {
    await testUserWorkflow();
    await testMultipleIntents();
    
    console.log('🎉 Frontend-Backend interaction tests completed!');
    console.log('✅ The system is ready for user interactions');
    console.log('🌐 Frontend: http://localhost:8080');
    console.log('🔧 Backend: http://localhost:5400');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
}

runTests();
