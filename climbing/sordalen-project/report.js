/* This is a lightweight static viewing gate, not server-side access control. */
(() => {
  'use strict';
  const HASH = 'e82935f881d383051832c246387c336e478e6b17521b31f044aa2366cdf6ebc3';
  const KEY = 'sordalen-report-access-v1';
  const gate = document.getElementById('gate');
  const report = document.getElementById('report');
  const form = document.getElementById('access-form');
  const error = document.getElementById('password-error');
  const password = document.getElementById('password');
  let initialized = false;
  function unlock() {
    report.querySelectorAll('img[data-src]').forEach(image => { image.src = image.dataset.src; });
    gate.hidden = true;
    report.hidden = false;
    report.inert = false;
    password.value = '';
    if (!initialized) { initializeReport(); initialized = true; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password.value));
      const digest = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
      if (digest !== HASH) { error.textContent = 'Feil passord. Prøv igjen.'; error.hidden = false; password.setAttribute('aria-invalid', 'true'); return; }
      error.hidden = true;
      password.removeAttribute('aria-invalid');
      try { sessionStorage.setItem(KEY, HASH); } catch (_) { /* Viewing still works with storage blocked. */ }
      unlock();
      window.scrollTo(0, 0);
    } catch (_) { error.textContent = 'Åpne rapporten via en HTTPS-adresse eller den lokale forhåndsvisningen.'; error.hidden = false; }
  });
  document.getElementById('lock-report').addEventListener('click', () => {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
    report.hidden = true;
    report.inert = true;
    gate.hidden = false;
    window.scrollTo(0, 0);
    password.focus();
  });
  try { if (sessionStorage.getItem(KEY) === HASH) unlock(); } catch (_) {}

  function initializeReport() {
    const data = window.SORDALEN_DATA;
    const names = {south_north:'Sør → nord', west_east:'Vest → øst', southwest_northeast:'Sørvest → nordøst'};
    let selected = 'south_north', full = false, distance = 0;
    const svg = document.getElementById('profile-svg');
    const chart = document.getElementById('profile-chart');
    const tooltip = document.getElementById('chart-tooltip');
    const slider = document.getElementById('profile-position');
    const readout = document.getElementById('profile-readout');
    const ns = 'http://www.w3.org/2000/svg';
    let scales = null, marker = null, guide = null;
    const number = value => value.toLocaleString('nb-NO', {maximumFractionDigits:1, minimumFractionDigits:1});
    const relativeHeight = new Intl.NumberFormat('nb-NO', {
      signDisplay: 'exceptZero', maximumFractionDigits: 1
    });
    function el(tag, attrs = {}, text) {
      const element = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
      if (text !== undefined) element.textContent = text;
      svg.appendChild(element);
      return element;
    }
    function updateMarker(value, pointer = false) {
      distance = Math.max(scales.min, Math.min(scales.max, Math.round(value)));
      const profile = data.profiles[selected];
      const height = profile[distance + 500][1];
      const heightDifference = height - profile[500][1];
      const differenceText = `${relativeHeight.format(heightDifference)} m fra startnivået`;
      marker.setAttribute('cx', scales.x(distance)); marker.setAttribute('cy', scales.y(height));
      guide.setAttribute('x1', scales.x(distance)); guide.setAttribute('x2', scales.x(distance));
      slider.value = distance;
      readout.textContent = `${names[selected]} · ${distance === 0 ? 'punktet' : `${distance} m fra punktet`} · ${number(height)} m NN2000 · ${differenceText}`;
      if (pointer) {
        tooltip.textContent = `${distance} m · ${number(height)} m NN2000 · ${differenceText}`;
        tooltip.hidden = false;
        const tipX = Math.max(85, Math.min(scales.width - 85, scales.x(distance)));
        tooltip.style.left = `${tipX}px`;
        tooltip.style.top = `${Math.max(35, scales.y(height) - 12)}px`;
      }
    }
    function draw() {
      const width = Math.max(270, chart.getBoundingClientRect().width), height = 340;
      const pad = {left:48,right:16,top:20,bottom:55};
      const min = full ? -500 : -50, max = full ? 500 : 100;
      const points = data.profiles[selected].filter(p => p[0] >= min && p[0] <= max);
      const low = Math.floor(Math.min(...points.map(p=>p[1])) / 50) * 50;
      const high = Math.ceil(Math.max(...points.map(p=>p[1])) / 50) * 50;
      const x = d => pad.left + (d-min)/(max-min)*(width-pad.left-pad.right);
      const y = z => height-pad.bottom - (z-low)/(high-low)*(height-pad.top-pad.bottom);
      scales = {x,y,min,max,width};
      svg.replaceChildren(); svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      const yStep = high-low > 250 ? 100 : 50;
      for (let h=low;h<=high;h+=yStep) {
        el('line',{x1:pad.left,x2:width-pad.right,y1:y(h),y2:y(h),stroke:'#d1d6ca','stroke-width':1});
        el('text',{x:pad.left-10,y:y(h)+4,fill:'#5b6b65','text-anchor':'end','font-size':11},h);
      }
      const ticks = width < 500 ? [min,0,max] : full ? [-500,-250,0,250,500] : [-50,0,25,50,75,100];
      ticks.forEach(t => el('text',{x:x(t),y:height-30,fill:'#5b6b65','text-anchor':'middle','font-size':11},t));
      el('text',{x:pad.left,y:12,fill:'#5b6b65','font-size':11},'m NN2000');
      el('text',{x:(width+pad.left-pad.right)/2,y:height-5,fill:'#5b6b65','text-anchor':'middle','font-size':11},'Horisontal avstand fra punktet (m)');
      const path = points.map((p,i)=>`${i?'L':'M'}${x(p[0]).toFixed(2)},${y(p[1]).toFixed(2)}`).join(' ');
      el('path',{d:`${path} L${x(max)},${y(low)} L${x(min)},${y(low)} Z`,fill:'#1b6c7810'});
      el('path',{d:path,fill:'none',stroke:'#1b6c78','stroke-width':2.5,'stroke-linejoin':'round'});
      el('line',{x1:x(0),x2:x(0),y1:pad.top,y2:height-pad.bottom,stroke:'#bb482e','stroke-width':1,'stroke-dasharray':'3 4'});
      guide=el('line',{x1:x(distance),x2:x(distance),y1:pad.top,y2:height-pad.bottom,stroke:'#617d79','stroke-width':1,opacity:.6});
      marker=el('circle',{r:5,fill:'#bb482e',stroke:'#f4f2e9','stroke-width':2});
      updateMarker(distance);
    }
    document.querySelectorAll('[data-profile]').forEach(button => button.addEventListener('click',()=>{
      selected=button.dataset.profile;
      document.querySelectorAll('[data-profile]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      document.getElementById('profile-name').textContent=names[selected];
      tooltip.hidden=true;draw();
    }));
    document.getElementById('full-profile').addEventListener('change',event=>{
      full=event.target.checked;slider.min=full?-500:-50;slider.max=full?500:100;
      distance=Math.max(Number(slider.min),Math.min(Number(slider.max),distance));tooltip.hidden=true;draw();
    });
    slider.addEventListener('input',()=>{
      tooltip.hidden=true;
      updateMarker(Number(slider.value));
    });
    svg.addEventListener('pointermove',event=>{
      const rect=svg.getBoundingClientRect(), coordinate=event.clientX-rect.left;
      const value=scales.min+(coordinate-48)/(scales.width-64)*(scales.max-scales.min);
      updateMarker(value,true);
    });
    svg.addEventListener('pointerleave',()=>{tooltip.hidden=true;});
    new ResizeObserver(draw).observe(chart);
    draw();
    document.getElementById('load-terrain').addEventListener('click',()=>{
      const iframe=document.createElement('iframe');
      iframe.src='outputs/terrain_3d.html';
      iframe.title='Roterbar 3D-modell av terrenget i Sørdalen';
      iframe.setAttribute('allowfullscreen','');
      document.getElementById('terrain-view').replaceChildren(iframe);
    });
    function calculateWalkingTime() {
      const distance=Number(document.getElementById('walk-distance').value);
      const ascent=Number(document.getElementById('walk-ascent').value);
      const speed=Number(document.getElementById('walk-speed').value);
      const pause=Number(document.getElementById('walk-break').value);
      const hours=distance/speed+ascent/400+pause/60;
      const minutes=Math.round(hours*60);
      document.getElementById('walk-distance-value').textContent=`${number(distance)} km`;
      document.getElementById('walk-ascent-value').textContent=`${ascent} m`;
      document.getElementById('walk-speed-value').textContent=`${number(speed)} km/t`;
      document.getElementById('walk-break-value').textContent=`${pause} min`;
      document.getElementById('walking-time').textContent=`${Math.floor(minutes/60)} t ${minutes%60} min`;
      document.getElementById('walking-average').textContent=`Effektiv snittfart: ${number(distance/hours)} km/t, med stigning og pauser`;
    }
    ['walk-distance','walk-ascent','walk-speed','walk-break'].forEach(id=>document.getElementById(id).addEventListener('input',calculateWalkingTime));
    calculateWalkingTime();
  }
})();
