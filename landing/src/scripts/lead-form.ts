// Envío del formulario con mejora progresiva: sin JS, el form hace POST normal y el servidor redirige.
import { getAnonId, getAttribution, saveLead } from './track';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmal.com': 'gmail.com', 'gnail.com': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hormail.com': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com',
};

function setError(form: HTMLFormElement, message: string, field?: HTMLInputElement | null) {
  const box = form.querySelector<HTMLElement>('[data-form-error]');
  if (box) {
    box.textContent = message;
    box.hidden = !message;
  }
  form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
  if (field) {
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  }
}

function initForm(form: HTMLFormElement) {
  const msgs = JSON.parse(form.dataset.messages || '{}') as Record<string, string>;
  const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
  const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
  const consent = form.querySelector<HTMLInputElement>('input[name="consent"]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const hint = form.querySelector<HTMLElement>('[data-email-hint]');

  emailInput?.addEventListener('blur', () => {
    const v = emailInput.value.trim().toLowerCase();
    const domain = v.split('@')[1];
    if (hint && domain && TYPOS[domain]) {
      const fixed = `${v.split('@')[0]}@${TYPOS[domain]}`;
      hint.innerHTML = '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'underline font-semibold';
      btn.textContent = `¿Quisiste decir ${fixed}?`;
      btn.addEventListener('click', () => {
        emailInput.value = fixed;
        hint.textContent = '';
      });
      hint.appendChild(btn);
    } else if (hint) {
      hint.textContent = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput?.value.trim() ?? '';
    const email = emailInput?.value.trim().toLowerCase() ?? '';
    if (name.length < 2) return setError(form, msgs.name, nameInput);
    if (!EMAIL_RE.test(email) || email.length > 254) return setError(form, msgs.email, emailInput);
    if (consent && !consent.checked) return setError(form, msgs.consent, consent);
    setError(form, '');

    const data = new FormData(form);
    const attribution = getAttribution();
    const payload: Record<string, string> = {};
    data.forEach((v, k) => { payload[k] = typeof v === 'string' ? v : ''; });
    payload.email = email;
    payload.name = name;
    payload.consent = consent?.checked ? 'on' : '';
    payload.anon_id = getAnonId();
    for (const [k, v] of Object.entries(attribution)) if (v) payload[k] = v;

    const original = button?.textContent ?? '';
    if (button) {
      button.disabled = true;
      button.textContent = msgs.sending || '…';
    }
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; redirect?: string; error?: string };
      if (res.ok && json.ok) {
        saveLead({ name, email });
        const w = window as unknown as { fbq?: (...args: unknown[]) => void };
        w.fbq?.('track', 'Lead');
        window.location.assign(json.redirect || '/gracias');
        return;
      }
      const key = json.error && msgs[json.error] ? json.error : res.status === 429 ? 'rate' : 'generic';
      setError(form, msgs[key] || msgs.generic);
      const w = window as unknown as { turnstile?: { reset: () => void } };
      w.turnstile?.reset();
    } catch {
      setError(form, msgs.generic);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = original;
      }
    }
  });
}

document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach(initForm);
