# MessageJS API Reference

Complete API reference for MessageJS backend and client SDK.

## Table of Contents
- [Authentication](#authentication)
- [SDK API](#sdk-api)
- [Dashboard API](#dashboard-api)
- [Error Codes](#error-codes)

---

## Authentication

### User Registration

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "token": "<jwt_token_example>",
  "refreshToken": "refresh_xyz789..."
}
```

---

### User Login

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "user": { "id": "usr_abc123", "email": "user@example.com", "name": "John Doe" },
  "token": "<jwt_token_example>",
  "refreshToken": "refresh_xyz789..."
}
```

---

### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLogin": "2024-01-16T14:30:00Z"
  }
}
```

---

## SDK API

### Send Message

```http
POST /api/v1/messages
Authorization: Bearer <api_key_placeholder>
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "connectorId": "conn_whatsapp_abc123",
  "templateId": "tpl_welcome_xyz456",
  "variables": {
    "name": "John",
    "code": "12345"
  }
}
```

**Response:** `202 Accepted`
```json
{
  "messageId": "msg_xyz789",
  "status": "queued"
}
```

**Note on Idempotency:** To prevent duplicate messages, you can include an `Idempotency-Key: <uuid>` header in your request. If a request with the same key is received, the server will return the original success response without creating a duplicate message.

**Error Response:** `400 Bad Request`
```json
{
  "error": "Invalid phone number",
  "code": "INVALID_TO"
}
```

---

## Dashboard API

### Projects

#### List Projects

```http
GET /api/v1/projects
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "projects": [
    {
      "id": "proj_abc123",
      "name": "My Awesome Project",
      "description": "Project description",
      "createdAt": "2024-01-15T10:00:00Z",
      "isActive": true
    }
  ]
}
```

---

#### Create Project

```http
POST /api/v1/projects
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "My Awesome Project",
  "description": "Project description"
}
```

**Response:** `201 Created`
```json
{
  "id": "proj_abc123",
  "userId": "usr_xyz789",
  "name": "My Awesome Project",
  "description": "Project description",
  "createdAt": "2024-01-15T10:00:00Z",
  "isActive": true
}
```

---

#### Get Project

```http
GET /api/v1/projects/:id
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "id": "proj_abc123",
  "userId": "usr_xyz789",
  "name": "My Awesome Project",
  "description": "Project description",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z",
  "isActive": true
}
```

---

#### Update Project

```http
PUT /api/v1/projects/:id
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "id": "proj_abc123",
  "name": "Updated Project Name",
  "description": "Updated description",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

---

#### Delete Project

```http
DELETE /api/v1/projects/:id
Authorization: Bearer <jwt_token>
```

**Response:** `204 No Content`

---

### API Keys

#### List API Keys

