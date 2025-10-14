const msg = document.getElementById('msg');
document.querySelectorAll('.lang').forEach(b=>{
  b.onclick = ()=>{
    const code = b.dataset.code;
    msg.textContent = `言語を ${code} に切替予定（後で音声/翻訳を接続）`;
  };
});
