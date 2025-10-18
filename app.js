// app.js v15 — instant i18n + BFCache-safe

const DEFAULT_LANG = 'ja';
const I18N_PATH = '/islai-glassboat/i18n';     // ← GitHub Pages のサブパスに合わせる
const AUDIO_PATH = '/islai-glassboat/audio';

function getLang() { return localStorage.getItem('lang') || DEFAULT_LANG; }
function setLang(code) {
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  applyI18n();
  applyAudio();
}

// ---- JSON辞書の取得（no-store で常に最新）
async function loadDict(lang) {
  const url = `${I18N_PATH}/${lang}.json?v=15`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('i18n load failed: ' + url);
  return res.json();
}

let dictCache = {};
async function getDict() {
  const lang = getLang();
  if (!dictCache[lang]) dictCache[lang] = await loadDict(lang);
  return dictCache[lang];
}

// ---- i18n適用
async function applyI18n() {
  try {
    const d = await getDict();
    // テキスト
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (d[k] != null) el.textContent = d[k];
    });
    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const k = el.getAttribute('data-i18n-aria');
      if (d[k] != null) el.setAttribute('aria-label', d[k]);
    });
  } catch (e) { console.warn(e); }
}

// ---- 設定ラジオ
function bindSettings() {
  const radios = document.querySelectorAll('input[name="lang"]');
  if (!radios.length) return;
  const cur = getLang();
  radios.forEach(r => {
    r.checked = (r.value === cur);
    r.addEventListener('change', () => setLang(r.value), { passive: true });
  });
}

// ---- ガイド音声
function audioByLang(lang) {
  const map = { ja: 'ja.mp3', en: 'en.mp3', 'zh-CN': 'zh.mp3', 'zh-TW': 'zh.mp3', ko: 'ko.mp3' };
  return `${AUDIO_PATH}/${map[lang] || 'ja.mp3'}`;
}
function applyAudio() {
  const a = document.getElementById('guideAudio');
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  if (!a || !btn || !state) return;

  const lang = getLang();
  a.src = audioByLang(lang);
  getDict().then(d => {
    btn.textContent = d.play;
    state.textContent = d.idle;
  }).catch(()=>{});

  btn.onclick = async () => {
    const d = await getDict();
    try {
      if (a.paused) {
        await a.play();
        btn.textContent = d.pause;
        state.textContent = d.nowPlaying;
      } else {
        a.pause();
        btn.textContent = d.play;
        state.textContent = d.idle;
      }
    } catch (e) {
      state.textContent = d.error || 'Audio not found';
      console.warn(e);
    }
  };
}

// ---- 初期化（あらゆる入り口で確実に走らせる）
function init() {
  document.documentElement.setAttribute('lang', getLang());
  applyI18n();
  bindSettings();
  applyAudio();
}

// 1) すでに読み込み済みなら即実行
if (document.readyState !== 'loading') init();
// 2) 通常ロード
document.addEventListener('DOMContentLoaded', init);
// 3) BFCache 復元
window.addEventListener('pageshow', init);
