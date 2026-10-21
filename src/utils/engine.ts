/**
 * Pure engine functions for StoreReach:
 * URL normalization, store name parsing, template interpolation,
 * queue transitions, and JavaScript injection code generation.
 */

export interface SenderProfile {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  messageTemplate: string;
}

export type StoreStatus = 'pending' | 'completed' | 'skipped';

export interface StoreItem {
  id: string;
  rawUrl: string;
  cleanUrl: string;
  domain: string;
  storeName: string;
  status: StoreStatus;
  contactedAt?: string; // ISO date string
  notes?: string;
}

/**
 * Cleans and normalizes a raw store URL
 */
export function cleanUrl(input: string): string {
  if (!input) return '';
  let trimmed = input.trim();
  // Strip quotes or commas from csv pasting
  trimmed = trimmed.replace(/^["']|["']$/g, '').trim();

  // If missing protocol, prepend https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Remove query params like tracking tokens or fbclid unless necessary
    parsed.searchParams.delete('fbclid');
    parsed.searchParams.delete('gclid');
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Extracts a clean domain (e.g. "gymshark.com") from a URL
 */
export function extractDomain(url: string): string {
  try {
    const cleaned = cleanUrl(url);
    const parsed = new URL(cleaned);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || url;
  }
}

/**
 * Infers a readable Store Name from the domain or path
 * e.g. "lumina-fashion.com" -> "Lumina Fashion"
 * "the-wellness-club.myshopify.com" -> "The Wellness Club"
 */
export function extractStoreName(url: string): string {
  const domain = extractDomain(url);
  // remove common tlds
  const base = domain
    .replace(/\.myshopify\.com$/i, '')
    .replace(/\.(com|co\.uk|org|net|io|store|shop|de|ca|au|fr|co)$/i, '');

  // split by dash, dot, underscore
  const words = base
    .replace(/[-_.]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'Store';

  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Compiles an outreach template with variable substitutions
 * Variables: {store_name}, {domain}, {full_name}, {email}, {phone}
 */
export function compileTemplate(
  template: string,
  variables: {
    storeName?: string;
    domain?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  }
): string {
  if (!template) return '';
  let result = template;
  const storeName = variables.storeName || 'Store';
  const domain = variables.domain || 'your store';
  const fullName = variables.fullName || '';
  const email = variables.email || '';
  const phone = variables.phone || '';

  result = result.replace(/\{store_name\}/gi, storeName);
  result = result.replace(/\{domain\}/gi, domain);
  result = result.replace(/\{full_name\}/gi, fullName);
  result = result.replace(/\{email\}/gi, email);
  result = result.replace(/\{phone\}/gi, phone);

  return result;
}

/**
 * Parses raw text containing URLs into StoreItem array
 */
export function parseUrlList(text: string, existingList: StoreItem[] = []): StoreItem[] {
  if (!text) return existingList;
  const existingSet = new Set(existingList.map(s => extractDomain(s.rawUrl)));
  const lines = text.split(/\r?\n|,/);
  const newItems: StoreItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    // basic check for url-like string
    if (!trimmed.includes('.') && !trimmed.startsWith('http')) continue;

    const domain = extractDomain(trimmed);
    if (!domain || existingSet.has(domain)) continue;

    existingSet.add(domain);
    newItems.push({
      id: `store_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rawUrl: trimmed,
      cleanUrl: cleanUrl(trimmed),
      domain,
      storeName: extractStoreName(trimmed),
      status: 'pending',
    });
  }

  return [...existingList, ...newItems];
}

/**
 * Finds next pending store index
 */
export function getNextPendingIndex(items: StoreItem[], currentIndex: number): number {
  if (items.length === 0) return -1;

  // Search forward from current index + 1
  for (let i = currentIndex + 1; i < items.length; i++) {
    if (items[i].status === 'pending') {
      return i;
    }
  }

  // Wrap around to start if not found
  for (let i = 0; i < currentIndex; i++) {
    if (items[i].status === 'pending') {
      return i;
    }
  }

  // If current itself is pending, stay on it, otherwise -1
  if (items[currentIndex] && items[currentIndex].status === 'pending') {
    return currentIndex;
  }

  return -1;
}

/**
 * Calculates outreach queue metrics
 */
export function calculateMetrics(items: StoreItem[]) {
  const total = items.length;
  const completed = items.filter(i => i.status === 'completed').length;
  const skipped = items.filter(i => i.status === 'skipped').length;
  const pending = items.filter(i => i.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    skipped,
    pending,
    completionRate,
  };
}

/**
 * Generates the JavaScript injection snippet for detecting & navigating to contact page
 */
export function getContactScannerScript(): string {
  return `(function() {
  try {
    const currentUrl = window.location.href.toLowerCase();
    // Already on a contact page?
    if (currentUrl.includes('/contact') || currentUrl.includes('/get-in-touch') || currentUrl.includes('/support')) {
      return { status: 'already_on_contact', url: window.location.href };
    }

    // Try common Shopify / standard paths
    const commonPatterns = ['contact', 'contact us', 'contact-us', 'get in touch', 'reach us', 'support', 'help'];
    const links = Array.from(document.querySelectorAll('a[href]'));

    for (const pattern of commonPatterns) {
      for (const link of links) {
        const text = (link.textContent || '').trim().toLowerCase();
        const href = (link.getAttribute('href') || '').toLowerCase();
        const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();

        if (
          text === pattern ||
          text.includes(pattern) ||
          href.includes('pages/contact') ||
          href.includes('/contact') ||
          ariaLabel.includes(pattern)
        ) {
          const targetHref = link.href;
          if (targetHref && !targetHref.startsWith('mailto:') && !targetHref.startsWith('tel:')) {
            window.location.href = targetHref;
            return { status: 'navigating', target: targetHref };
          }
        }
      }
    }

    // Fallback: try navigating to /pages/contact or /contact
    const origin = window.location.origin;
    window.location.href = origin + '/pages/contact';
    return { status: 'fallback_redirect', target: origin + '/pages/contact' };
  } catch (err) {
    return { status: 'error', error: err.toString() };
  }
})();`;
}

/**
 * Generates the JavaScript injection snippet for auto-filling modern contact forms
 */
export function getFormAutoFillScript(profile: {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): string {
  const safeProfile = {
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    subject: profile.subject || '',
    message: profile.message || '',
  };

  return `(function() {
  try {
    const data = ${JSON.stringify(safeProfile)};
    const filledFields = [];

    function triggerEvents(el, val) {
      if (!el) return;
      el.focus();
      el.value = val;
      el.setAttribute('value', val);
      el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      el.blur();
    }

    function matchesAny(str, list) {
      if (!str) return false;
      const lower = str.toLowerCase();
      return list.some(k => lower.includes(k));
    }

    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea'));

    // 1. Name Field
    const nameKeywords = ['name', 'fullname', 'first_name', 'your-name', 'contact[name]'];
    const nameEl = inputs.find(el => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'email' || type === 'tel' || type === 'password') return false;
      return matchesAny(el.name, nameKeywords) ||
             matchesAny(el.id, nameKeywords) ||
             matchesAny(el.getAttribute('placeholder'), nameKeywords) ||
             matchesAny(el.getAttribute('autocomplete'), ['name']);
    });
    if (nameEl && data.fullName) {
      triggerEvents(nameEl, data.fullName);
      filledFields.push('name');
    }

    // 2. Email Field
    const emailKeywords = ['email', 'e-mail', 'contact[email]'];
    const emailEl = inputs.find(el => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      return type === 'email' ||
             matchesAny(el.name, emailKeywords) ||
             matchesAny(el.id, emailKeywords) ||
             matchesAny(el.getAttribute('placeholder'), ['email', 'e-mail']);
    });
    if (emailEl && data.email) {
      triggerEvents(emailEl, data.email);
      filledFields.push('email');
    }

    // 3. Phone Field
    const phoneKeywords = ['phone', 'tel', 'mobile', 'contact[phone]'];
    const phoneEl = inputs.find(el => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      return type === 'tel' ||
             matchesAny(el.name, phoneKeywords) ||
             matchesAny(el.id, phoneKeywords) ||
             matchesAny(el.getAttribute('placeholder'), phoneKeywords);
    });
    if (phoneEl && data.phone) {
      triggerEvents(phoneEl, data.phone);
      filledFields.push('phone');
    }

    // 4. Subject Field
    const subjectKeywords = ['subject', 'topic', 'contact[subject]'];
    const subjectEl = inputs.find(el => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'email' || type === 'tel') return false;
      return matchesAny(el.name, subjectKeywords) ||
             matchesAny(el.id, subjectKeywords) ||
             matchesAny(el.getAttribute('placeholder'), subjectKeywords);
    });
    if (subjectEl && data.subject) {
      triggerEvents(subjectEl, data.subject);
      filledFields.push('subject');
    }

    // 5. Message Field (textarea or large body input)
    const messageKeywords = ['body', 'message', 'comment', 'inquiry', 'contact[body]', 'notes'];
    const messageEl = inputs.find(el => {
      return el.tagName.toLowerCase() === 'textarea' ||
             matchesAny(el.name, messageKeywords) ||
             matchesAny(el.id, messageKeywords) ||
             matchesAny(el.getAttribute('placeholder'), messageKeywords);
    });
    if (messageEl && data.message) {
      triggerEvents(messageEl, data.message);
      filledFields.push('message');
    }

    // 6. Find Submit Button and Scroll Into View Center
    const submitSelectors = [
      'input[type="submit"]',
      'button[type="submit"]',
      'button:not([type])',
      '.contact-form button',
      'form button'
    ];
    let submitBtn = null;
    for (const sel of submitSelectors) {
      const found = document.querySelectorAll(sel);
      for (const btn of found) {
        const text = (btn.textContent || btn.value || '').toLowerCase();
        if (matchesAny(text, ['send', 'submit', 'message', 'contact', 'post', 'get in touch'])) {
          submitBtn = btn;
          break;
        }
      }
      if (submitBtn) break;
    }

    if (!submitBtn) {
      submitBtn = document.querySelector('button[type="submit"], input[type="submit"]');
    }

    if (submitBtn) {
      submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Apply subtle highlight ring
      submitBtn.style.outline = '3px solid #6366f1';
      submitBtn.style.outlineOffset = '2px';
      setTimeout(() => { submitBtn.style.outline = ''; }, 3000);
    }

    return {
      status: 'success',
      filled: filledFields,
      hasSubmitBtn: !!submitBtn
    };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
})();`;
}

export interface StoreContactRoutes {
  shopifyPagesContact: string;
  contactUs: string;
  contact: string;
  googleSearch: string;
}

/**
 * Returns the exact direct contact routes and fallback search URL for any store domain
 */
export function getStoreContactRoutes(domain: string): StoreContactRoutes {
  const cleanDom = domain
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./i, '')
    .trim();

  return {
    shopifyPagesContact: `https://${cleanDom}/pages/contact`,
    contactUs: `https://${cleanDom}/contact-us`,
    contact: `https://${cleanDom}/contact`,
    googleSearch: `https://www.google.com/search?q=site:${cleanDom}+contact`,
  };
}

/**
 * Generates an ultra-reliable JavaScript Bookmarklet packed with the user's
 * configured contact details and template interpolation engine.
 * Clicking this bookmarklet while viewing ANY store's contact page automatically
 * finds and fills inputs and dispatches reactive events.
 */
export function generateAutoFillBookmarklet(profile: SenderProfile): string {
  const safeProfile = {
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    subject: profile.subject || '',
    template: profile.messageTemplate || '',
  };

  const payload = JSON.stringify(safeProfile);

  return `javascript:(function(){try{var d=document,w=window;var dom=w.location.hostname.replace(/^www\\./,'');var b=dom.replace(/\\.myshopify\\.com$/i,'').replace(/\\.[a-z]{2,8}$/i,'');var sn=b.replace(/[-_.]/g,' ').replace(/\\b\\w/g,function(l){return l.toUpperCase();})||'Store';var p=${payload};var subj=p.subject.replace(/{store_name}/gi,sn).replace(/{domain}/gi,dom);var msg=p.template.replace(/{store_name}/gi,sn).replace(/{domain}/gi,dom).replace(/{full_name}/gi,p.fullName).replace(/{email}/gi,p.email).replace(/{phone}/gi,p.phone);function f(el,v){if(!el||!v)return;el.focus();el.value=v;el.setAttribute('value',v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.blur();}function has(s,a){if(!s)return false;s=s.toLowerCase();return a.some(function(k){return s.indexOf(k)!==-1;});}var ins=Array.from(d.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),textarea'));var n=0;var ne=ins.find(function(e){var t=(e.type||'').toLowerCase();if(t==='email'||t==='tel'||t==='password')return false;return has(e.name,['name','full_name','your-name'])||has(e.id,['name'])||has(e.placeholder,['name']);});if(ne&&p.fullName){f(ne,p.fullName);n++;}var ee=ins.find(function(e){return(e.type||'').toLowerCase()==='email'||has(e.name,['email'])||has(e.id,['email'])||has(e.placeholder,['email']);});if(ee&&p.email){f(ee,p.email);n++;}var pe=ins.find(function(e){return(e.type||'').toLowerCase()==='tel'||has(e.name,['phone','tel'])||has(e.id,['phone'])||has(e.placeholder,['phone']);});if(pe&&p.phone){f(pe,p.phone);n++;}var se=ins.find(function(e){var t=(e.type||'').toLowerCase();if(t==='email'||t==='tel')return false;return has(e.name,['subject','topic'])||has(e.id,['subject'])||has(e.placeholder,['subject']);});if(se&&subj){f(se,subj);n++;}var me=ins.find(function(e){return e.tagName.toLowerCase()==='textarea'||has(e.name,['body','message','comment'])||has(e.id,['message'])||has(e.placeholder,['message']);});if(me&&msg){f(me,msg);n++;}var btn=d.querySelector('button[type="submit"],input[type="submit"],.contact-form button,form button');if(btn){btn.scrollIntoView({behavior:'smooth',block:'center'});btn.style.outline='4px solid #6366f1';btn.style.boxShadow='0 0 25px rgba(99,102,241,0.6)';}var box=d.createElement('div');box.innerHTML='&#9889; <b>StoreScout:</b> Auto-filled '+n+' fields for '+sn+'!';box.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#09090b;color:#a5b4fc;border:2px solid #6366f1;padding:12px 24px;border-radius:14px;font-family:sans-serif;font-size:14px;z-index:9999999;box-shadow:0 12px 30px rgba(0,0,0,0.8);';d.body.appendChild(box);setTimeout(function(){if(box.parentNode)box.parentNode.removeChild(box);},3500);}catch(err){alert('StoreScout Error: '+err.message);}})();`;
}

