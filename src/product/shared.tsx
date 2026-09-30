import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { request } from './api';
import type { User, Settings, Capabilities } from './types';
import { Recovery } from './Recovery';
export const money = (amount: number, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount / 100);
export const date = (value: string) => new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z').toLocaleString();
export const StoreContext = createContext<{ user: User | null; config: Settings; capabilities: Capabilities; refresh: () => Promise<void>; version: number; notify: (message: string) => void }>({ user: null, config: { name: 'VoltMart', currency: 'USD', country: 'US', shippingFee: 0, taxBasisPoints: 0, supportEmail: '', address: '' }, capabilities: { payments: false, phone: false, identity: false, shipping: false }, refresh: async () => {}, version: 0, notify: () => {} });
export const useStore = () => useContext(StoreContext);
export function useData<T>(url: string) {
  const { version } = useStore(); const [data, setData] = useState<T | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; setLoading(true); setError(''); request<T>(url).then(value => { if (active) setData(value); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [url, version]);
  return { data, error, loading };
}
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
export function Banner({ error }: { error: string }) { return error ? <p role="alert" className="error-banner">{error}</p> : null; }
export function Empty({ children }: { children: ReactNode }) { return <div className="empty-state">{children}</div>; }
export function Status({ value }: { value: string }) { return <span className={`status status-${value}`}>{value.replaceAll('_', ' ')}</span>; }
export function Loading({ loading, error }: { loading: boolean; error: string }) { return <><Banner error={error} />{loading && <p role="status" className="muted">Loading…</p>}</>; }
export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) { return <div className="page-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1></div>{children}</div>; }
export function useAction() {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const { refresh, notify } = useStore();
  const run = async (action: () => Promise<unknown>, message?: string) => { if (busy) return; setBusy(true); setError(''); try { await action(); await refresh(); if (message) notify(message); } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); } finally { setBusy(false); } };
  return { busy, error, run };
}
export function Table({ headings, children }: { headings: string[]; children: ReactNode }) { return <div className="table-wrap"><table><thead><tr>{headings.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
export function AuthForm() {
  const [recovery, setRecovery] = useState(!!new URLSearchParams(location.search).get('reset'));
  const [mode, setMode] = useState<'login' | 'register'>('login'); const { busy, error, run } = useAction();
  if (recovery) return <Recovery token={new URLSearchParams(location.search).get('reset')} onBack={() => setRecovery(false)} />;
  return <div className="auth-card panel"><span className="eyebrow">YOUR STORE ACCOUNT</span><h1>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1><p className="muted">Manage your orders, savings, and support in one place.</p><form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(() => request('/auth/' + mode, 'POST', Object.fromEntries(f)), mode === 'login' ? 'Signed in' : 'Account created'); }}>
    {mode === 'register' && <Field label="Full name"><input name="name" required minLength={2} autoComplete="name" /></Field>}
    <Field label="Email"><input type="email" name="email" required autoComplete="email" /></Field><Field label="Password"><input type="password" name="password" required minLength={mode === 'register' ? 12 : 1} maxLength={128} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /></Field>
    {mode === 'register' && <small>Use at least 12 characters.</small>}<Banner error={error} /><button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
  </form><button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}</button><br /><button className="text-button" onClick={() => setRecovery(true)}>Forgot your password?</button></div>;
}
