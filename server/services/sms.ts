
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}
