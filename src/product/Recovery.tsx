import React from 'react';
import { request } from './api';
import { Banner, Field, useAction } from './shared';
export function Recovery({ token, onBack }: { token: string | null; onBack: () => void }) {
  const action = useAction();
  return <section className="panel auth-card"><h1>{token ? 'Choose a new password' : 'Recover your account'}</h1><form onSubmit={e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)); void action.run(async () => { await request(token ? '/auth/reset-password' : '/auth/forgot-password', 'POST', token ? { token, password: f.password } : { email: f.email }); if (token) history.replaceState({}, '', '/?view=account'); onBack(); }, token ? 'Password reset. Sign in with your new password.' : 'If this email has an account, a reset link has been sent.'); }}>{token ? <Field label="New password"><input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></Field> : <Field label="Account email"><input name="email" type="email" autoComplete="email" required /></Field>}<Banner error={action.error} /><button className="primary" disabled={action.busy}>{token ? 'Reset password' : 'Send reset link'}</button><button type="button" className="text-button" onClick={onBack}>Back to sign in</button></form></section>;
}
