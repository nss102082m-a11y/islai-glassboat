// Lottie を再生 → 終わったらフェードアウトして削除
(() => {
  const wrap = document.getElementById('splash');
  const player = document.getElementById('islaiIntro');
  if(!wrap || !player) return;

  // 再生完了で閉じる
  player.addEventListener('complete', () => finish());

  // 念のためタイムアウト（万一Lottieが落ちても閉じる）
  const kill = setTimeout(() => finish(), 4000); // 4秒で保険
  function finish(){
    clearTimeout(kill);
    wrap.classList.add('is-done');
    setTimeout(()=> wrap.remove(), 320);
  }
})();
