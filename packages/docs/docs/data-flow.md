---
id: data-flow
title: Data Flow
sidebar_position: 7
---

# Data Flow

Understanding how data flows through the MessageJS system.

## Message Sending Sequence

```mermaid
sequenceDiagram
    participant WebApp as Developer's Web App
    participant SDK as messagejs-client
    participant CoreAPI as messagejs-core
    participant DB as Database
    participant Queue as Job Queue
    participant ThirdParty as Third-Party API

    WebApp->>+SDK: sendMessage({ ... })
    SDK->>+CoreAPI: POST /api/v1/messages (API key)
    CoreAPI->>CoreAPI: Validate API key
    CoreAPI->>+DB: Fetch project & service config
    DB-->>-CoreAPI: Return encrypted credentials
    CoreAPI->>CoreAPI: Decrypt credentials
    CoreAPI->>+Queue: Add message job
    Queue-->>-CoreAPI: Job queued
    CoreAPI-->>-SDK: { success: true, messageId }
    SDK-->>-WebApp: Promise resolves

    Note over Queue,ThirdParty: Asynchronous processing
    Queue->>+ThirdParty: Send message via connector
    ThirdParty-->>-Queue: API response
    Queue->>+DB: Log result
    DB-->>-Queue: Log saved
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Dashboard as Dashboard
    participant CoreAPI as messagejs-core
    participant DB as Database

    User->>+Dashboard: Login credentials
    Dashboard->>+CoreAPI: POST /auth/login
    CoreAPI->>+DB: Validate credentials
    DB-->>-CoreAPI: User data
    CoreAPI->>CoreAPI: Generate JWT
    CoreAPI-->>-Dashboard: JWT token
    Dashboard-->>-User: Authenticated

    Note over Dashboard,CoreAPI: Subsequent requests
    User->>Dashboard: Request with JWT
    Dashboard->>CoreAPI: Request + Authorization header
    CoreAPI->>CoreAPI: Validate JWT
    CoreAPI-->>Dashboard: Authorized response
```

## Connector Execution Flow

```mermaid
graph TD
    A[Message Job Added to Queue] --> B[Worker Picks Up Job]
    B --> C[Load Connector]
    C --> D{Fetch Template}
    D -->|Template Found| E[Render Template with Variables]
    D -->|No Template| F[Use Raw Message]
    E --> G[Get Service Credentials]
    F --> G
    G --> H[Decrypt Credentials]
    H --> I[Call Third-Party API]
    I --> J{Success?}
    J -->|Yes| K[Update Status: SENT]
    J -->|No| L[Retry Logic]
    L --> M{Max Retries?}
    M -->|No| I
    M -->|Yes| N[Update Status: FAILED]
    K --> O[Log to Database]
    N --> O
    O --> P[Complete]
```

## API Key Validation Flow

```mermaid
sequenceDiagram
    participant SDK
    participant Middleware as Auth Middleware
    participant Cache as Redis Cache
    participant DB as Database

    SDK->>Middleware: Request + API Key
    Middleware->>Cache: Check rate limit
    Cache-->>Middleware: Rate limit OK
    Middleware->>Cache: Get API key hash
    Cache-->>Middleware: Not cached
    Middleware->>+DB: Fetch API key
    DB-->>-Middleware: API key data
    Middleware->>Cache: Store in cache
    Middleware->>Middleware: Validate hash
    Middleware-->>SDK: Authenticated
```

## Credential Encryption Flow

```mermaid
sequenceDiagram
    participant Dashboard
    participant CoreAPI
    participant Encryption as Encryption Service
    participant DB as Database

    Dashboard->>CoreAPI: Add connector credentials
    CoreAPI->>Encryption: Encrypt credentials
    Encryption-->>CoreAPI: Encrypted blob
    CoreAPI->>+DB: Store encrypted credentials
    DB-->>-CoreAPI: Stored
    CoreAPI-->>Dashboard: Connector created

    Note over CoreAPI,Encryption: Message sending
    CoreAPI->>+DB: Fetch connector
    DB-->>-CoreAPI: Encrypted blob
    CoreAPI->>Encryption: Decrypt credentials
    Encryption-->>CoreAPI: Plain credentials
    Note over Encryption: In-memory only
```

## Job Queue Processing

```mermaid
graph LR
    A[API Receives Request] --> B[Add Job to Queue]
    B --> C{BullMQ Queue}
    C --> D[Worker 1]
    C --> E[Worker 2]
    C --> F[Worker N]
    D --> G[Process Message]
    E --> G
    F --> G
    G --> H[Update Status]
```

## Next Steps

- [Technology Stack](./technology-stack)
- [Core Components](./core-components) (coming soon)
- [API Reference](./api-reference) (coming soon)

