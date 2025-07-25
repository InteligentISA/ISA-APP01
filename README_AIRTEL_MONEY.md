# Airtel Money Integration Guide

## 1. Backend Proxy Setup

This project includes an Express server (`airtel-api-proxy.js`) that acts as a secure proxy for Airtel Money payments.

### How to Run the Proxy

1. **Install dependencies:**
   ```bash
   npm install express node-fetch body-parser
   ```
2. **Run the server:**
   ```bash
   node airtel-api-proxy.js
   ```
   The server will start on port 4001 by default.

3. **(Optional) Set environment variables:**
   - `PORT` (default: 4001)
   - `AIRTEL_CLIENT_ID` and `AIRTEL_CLIENT_SECRET` (hardcoded for now, but you can move them to environment variables for security)

### Endpoint
- `POST /api/airtel/initiate`
  - Body: `{ phoneNumber, amount, orderId, description }`
  - Returns: `{ status, transactionId, message }`

## 2. Frontend Usage

- Use the `AirtelService` in `src/services/airtelService.ts`:

```typescript
import { AirtelService } from '@/services/airtelService';

const response = await AirtelService.initiatePayment({
  phoneNumber: '2547XXXXXXXX',
  amount: 1000,
  orderId: 'ORDER123',
  description: 'Order payment'
});

if (response.success) {
  // Show success message
} else {
  // Show error message
}
```

## 3. Notes
- The proxy must be running and accessible to your frontend (CORS may need to be configured if running separately).
- The Airtel API credentials are currently hardcoded for demo purposes. For production, use environment variables.
- You may need to handle Airtel Money payment callbacks/webhooks for final payment confirmation.
- See [Airtel Africa API Docs](https://developers.airtel.africa/docs/merchant-payments/api-reference) for more details.

## 4. Testing
- Use Airtel sandbox/test credentials and numbers for development.
- Check the API docs for test scenarios and expected responses. 