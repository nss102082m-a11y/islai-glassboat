// app.js – instant i18n (no reload) + audio bind
const DEFAULT_LANG = 'ja';
const I18N_PATH = '/i18n';
const AUDIO_PATH = '/audio';

// ---- language state ----
function getLang() {
  return localStorage.getItem('lang') || DEFAULT_LANG;
}
function setLang(code) {
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  // その場で適用
  applyI18n();
  applyAudio();
}

// ---- i18n dict loader (no-store) ----
async function loadDict(lang) {
  const url = `${I18N_PATH}/${lang}.json?v=12`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('i18n load failed: ' + url);
  return res.json();
}

// memoize per lang
let dictCache = {};
async function getDict() {
  const lang = getLang();
  if (!dictCache[lang]) dictCache[lang] = await loadDict(lang);
  return dictCache[lang];
}

// ---- apply i18n to DOM ----
async function applyI18n() {
  const d = await getDict();
  // textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (k in d) el.textContent = d[k];
  });
  // aria-label
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const k = el.getAttribute('data-i18n-aria');
    if (k in d) el.setAttribute('aria-label', d[k]);
  });
}

// ---- settings radios ----
function bindSettings() {
  const radios = document.querySelectorAll('input[name="lang"]');
  if (!radios.length) return;
  // 反映
  const cur = getLang();
  radios.forEach(r => { r.checked = (r.value === cur); });
  // 変更
  radios.forEach(r => {
    r.addEventListener('change', () => setLang(r.value));
  });
}

// ---- guide audio (optional) ----
function audioSrcByLang(lang) {
  // zh-CN / zh-TW はどちらも zh.mp3 を使う
  if (lang === 'zh-CN' || lang === 'zh-TW') return `${AUDIO_PATH}/zh.mp3`;
  if (lang === 'en') return `${AUDIO_PATH}/en.mp3`;
  if (lang === 'ko') return `${AUDIO_PATH}/ko.mp3`;
  return `${AUDIO_PATH}/ja.mp3`; // default
}
function bindGuideAudio() {
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  const audio = document.getElementById('guideAudio');
  if (!btn || !state || !audio) return;

  function setUIPlaying(isPlaying, d) {
    btn.textContent = isPlaying ? d.pause : d.play;
    state.textContent = isPlaying ? d.nowPlaying : d.idle;
  }

  async function refreshByLang() {
    const d = await getDict();
    audio.src = audioSrcByLang(getLang());
    setUIPlaying(false, d);
  }

  btn.onclick = async () => {
    const d = await getDict();
    try {
      if (audio.paused) {
        await audio.play();
        setUIPlaying(true, d);
      } else {
        audio.pause();
        setUIPlaying(false, d);
      }
    } catch (e) {
      state.textContent = d.error || 'Audio not found';
      console.warn(e);
    }
  };

  refreshByLang();
}

// ---- init ----
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('lang', getLang());
  bindSettings();
  bindGuideAudio();
  applyI18n();
});
