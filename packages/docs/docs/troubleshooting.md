---
id: troubleshooting
title: Troubleshooting Guide
sidebar_position: 10
---

# Troubleshooting Guide

Common issues and solutions when using MessageJS.

## SDK Issues

### "Authentication token not found"

**Problem:** The API key is missing or invalid.

**Solution:**
1. Verify your API key is correct
2. Ensure you're using the correct base URL
3. Check that the API key format is: `pk_live_..._sk_...`

```typescript
// ✅ Correct
messagejs.init({
  apiKey: 'pk_live_abc123_sk_xyz789',
  baseUrl: 'https://api.messagejs.pro'
});

// ❌ Incorrect
messagejs.init('invalid-key');
```

### "Network error or API is unreachable"

**Problem:** Cannot connect to the API server.

**Solutions:**
1. Check your internet connection
2. Verify the base URL is correct
3. Check for firewall/proxy issues
4. Ensure the API server is running (for local development)

```typescript
// For local development
messagejs.init({
  apiKey: process.env.MESSAGEJS_API_KEY!,
  baseUrl: 'http://localhost:3001' // Local API
});

// For production
messagejs.init({
  apiKey: process.env.MESSAGEJS_API_KEY!,
  baseUrl: 'https://api.messagejs.pro' // Production API
});
```

### "Request failed with status 429"

**Problem:** Rate limit exceeded.

**Solutions:**
1. Implement exponential backoff
2. Add request queuing
3. Contact support to increase limits

The SDK automatically retries with exponential backoff, but you can configure it:

```typescript
messagejs.init({
  apiKey: process.env.MESSAGEJS_API_KEY!,
  retries: 5 // Increase retry attempts
});
```

## Dashboard Issues

### Can't log in

**Problem:** Login fails with 401 error.

**Solutions:**
1. Check email and password are correct
2. Ensure CORS is configured on the API
3. Clear browser cookies and try again
4. Check that the authentication endpoint is accessible

### Projects not loading

**Problem:** Dashboard shows empty state or error.

**Solutions:**
1. Refresh the page
2. Check browser console for errors
3. Verify API is accessible
4. Check network tab for failed requests

### API key not visible after creation

**Problem:** Missing API key after generation.

**Solution:** API keys are only shown once during creation. If you didn't copy it:
1. Delete the key and create a new one
2. Copy it to a secure location immediately

## Message Sending Issues

### Messages not sending

**Problem:** `sendMessage` fails or times out.

**Solutions:**

1. **Check connector configuration:**
   ```typescript
   // Ensure connector is properly configured in dashboard
   ```

2. **Verify template exists:**
   ```typescript
   const result = await messagejs.sendMessage({
     templateId: 'valid_template_id', // Make sure this exists
     connectorId: 'valid_connector_id', // Make sure this exists
     to: '+1234567890',
     variables: {}
   });
   ```

3. **Check recipient format:**
   ```typescript
   // ✅ Correct: E.164 format
   to: '+1234567890'
   
   // ❌ Incorrect
   to: '1234567890'
   to: '(123) 456-7890'
   ```

### Template variables not working

**Problem:** Variables not substituted correctly.

**Solution:** Ensure variables match the template definition:

```typescript
// Template: "Hello {{name}}, your code is {{code}}"

// ✅ Correct
variables: {
  name: 'John',
  code: '123456'
}

// ❌ Incorrect (wrong keys)
variables: {
  username: 'John', // Should be 'name'
  otp: '123456'     // Should be 'code'
}
```

### Messages sent but not delivered

**Problem:** Messages show "sent" but recipients don't receive them.

**Solutions:**
1. Check connector status in dashboard
2. Verify connector credentials are valid
3. Check webhook logs for delivery status
4. Contact your connector provider

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `400` | Bad Request | Check request parameters |
| `401` | Unauthorized | Verify API key |
| `403` | Forbidden | Check permissions |
| `404` | Not Found | Verify IDs exist |
| `429` | Rate Limited | Implement backoff |
| `500` | Server Error | Retry or contact support |

## Getting Help

If you're still experiencing issues:

1. Check the [FAQ](#)
2. Review [API Reference](/api-reference)
3. Search [GitHub Issues](https://github.com/1cbyc/messagejs/issues)
4. Contact support: support@messagejs.pro

## Debug Mode

Enable debug logging:

```typescript
messagejs.init({
  apiKey: process.env.MESSAGEJS_API_KEY!,
  baseUrl: 'https://api.messagejs.pro',
  debug: true // Enable verbose logging
});
```

For dashboard debugging, check browser console:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for API requests

