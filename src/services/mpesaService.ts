// M-Pesa Service for Daraja API integration
// This service handles M-Pesa payment processing

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  description: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  errorCode?: string;
}

export class MpesaService {
  private static readonly BASE_URL = 'https://sandbox.safaricom.co.ke'; // Change to production URL when ready
  private static readonly CONSUMER_KEY = import.meta.env.VITE_MPESA_CONSUMER_KEY || '';
  private static readonly CONSUMER_SECRET = import.meta.env.VITE_MPESA_CONSUMER_SECRET || '';
  private static readonly PASSKEY = import.meta.env.VITE_MPESA_PASSKEY || '';
  private static readonly BUSINESS_SHORT_CODE = import.meta.env.VITE_MPESA_BUSINESS_SHORT_CODE || '';

  // Get access token for API authentication
  private static async getAccessToken(): Promise<string> {
    try {
      const credentials = btoa(`${this.CONSUMER_KEY}:${this.CONSUMER_SECRET}`);
      const response = await fetch(`${this.BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Authentication failed');
    }
  }

  // Generate timestamp in required format
  private static getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  // Generate password for STK Push
  private static generatePassword(): string {
    const timestamp = this.getTimestamp();
    const password = btoa(`${this.BUSINESS_SHORT_CODE}${this.PASSKEY}${timestamp}`);
    return password;
  }

  // Initiate STK Push (M-Pesa payment request)
  static async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      // Call backend proxy instead of Safaricom API directly
      const response = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: request.phoneNumber,
          amount: Math.round(request.amount),
          orderId: request.orderId,
          description: request.description
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      if (data.ResponseCode === '0') {
        return {
          success: true,
          transactionId: data.CheckoutRequestID,
          message: 'Payment request sent successfully. Please check your phone for the M-Pesa prompt.'
        };
      } else {
        return {
          success: false,
          message: data.ResponseDescription || 'Payment initiation failed',
          errorCode: data.ResponseCode
        };
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  // Check payment status
  static async checkPaymentStatus(checkoutRequestId: string): Promise<MpesaPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await fetch(`${this.BASE_URL}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      
      if (data.ResponseCode === '0') {
        const resultCode = data.ResultCode;
        if (resultCode === '0') {
          return {
            success: true,
            transactionId: data.TransactionID,
            message: 'Payment completed successfully'
          };
        } else if (resultCode === '1') {
          return {
            success: false,
            message: 'Payment is being processed'
          };
        } else {
          return {
            success: false,
            message: data.ResultDesc || 'Payment failed',
            errorCode: resultCode
          };
        }
      } else {
        return {
          success: false,
          message: data.ResponseDescription || 'Status check failed',
          errorCode: data.ResponseCode
        };
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  // Simulate payment for development/testing
  static async simulatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success (90% success rate for testing)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Payment completed successfully (Simulated)'
      };
    } else {
      return {
        success: false,
        message: 'Payment failed (Simulated)',
        errorCode: 'SIM_ERROR'
      };
    }
  }
} 