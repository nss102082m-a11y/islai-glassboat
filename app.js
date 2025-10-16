// ====== 言語データ ======
const I18N = {
  ja: { brandTag:"The Lighthouse of Language", homeTitle:"グラスボート 多言語ガイド（プロトタイプ）",
    homeMsg:"スマホ最適化・多言語・音声ガイドに対応予定。", demoBtn:"デモ再生（準備中）",
    guideTitle:"ガイド", guideMsg:"ここにコースや音声ガイドの入口を置く想定。",
    aboutTitle:"About", aboutMsg:"本アプリは BLUE CORAL 提供の ISLAI プロトタイプです。",
    settingsTitle:"設定", settingsLang:"言語", settingsAudio:"音声：準備中",
    settingsOffline:"オフライン：PWA準備中", play:"再生", pause:"一時停止",
    nowPlaying:"再生中…", idle:"停止中" },
  en: { brandTag:"The Lighthouse of Language", homeTitle:"Glassboat Multilingual Guide (Prototype)",
    homeMsg:"Mobile-optimized, multilingual, with audio guide (planned).", demoBtn:"Play demo (WIP)",
    guideTitle:"Guide", guideMsg:"Entrypoints for courses and audio guides will appear here.",
    aboutTitle:"About", aboutMsg:"This app is an ISLAI prototype by BLUE CORAL.",
    settingsTitle:"Settings", settingsLang:"Language", settingsAudio:"Audio: WIP",
    settingsOffline:"Offline: PWA WIP", play:"Play", pause:"Pause",
    nowPlaying:"Now playing…", idle:"Idle" },
  "zh-CN": { brandTag:"语言的灯塔", homeTitle:"玻璃船 多语言导览（原型）",
    homeMsg:"计划支持手机优化、多语言、语音导览。", demoBtn:"演示（开发中）",
    guideTitle:"导览", guideMsg:"课程与语音导览入口将放在这里。", aboutTitle:"关于",
    aboutMsg:"本应用为 BLUE CORAL 提供的 ISLAI 原型。", settingsTitle:"设置",
    settingsLang:"语言", settingsAudio:"音频：开发中", settingsOffline:"离线：PWA 开发中",
    play:"播放", pause:"暂停", nowPlaying:"播放中…", idle:"空闲" },
  "zh-TW": { brandTag:"語言的燈塔", homeTitle:"玻璃船 多語導覽（原型）",
    homeMsg:"預計支援手機最佳化、多語、語音導覽。", demoBtn:"示範（開發中）",
    guideTitle:"導覽", guideMsg:"這裡會放課程與語音導覽入口。", aboutTitle:"About",
    aboutMsg:"本應用為 BLUE CORAL 提供之 ISLAI 原型。", settingsTitle:"設定",
    settingsLang:"語言", settingsAudio:"音訊：開發中", settingsOffline:"離線：PWA 開發中",
    play:"播放", pause:"暫停", nowPlaying:"播放中…", idle:"閒置" },
  ko: { brandTag:"언어의 등대", homeTitle:"글라스보트 다국어 가이드(프로토타입)",
    homeMsg:"모바일 최적화·다국어·음성 가이드 예정.", demoBtn:"데모 재생(준비 중)",
    guideTitle:"가이드", guideMsg:"코스·음성 가이드 진입점을 여기에 둘 예정입니다.",
    aboutTitle:"About", aboutMsg:"본 앱은 BLUE CORAL이 제공하는 ISLAI 프로토타입입니다.",
    settingsTitle:"설정", settingsLang:"언어", settingsAudio:"오디오: 준비 중",
    settingsOffline:"오프라인: PWA 준비 중", play:"재생", pause:"일시정지",
    nowPlaying:"재생 중…", idle:"대기" }
};

// ====== ユーザーの言語状態 ======
const DEFAULT_LANG = 'ja';
function getLang(){ return localStorage.getItem('lang') || DEFAULT_LANG; }
function setLang(code){
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  applyI18n();
}

// ====== 文言反映（data-i18n / data-i18n-aria）======
function applyI18n(){
  const lang = getLang();
  const dict = I18N[lang] || I18N[DEFAULT_LANG];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key]) el.setAttribute('aria-label', dict[key]);
  });
}

// ====== 設定ページ：言語ラジオ ======
function bindSettings(){
  const radios = document.querySelectorAll('input[name="lang"]');
  if (!radios.length) return;
  const current = getLang();
  radios.forEach(r=>{
    if (r.value === current) r.checked = true;
    r.addEventListener('change', ()=> setLang(r.value));
  });
}

// ====== 言語別音声ファイル（※コロン付きファイル名に合わせる）======
function pickAudioByLang(lang){
  const map = {
    ja: 'audio:ja.mp3',
    en: 'audio:en.mp3',
    'zh-CN': 'audio:zh.mp3',
    'zh-TW': 'audio:zh.mp3',   // ひとまず簡体/繁体どちらも共通
    ko: 'audio:ja.mp3'         // まだ無ければ暫定で日本語
  };
  return map[lang] || map.ja;
}

// ====== ガイド：再生ボタン連携 ======
let audioEl;
function bindGuideAudio(){
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  audioEl = document.getElementById('guideAudio');
  if (!audioEl || !btn) return;

  const applyTexts = ()=>{
    const d = I18N[getLang()] || I18N[DEFAULT_LANG];
    btn.textContent = audioEl.paused ? d.play : d.pause;
    state.textContent = audioEl.paused ? d.idle : d.nowPlaying;
  };

  audioEl.src = pickAudioByLang(getLang());
  applyTexts();

  btn.onclick = ()=>{
    if (audioEl.paused){
      audioEl.play().then(applyTexts).catch(console.warn);
    }else{
      audioEl.pause();
      applyTexts();
    }
  };

  // 言語切り替えに追従（別ページでlocalStorageを変えた場合も想定）
  window.addEventListener('storage', (e)=>{
    if (e.key === 'lang'){
      audioEl.src = pickAudioByLang(getLang());
      applyI18n();
      applyTexts();
    }
  });
}

// ====== 初期化 ======
document.addEventListener('DOMContentLoaded', ()=>{
  document.documentElement.setAttribute('lang', getLang());
  applyI18n();
  bindSettings();
  bindGuideAudio();
});
