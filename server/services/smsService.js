const db = require('../config/db');

const sendSMS = async ({ recipientPhone, message, smsType, sentBy = null }) => {
  const apiKey = process.env.SMS_API_KEY;
  const senderName = process.env.SMS_SENDER_NAME || 'MEDITRACK';
  const apiUrl = process.env.SMS_API_URL || 'https://api.semaphore.co/api/v4/messages';

  let status = 'Sent';
  let apiResponse = 'Simulated SMS Gateway delivery: Success';

  try {
    if (apiKey && apiKey !== 'your_semaphore_api_key_here') {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          apikey: apiKey,
          number: recipientPhone,
          message: message,
          sendername: senderName
        })
      });
      const data = await response.json();
      apiResponse = JSON.stringify(data);
      status = response.ok ? 'Sent' : 'Failed';
    } else {
      console.log(`[SMS-SIMULATED] To: ${recipientPhone} | ${message}`);
    }
  } catch (err) {
    status = 'Failed';
    apiResponse = err.message;
  }

  try {
    await db.query(
      `INSERT INTO sms_logs (recipient_phone, message, sms_type, status, api_response, sent_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recipientPhone, message, smsType, status, apiResponse, sentBy]
    );
  } catch (logErr) {
    console.error('Failed to save SMS log:', logErr.message);
  }

  return { status, apiResponse };
};

module.exports = { sendSMS };