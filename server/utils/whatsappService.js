// ==========================================
// WhatsApp & SMS Integration Service
// ==========================================
// When the CEO purchases an API (like MSG91, Twilio, or Meta Cloud API),
// you will simply import 'axios' here and replace the console.log 
// with the actual POST request to their server.

const sendWhatsAppMessage = async (phone, messageTemplateName, variables) => {
  // 1. Sanitize Phone Number (Remove spaces, ensure country code)
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone; // Default to India if no country code
  }

  // 2. Format the message for our console log (Simulating the API payload)
  let finalMessage = "";

  switch (messageTemplateName) {
    case "donation_receipt":
      finalMessage = `Namaste ${variables.name}, thank you for your generous donation of Rs. ${variables.amount} towards ${variables.scheme}. Your Receipt No is ${variables.receiptNo}. - Karunasri Seva Samithi`;
      break;

    case "donation_cancelled":
      finalMessage = `Namaste ${variables.name}, your donation receipt ${variables.receiptNo} for Rs. ${variables.amount} has been cancelled. Reason: ${variables.reason}. - Karunasri Seva Samithi`;
      break;

    case "event_invitation":
      finalMessage = `Namaste ${variables.name}, your Seva (${variables.scheme}) is scheduled on ${variables.date}. We cordially invite you to visit the Ashram and serve the students. - Karunasri Seva Samithi`;
      break;

    case "recurring_reminder":
      finalMessage = `Namaste ${variables.name}, a gentle reminder that your annual support for ${variables.scheme} is upcoming in ${variables.daysLeft} days. - Karunasri Seva Samithi`;
      break;

    default:
      finalMessage = `Namaste, you have a new notification from Karunasri Seva Samithi.`;
  }

  // 3. The API Call Stub
  try {
    // Example of future code:
    // await axios.post('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/', {
    //   integrated_number: process.env.WA_NUMBER,
    //   content_type: "template",
    //   payload: { to: cleanPhone, template: { name: messageTemplateName, language: { policy: "deterministic", code: "en" }, components: [...] } }
    // }, { headers: { authkey: process.env.MSG91_KEY } });

    console.log(`\n💬 [WHATSAPP API MOCK] To: +${cleanPhone}`);
    console.log(`   Template: ${messageTemplateName}`);
    console.log(`   Message: "${finalMessage}"\n`);
    
    return true;
  } catch (error) {
    console.error("❌ WhatsApp API Failed:", error.message);
    return false;
  }
};

module.exports = { sendWhatsAppMessage };