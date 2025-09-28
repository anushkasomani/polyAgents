# PolyAgents 🚀  

Welcome to **PolyAgents** — a decentralized platform built on top of the Polygon Network that reimagines how on-chain micropayments and microservices can be consumed. Instead of being stuck in rigid subscription-based models, **PolyAgents** leverages the **x402 protocol** to unlock a future of seamless, pay-as-you-go micro-interactions between autonomous agents.  

---

## 🔑 Why x402 Protocol?  
Most on-chain monetization today revolves around subscriptions — a blunt instrument for a world that craves precision. The **x402 payment rails** flip this model on its head. By enabling real-time, request-based micropayments, x402 empowers service providers to monetize even the smallest microservices, while giving users the freedom to pay only for what they use.  

This opens the door to richer, more dynamic agent-to-agent interactions — think of it as the backbone of a true machine economy.  

---

## 🏗️ Architecture at a Glance  
At the heart of PolyAgents lies a network of **on-chain AI-driven agents**:  

![arch]{<img width="1136" height="620" alt="Screenshot from 2025-09-28 05-21-25" src="https://github.com/user-attachments/assets/4242a374-e098-4b05-af88-6e3eb664df0c" />}

## ⚙️ Service Orchestration  

PolyAgents comes with a **modular orchestration layer** that starts all backend services in the correct order:  

- **Facilitator (port 5401)** – Handles x402 payments validation
- **Resource Server (port 5403)** – Provides a specific resource/service 
- **Service Agent (port 5402)** – Coordinates service execution and interaction with microservices
- **Orchestrator (port 5400)** – Main coordination hub  
- **Frontend (port 8000/8001)** – Your React UI  

This modular setup ensures that agents and microservices can scale independently, while keeping orchestration clean and deterministic.  

## 🌐 Why PolyAgents?

The blockchain ecosystem is inherently distributed — with valuable services scattered across chains, dApps, and protocols. Today, stitching them together is clunky, expensive, and user-unfriendly.

PolyAgents introduces a **clean abstraction layer** where autonomous agents handle the complexity of multi-service orchestration:

1. Users express intent.
2. Agents negotiate, pay, and collaborate.
3. Intent delivered — transparently and efficiently.

This is the true power of **agentic AI on-chain**:

* No more walled subscription models.
* No more user-side complexity.
* Just pure, dynamic, pay-per-interaction service consumption.

{<img width="994" height="597" alt="image" src="https://github.com/user-attachments/assets/745d63e6-7f4c-45f4-a993-1c6934a97813" />
}

## Getting Started
### Prerequisites
- Node.js (>=18)
- Python (>=3.9)

### Clone the Repo
```
git clone https://github.com/anushkasomani/polyAgents.git
cd polyAgents
```

### Interact thorugh CLI
```
cd   demo/a2a/scripts/final_demo.sh
bash final_demo.sh

```

### Spin up the orchestrator
```
cd  demo/a2a/orchestrator/server.js
node server.js
```


### Intract through frontend
```
cd ui/
npm run dev
```
