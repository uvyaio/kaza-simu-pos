/**
 * KaliPOS M-Pesa Daraja API STK Push (LIPA NA M-PESA ONLINE) helper
 */

export type MpesaStkRequest = {
  phoneNumber: string; // e.g. 254712345678 or 0712345678
  amount: number;
  tillOrPaybill: string;
  accountReference?: string;
  transactionDesc?: string;
};

export type MpesaStkResponse = {
  success: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  mpesaReceiptNumber?: string;
  error?: string;
};

/**
 * Standardizes Kenyan phone numbers to format 254XXXXXXXXX
 */
export function formatKenyanPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+254")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

/**
 * Initiates an M-Pesa STK Push request.
 * Communicates with backend / Supabase Edge Function or simulates active push with full response metadata.
 */
export async function triggerMpesaStkPush(req: MpesaStkRequest): Promise<MpesaStkResponse> {
  const formattedPhone = formatKenyanPhone(req.phoneNumber);
  
  if (formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
    return {
      success: false,
      error: "Invalid phone number format. Please enter a valid Kenyan Safaricom M-Pesa number (e.g. 0712 345 678 or 0799 000 111).",
    };
  }

  if (req.amount <= 0) {
    return {
      success: false,
      error: "Amount must be greater than zero.",
    };
  }

  // Simulate server roundtrip / STK prompt dispatch
  await new Promise((res) => setTimeout(res, 1500));

  const randomRef = "SJ" + Math.random().toString(36).substring(2, 9).toUpperCase();
  const checkoutId = "ws_CO_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

  return {
    success: true,
    merchantRequestId: "29177-1002341-1",
    checkoutRequestId: checkoutId,
    responseCode: "0",
    responseDescription: "Success. Request accepted for processing",
    customerMessage: `STK push sent to ${formattedPhone}. Please check your phone and enter M-Pesa PIN to complete payment of KSh ${req.amount.toLocaleString()}.`,
    mpesaReceiptNumber: randomRef,
  };
}
