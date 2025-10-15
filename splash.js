/* ===== Cinematic Splash for ISLAI =====
   1) 灯台がふわっと登場
   2) 光が左→正面へスイープ（少しオーバーシュート）
   3) ロゴが下からフェードイン
   4) 白フラッシュ→スプラッシュ終了
*/
(() => {
  const stage = document.querySelector('#splash');
  if (!stage) return;

  const svg = document.querySelector('#lighthouse');
  const edge = document.querySelector('.beam .edge');
  const core = document.querySelector('.beam .core');
  const logo = document.querySelector('.splash-logo');
  const flash = document.querySelector('.flash');

  // Web Animations API（Safari/Chrome/Edge/Firefox ほぼOK）
  const tIn = getVar('--duration-in', 720);
  const tSweep = getVar('--duration-sweep', 900);
  const tFlash = getVar('--duration-flash', 320);

  // 1) Lighthouse fade-in + slight pop
  const a1 = svg.animate([
    { opacity:0, transform:'translate(-50%,-56%) scale(.90)'},
    { opacity:1, transform:'translate(-50%,-52%) scale(1.00)'}
  ], { duration:tIn, easing:getVar('--e-out','.17,.84,.44,1'), fill:'forwards'});

  // 2) Beam sweep（左から入って正面で少し戻る）
  a1.finished.then(() => {
    // 初期状態：左向き
    setBeamAngle(-40);

    const sweep = new KeyframeEffect(
      svg,
      [
        { transform: 'translate(-50%,-52%) rotate(-40deg) scale(1.00)'},
        { transform: 'translate(-50%,-52%) rotate(2deg)  scale(1.00)', offset: .85},
        { transform: 'translate(-50%,-52%) rotate(0deg)  scale(1.00)'}
      ],
      { duration:tSweep, easing:getVar('--e-overshoot','.2,1,.15,1'), fill:'forwards' }
    );
    const anim = new Animation(sweep, document.timeline);

    // ビームの発光（コア→エッジの順に）
    edge.animate([{opacity:0},{opacity:.55}], {duration:tSweep*0.6, delay:60, fill:'forwards', easing:'linear'});
    core.animate([{opacity:0},{opacity:.95}], {duration:tSweep*0.5, delay:100, fill:'forwards', easing:'linear'});

    anim.play();

    // 3) ロゴ出現（下からふわっと）
    setTimeout(() => {
      logo.animate([
        {opacity:0, transform:'translateY(16px)'},
        {opacity:1, transform:'translateY(0)'}
      ], {duration:520, easing:getVar('--e-out','.17,.84,.44,1'), fill:'forwards'});
    }, tSweep*0.55);

    // 4) 白フラッシュ → 終了
    anim.finished.then(() => {
      flash.animate([{opacity:0},{opacity:.9},{opacity:0}], {
        duration:tFlash, easing:getVar('--e-in','.11,.9,.2,1')
      }).finished.then(() =>{
        // 少し余韻を残して消える
        stage.animate([{opacity:1},{opacity:0}], {duration:260, fill:'forwards'})
             .finished.then(()=> stage.remove());
      });
    });
  });

  // ▼ ユーティリティ
  function getVar(name, fallbackMs){
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (v.includes('cubic-bezier')) return `cubic-bezier${v.match(/$begin:math:text$.*$end:math:text$/)[0]}`;
    const ms = parseInt(v,10);
    return Number.isFinite(ms) ? ms : fallbackMs;
  }

  function setBeamAngle(deg){
    // SVG 全体を回してビーム方向を表現（GPU 合成対象）
    svg.style.transform = `translate(-50%,-52%) rotate(${deg}deg) scale(1.00)`;
    // 透明度は別途アニメーションで付与
  }
})();
