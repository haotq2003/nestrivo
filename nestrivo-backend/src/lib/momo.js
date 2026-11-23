import crypto from "crypto";

const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/landlord/dashboard?payment=success",
  ipnUrl: process.env.MOMO_IPN_URL || "https://momo.nestrivo.vn/api/promotions/momo-ipn",
};

/**
 * Tạo URL thanh toán MoMo (All-in-One Gateway v2)
 */
export async function createMoMoPayment({
  orderId,
  amount,
  orderInfo = "Thanh toán gói tin nổi bật Nestrivo",
  redirectUrl = MOMO_CONFIG.redirectUrl,
  ipnUrl = MOMO_CONFIG.ipnUrl,
  extraData = "",
  requestType = "payWithATM",
}) {
  const requestId = `${orderId}_${Date.now()}`;
  const amountStr = String(Math.round(amount));

  // Chuỗi chữ ký chuẩn SHA256 theo tài liệu MoMo v2
  const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: MOMO_CONFIG.partnerCode,
    partnerName: "Nestrivo PropTech",
    storeId: "NestrivoStore",
    requestId,
    amount: amountStr,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: "vi",
  };

  const response = await fetch(MOMO_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseData = await response.json();

  if (responseData.resultCode !== 0) {
    throw new Error(responseData.message || "Không thể khởi tạo thanh toán qua MoMo.");
  }

  return {
    payUrl: responseData.payUrl,
    qrCodeUrl: responseData.qrCodeUrl,
    deeplink: responseData.deeplink,
    deeplinkMiniApp: responseData.deeplinkMiniApp,
    orderId: responseData.orderId,
    requestId: responseData.requestId,
    resultCode: responseData.resultCode,
    message: responseData.message,
  };
}

/**
 * Xác thực chữ ký IPN (Webhook) gửi từ MoMo
 */
export function verifyMoMoIpnSignature(body) {
  const {
    accessKey = MOMO_CONFIG.accessKey,
    amount,
    extraData = "",
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode = MOMO_CONFIG.partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    transId,
    signature,
  } = body;

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const generatedSignature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  return generatedSignature === signature;
}
