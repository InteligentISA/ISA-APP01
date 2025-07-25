export interface AirtelPaymentRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  description: string;
}

export interface AirtelPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  errorCode?: string;
}

export class AirtelService {
  // Initiate Airtel Money payment (calls your backend proxy)
  static async initiatePayment(request: AirtelPaymentRequest): Promise<AirtelPaymentResponse> {
    try {
      const response = await fetch('/api/airtel/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      if (data.status === 'SUCCESS') {
        return {
          success: true,
          transactionId: data.transactionId,
          message: 'Payment request sent successfully. Please check your phone for the Airtel Money prompt.'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Payment initiation failed',
          errorCode: data.status
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }
} 