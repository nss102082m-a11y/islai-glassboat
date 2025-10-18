// app.js — instant i18n, no reload
const DEFAULT_LANG = 'ja';
const I18N_PATH = '/i18n';          // 既に /i18n/*.json ある想定
const AUDIO_PATH = '/audio';        // /audio/{ja,en,zh,ko}.mp3

// 言語の保存・取得
function getLang() {
  return localStorage.getItem('lang') || DEFAULT_LANG;
}
function setLang(code) {
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  applyI18n();              // その場で文言を更新
  applyAudio();             // ガイドの音声も切替
}

// JSON辞書を読み込み（SW回避のため no-store）
async function loadDict(lang) {
  const url = `${I18N_PATH}/${lang}.json?v=6`;
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

// data-i18n / data-i18n-aria を一括適用
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

// 設定ページのラジオをバインド
function bindSettingsRadios() {
  const radios = document.querySelectorAll('input[name="lang"]');
  if (!radios.length) return;
  const cur = getLang();
  radios.forEach(r => {
    r.checked = (r.value === cur);
    r.addEventListener('change', () => setLang(r.value));
  });
}

// ガイド音声：言語に合わせて src を切替
function audioSrcFor(lang) {
  // zh-CN / zh-TW は同じ zh.mp3 を使う想定（必要なら分けられる）
  if (lang.startsWith('zh')) return `${AUDIO_PATH}/zh.mp3`;
  if (lang === 'ko')        return `${AUDIO_PATH}/ko.mp3`;
  if (lang === 'en')        return `${AUDIO_PATH}/en.mp3`;
  return `${AUDIO_PATH}/ja.mp3`;
}

async function applyAudio() {
  const audio = document.getElementById('guideAudio');
  const btn   = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  if (!audio || !btn || !state) return;

  const d = await getDict();
  audio.src = audioSrcFor(getLang());
  state.textContent = d.idle;
  btn.textContent = d.play;
}

function bindGuideControls() {
  const audio = document.getElementById('guideAudio');
  const btn   = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  if (!audio || !btn || !state) return;

  btn.addEventListener('click', async () => {
    const d = await getDict();
    try {
      if (audio.paused) {
        await audio.play();
        btn.textContent = d.pause;
        state.textContent = d.nowPlaying;
      } else {
        audio.pause();
        btn.textContent = d.play;
        state.textContent = d.idle;
      }
    } catch (e) {
      state.textContent = d.error || 'Error';
      console.warn(e);
    }
  });
}

// 初期化：言語属性→辞書適用→UIバインド
document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.setAttribute('lang', getLang());
  await applyI18n();
  bindSettingsRadios();
  await applyAudio();
  bindGuideControls();

  // Service Worker を登録（新SWの反映を早める）
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      // 新しいSWが来たらすぐ切替
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            // 背景で更新、次回アクセスから最新版
          }
        });
      });
    } catch (e) {
      console.warn('SW register failed', e);
    }
  }
});
