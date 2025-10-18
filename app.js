// app.js — instant i18n, no reload

// ====== 設定 ======
const VERSION      = '11';          // キャッシュ回避用のバージョン（数字だけ上げればOK）
const DEFAULT_LANG = 'ja';
const I18N_PATH    = '/i18n';
const AUDIO_PATH   = '/audio';

// ====== 言語保存・取得 ======
function getLang() {
  return localStorage.getItem('lang') || DEFAULT_LANG;
}
function setLang(code) {
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  // その場で反映
  applyI18n();
  applyAudio();
}

// ====== i18n JSON 読み込み（no-store で常に最新） ======
async function loadDict(lang) {
  const url = `${I18N_PATH}/${lang}.json?v=${VERSION}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`i18n load failed: ${lang}`);
  return res.json();
}

// ====== 辞書キャッシュ（メモリ） ======
let dictCache = {};
async function getDict() {
  const lang = getLang();
  if (!dictCache[lang]) dictCache[lang] = await loadDict(lang);
  return dictCache[lang];
}

// ====== i18n 適用 ======
async function applyI18n() {
  try {
    const d = await getDict();

    // data-i18n="key" のテキスト置換
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (d[k] != null) el.textContent = d[k];
    });

    // data-i18n-aria="key" の aria-label 置換（必要あれば）
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const k = el.getAttribute('data-i18n-aria');
      if (d[k] != null) el.setAttribute('aria-label', d[k]);
    });

  } catch (e) {
    console.warn(e);
  }
}

// ====== 設定（言語ラジオ） ======
function bindSettings() {
  const radios = document.querySelectorAll('input[name="lang"]');
  if (!radios.length) return;

  const cur = getLang();
  radios.forEach(r => {
    if (r.value === cur) r.checked = true;
    r.addEventListener('change', () => setLang(r.value));
  });
}

// ====== ガイド：音声ファイル切替 ======
function pickAudioByLang(lang) {
  // 置いてあるファイル名に合わせる（/audio/en.mp3 など）
  const map = {
    ja: 'ja.mp3',
    en: 'en.mp3',
    'zh-CN': 'zh.mp3',
    'zh-TW': 'zh.mp3',
    ko: 'ko.mp3'
  };
  return `${AUDIO_PATH}/${map[lang] || map.ja}`;
}

function bindGuideAudio() {
  const btn   = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  const audio = document.getElementById('guideAudio');
  if (!btn || !state || !audio) return;

  const setIdle = async () => {
    const d = await getDict();
    btn.textContent   = d.play;
    state.textContent = d.idle;
  };

  // 初期ソースと言語文言
  const initAudio = async () => {
    const lang = getLang();
    audio.src = pickAudioByLang(lang) + `?v=${VERSION}`;
    await setIdle();
  };

  btn.onclick = async () => {
    const d = await getDict();
    try {
      if (audio.paused) {
        await audio.play();
        btn.textContent   = d.pause;
        state.textContent = d.nowPlaying;
      } else {
        audio.pause();
        await setIdle();
      }
    } catch (e) {
      state.textContent = d.error || 'Error';
      console.warn(e);
    }
  };

  initAudio();
}

// 言語が他タブで変わったときも反映
window.addEventListener('storage', (e) => {
  if (e.key === 'lang') {
    document.documentElement.setAttribute('lang', getLang());
    applyI18n();
    applyAudio();
  }
});

function applyAudio() {
  // ガイドページにだけ要素があるので、安全に再初期化
  const audio = document.getElementById('guideAudio');
  if (!audio) return;
  // ソースと表示を更新
  const lang = getLang();
  audio.src = pickAudioByLang(lang) + `?v=${VERSION}`;
  // ボタン・状態ラベルも更新
  getDict().then(d => {
    const btn = document.getElementById('playBtn');
    const st  = document.getElementById('playState');
    if (btn) btn.textContent = d.play;
    if (st)  st.textContent  = d.idle;
  });
}

// ====== 初期化 ======
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('lang', getLang());
  bindSettings();
  bindGuideAudio();
  applyI18n();
});
