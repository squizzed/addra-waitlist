import nodemailer from 'nodemailer';
import { blobs } from '@netlify/blobs';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors(200);
  if (event.httpMethod !== 'POST') return cors(405, { error: 'Method not allowed' });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, TO_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return cors(500, { error: 'Email not configured (missing env).' });
  }

  let body = {}; try { body = JSON.parse(event.body || '{}'); } catch { return cors(400, { error:'Invalid JSON' }); }
  const name = String(body.name||'').trim().slice(0,80);
  const email = String(body.email||'').trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !valid) return cors(400, { error: 'Invalid name or email' });

  // persist count + store lead
  const store = blobs();
  const countKey = 'stats:count';
  const raw = await store.get(countKey, { type: 'text' });
  const current = raw === null ? 0 : (parseInt(raw,10) || 0);
  const next = current + 1;
  await Promise.all([
    store.set(countKey, String(next)),
    store.set(`lead:${Date.now()}:${Math.random().toString(36).slice(2)}`, JSON.stringify({ name, email, ts: new Date().toISOString() }))
  ]);

  try{
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const from = `Addra <${SMTP_USER}>`;
    await transporter.sendMail({
      from,
      to: email,
      subject: '🎉 Welcome to Addra — You’re on the waitlist!',
      html: tplUser(name)
    });

    await transporter.sendMail({
      from,
      to: TO_EMAIL || SMTP_USER,
      subject: `New waitlist signup — ${email}`,
      text: `Name: ${name}\nEmail: ${email}\nTime: ${new Date().toISOString()}`
    });

    return cors(200, { ok:true, count: next });
  }catch(e){
    return cors(500, { error: 'Email send failed. Check SMTP settings/password.' });
  }
};

function cors(status, body={}){
  return {
    statusCode: status,
    headers: {
      'Content-Type':'application/json',
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Methods':'POST,OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type'
    },
    body: JSON.stringify(body)
  };
}

function esc(s=''){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function firstName(n){ const f = String(n).trim().split(/\s+/)[0]||'there'; return esc(f); }

function tplUser(name){
  const first = firstName(name);
  return `
<div style="background:#0b0f18;padding:32px">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
         style="max-width:600px;margin:0 auto;background:#0f172a;
                border:1px solid #1f2e4a;border-radius:20px;color:#eaf2ff;
                font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif">
    <tr>
      <td style="padding:28px;text-align:center">
        <img src="https://addra.in/assets/logo.svg" alt="Addra Logo"
             style="width:64px;height:64px;margin-bottom:14px"/>

        <h1 style="margin:0;font-size:24px;font-weight:800;
                   background:linear-gradient(90deg,#7c5cff,#00e0ff);
                   -webkit-background-clip:text;color:transparent">
          Welcome to Addra 🎉
        </h1>

        <p style="margin:14px 0;color:#9cb3d9;font-size:16px;line-height:1.5">
          Hey <strong>${first}</strong>, thanks for joining our waitlist!<br/>
          You’re officially on the path to early access of India’s
          safe, authentic, <em>AI-powered</em> hangout.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto">
          <tr>
            <td align="center" bgcolor="#7c5cff"
                style="border-radius:12px;background:linear-gradient(90deg,#7c5cff,#00e0ff)">
              <a href="https://addra.in" target="_blank"
                 style="display:inline-block;padding:12px 22px;
                        font-size:15px;font-weight:700;color:#04101a;
                        text-decoration:none;font-family:inherit">
                Visit Addra
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;color:#cfe3ff;font-size:15px">
          🚀 Why Addra?
        </p>
        <ul style="margin:8px auto 18px;padding-left:20px;text-align:left;
                   display:inline-block;color:#bcd3ff;font-size:14px;line-height:1.6">
          <li>No stolen pictures — AI blocks them instantly</li>
          <li>Real people (verified) or private AI avatars</li>
          <li>Regional communities & creator tools</li>
        </ul>

        <p style="margin:0;color:#9cb3d9;font-size:14px">
          — Team Addra
        </p>
      </td>
    </tr>
  </table>
</div>`;
}
