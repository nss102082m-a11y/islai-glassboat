<!-- app.js（全置き換え） -->
<script>
// ====== 設定 ======
const DEFAULT_LANG = 'ja';
const I18N_PATH   = (lang) => `./i18n/${lang}.json`;

// メモリ上の辞書キャッシュ
let DICT = null;

// ====== 言語状態 ======
function getLang() {
  return localStorage.getItem('lang') || DEFAULT_LANG;
}
function setLang(code) {
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  // 言語変更時にUIと音声UIを再構成
  applyI18n();
  refreshAudioUI();
}

// ====== i18n 読み込み & 適用 ======
async function loadDict(lang = getLang()) {
  // zh 系の揺れをファイル名に合わせて吸収
  const fileLang = (lang === 'zh-CN' || lang === 'zh-TW') ? 'zh-CN' : lang;
  const res = await fetch(I18N_PATH(fileLang), { cache: 'no-store' });
  if (!res.ok) throw new Error('i18n fetch failed: ' + res.status);
  return await res.json();
}

async function applyI18n() {
  try {
    DICT = await loadDict(getLang());
  } catch (e) {
    console.warn(e);
    // 最低限のフォールバック
    DICT = { settingsTitle:'設定', settingsLang:'言語', settingsAudio:'音声: 準備中', settingsOffline:'オフライン:PWA準備中' };
  }

  // data-i18n を反映
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key in DICT) el.textContent = DICT[key];
  });

  // ARIA 用
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (key in DICT) el.setAttribute('aria-label', DICT[key]);
  });
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

// ====== 音声ファイル選択（言語→パス） ======
function pickAudioByLang(lang = getLang()) {
  // zh 系は 1 本化（zh.mp3）
  const normalized =
    (lang === 'zh-CN' || lang === 'zh-TW') ? 'zh' :
    (lang === 'en' || lang === 'ja' || lang === 'ko') ? lang :
    'ja';
  return `./audio/${normalized}.mp3`;
}

// ====== ガイド画面の再生UI ======
let guideAudio;      // <audio id="guideAudio">
let guideBtn;        // <button id="playBtn">
let guideState;      // <span id="playState">

function bindGuideAudio() {
  guideAudio = document.getElementById('guideAudio');
  guideBtn   = document.getElementById('playBtn');
  guideState = document.getElementById('playState');

  if (!guideAudio || !guideBtn || !guideState) return;

  // 初期状態反映
  refreshAudioUI();

  guideBtn.onclick = async () => {
    try {
      if (guideAudio.paused) {
        await guideAudio.play();
        guideBtn.textContent   = (DICT?.pause)      || 'Pause';
        guideState.textContent = (DICT?.nowPlaying) || 'Now playing…';
      } else {
        guideAudio.pause();
        guideBtn.textContent   = (DICT?.play) || 'Play';
        guideState.textContent = (DICT?.idle) || 'Idle';
      }
    } catch (err) {
      console.warn(err);
      guideState.textContent = (DICT?.error) || 'Audio not found';
    }
  };
}

// 言語変更や初期化時に呼ぶ
function refreshAudioUI() {
  if (!guideAudio || !guideBtn || !guideState) return;
  guideAudio.src = pickAudioByLang();
  guideBtn.textContent   = (DICT?.play) || 'Play';
  guideState.textContent = (DICT?.idle) || 'Idle';
}

// ====== ホームの「デモ再生」ボタンにも再生を紐づけ ======
function bindHomeDemoPlay() {
  const demoBtn =
    document.getElementById('demoBtn') ||
    document.querySelector('[data-i18n="demoBtn"]');
  if (!demoBtn) return;

  demoBtn.addEventListener('click', async () => {
    try {
      const a = new Audio(pickAudioByLang());
      await a.play();
    } catch (e) {
      console.warn('demo play error', e);
      // 画面に状態表示が無いページなので alert は控えてログのみ
    }
  });
}

// ====== 他タブでの言語変更を反映 ======
window.addEventListener('storage', (e) => {
  if (e.key === 'lang') {
    document.documentElement.setAttribute('lang', getLang());
    applyI18n().then(refreshAudioUI).catch(console.warn);
  }
});

// ====== 初期化 ======
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('lang', getLang());
  applyI18n().then(() => {
    bindSettings();
    bindGuideAudio();
    bindHomeDemoPlay();
  }).catch(err => {
    console.warn(err);
    bindSettings();
    bindGuideAudio();
    bindHomeDemoPlay();
  });
});
</script>
