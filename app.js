<script>
// ====== i18n 辞書（全部入り） ======
const I18N = {
  ja: {
    brandTag:"The Lighthouse of Language",
    homeTitle:"グラスボート 多言語ガイド（プロトタイプ）",
    homeMsg:"スマホ最適化・多言語・音声ガイドに対応予定。",
    demoBtn:"デモ再生（準備中）",

    guideTitle:"ガイド",
    guideMsg:"ここにコースや音声ガイドの入口を置く想定。",
    play:"再生",
    pause:"一時停止",
    nowPlaying:"再生中…",
    idle:"停止中",
    error:"音声が見つかりません",

    aboutTitle:"About",
    aboutBody:"本アプリは <strong>BLUE CORAL</strong> 提供の ISLAI プロトタイプです。",

    settingsTitle:"設定",
    settingsLang:"言語",
    settingsAudio:"音声：準備中",
    settingsOffline:"オフライン：PWA準備中",

    navHome:"ホーム",
    navGuide:"ガイド",
    navAbout:"About",
    navSettings:"設定"
  },

  en: {
    brandTag:"The Lighthouse of Language",
    homeTitle:"Glassboat Multilingual Guide (Prototype)",
    homeMsg:"Mobile-optimized, multilingual, with audio guide (planned).",
    demoBtn:"Play demo (WIP)",

    guideTitle:"Guide",
    guideMsg:"Entrypoints for courses and audio guides will appear here.",
    play:"Play",
    pause:"Pause",
    nowPlaying:"Now playing…",
    idle:"Idle",
    error:"Audio not found",

    aboutTitle:"About",
    aboutBody:"This app is an ISLAI prototype by <strong>BLUE CORAL</strong>.",

    settingsTitle:"Settings",
    settingsLang:"Language",
    settingsAudio:"Audio: WIP",
    settingsOffline:"Offline: PWA WIP",

    navHome:"Home",
    navGuide:"Guide",
    navAbout:"About",
    navSettings:"Settings"
  },

  "zh-CN": {
    brandTag:"语言的灯塔",
    homeTitle:"玻璃船 多语言导览（原型）",
    homeMsg:"计划支持手机优化、多语言、语音导览。",
    demoBtn:"演示（开发中）",

    guideTitle:"导览",
    guideMsg:"课程与语音导览入口将放在这里。",
    play:"播放",
    pause:"暂停",
    nowPlaying:"播放中…",
    idle:"空闲",
    error:"未找到音频",

    aboutTitle:"关于",
    aboutBody:"本应用为 <strong>BLUE CORAL</strong> 提供的 ISLAI 原型。",

    settingsTitle:"设置",
    settingsLang:"语言",
    settingsAudio:"音频：开发中",
    settingsOffline:"离线：PWA 开发中",

    navHome:"首页",
    navGuide:"导览",
    navAbout:"关于",
    navSettings:"设置"
  },

  "zh-TW": {
    brandTag:"語言的燈塔",
    homeTitle:"玻璃船 多語導覽（原型）",
    homeMsg:"預計支援手機最佳化、多語、語音導覽。",
    demoBtn:"示範（開發中）",

    guideTitle:"導覽",
    guideMsg:"這裡會放課程與語音導覽入口。",
    play:"播放",
    pause:"暫停",
    nowPlaying:"播放中…",
    idle:"閒置",
    error:"找不到音訊",

    aboutTitle:"About",
    aboutBody:"本應用為 <strong>BLUE CORAL</strong> 提供之 ISLAI 原型。",

    settingsTitle:"設定",
    settingsLang:"語言",
    settingsAudio:"音訊：開發中",
    settingsOffline:"離線：PWA 開發中",

    navHome:"首頁",
    navGuide:"導覽",
    navAbout:"關於",
    navSettings:"設定"
  },

  ko: {
    brandTag:"언어의 등대",
    homeTitle:"글라스보트 다국어 가이드(프로토타입)",
    homeMsg:"모바일 최적화·다국어·음성 가이드 예정.",
    demoBtn:"데모 재생(준비 중)",

    guideTitle:"가이드",
    guideMsg:"코스·음성 가이드 진입점을 여기에 둘 예정입니다.",
    play:"재생",
    pause:"일시정지",
    nowPlaying:"재생 중…",
    idle:"대기",
    error:"오디오를 찾을 수 없음",

    aboutTitle:"About",
    aboutBody:"본 앱은 <strong>BLUE CORAL</strong>이 제공하는 ISLAI 프로토타입입니다.",

    settingsTitle:"설정",
    settingsLang:"언어",
    settingsAudio:"오디오: 준비 중",
    settingsOffline:"오프라인: PWA 준비 중",

    navHome:"홈",
    navGuide:"가이드",
    navAbout:"정보",
    navSettings:"설정"
  }
};

