// app.js v14 — instant i18n (no reload) + audio bind
const DEFAULT_LANG = 'ja';
const I18N_PATH = 'i18n';   // 先頭スラッシュなし（相対パス）
const AUDIO_PATH = 'audio';

// ---- language state ----
function getLang(){ return localStorage.getItem('lang') || DEFAULT_LANG; }
function setLang(code){
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  applyI18n();
  applyAudio();
}

// ---- i18n dict loader (no-store) ----
async function loadDict(lang){
  const url = `${I18N_PATH}/${lang}.json?v=14`;
  const res = await fetch(url, { cache: 'no-store' });
  if(!res.ok){ console.error('[i18n] failed', url, res.status); throw new Error('i18n load failed'); }
  return res.json();
}
let dictCache = {};
async function getDict(){
  const lang = getLang();
  if(!dictCache[lang]) dictCache[lang] = await loadDict(lang);
  return dictCache[lang];
}

// ---- apply i18n ----
async function applyI18n(){
  try{
    const d = await getDict();
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      if(k in d) el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
      const k = el.getAttribute('data-i18n-aria');
      if(k in d) el.setAttribute('aria-label', d[k]);
    });
  }catch(e){ console.warn(e); }
}

// ---- settings radios ----
function bindSettings(){
  const radios = document.querySelectorAll('input[name="lang"]');
  if(!radios.length) return;
  const cur = getLang();
  radios.forEach(r=> r.checked = (r.value===cur));
  radios.forEach(r=> r.addEventListener('change', ()=> setLang(r.value)));
}

// ---- guide audio ----
function audioSrcByLang(lang){
  if(lang==='zh-CN'||lang==='zh-TW') return `${AUDIO_PATH}/zh.mp3`;
  if(lang==='en') return `${AUDIO_PATH}/en.mp3`;
  if(lang==='ko') return `${AUDIO_PATH}/ko.mp3`;
  return `${AUDIO_PATH}/ja.mp3`;
}
function applyAudio(){
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  const audio = document.getElementById('guideAudio');
  if(!btn || !state || !audio) return;

  (async ()=>{
    const d = await getDict();
    audio.src = audioSrcByLang(getLang());
    btn.textContent = d.play;
    state.textContent = d.idle;
  })();
}
function bindGuideAudio(){
  const btn = document.getElementById('playBtn');
  const state = document.getElementById('playState');
  const audio = document.getElementById('guideAudio');
  if(!btn || !state || !audio) return;

  btn.onclick = async ()=>{
    const d = await getDict();
    try{
      if(audio.paused){ await audio.play(); btn.textContent=d.pause; state.textContent=d.nowPlaying; }
      else{ audio.pause(); btn.textContent=d.play; state.textContent=d.idle; }
    }catch{ state.textContent = d.error || 'Audio not found'; }
  };
}

// ---- init ----
document.addEventListener('DOMContentLoaded', ()=>{
  document.documentElement.setAttribute('lang', getLang());
  bindSettings();
  bindGuideAudio();
  applyI18n();
});
