export function normalizeFrPhone(raw) {
  if (!raw) return null;
  const d = String(raw).replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("33") && d.length >= 11) return `+${d.slice(0, 11)}`;
  if (d.startsWith("0") && d.length === 10) return `+33${d.slice(1)}`;
  if (d.length === 9 && (d.startsWith("6") || d.startsWith("7"))) {
    return `+33${d}`;
  }
  return null;
}

export function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM,
  );
}

export async function sendSms(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) {
    throw new Error("SMS non configuré");
  }
  const params = new URLSearchParams({
    To: to,
    From: from,
    Body: body,
  });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio: ${res.status} ${text}`);
  }
  return res.json();
}