// ====== 言語状態 ======
const DEFAULT_LANG = 'ja';
function getLang(){ return localStorage.getItem('lang') || DEFAULT_LANG; }
function setLang(code){
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  applyI18n();
}

// ====== i18n 適用 ======
function applyI18n(){
  const d = I18N[getLang()] || I18N[DEFAULT_LANG];

  // data-i18n テキスト差し替え
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if (d[k] !== undefined) {
      // p などに HTML を含む翻訳があるため innerHTML を使用
      if (/<\/?[a-z][\s\S]*>/i.test(d[k])) el.innerHTML = d[k];
      else el.textContent = d[k];
    }
  });

  // aria
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    const k = el.getAttribute('data-i18n-aria');
    if (d[k]) el.setAttribute('aria-label', d[k]);
  });
}

// ====== 設定（言語ラジオ） ======
function bindSettings(){
  const radios = document.querySelectorAll('input[name="lang"]');
  if(!radios.length) return;
  const cur = getLang();
  radios.forEach(r=>{
    if(r.value===cur) r.checked=true;
    r.addEventListener('change',()=>setLang(r.value));
  });
}

// ====== ガイド：音声 ======
let audioEl;
function pickAudioByLang(lang){
  // /audio/*.mp3 を参照（用意済み：ja,en,zh,ko）
  const map = { ja:'/audio/ja.mp3', en:'/audio/en.mp3', 'zh-CN':'/audio/zh.mp3', 'zh-TW':'/audio/zh.mp3', ko:'/audio/ko.mp3' };
  return map[lang] || map.ja;
}
function bindGuideAudio(){
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  audioEl = document.getElementById('guideAudio');
  if(!audioEl || !btn || !state) return;

  const d = I18N[getLang()];
  audioEl.src = pickAudioByLang(getLang());
  btn.textContent = d.play;
  state.textContent = d.idle;

  btn.onclick = async ()=>{
    try{
      if(audioEl.paused){
        await audioEl.play();
        btn.textContent = I18N[getLang()].pause;
        state.textContent = I18N[getLang()].nowPlaying;
      }else{
        audioEl.pause();
        btn.textContent = I18N[getLang()].play;
        state.textContent = I18N[getLang()].idle;
      }
    }catch(e){
      state.textContent = I18N[getLang()].error;
      console.warn(e);
    }
  };

  // 設定で言語が変わったら同期
  window.addEventListener('storage', e=>{
    if(e.key==='lang'){
      const L = getLang(), d2 = I18N[L] || I18N[DEFAULT_LANG];
      audioEl.src = pickAudioByLang(L);
      btn.textContent = d2.play;
      state.textContent = d2.idle;
      applyI18n();
    }
  });
}

// ====== 初期化 ======
document.addEventListener('DOMContentLoaded', ()=>{
  document.documentElement.setAttribute('lang', getLang());
  applyI18n();
  bindSettings();
  bindGuideAudio();

  // SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});
</script>
