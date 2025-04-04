
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface SMSOptions {
  templateName?: string;
  variables?: Record<string, string>;
}

const templates: Record<string, (vars?: Record<string, string>) => string> = {
  welcome: () => "Welcome to AGRI AI! Your farming assistant is ready to help you.",
  cropAlert: (vars) => `Alert: Your ${vars?.cropName} field may need attention. ${vars?.message}`,
  weatherAlert: (vars) => `Weather Alert: ${vars?.condition} expected in your area. ${vars?.advice}`,
  marketPrice: (vars) => `Market Update: Current price for ${vars?.cropName} is ₹${vars?.price}/quintal`,
};

export async function sendSMS(
  phoneNumber: string, 
  message: string,
  options?: SMSOptions
) {
  try {
    let finalMessage = message;
    if (options?.templateName && templates[options.templateName]) {
      finalMessage = templates[options.templateName](options.variables);
    }

    const result = await client.messages.create({
      body: finalMessage,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

export async function sendBulkSMS(
  phoneNumbers: string[], 
  message: string,
  options?: SMSOptions
) {
  try {
    const promises = phoneNumbers.map(phoneNumber => 
      sendSMS(phoneNumber, message, options)
    );
    return await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
}
