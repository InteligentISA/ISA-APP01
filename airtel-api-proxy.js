const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4001;

// Airtel API credentials (from user)
const AIRTEL_CLIENT_ID = 'df32b019-95e4-4a6e-a687-e471785aa60a';
const AIRTEL_CLIENT_SECRET = 'df32b019-95e4-4a6e-a687-e471785aa60a';
const AIRTEL_BASE_URL = 'https://openapi.airtel.africa';

app.use(bodyParser.json());

async function getAirtelAccessToken() {
  const response = await fetch(`${AIRTEL_BASE_URL}/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: AIRTEL_CLIENT_ID,
      client_secret: AIRTEL_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const data = await response.json();
  if (!data.access_token) throw new Error('Failed to get Airtel access token');
  return data.access_token;
}

app.post('/api/airtel/initiate', async (req, res) => {
  try {
    const { phoneNumber, amount, orderId, description } = req.body;
    const accessToken = await getAirtelAccessToken();

    const paymentResponse = await fetch(`${AIRTEL_BASE_URL}/merchant/v1/payments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Country': 'KE', // Kenya
        'X-Currency': 'KES'
      },
      body: JSON.stringify({
        reference: orderId,
        subscriber: {
          country: 'KE',
          currency: 'KES',
          msisdn: phoneNumber
        },
        transaction: {
          amount: amount,
          country: 'KE',
          currency: 'KES',
          id: orderId
        }
      })
    });

    const data = await paymentResponse.json();
    if (data.status && data.status.status === 'SUCCESS') {
      res.json({
        status: 'SUCCESS',
        transactionId: data.data.transaction.id,
        message: 'Airtel Money payment initiated'
      });
    } else {
      res.status(400).json({
        status: 'FAILED',
        message: data.status ? data.status.message : 'Airtel Money payment failed'
      });
    }
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Airtel Money API proxy running on port ${PORT}`);
}); 