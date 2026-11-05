(() => {
  'use strict';
  const hash='e82935f881d383051832c246387c336e478e6b17521b31f044aa2366cdf6ebc3';
  const key='sordalen-report-access-v1';
  const gate=document.getElementById('gate'), report=document.getElementById('report');
  const password=document.getElementById('password'), error=document.getElementById('password-error');
  function unlock(){report.querySelectorAll('img[data-src]').forEach(image => { image.src = image.dataset.src; });gate.hidden=true;report.hidden=false;report.inert=false;password.value='';}
  document.getElementById('access-form').addEventListener('submit',async event=>{
    event.preventDefault();
    try{
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password.value));
      const value=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
      if(value!==hash){error.textContent='Feil passord. Prøv igjen.';error.hidden=false;return;}
      error.hidden=true;try{sessionStorage.setItem(key,hash);}catch(_){}unlock();window.scrollTo(0,0);
    }catch(_){error.textContent='Åpne rapporten via HTTPS eller den lokale forhåndsvisningen.';error.hidden=false;}
  });
  document.getElementById('lock-report').addEventListener('click',()=>{
    try{sessionStorage.removeItem(key);}catch(_){}report.hidden=true;report.inert=true;gate.hidden=false;window.scrollTo(0,0);password.focus();
  });
  document.getElementById('load-terrain').addEventListener('click',()=>{
    const frame=document.createElement('iframe');frame.src='outputs/terrain_3d.html';frame.title='3D-terreng ved Andopshestryggen';frame.setAttribute('allowfullscreen','');document.getElementById('terrain-view').replaceChildren(frame);
  });
  try{if(sessionStorage.getItem(key)===hash)unlock();}catch(_){}
})();
