# Addra — Ultimate Waitlist (v2)
- Premium landing (hero, 3D card, starfield)
- Waitlist with success/failure states
- Auto‑reply email (upgraded HTML template with CTA)
- Admin notification
- Persistent counter via Netlify Blobs

## Env (Netlify → Project configuration → Environment variables)
SMTP_HOST = smtppro.zoho.in
SMTP_PORT = 465
SMTP_USER = hello@addra.in
SMTP_PASS = <your_app_password>
TO_EMAIL  = hello@addra.in

## Deploy
- Connect this repo to Netlify (Import from Git) or drag ZIP to Deploys
- Publish directory: "."  (root)
- No build command needed

## Test
- GET /.netlify/functions/stats → {"count":N}
- POST /.netlify/functions/join  body {"name","email"} → {"ok":true,"count":N}
- Submit form on index.html → see toast, receive emails
