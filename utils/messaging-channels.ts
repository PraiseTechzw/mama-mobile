function digitsOnly(value: string | undefined) {
  return value?.replace(/\D/g, '') ?? '';
}

function validInternationalNumber(value: string) {
  return /^\d{8,15}$/.test(value);
}

const whatsappNumber = digitsOnly(process.env.EXPO_PUBLIC_MAMABOT_WHATSAPP_NUMBER);
const smsNumber = digitsOnly(process.env.EXPO_PUBLIC_MAMABOT_SMS_NUMBER);

export const messagingChannels = {
  whatsappUrl: validInternationalNumber(whatsappNumber)
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello MamaBot')}`
    : null,
  smsUrl: validInternationalNumber(smsNumber) ? `sms:+${smsNumber}` : null,
};
