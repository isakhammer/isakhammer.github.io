/* Same lightweight static viewing gate as the existing report. Not encryption. */
(() => {
  'use strict';
  const HASH='e82935f881d383051832c246387c336e478e6b17521b31f044aa2366cdf6ebc3';
  const KEY='sordalen-report-access-v1';
  const form=document.getElementById('lidar-access-form');
  const password=document.getElementById('lidar-password');
  const error=document.getElementById('lidar-access-error');
  let initialized=false;
  function unlock(){
    if(initialized)return;
    initialized=true;
    document.documentElement.classList.add('lidar-unlocked');
    document.querySelectorAll('img[data-src]').forEach(image=>{image.src=image.dataset.src;});
    password.value='';
    window.dispatchEvent(new Event('lidar-access-granted'));
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    try{
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password.value));
      const digest=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
      if(digest!==HASH){error.textContent='Feil passord. Prøv igjen.';error.hidden=false;password.setAttribute('aria-invalid','true');return;}
      error.hidden=true;password.removeAttribute('aria-invalid');
      try{sessionStorage.setItem(KEY,HASH);}catch(_){}
      unlock();
    }catch(_){error.textContent='Åpne visningen via HTTPS eller den lokale forhåndsvisningen.';error.hidden=false;}
  });
  document.getElementById('lidar-lock')?.addEventListener('click',()=>{
    try{sessionStorage.removeItem(KEY);}catch(_){}
    location.reload();
  });
  try{if(sessionStorage.getItem(KEY)===HASH)unlock();}catch(_){}
})();
