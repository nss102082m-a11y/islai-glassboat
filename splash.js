// splash.js : アニメ終了後にスプラッシュを閉じる
(function(){
  const splash = document.getElementById('splash');
  if(!splash) return;

  // アニメ終了を待って隠す（安全マージン込）
  const total = 1200 + 1400 + 260 + 200; // ms
  setTimeout(()=>{ 
    splash.classList.add('hidden');
    // さらに外してDOM軽量化したいなら次行を有効化
    setTimeout(()=> splash.remove(), 600);
  }, total);

  // ユーザーがタップしたら即スキップも可
  splash.addEventListener('click', ()=> splash.classList.add('hidden'));
})();
