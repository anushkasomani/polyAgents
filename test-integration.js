#!/usr/bin/env node

// Test script to verify frontend-backend integration
const http = require('http');

console.log('🧪 Testing Frontend-Backend Integration...\n');

// Test 1: Check if orchestrator is running
console.log('1. Testing Orchestrator Health...');
const orchestratorTest = () => {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:5400/health', (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Orchestrator is running');
        resolve(true);
      } else {
        console.log('   ❌ Orchestrator not responding');
        reject(false);
      }
    });
    req.on('error', () => {
      console.log('   ❌ Orchestrator not accessible');
      reject(false);
    });
    req.end();
  });
};

// Test 2: Test intent processing
console.log('2. Testing Intent Processing...');
const testIntentProcessing = () => {
  return new Promise((resolve, reject) => {
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
          if (result.plan && result.price) {
            console.log('   ✅ Intent processing working');
            console.log(`   📊 Services identified: ${result.plan.services.length}`);
            console.log(`   💰 Total cost: $${result.price}`);
            resolve(result);
          } else {
            console.log('   ❌ Invalid response from orchestrator');
            reject(false);
          }
        } catch (e) {
          console.log('   ❌ Failed to parse orchestrator response');
          reject(false);
        }
      });
    });

    req.on('error', () => {
      console.log('   ❌ Failed to connect to orchestrator');
      reject(false);
    });

    req.write(postData);
    req.end();
  });
};

// Test 3: Test service execution
console.log('3. Testing Service Execution...');
const testServiceExecution = (plan) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ plan });

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
          if (result.success && result.results) {
            console.log('   ✅ Service execution working');
            console.log(`   📈 Results: ${result.results.length} services executed`);
            console.log(`   💵 Total cost: $${result.totalCost}`);
            resolve(result);
          } else {
            console.log('   ❌ Service execution failed');
            reject(false);
          }
        } catch (e) {
          console.log('   ❌ Failed to parse execution response');
          reject(false);
        }
      });
    });

    req.on('error', () => {
      console.log('   ❌ Failed to execute services');
      reject(false);
    });

    req.write(postData);
    req.end();
  });
};

// Test 4: Check frontend accessibility
console.log('4. Testing Frontend Accessibility...');
const testFrontend = () => {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:8080', (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Frontend is accessible on port 8080');
        resolve(true);
      } else {
        console.log('   ❌ Frontend not responding');
        reject(false);
      }
    });
    req.on('error', () => {
      console.log('   ❌ Frontend not accessible');
      reject(false);
    });
    req.end();
  });
};

// Run all tests
async function runTests() {
  try {
    await orchestratorTest();
    const intentResult = await testIntentProcessing();
    await testServiceExecution(intentResult.plan);
    await testFrontend();
    
    console.log('\n🎉 All integration tests passed!');
    console.log('✅ Frontend-Backend integration is working correctly');
    console.log('🚀 Ready for user testing!');
    
  } catch (error) {
    console.log('\n❌ Integration test failed');
    console.log('Please check that all services are running:');
    console.log('  - Orchestrator: http://localhost:5400');
    console.log('  - Frontend: http://localhost:5173');
  }
}

runTests();
