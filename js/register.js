/**
 * ZAZISE sample registration — first name, surname, email, password, confirm, reCAPTCHA.
 * Demo only. Never logs plaintext passwords.
 */
(function () {
  'use strict';

  var MIN_LEN = 12;
  var MAX_LEN = 128;
  var TOAST_MARK = 'assets/zazise-toast-mark.png';
  var COMMON_PASSWORDS = [
    'password123',
    'password1234',
    '123456789012',
    '1234567890123',
    'qwertyuiopas',
    'qwertyuiopasd',
    'letmein12345',
    'welcome12345',
    'adminpassword',
    'iloveyou1234',
    'changeme1234',
    'passwordpassword',
  ];

  function t(key) {
    return (window.ZaziseI18n && window.ZaziseI18n.t) ? window.ZaziseI18n.t(key) : key;
  }

  function toast(message, kind) {
    var host = document.getElementById('toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast-host';
      host.className = 'toast-host';
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'toast toast--' + (kind || 'error');
    el.setAttribute('role', 'alert');

    if ((kind || 'error') === 'error') {
      var mark = document.createElement('img');
      mark.className = 'toast__mark';
      mark.src = TOAST_MARK;
      mark.alt = '';
      mark.setAttribute('aria-hidden', 'true');
      mark.width = 28;
      mark.height = 28;
      el.appendChild(mark);
    }

    var msg = document.createElement('span');
    msg.className = 'toast__msg';
    msg.textContent = message;
    el.appendChild(msg);

    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('toast--show'); });
    setTimeout(function () {
      el.classList.remove('toast--show');
      setTimeout(function () { el.remove(); }, 320);
    }, 4200);
  }

  function ensureFieldErrorEl(field) {
    var err = field.querySelector('.field-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.setAttribute('aria-live', 'polite');
      field.appendChild(err);
    }
    return err;
  }

  function setFieldError(field, message) {
    if (!field) return;
    var err = ensureFieldErrorEl(field);
    if (message) {
      field.classList.add('is-invalid');
      err.textContent = message;
      var input = field.querySelector('input');
      if (input) input.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('is-invalid');
      err.textContent = '';
      var inputClear = field.querySelector('input');
      if (inputClear) inputClear.removeAttribute('aria-invalid');
    }
  }

  function clearAllFieldErrors(form) {
    if (!form) return;
    form.querySelectorAll('.field.is-invalid').forEach(function (f) {
      setFieldError(f, null);
    });
  }

  function isCommonPassword(pw) {
    var lower = String(pw).toLowerCase();
    return COMMON_PASSWORDS.some(function (c) { return lower === c; });
  }

  function equalsIdentity(pw, name, surname, email) {
    var lower = String(pw).toLowerCase();
    var n = String(name || '').trim().toLowerCase();
    var s = String(surname || '').trim().toLowerCase();
    var e = String(email || '').trim().toLowerCase();
    if (n && lower === n) return true;
    if (s && lower === s) return true;
    if (n && s && lower === (n + ' ' + s)) return true;
    if (e && lower === e) return true;
    if (e) {
      var local = e.split('@')[0];
      if (local && lower === local) return true;
    }
    return false;
  }

  /** Strip accents/spaces; return A–Z letters only (uppercase). */
  function lettersOnly(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z]/g, '')
      .toUpperCase();
  }

  /** Initials: first of first + first of surname; else first two of one name; default MZ. */
  function computeInitials(firstName, surname) {
    var a = lettersOnly(firstName);
    var b = lettersOnly(surname);
    if (a && b) return a.charAt(0) + b.charAt(0);
    var one = a || b;
    if (one.length >= 2) return one.slice(0, 2);
    if (one.length === 1) return one + one;
    return 'MZ';
  }

  function savePreviewProfile(firstName, surname) {
    var profile = {
      firstName: String(firstName || '').trim(),
      surname: String(surname || '').trim(),
      initials: computeInitials(firstName, surname),
    };
    try {
      var json = JSON.stringify(profile);
      sessionStorage.setItem('zazisePreviewProfile', json);
      localStorage.setItem('zazisePreviewProfile', json);
    } catch (e) { /* storage blocked — non-fatal */ }
    return profile;
  }

  /** Lightweight hint only — does not block submit if length+denylist pass. */
  function strengthLabel(pw) {
    if (!pw || pw.length < MIN_LEN) return { key: 'pw_strength_weak', cls: 'is-weak' };
    var score = 0;
    if (pw.length >= 14) score += 1;
    if (pw.length >= 16) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    if (score <= 1) return { key: 'pw_strength_weak', cls: 'is-weak' };
    if (score <= 3) return { key: 'pw_strength_fair', cls: 'is-fair' };
    return { key: 'pw_strength_strong', cls: 'is-strong' };
  }

  function fieldFor(el) {
    return el ? el.closest('.field') : null;
  }

  /** Validate one field; returns error message or null. Marks UI. */
  function validateField(name, el, form) {
    var field = fieldFor(el);
    if (!field || !el) return null;
    var val = el.value || '';
    var msg = null;

    if (name === 'name') {
      if (!val.trim()) msg = t('err_name_required');
      else if (val.trim().length < 2) msg = t('err_name_short');
    } else if (name === 'surname') {
      if (!val.trim()) msg = t('err_surname_required');
      else if (val.trim().length < 2) msg = t('err_surname_short');
    } else if (name === 'email') {
      if (!val.trim()) msg = t('err_email_required');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) msg = t('err_email_invalid');
    } else if (name === 'password') {
      if (!val) msg = t('err_password_required');
      else if (val.length < MIN_LEN) msg = t('err_password_short');
      else if (val.length > MAX_LEN) msg = t('err_password_long');
      else {
        var nameVal = form.querySelector('#register-name');
        var surnameVal = form.querySelector('#register-surname');
        var emailVal = form.querySelector('#register-email');
        if (equalsIdentity(val, nameVal && nameVal.value, surnameVal && surnameVal.value, emailVal && emailVal.value)) {
          msg = t('err_password_identity');
        } else if (isCommonPassword(val)) {
          msg = t('err_password_common');
        }
      }
    } else if (name === 'passwordConfirm') {
      var pwEl = form.querySelector('#register-password');
      var pw = pwEl ? pwEl.value : '';
      if (!val) msg = t('err_password_required');
      else if (val !== pw) msg = t('err_password_mismatch');
    } else if (name === 'recaptcha') {
      if (!getRecaptchaToken()) msg = t('err_recaptcha_required');
    }

    setFieldError(field, msg);
    return msg;
  }

  /**
   * Client validate + mark fields. Returns first toast message (or null if ok).
   */
  function clientValidateAndMark(form, name, surname, email, password, passwordConfirm, recaptchaToken, honeypot) {
    clearAllFieldErrors(form);

    if (honeypot && String(honeypot).trim()) {
      return t('err_recaptcha_required');
    }

    var nameEl = form.querySelector('#register-name');
    var surnameEl = form.querySelector('#register-surname');
    var emailEl = form.querySelector('#register-email');
    var pwEl = form.querySelector('#register-password');
    var pwConfirmEl = form.querySelector('#register-password-confirm');
    var recaptchaField = form.querySelector('.field--recaptcha');

    var first = null;
    function note(msg) {
      if (msg && !first) first = msg;
      return msg;
    }

    note(validateField('name', nameEl, form));
    note(validateField('surname', surnameEl, form));
    note(validateField('email', emailEl, form));
    note(validateField('password', pwEl, form));
    note(validateField('passwordConfirm', pwConfirmEl, form));

    if (!recaptchaToken) {
      if (recaptchaField) setFieldError(recaptchaField, t('err_recaptcha_required'));
      note(t('err_recaptcha_required'));
    } else if (recaptchaField) {
      setFieldError(recaptchaField, null);
    }

    return first;
  }

  function mapServerError(payload) {
    var code = payload && payload.errors && payload.errors[0] && payload.errors[0].code;
    var map = {
      name_required: 'err_name_required',
      name_short: 'err_name_short',
      surname_required: 'err_surname_required',
      surname_short: 'err_surname_short',
      email_required: 'err_email_required',
      email_invalid: 'err_email_invalid',
      password_required: 'err_password_required',
      password_short: 'err_password_short',
      password_long: 'err_password_long',
      password_mismatch: 'err_password_mismatch',
      password_identity: 'err_password_identity',
      password_common: 'err_password_common',
      recaptcha_required: 'err_recaptcha_required',
      recaptcha_failed: 'err_recaptcha_failed',
      human_required: 'err_recaptcha_required',
      email_taken: 'err_email_taken',
      server_error: 'err_server',
    };
    if (code && map[code]) return t(map[code]);
    if (payload && payload.error) return payload.error;
    return t('err_server');
  }

  function mapServerField(code) {
    var map = {
      name_required: 'name',
      name_short: 'name',
      surname_required: 'surname',
      surname_short: 'surname',
      email_required: 'email',
      email_invalid: 'email',
      email_taken: 'email',
      password_required: 'password',
      password_short: 'password',
      password_long: 'password',
      password_identity: 'password',
      password_common: 'password',
      password_mismatch: 'passwordConfirm',
      recaptcha_required: 'recaptcha',
      recaptcha_failed: 'recaptcha',
      human_required: 'recaptcha',
    };
    return map[code] || null;
  }

  function getRecaptchaToken() {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse) {
      return grecaptcha.getResponse() || '';
    }
    var el = document.querySelector('[name="g-recaptcha-response"]');
    return el ? (el.value || '') : '';
  }

  function resetRecaptcha() {
    try {
      if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) grecaptcha.reset();
    } catch (e) { /* ignore */ }
  }

  function wirePasswordToggles(root) {
    var buttons = (root || document).querySelectorAll('[data-pw-toggle]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-pw-toggle');
        var input = document.getElementById(id);
        if (!input) return;
        var showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        var showLabel = btn.querySelector('.pw-toggle__show');
        var hideLabel = btn.querySelector('.pw-toggle__hide');
        if (showLabel) showLabel.hidden = !showing;
        if (hideLabel) hideLabel.hidden = showing;
        btn.setAttribute('aria-label', showing ? t('btn_show_password') : t('btn_hide_password'));
        btn.setAttribute('aria-pressed', showing ? 'false' : 'true');
      });
    });
  }

  function wireStrengthHint() {
    var input = document.getElementById('register-password');
    var hint = document.getElementById('pw-strength');
    if (!input || !hint) return;
    function update() {
      var pw = input.value || '';
      if (!pw) {
        hint.hidden = true;
        hint.textContent = '';
        hint.className = 'pw-strength';
        return;
      }
      var s = strengthLabel(pw);
      hint.hidden = false;
      hint.className = 'pw-strength ' + s.cls;
      hint.textContent = t(s.key);
    }
    input.addEventListener('input', update);
    update();
  }

  function wireFieldValidation(form) {
    var pairs = [
      ['#register-name', 'name'],
      ['#register-surname', 'surname'],
      ['#register-email', 'email'],
      ['#register-password', 'password'],
      ['#register-password-confirm', 'passwordConfirm'],
    ];
    pairs.forEach(function (pair) {
      var el = form.querySelector(pair[0]);
      if (!el) return;
      el.addEventListener('blur', function () {
        validateField(pair[1], el, form);
      });
      el.addEventListener('input', function () {
        var field = fieldFor(el);
        if (field && field.classList.contains('is-invalid')) {
          validateField(pair[1], el, form);
        }
      });
    });
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var nameEl = form.querySelector('#register-name');
    var surnameEl = form.querySelector('#register-surname');
    var emailEl = form.querySelector('#register-email');
    var pwEl = form.querySelector('#register-password');
    var pwConfirmEl = form.querySelector('#register-password-confirm');
    var hpEl = form.querySelector('#register-website');
    var btn = form.querySelector('[data-submit]');
    var name = nameEl ? nameEl.value : '';
    var surname = surnameEl ? surnameEl.value : '';
    var email = emailEl ? emailEl.value : '';
    var password = pwEl ? pwEl.value : '';
    var passwordConfirm = pwConfirmEl ? pwConfirmEl.value : '';
    var honeypot = hpEl ? hpEl.value : '';
    var recaptchaToken = getRecaptchaToken();

    var localErr = clientValidateAndMark(
      form, name, surname, email, password, passwordConfirm, recaptchaToken, honeypot
    );
    if (localErr) {
      toast(localErr, 'error');
      var firstInvalid = form.querySelector('.field.is-invalid input, .field.is-invalid');
      if (firstInvalid && firstInvalid.focus) {
        try { firstInvalid.focus(); } catch (e) { /* ignore */ }
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.dataset.label = btn.textContent;
      btn.textContent = t('submitting');
    }

    try {
      var payload = {
          name: name.trim(),
          surname: surname.trim(),
          email: email.trim(),
          password: password,
          passwordConfirm: passwordConfirm,
          recaptchaToken: recaptchaToken,
          website: '', // honeypot empty for humans
        };
      // Prefer Node demo API; fall back to PHP on Afrihost static hosting
      var endpoints = ['/api/register', 'api/register.php', '/api/register.php'];
      var res = null;
      var lastErr = null;
      for (var i = 0; i < endpoints.length; i++) {
        try {
          res = await fetch(endpoints[i], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
          });
          // If host returns HTML 404 for missing Node route, try next
          var ct = (res.headers.get('content-type') || '').toLowerCase();
          if (res.status === 404 || (ct.indexOf('json') < 0 && res.status >= 400)) {
            lastErr = res;
            res = null;
            continue;
          }
          break;
        } catch (e) {
          lastErr = e;
          res = null;
        }
      }
      if (!res) {
        throw lastErr || new Error('register endpoint unavailable');
      }
      var data = null;
      try { data = await res.json(); } catch (e) { data = null; }

      if (!res.ok || !data || !data.ok) {
        var msg = mapServerError(data || {});
        toast(msg, 'error');
        var code = data && data.errors && data.errors[0] && data.errors[0].code;
        var which = mapServerField(code);
        if (which === 'name') validateField('name', nameEl, form) || setFieldError(fieldFor(nameEl), msg);
        else if (which === 'surname') validateField('surname', surnameEl, form) || setFieldError(fieldFor(surnameEl), msg);
        else if (which === 'email') setFieldError(fieldFor(emailEl), msg);
        else if (which === 'password') setFieldError(fieldFor(pwEl), msg);
        else if (which === 'passwordConfirm') setFieldError(fieldFor(pwConfirmEl), msg);
        else if (which === 'recaptcha') setFieldError(form.querySelector('.field--recaptcha'), msg);
        resetRecaptcha();
        return;
      }
      savePreviewProfile(name.trim(), surname.trim());
      try {
        sessionStorage.setItem('zaziseJustRegistered', '1');
      } catch (e) { /* storage blocked — thank-you will fall back to ?registered=1 */ }
      window.location.href = 'thank-you.html?registered=1';
    } catch (err) {
      toast(t('err_network'), 'error');
      resetRecaptcha();
    } finally {
      if (btn) {
        btn.disabled = false;
        if (btn.dataset.label) btn.textContent = btn.dataset.label;
      }
    }
  }

  function init() {
    var form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', onSubmit);
      wireFieldValidation(form);
      // Pre-create error slots under each field for layout stability
      form.querySelectorAll('.field').forEach(function (f) {
        if (!f.classList.contains('hp-trap') && !f.querySelector('.hp-trap')) {
          ensureFieldErrorEl(f);
        }
      });
    }
    wirePasswordToggles(form || document);
    wireStrengthHint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
