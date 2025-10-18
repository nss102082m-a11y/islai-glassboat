// app.js v17 — relative paths (i18n/audio), instant apply, BFCache-safe

const DEFAULT_LANG = 'ja';
const I18N_PATH = 'i18n';    // ← 先頭に / を付けない（相対パス）
const AUDIO_PATH = 'audio';  // ← 同上

function getLang(){ return localStorage.getItem('lang') || DEFAULT_LANG; }
function setLang(code){
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  applyI18n();
  applyAudio();
}

async function loadDict(lang){
  const url = `${I18N_PATH}/${lang}.json?v=17`;
  const res = await fetch(url, { cache:'no-store' });
  if(!res.ok) throw new Error('i18n load failed: '+url);
  return res.json();
}

let dictCache = {};
async function getDict(){
  const lang = getLang();
  if(!dictCache[lang]) dictCache[lang] = await loadDict(lang);
  return dictCache[lang];
}

async function applyI18n(){
  try{
    const d = await getDict();
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      if(d[k] != null) el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
      const k = el.getAttribute('data-i18n-aria');
      if(d[k] != null) el.setAttribute('aria-label', d[k]);
    });
  }catch(e){ console.warn(e); }
}

function bindSettings(){
  const radios = document.querySelectorAll('input[name="lang"]');
  if(!radios.length) return;
  const cur = getLang();
  radios.forEach(r=>{
    r.checked = (r.value === cur);
    r.addEventListener('change', ()=> setLang(r.value), { passive:true });
  });
}

function audioByLang(lang){
  const map = { ja:'ja.mp3', en:'en.mp3', 'zh-CN':'zh.mp3', 'zh-TW':'zh.mp3', ko:'ko.mp3' };
  return `${AUDIO_PATH}/${map[lang] || 'ja.mp3'}`;
}

function applyAudio(){
  const a = document.getElementById('guideAudio');
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  if(!a || !btn || !state) return;

  const lang = getLang();
  a.src = audioByLang(lang);
  getDict().then(d=>{
    btn.textContent = d.play;
    state.textContent = d.idle;
  }).catch(()=>{});

  btn.onclick = async ()=>{
    const d = await getDict();
    try{
      if(a.paused){
        await a.play();
        btn.textContent = d.pause;
        state.textContent = d.nowPlaying;
      }else{
        a.pause();
        btn.textContent = d.play;
        state.textContent = d.idle;
      }
    }catch(e){
      state.textContent = d.error || 'Audio not found';
      console.warn(e);
    }
  };
}

function init(){
  document.documentElement.setAttribute('lang', getLang());
  applyI18n();
  bindSettings();
  applyAudio();
}

if(document.readyState !== 'loading') init();
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('pageshow', init);

