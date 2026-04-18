/**
 * Way2Smart SMS Integration for Yogis Farm
 * All SMS templates are DLT-registered with specific template IDs.
 */
const https = require('https');
const http = require('http');

const SMS_CONFIG = {
  sender: process.env.SMS_SENDER || 'YOSFRM',
  apiKey: process.env.SMS_API_KEY || '',
  dltEntityId: process.env.SMS_DLT_ENTITY_ID || '',
  baseUrl: 'https://platform.way2smart.in/index.php/sms/urlsms',

  // DLT Template IDs – one per message type
  templates: {
    OTP:            process.env.SMS_TMPL_OTP || '',
    ORDER_CONFIRM:  process.env.SMS_TMPL_ORDER_CONFIRM || '',
    SHIPPED:        process.env.SMS_TMPL_SHIPPED || '',
    OUT_FOR_DEL:    process.env.SMS_TMPL_OUT_FOR_DEL || '',
    DELIVERED_INV:  process.env.SMS_TMPL_DELIVERED_INV || '',
    ASSIGNED:       process.env.SMS_TMPL_ASSIGNED || '',
  }
};

/**
 * Fire an SMS via Way2Smart URL-based API.
 * @param {string} phone  - 10-digit mobile number
 * @param {string} message - Fully composed message string
 * @param {string} templateId - DLT template ID for this message
 */
async function sendSMS(phone, message, templateId) {
  // Always log to console for debugging
  console.log(`\n📱 [SMS → ${phone}] ${message}\n`);

  // Skip actual SMS in demo mode or if API key is missing
  if (process.env.DEMO_MODE === 'true' || !SMS_CONFIG.apiKey) {
    console.log('   ⚠️  SMS skipped (demo mode or no API key configured)\n');
    return { sent: false, reason: 'demo_mode' };
  }

  const params = new URLSearchParams({
    sender: SMS_CONFIG.sender,
    numbers: phone,
    message,
    messagetype: 'TXT',
    reponse: 'Y',
    apikey: SMS_CONFIG.apiKey,
    dltentityid: SMS_CONFIG.dltEntityId,
    dlttempid: templateId
  });

  // Way2Smart requires %20 for spaces, URLSearchParams uses + by default
  const queryString = params.toString().replace(/\+/g, '%20');
  const url = `${SMS_CONFIG.baseUrl}?${queryString}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await response.text();
    console.log(`   ✅ SMS API response: ${data}\n`);
    return { sent: true, response: data };

  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('   ❌ SMS API timeout (10s)\n');
      return { sent: false, error: 'timeout' };
    }
    console.error(`   ❌ SMS send error: ${err.message}\n`);
    return { sent: false, error: err.message };
  }
}

// ─── Pre-built message helpers ───

/**
 * 1. NYOTP — Login OTP
 */
function sendOtpSMS(phone, otp) {
  const message = `Dear Customer, Your OTP for login is ${otp}. It is valid for 5 minutes. Regards, Team YogisFarms`;
  return sendSMS(phone, message, SMS_CONFIG.templates.OTP);
}

/**
 * 4. NYOCONFIRM — Order confirmed
 */
function sendOrderConfirmSMS(phone, orderId) {
  const message = `Dear Customer, Your order with ID ${orderId} has been confirmed. Regards, Team YogisFarms`;
  return sendSMS(phone, message, SMS_CONFIG.templates.ORDER_CONFIRM);
}

/**
 * 3. NYSHIPPED — Order shipped
 */
function sendShippedSMS(phone, orderId, trackingLink = '') {
  const message = `Dear Customer, Your order with ID ${orderId} has been shipped. You can track your order here:${trackingLink} Pune. Regards, Team YogisFarms`;
  return sendSMS(phone, message, SMS_CONFIG.templates.SHIPPED);
}

/**
 * 5. NYOFDEL — Out for delivery
 */
function sendOutForDeliverySMS(phone, orderId) {
  const message = `Dear Customer, Your order ID ${orderId} is out for delivery. Please be available, your order will be delivered soon. Regards, Team YogisFarms`;
  return sendSMS(phone, message, SMS_CONFIG.templates.OUT_FOR_DEL);
}

/**
 * 2. NYDELINV — Delivered + invoice link
 */
function sendDeliveredSMS(phone, orderId, invoiceLink = '') {
  const message = `Dear Customer, Your order with ID ${orderId} has been delivered. You can download your invoice here: ${invoiceLink}. Regards, Team YogisFarms`;
  return sendSMS(phone, message, SMS_CONFIG.templates.DELIVERED_INV);
}

/**
 * 6. NYASSIGNED — Delivery partner assigned
 */
function sendAssignedSMS(phone, orderId, deliveryBoyPhone = '') {
  // Matching exact URL structure: ...your order (ID:${orderId}) is assigned... Contact: {${deliveryBoyPhone}}...
  const message = `Dear Customer, your order (ID:${orderId}) is assigned to a delivery partner. Contact: {${deliveryBoyPhone}}. - Team YogisFarms`;
  return sendSMS(phone, message, SMS_CONFIG.templates.ASSIGNED);
}

module.exports = {
  sendSMS,
  sendOtpSMS,
  sendOrderConfirmSMS,
  sendShippedSMS,
  sendOutForDeliverySMS,
  sendDeliveredSMS,
  sendAssignedSMS
};
