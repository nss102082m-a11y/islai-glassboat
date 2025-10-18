// app.js – instant i18n, no reload (relative paths)
const DEFAULT_LANG = 'ja';
const I18N_PATH = 'i18n';    // ← 先頭のスラッシュ無し
const AUDIO_PATH = 'audio';  // ← 同上

// 言語の保存・取得
function getLang() {
  return localStorage.getItem('lang') || DEFAULT_LANG;
}
function setLang(code) {
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  applyI18n();
  applyAudio();
}

// JSON辞書を読み込み（SW回避のため no-store）
async function loadDict(lang) {
  const url = `${I18N_PATH}/${lang}.json?v=8`; // キャッシュバスター
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('i18n load failed: ' + url);
  return res.json();
}

// 現在言語の辞書をメモ化
let dictCache = {};
async function getDict() {
  const lang = getLang();
  if (!dictCache[lang]) {
    dictCache[lang] = await loadDict(lang);
  }
  return dictCache[lang];
}

// data-i18n / data-i18n-aria に適用
async function applyI18n() {
  const d = await getDict();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (d[k] != null) el.textContent = d[k];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const k = el.getAttribute('data-i18n-aria');
    if (d[k] != null) el.setAttribute('aria-label', d[k]);
  });
}

// 設定ページの言語ラジオ
function bindSettings() {
  const radios = document.querySelectorAll('input[name="lang"]');
  if (!radios.length) return;
  const cur = getLang();
  radios.forEach(r => {
    if (r.value === cur) r.checked = true;
    r.addEventListener('change', () => setLang(r.value));
  });
}

// ガイドの音声
function pickAudioByLang(lang) {
  const map = { ja:'ja.mp3', en:'en.mp3', 'zh-CN':'zh.mp3', 'zh-TW':'zh.mp3', ko:'ko.mp3' };
  return map[lang] || map.ja;
}
async function applyAudio() {
  const audioEl = document.getElementById('guideAudio');
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  if (!audioEl || !btn || !state) return;

  const lang = getLang();
  const d = await getDict();

  audioEl.src = `${AUDIO_PATH}/${pickAudioByLang(lang)}?v=8`;
  btn.textContent = d.play;
  state.textContent = d.idle;
}
function bindGuideAudio() {
  const audioEl = document.getElementById('guideAudio');
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  if (!audioEl || !btn || !state) return;

  btn.onclick = async () => {
    try {
      const d = await getDict();
      if (audioEl.paused) {
        await audioEl.play();
        btn.textContent = d.pause;
        state.textContent = d.nowPlaying;
      } else {
        audioEl.pause();
        btn.textContent = d.play;
        state.textContent = d.idle;
      }
    } catch (e) {
      console.warn(e);
      const d = await getDict();
      state.textContent = d.error || 'Error';
    }
  };
}

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.setAttribute('lang', getLang());
  await applyI18n();
  bindSettings();
  bindGuideAudio();
});

// Service Worker 登録（任意：あれば）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js?v=8'); // 相対 + バージョン
  });
}
