// ====== 設定 ======
const DEFAULT_LANG = 'ja';

// 現在の言語
function getLang() {
  return localStorage.getItem('lang') || DEFAULT_LANG;
}
// 言語変更（保存＋即時反映）
function setLang(code) {
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  // 他ページの取りこぼしを防ぐため、軽くリロード
  location.reload();
}

// ====== i18n ローダ & 反映 ======
async function loadDict(lang) {
  // 失敗時は既定言語にフォールバック
  const tryList = [lang, DEFAULT_LANG];
  for (const code of tryList) {
    try {
      const res = await fetch(`i18n/${code}.json?v=8`, { cache: 'no-store' });
      if (!res.ok) continue;
      return await res.json();
    } catch (_) {}
  }
  return {};
}

function applyI18n(dict) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] != null) el.setAttribute('aria-label', dict[key]);
  });
}

// ====== 設定ページ：言語ラジオ ======
function bindLangRadios() {
  const radios = document.querySelectorAll('input[name="lang"]');
  if (!radios.length) return;
  const cur = getLang();
  radios.forEach(r => {
    if (r.value === cur) r.checked = true;
    r.addEventListener('change', () => setLang(r.value));
  });
}

// ====== ガイド：音声 ======
let audioEl;
function pickAudioByLang(lang) {
  // audio/ 配下のファイル名に合わせる
  const map = {
    ja: 'audio/ja.mp3',
    en: 'audio/en.mp3',
    'zh-CN': 'audio/zh.mp3',
    'zh-TW': 'audio/zh.mp3',
    ko: 'audio/ko.mp3'
  };
  return map[lang] || map.ja;
}

function bindGuideAudio(dict) {
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  audioEl = document.getElementById('guideAudio');
  if (!audioEl || !btn || !state) return;

  const lang = getLang();
  audioEl.src = pickAudioByLang(lang);
  btn.textContent = dict.play;
  state.textContent = dict.idle;

  btn.onclick = async () => {
    try {
      if (audioEl.paused) {
        await audioEl.play();
        btn.textContent = dict.pause;
        state.textContent = dict.nowPlaying;
      } else {
        audioEl.pause();
        btn.textContent = dict.play;
        state.textContent = dict.idle;
      }
    } catch (e) {
      state.textContent = dict.error || 'Audio not found';
      console.warn(e);
    }
  };
}

// ====== 初期化 ======
document.addEventListener('DOMContentLoaded', async () => {
  const lang = getLang();
  document.documentElement.setAttribute('lang', lang);
  const dict = await loadDict(lang);
  applyI18n(dict);
  bindLangRadios();
  bindGuideAudio(dict);
});