```http
GET /api/v1/projects/:projectId/keys
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "keys": [
    {
      "id": "key_abc123",
      "name": "Production Key",
      "lastUsed": "2024-01-15T14:30:00Z",
      "rateLimit": 1000,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### Create API Key

```http
POST /api/v1/projects/:projectId/keys
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Production Key",
  "rateLimit": 1000
}
```

**Response:** `201 Created`
```json
{
  "key": "<redacted_do_not_use_prod_keys>",
  "id": "key_abc123",
  "name": "Production Key",
  "rateLimit": 1000,
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Note:** The plain API key is only returned once. Store it securely.

---

#### Delete API Key

```http
DELETE /api/v1/projects/:projectId/keys/:keyId
Authorization: Bearer <jwt_token>
```

**Response:** `204 No Content`

---

### Connectors

#### List Connectors

```http
GET /api/v1/projects/:projectId/connectors
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "connectors": [
    {
      "id": "conn_abc123",
      "type": "whatsapp",
      "name": "Business WhatsApp",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### Create Connector

```http
POST /api/v1/projects/:projectId/connectors
Authorization: Bearer <jwt_token>
```

**Request Body (WhatsApp):**
```json
{
  "type": "whatsapp",
  "name": "Business WhatsApp",
  "credentials": {
    "phoneNumberId": "123456789",
    "accessToken": "EAAG..."
  }
}
```

**Request Body (Telegram):**
```json
{
  "type": "telegram",
  "name": "My Bot",
  "credentials": {
    "botToken": "123456:ABC-DEF..."
  }
}
```

**Request Body (Twilio):**
```json
{
  "type": "twilio",
  "name": "SMS Provider",
  "credentials": {
    "accountSid": "ACxxx...",
    "authToken": "xxx...",
    "fromNumber": "+1234567890"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "conn_abc123",
  "projectId": "proj_xyz789",
  "type": "whatsapp",
  "name": "Business WhatsApp",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

#### Get Connector

```http
GET /api/v1/projects/:projectId/connectors/:id
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "id": "conn_abc123",
  "type": "whatsapp",
  "name": "Business WhatsApp",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Note:** Credentials are never returned.

---

#### Update Connector

```http
PUT /api/v1/projects/:projectId/connectors/:id
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated Connector Name",
  "isActive": false
}
```

**Response:** `200 OK`
```json
{
  "id": "conn_abc123",
  "name": "Updated Connector Name",
  "isActive": false,
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

---

#### Delete Connector

```http
DELETE /api/v1/projects/:projectId/connectors/:id
Authorization: Bearer <jwt_token>
```

**Response:** `204 No Content`

---

#### Test Connector

```http
POST /api/v1/projects/:projectId/connectors/:id/test
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "connected": true,
  "message": "Connected to WhatsApp Cloud API"
}
```

---

### Messages

#### List Messages

```http
GET /api/v1/messages?projectId=proj_abc123&limit=50&offset=0
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `projectId` (required): Project ID
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (`pending`, `sent`, `delivered`, `failed`)
- `connector` (optional): Filter by connector type
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "msg_abc123",
      "to": "+1234567890",
      "text": "Hello, world!",
      "status": "sent",
      "connectorType": "whatsapp",
      "sentAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:29:55Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150
  }
}
```

---

#### Get Message

```http
GET /api/v1/messages/:id
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "id": "msg_abc123",
  "projectId": "proj_xyz789",
  "connectorId": "conn_def456",
  "to": "+1234567890",
  "text": "Hello, world!",
  "status": "sent",
  "metadata": {
    "messageId": "wamid.xxx"
  },
  "sentAt": "2024-01-15T10:30:00Z",
  "deliveredAt": "2024-01-15T10:30:05Z",
  "createdAt": "2024-01-15T10:29:55Z"
}
```

---

### Templates

#### List Templates

```http
GET /api/v1/projects/:projectId/templates
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "templates": [
    {
      "id": "tpl_abc123",
      "name": "Welcome Message",
      "connectorType": "whatsapp",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### Create Template

```http
POST /api/v1/projects/:projectId/templates
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Welcome Message",
  "connectorType": "whatsapp",
  "content": "Hello {{name}}, welcome to {{company}}! Your code is: {{code}}",
  "variables": ["name", "company", "code"]
}
```

**Response:** `201 Created`
```json
{
  "id": "tpl_abc123",
  "name": "Welcome Message",
  "connectorType": "whatsapp",
  "content": "Hello {{name}}, welcome to {{company}}! Your code is: {{code}}",
  "variables": ["name", "company", "code"],
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

#### Get Template

```http
GET /api/v1/projects/:projectId/templates/:id
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "id": "tpl_abc123",
  "name": "Welcome Message",
  "connectorType": "whatsapp",
  "content": "Hello {{name}}, welcome to {{company}}! Your code is: {{code}}",
  "variables": ["name", "company", "code"],
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

---

#### Update Template

```http
PUT /api/v1/projects/:projectId/templates/:id
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Hi {{name}}, thanks for joining {{company}}!",
  "variables": ["name", "company"]
}
```

**Response:** `200 OK`
```json
{
  "id": "tpl_abc123",
  "content": "Hi {{name}}, thanks for joining {{company}}!",
  "variables": ["name", "company"],
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

---

#### Delete Template

```http
DELETE /api/v1/projects/:projectId/templates/:id
Authorization: Bearer <jwt_token>
```

**Response:** `204 No Content`

---

### Analytics

#### Message Statistics

```http
GET /api/v1/analytics/messages?projectId=proj_abc123&from=2024-01-01&to=2024-01-31
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "period": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-31T23:59:59Z"
  },
  "totals": {
    "sent": 1250,
    "delivered": 1180,
    "failed": 70,
    "deliveredRate": 0.944
  },
  "byConnector": {
    "whatsapp": { "sent": 800, "delivered": 780, "failed": 20 },
    "telegram": { "sent": 300, "delivered": 290, "failed": 10 },
    "twilio": { "sent": 150, "delivered": 110, "failed": 40 }
  },
  "byDay": [
    { "date": "2024-01-15", "sent": 45, "delivered": 43, "failed": 2 },
    { "date": "2024-01-16", "sent": 52, "delivered": 50, "failed": 2 }
  ]
}
```

---

#### Usage Analytics

```http
GET /api/v1/analytics/usage?projectId=proj_abc123
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "totalMessages": 1250,
  "totalProjects": 5,
  "totalConnectors": 12,
  "averageDeliveryRate": 0.944,
  "topConnectors": [
    { "type": "whatsapp", "messages": 800 },
    { "type": "telegram", "messages": 300 },
    { "type": "twilio", "messages": 150 }
  ]
}
```

---

## Error Codes

All error responses follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* optional additional context */ }
}
```

### Authentication Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_TOKEN` | 401 | Invalid JWT token format |
| `MISSING_API_KEY` | 401 | API key not provided |
| `INVALID_API_KEY` | 401 | API key is invalid or revoked |
| `API_KEY_EXPIRED` | 401 | API key has expired |

### Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_EMAIL` | 400 | Invalid email format |
| `INVALID_PHONE` | 400 | Invalid phone number format |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing |
| `INVALID_CONNECTOR_TYPE` | 400 | Unsupported connector type |

### Rate Limiting

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `QUOTA_EXCEEDED` | 429 | Monthly quota exceeded |

### Resource Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PROJECT_NOT_FOUND` | 404 | Project does not exist |
| `CONNECTOR_NOT_FOUND` | 404 | Connector does not exist |
| `TEMPLATE_NOT_FOUND` | 404 | Template does not exist |
| `ACCESS_DENIED` | 403 | User does not have access to resource |

### Connector Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CONNECTOR_ERROR` | 500 | Connector failed to send message |
| `INVALID_CREDENTIALS` | 400 | Invalid connector credentials |
| `CONNECTOR_NOT_ACTIVE` | 400 | Connector is not active |
| `THIRD_PARTY_ERROR` | 502 | Third-party API error |

### Server Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Internal server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Rate Limits

### API Key Limits
- **Free Tier**: 1,000 messages/hour
- **Pro Tier**: 10,000 messages/hour
- **Enterprise**: Custom limits

### Dashboard API Limits
- **Standard**: 100 requests/minute per user
- **Pro**: 500 requests/minute per user

---

## Pagination

List endpoints support pagination using `limit` and `offset` query parameters.

**Example:**
```
GET /api/v1/messages?limit=20&offset=40
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 40,
    "total": 100,
    "hasMore": true
  }
}
```

---

## SDK Usage

### Installation

```bash
npm install messagejs-client
# or
yarn add messagejs-client
# or
browser: <script src="https://cdn.messagejs.pro/v1/messagejs.js"></script>
```

### Initialize

```typescript
import { messagejs } from '@messagejs/client';

messagejs.init({
  apiKey: 'pk_live_your_api_key',
  // Optional config for self-hosting or retries
  baseUrl: 'https://api.messagejs.pro/api/v1',
  retries: 2 // Number of retries on 429/5xx errors, default is 0
});
```

### Send Message

All messages are sent using a connector and a template.

```typescript
import { messagejs } from '@messagejs/client';

try {
  const result = await messagejs.sendMessage({
    to: '+1234567890',
    connectorId: 'conn_whatsapp_abc123',
    templateId: 'tpl_welcome_xyz456',
    variables: {
      name: 'John',
      code: '12345'
    }
  });

  console.log('Message queued successfully:', result.messageId, 'Status:', result.status);
} catch (error) {
  console.error('Failed to send message:', error);
}
```

---

**Last Updated**: 2024-01-15  
**API Version**: v1
