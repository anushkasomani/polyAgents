# 🔧 Frontend Integration Debug Instructions

## 🎯 **Current Status**
- ✅ Backend: Running on http://localhost:5400
- ✅ Frontend: Running on http://localhost:8080
- ❌ Integration: Not working (no progress bar appears)

## 🧪 **Debug Steps**

### **Step 1: Open Browser Developer Tools**
1. Open http://localhost:8080 in your browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Try to process an intent
5. Look for error messages or debug logs

### **Step 2: Test Backend Connection**
Open this URL in your browser: http://localhost:8080/test-frontend-debug.html

This will test:
- ✅ Backend health check
- ✅ Intent processing
- ✅ Service execution

### **Step 3: Check for Common Issues**

#### **Issue 1: CORS Error**
If you see: `Access to fetch at 'http://localhost:5400/process' from origin 'http://localhost:8080' has been blocked by CORS policy`

**Solution**: The backend should handle CORS, but if not, we need to fix it.

#### **Issue 2: Connection Refused**
If you see: `Failed to fetch`

**Solution**: 
1. Check if backend is running: `curl http://localhost:5400/health`
2. Restart backend: `python3 mock-orchestrator.py`

#### **Issue 3: 402 Response Not Handled**
If you see: `Orchestrator error: 402`

**Solution**: The frontend should handle 402 as success (this is expected for x402 protocol).

### **Step 4: Manual Test**

Try this in your browser console:

```javascript
// Test backend connection
fetch('http://localhost:5400/health')
  .then(response => response.json())
  .then(data => console.log('Backend health:', data))
  .catch(error => console.error('Backend error:', error));

// Test intent processing
fetch('http://localhost:5400/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userText: 'Get BTC news' })
})
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => console.log('Intent response:', data))
  .catch(error => console.error('Intent error:', error));
```

### **Step 5: Check Frontend Code**

The IntentProcessor component should show these debug messages in console:
- `🚀 Starting intent processing:`
- `📡 Calling orchestrator:`
- `📡 Orchestrator response status:`
- `📊 Orchestrator response data:`

If you don't see these messages, the button click isn't working.

### **Step 6: Verify Button Click**

Make sure:
1. You're typing in the text area
2. You're clicking the "Process Intent" button
3. The button is not disabled
4. There are no JavaScript errors

## 🚀 **Quick Fix**

If nothing works, try this simple test:

1. **Open**: http://localhost:8080/test-frontend-debug.html
2. **Click**: "Test Backend" - should show ✅
3. **Click**: "Test Intent" - should show ✅ with 402 response
4. **Click**: "Test Execution" - should show ✅ with results

If this works, the backend is fine and the issue is in the main frontend app.

## 🎯 **Expected Behavior**

When you click "Process Intent":
1. **Progress bar should appear**
2. **Steps should show**: Parse Intent → Payment Required → Process Payment → Execute Services → Aggregate Results
3. **Console should show**: Debug messages
4. **Results should display**: Service data

## ❓ **What to Report**

Please tell me:
1. **What you see in the browser console** (any errors?)
2. **What happens when you click the button** (nothing? error?)
3. **Results from the debug test page** (http://localhost:8080/test-frontend-debug.html)
4. **Any error messages** you see

This will help me identify the exact issue and fix it!
