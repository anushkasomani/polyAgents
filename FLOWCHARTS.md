# x402 Protocol Flowcharts

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        CA[Client Agent<br/>Port: 5403]
        WEB[Web Client<br/>Mobile App]
    end
    
    subgraph "Agent Communication Layer"
        SA[Service Agent<br/>Port: 5402]
        ORCH[Orchestrator<br/>Port: 5400]
    end
    
    subgraph "Service Layer"
        NEWS[News Service<br/>Port: 5404]
        WEATHER[Weather Service<br/>Port: 5405]
        OHLCV[OHLCV Service<br/>Port: 5406]
        NFT[NFT Service<br/>Port: 5407]
        BACKTEST[Backtest Service<br/>Port: 5408]
        SENTIMENT[Sentiment Service<br/>Python]
    end
    
    subgraph "Payment Layer"
        FAC[Facilitator<br/>Port: 5401]
        RS[Resource Server<br/>Port: 5403]
    end
    
    subgraph "Blockchain Layer"
        POLYGON[Polygon Amoy<br/>Chain ID: 80002]
        USDC[USDC Token<br/>EIP-3009]
    end
    
    WEB --> CA
    CA --> SA
    SA --> ORCH
    SA --> RS
    ORCH --> NEWS
    ORCH --> WEATHER
    ORCH --> OHLCV
    ORCH --> NFT
    ORCH --> BACKTEST
    ORCH --> SENTIMENT
    RS --> FAC
    FAC --> POLYGON
    POLYGON --> USDC
```

## 🔄 Complete Payment Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Client as Client Agent
    participant Service as Service Agent
    participant Orchestrator as Orchestrator
    participant Resource as Resource Server
    participant Facilitator as Facilitator
    participant Blockchain as Polygon Amoy

    User->>Client: "Get me crypto news and weather"
    Client->>Service: POST /a2a {skill: "orchestrate.execute", input: {text}}
    Service->>Orchestrator: POST /process {userText}
    
    Note over Orchestrator: AI Plan Generation
    Orchestrator->>Orchestrator: generatePlan(userText)
    Orchestrator->>Orchestrator: calculatePrice(services)
    
    Orchestrator-->>Service: 402 Payment Required<br/>{accepts: [PaymentRequirements]}
    Service-->>Client: 402 Payment Required<br/>{accepts: [PaymentRequirements]}
    
    Note over Client: Payment Creation
    Client->>Client: createDemoPaymentPayload()
    Client->>Client: encodePaymentPayload(base64)
    
    Client->>Service: POST /a2a {X-PAYMENT: base64}
    Service->>Resource: Forward with X-PAYMENT header
    
    Note over Resource: Payment Verification
    Resource->>Facilitator: POST /verify {paymentPayload}
    Facilitator->>Facilitator: Validate EIP-712 signature
    Facilitator-->>Resource: {isValid: true}
    
    Note over Resource: Service Execution
    Resource->>Resource: Execute premium services
    Resource->>Resource: Call News Service
    Resource->>Resource: Call Weather Service
    
    Note over Facilitator: Payment Settlement
    Resource->>Facilitator: POST /settle {paymentPayload}
    Facilitator->>Blockchain: transferWithAuthorization()
    Blockchain-->>Facilitator: Transaction confirmed
    Facilitator-->>Resource: {success: true, txHash}
    
    Resource-->>Service: 200 OK + X-PAYMENT-RESPONSE<br/>{results: ServiceResults}
    Service-->>Client: Service results + payment confirmation
    Client-->>User: "Here's your crypto news and weather data"
```

## 🎯 Service Discovery & Orchestration

```mermaid
graph TD
    A[User Input: "Get me BTC news and London weather"] --> B[Orchestrator: Text Analysis]
    B --> C{Gemini AI<br/>Plan Generation}
    C --> D[Service Plan:<br/>- news: BTC articles<br/>- weather: London forecast]
    D --> E[Price Calculation:<br/>- Single service: 1000 units<br/>- Bundle discount: 1800 units]
    E --> F[Payment Requirements:<br/>- scheme: exact<br/>- network: polygon-amoy<br/>- amount: 1800 USDC]
    F --> G[402 Response to Client]
    G --> H[Client Creates Payment]
    H --> I[Services Execute in Parallel]
    I --> J[Results Aggregated]
    J --> K[Payment Settled on Blockchain]
    K --> L[Response to User]
```

