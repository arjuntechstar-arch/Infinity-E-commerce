import Stripe from 'stripe';
import { HttpError } from './http';
import nodemailer from 'nodemailer';
export class Providers {
  mailConfigured() { return !!(process.env.SMTP_HOST && process.env.SMTP_FROM); }
  async sendReset(email: string, url: string) {
    if (!this.mailConfigured()) throw new HttpError(503, 'Account recovery email is not configured. Contact the store.');
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } } : {}), connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000 });
    await transport.sendMail({ from: process.env.SMTP_FROM, to: email, subject: 'Reset your store password', text: `A password reset was requested for your account. Open the following link within 15 minutes:\n\n${url}\n\nIf you did not request this, ignore this email.` });
  }
  stripe() {
    if (!process.env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Payments are not configured. Contact the store.');
    return new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 20000, maxNetworkRetries: 2 });
  }
  appUrl() {
    const value = process.env.APP_URL;
    if (!value) throw new HttpError(503, 'Store URL is not configured');
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new HttpError(503, 'Store URL must use HTTPS');
    return url.origin;
  }
  async verifyPhone(phone: string, code?: string): Promise<{ status: string; sid: string; to: string }> {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) throw new HttpError(503, 'Phone verification is not configured');
    const params = new URLSearchParams({ To: phone, ...(code ? { Code: code } : { Channel: 'sms' }) });
    const res = await fetch(`https://verify.twilio.com/v2/Services/${encodeURIComponent(TWILIO_VERIFY_SERVICE_SID)}/${code ? 'VerificationCheck' : 'Verifications'}`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new HttpError(res.status === 404 ? 400 : 502, res.status === 404 ? 'Verification expired. Request a new code.' : 'Phone verification service could not complete the request');
    return res.json();
  }
  async shippo(endpoint: string, body?: object) {
    if (!process.env.SHIPPO_TOKEN) throw new HttpError(503, 'Shipping provider is not configured');
    const res = await fetch('https://api.goshippo.com' + endpoint, { method: body ? 'POST' : 'GET', headers: { Authorization: `ShippoToken ${process.env.SHIPPO_TOKEN}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new HttpError(502, 'Shipping provider could not complete the request');
    return await res.json() as { object_id: string; status: string; rates?: { object_id: string; provider: string; amount: string; currency: string; servicelevel: { name: string } }[]; label_url: string; tracking_number: string; tracking_url_provider: string; tracking_status?: { status: string }; messages?: unknown[] };
  }
  capabilities() {
    return { payments: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.APP_URL), identity: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.APP_URL), phone: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID), shipping: !!(process.env.SHIPPO_TOKEN && process.env.SHIP_FROM_ADDRESS) };
  }
}
