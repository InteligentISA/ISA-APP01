# Environment Setup Guide

## M-Pesa API Configuration

To enable M-Pesa payments, you need to create a `.env` file in the MyPlug directory with the following variables:

```env
# M-Pesa API Credentials
VITE_MPESA_CONSUMER_KEY=xMrGml5cQ8qxSLRQP4N9TMerz8gBMKP2U7s0YOUT7CCU9jRy
VITE_MPESA_CONSUMER_SECRET=7W6xQIqeAaQozL54IDBzxtEHqAtjDYvpl3viByrDSHjFNvGD6ZibgXCjxCSQGTvf

# M-Pesa Business Short Code (you'll need to get this from Safaricom)
VITE_MPESA_BUSINESS_SHORT_CODE=174379

# M-Pesa Passkey (you'll need to get this from Safaricom)
VITE_MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Environment
NODE_ENV=development
```

## Steps to Set Up:

1. Create a `.env` file in the MyPlug directory
2. Copy the above content into the `.env` file
3. Replace the placeholder values with your actual M-Pesa credentials
4. Restart your development server

## Getting M-Pesa Credentials:

1. **Business Short Code**: This is your Safaricom business number (e.g., 174379 for sandbox)
2. **Passkey**: This is provided by Safaricom when you register for the Daraja API
3. **Consumer Key & Secret**: These are your API credentials from Safaricom

## Testing:

- The current setup uses the Sandbox environment
- For production, change the BASE_URL in `src/services/mpesaService.ts` to the production URL
- Test with the provided sandbox credentials first

## Security Notes:

- Never commit the `.env` file to version control
- Keep your API credentials secure
- Use different credentials for development and production 