## 💰 Payment Protocol Details

```mermaid
graph LR
    subgraph "Payment Creation"
        A[Client Request] --> B[402 Response]
        B --> C[PaymentRequirements]
        C --> D[EIP-712 Signature]
        D --> E[Base64 Encoding]
        E --> F[X-PAYMENT Header]
    end
    
    subgraph "Payment Verification"
        F --> G[Resource Server]
        G --> H[Facilitator /verify]
        H --> I[Signature Validation]
        I --> J[Nonce Check]
        J --> K[Amount Verification]
        K --> L[Valid Payment]
    end
    
    subgraph "Payment Settlement"
        L --> M[Service Execution]
        M --> N[Facilitator /settle]
        N --> O[transferWithAuthorization]
        O --> P[Blockchain Transaction]
        P --> Q[Confirmation]
        Q --> R[X-PAYMENT-RESPONSE]
    end
```

## 🔧 Service Architecture Patterns

```mermaid
graph TB
    subgraph "Service Pattern"
        A[HTTP Request] --> B{Payment Header?}
        B -->|No| C[402 Payment Required]
        B -->|Yes| D[Verify Payment]
        D --> E{Valid?}
        E -->|No| C
        E -->|Yes| F[Execute Service]
        F --> G[Settle Payment]
        G --> H[Return Results]
    end
    
    subgraph "Agent Communication Pattern"
        I[Client Agent] --> J[JSON-RPC message/send]
        J --> K[Service Agent]
        K --> L[Route to Resource Server]
        L --> M[Forward Payment Header]
        M --> N[Return Response]
    end
```

## 🌐 Network Topology

```mermaid
graph TB
    subgraph "Local Development"
        subgraph "Port 5400-5408"
            ORCH[Orchestrator: 5400]
            FAC[Facilitator: 5401]
            SA[Service Agent: 5402]
            RS[Resource Server: 5403]
            NEWS[News Service: 5404]
            WEATHER[Weather Service: 5405]
            OHLCV[OHLCV Service: 5406]
            NFT[NFT Service: 5407]
            BACKTEST[Backtest Service: 5408]
        end
    end
    
    subgraph "External Services"
        GEMINI[Gemini AI API]
        CRYPTOPANIC[CryptoPanic API]
        WEATHERAPI[Weather API]
        BLOCKCHAIN[Polygon Amoy RPC]
    end
    
    ORCH --> GEMINI
    NEWS --> CRYPTOPANIC
    WEATHER --> WEATHERAPI
    FAC --> BLOCKCHAIN
```

## 🔄 Error Handling Flow

```mermaid
graph TD
    A[Request] --> B{Payment Valid?}
    B -->|No| C[402 Payment Required]
    B -->|Yes| D{Service Available?}
    D -->|No| E[503 Service Unavailable]
    D -->|Yes| F{Execution Success?}
    F -->|No| G[500 Internal Error]
    F -->|Yes| H{Payment Settlement?}
    H -->|No| I[402 Payment Failed]
    H -->|Yes| J[200 Success + Results]
    
    C --> K[Client Retry with Payment]
    E --> L[Client Retry Later]
    G --> M[Client Error Handling]
    I --> N[Client Payment Retry]
    J --> O[Client Success Response]
```

## 📊 Data Flow Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        A[User Text Input]
        B[Natural Language Query]
    end
    
    subgraph "Processing Layer"
        C[AI Plan Generation]
        D[Service Discovery]
        E[Price Calculation]
    end
    
    subgraph "Execution Layer"
        F[Parallel Service Calls]
        G[Data Aggregation]
        H[Result Processing]
    end
    
    subgraph "Output Layer"
        I[Structured Response]
        J[Payment Confirmation]
        K[User Interface]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
```

---

## 🎨 Visual Legend

| Symbol | Meaning |
|--------|---------|
| 🔵 **Blue Circles** | Core Services |
| 🟢 **Green Rectangles** | External APIs |
| 🟡 **Yellow Diamonds** | Decision Points |
| 🔴 **Red Hexagons** | Error States |
| ⚪ **White Ovals** | Data/Results |
| 🔗 **Arrows** | Data Flow |
| 📦 **Boxes** | Service Groups |

---

*These flowcharts provide a comprehensive visual representation of the x402 protocol architecture, payment flows, and service interactions.*
