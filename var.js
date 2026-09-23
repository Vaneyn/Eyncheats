(()=>{
  if(window.__bmp) return window.__bmp.remove();

  const isMobile = matchMedia('(max-width:700px)').matches || ('ontouchstart' in window && matchMedia('(max-width:900px)').matches);

  const p = document.createElement('div');
  p.id = '__bmp';

  if(isMobile){
    p.style.cssText = 'position:fixed;left:0;right:0;bottom:0;top:auto;height:78vh;background:#1e1e1e;color:#eee;font:14px/1.45 ui-monospace,Menlo,Consolas,monospace;border-top-left-radius:14px;border-top-right-radius:14px;box-shadow:0 -8px 40px rgba(0,0,0,.6);z-index:2147483647;display:flex;flex-direction:column;overflow:hidden';
  } else {
    p.style.cssText = 'position:fixed;top:20px;right:20px;width:580px;max-height:80vh;min-width:340px;background:#1e1e1e;color:#eee;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;border:1px solid #444;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.5);z-index:2147483647;display:flex;flex-direction:column;overflow:hidden;resize:both';
  }

  const tabs = ['Local','Session','Cookies','Window','Media'];
  const tabStyle = `flex:${isMobile?'0 0 auto':'1'};background:#111;color:#eee;border:1px solid #333;border-radius:6px;padding:${isMobile?'8px 14px':'4px'};cursor:pointer;font:inherit;white-space:nowrap`;

  p.innerHTML =
    '<div id="__bmp_h" style="display:flex;align-items:center;padding:'+(isMobile?'12px':'8px')+' 12px;background:#111;border-bottom:1px solid #333;'+(isMobile?'':'cursor:move;user-select:none')+'">'+
      '<b style="flex:1;font-size:'+(isMobile?'15px':'13px')+'">🧰 Инспектор</b>'+
      '<button id="__bmp_x" style="background:#c33;color:#fff;border:0;border-radius:6px;padding:'+(isMobile?'6px 12px':'2px 8px')+';cursor:pointer;font:inherit">✕</button>'+
    '</div>'+
    '<div id="__bmp_t" style="display:flex;gap:4px;padding:6px;background:#181818;overflow-x:auto;-webkit-overflow-scrolling:touch">'+
      tabs.map((t,i)=>'<button data-i="'+i+'" style="'+tabStyle+'">'+t+'</button>').join('')+
    '</div>'+
    '<div id="__bmp_b" style="flex:1;overflow:auto;padding:10px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain"></div>';

  document.body.appendChild(p);
  const prevOverflow = document.body.style.overflow;
  if(isMobile) document.body.style.overflow = 'hidden';

  const bodyEl = p.querySelector('#__bmp_b');
  const tabEls = p.querySelectorAll('#__bmp_t button');

  const close = () => { document.body.style.overflow = prevOverflow || ''; p.remove(); };
  p.querySelector('#__bmp_x').onclick = close;

  if(!isMobile){
    const h = p.querySelector('#__bmp_h');
    let dx,dy,ox,oy,drag=false;
    h.addEventListener('mousedown', e => {
      if(e.target.id === '__bmp_x') return;
      drag = true;
      const r = p.getBoundingClientRect();
      dx = e.clientX; dy = e.clientY; ox = r.left; oy = r.top;
      p.style.right='auto'; p.style.left=r.left+'px'; p.style.top=r.top+'px';
    });
    addEventListener('mousemove', e => {
      if(!drag) return;
      p.style.left = (ox+e.clientX-dx)+'px';
      p.style.top  = (oy+e.clientY-dy)+'px';
    });
    addEventListener('mouseup', () => drag = false);
  }

  const iS = 'width:100%;background:#0d0d0d;color:#eee;border:1px solid #333;border-radius:6px;padding:'+(isMobile?'10px':'4px')+';font:inherit;box-sizing:border-box';
  const bS = 'background:#2a2a2a;color:#eee;border:1px solid #444;border-radius:6px;padding:'+(isMobile?'10px 14px':'4px 8px')+';cursor:pointer;font:inherit';

  const mkDiv = (t,s) => { const d = document.createElement('div'); d.textContent = t; if(s) d.style.cssText = s; return d; };
  const mkInp = (v,ph,ro) => { const i = document.createElement('input'); i.value = v==null?'':v; i.placeholder = ph||''; i.style.cssText = iS; i.readOnly = !!ro; return i; };
  const mkBtn = (t,fn) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = bS; b.onclick = fn; return b; };
  const mkRow = (...els) => { const r = document.createElement('div'); r.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px'; els.forEach(e => r.appendChild(e)); return r; };

  const renderStorage = kind => {
    const s = kind === 'local' ? localStorage : sessionStorage;
    bodyEl.innerHTML = '';
    const k = mkInp('','ключ'), v = mkInp('','значение');
    bodyEl.appendChild(mkRow(k, v, mkBtn('+', () => { if(k.value) s.setItem(k.value, v.value); renderStorage(kind); })));
    Object.keys(s).forEach(key => {
      const ki = mkInp(key, null, true), vi = mkInp(s.getItem(key));
      bodyEl.appendChild(mkRow(ki, vi,
        mkBtn('💾', () => s.setItem(key, vi.value)),
        mkBtn('🗑', () => { s.removeItem(key); renderStorage(kind); })
      ));
    });
    if(!Object.keys(s).length) bodyEl.appendChild(mkDiv('(пусто)','color:#888'));
  };

  const renderCookies = () => {
    bodyEl.innerHTML = '';
    const parse = () => document.cookie.split('; ').filter(Boolean).map(x => {
      const i = x.indexOf('='); return [x.slice(0,i), x.slice(i+1)];
    });
    const k = mkInp('','имя'), v = mkInp('','значение');
    bodyEl.appendChild(mkRow(k, v, mkBtn('+', () => {
      if(k.value) document.cookie = k.value+'='+encodeURIComponent(v.value)+'; path=/; max-age=31536000';
      renderCookies();
    })));
    parse().forEach(([key,val]) => {
      const ki = mkInp(key, null, true), vi = mkInp(decodeURIComponent(val));
      bodyEl.appendChild(mkRow(ki, vi,
        mkBtn('💾', () => { document.cookie = key+'='+encodeURIComponent(vi.value)+'; path=/; max-age=31536000'; }),
        mkBtn('🗑', () => { document.cookie = key+'=; path=/; max-age=0'; renderCookies(); })
      ));
    });
    if(!parse().length) bodyEl.appendChild(mkDiv('(пусто)','color:#888'));
  };

  const renderWindow = () => {
    bodyEl.innerHTML = '';
    const all = [];
    for(const k in window){ try { if(typeof window[k] !== 'function') all.push(k); } catch(e){} }
    const f = mkInp('','фильтр…'); f.style.marginBottom = '6px'; bodyEl.appendChild(f);
    const nameInp = mkInp('','имя переменной (кликните по ключу ниже)', true);
    const ta = document.createElement('textarea');
    ta.style.cssText = iS + ';height:80px;resize:vertical';
    ta.placeholder = 'значение (JSON или строка)';
    const save = mkBtn('💾 Сохранить', () => {
      const k = nameInp.value; if(!k) return;
      let v = ta.value; try { v = JSON.parse(v); } catch(e){}
      try { window[k] = v; } catch(e){}
    });
    const del = mkBtn('🗑 Удалить', () => {
      const k = nameInp.value; if(!k) return;
      try { delete window[k]; } catch(e){}
      const i = all.indexOf(k); if(i >= 0) all.splice(i,1);
      draw();
    });
    bodyEl.appendChild(mkRow(nameInp));
    bodyEl.appendChild(ta);
    bodyEl.appendChild(mkRow(save, del));
    const list = document.createElement('div'); bodyEl.appendChild(list);
    const draw = () => {
      list.innerHTML = '';
      const q = f.value.toLowerCase();
      all.filter(k => k.toLowerCase().includes(q)).slice(0,300).forEach(key => {
        const btn = mkBtn(key, () => {
          nameInp.value = key;
          let txt;
          try { const c = window[key]; txt = typeof c === 'object' ? JSON.stringify(c,null,2) : String(c); }
          catch(e){ txt = '<ошибка>'; }
          ta.value = txt;
        });
        btn.style.cssText = bS + ';flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
        list.appendChild(btn);
      });
    };
    f.oninput = draw; draw();
  };

  const renderMedia = () => {
    bodyEl.innerHTML = '';
    bodyEl.appendChild(mkDiv('Сканирую страницу…','color:#9cf;margin-bottom:8px'));

    const exts = /\.(mp4|webm|ogv|mov|avi|mkv|m4v|mp3|wav|m4a|flac|ogg|oga|aac|m3u8|mpd|pdf|zip|rar|7z|jpg|jpeg|png|gif|webp|svg|avif|bmp|txt|csv|json)(\?|#|$)/i;

    const add = (u, el) => {
      if(!u) return;
      try {
        const abs = new URL(u, location.href).href;
        if(!seen.has(abs)) seen.set(abs, { url: abs, el: el || null });
      } catch(e){}
    };
    const seen = new Map();

    document.querySelectorAll('video').forEach(el => { add(el.src, el); add(el.currentSrc, el); });
    document.querySelectorAll('audio').forEach(el => { add(el.src, el); add(el.currentSrc, el); });
    document.querySelectorAll('source').forEach(el => add(el.src, el));
    document.querySelectorAll('img[src]').forEach(el => add(el.src, el));
    document.querySelectorAll('a[href]').forEach(el => { if(exts.test(el.href)) add(el.href, el); });
    try {
      performance.getEntriesByType('resource').forEach(e => {
        if(exts.test(e.name) || /video|audio|media/.test(e.initiatorType || '')) add(e.name, null);
      });
    } catch(e){}

    const classify = url => {
      if(url.startsWith('blob:')) return 'blob';
      const u = url.split('?')[0].split('#')[0].toLowerCase();
      if(/\.(mp4|webm|ogv|mov|avi|mkv|m4v)$/.test(u)) return 'video';
      if(/\.(mp3|wav|m4a|flac|ogg|oga|aac)$/.test(u)) return 'audio';
      if(/\.(m3u8|mpd)$/.test(u)) return 'stream';
      if(/\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)$/.test(u)) return 'image';
      if(/\.(pdf|zip|rar|7z)$/.test(u)) return 'file';
      return 'other';
    };

    const groups = { video:[], audio:[], stream:[], image:[], file:[], blob:[], other:[] };
    for(const [, it] of seen){
      const kind = classify(it.url);
      it.kind = kind;
      (groups[kind] || groups.other).push(it);
    }
    const total = [...seen.size ? [1] : []].length ? seen.size : 0;

    bodyEl.innerHTML = '';
    if(!total){ bodyEl.appendChild(mkDiv('(ничего не найдено)','color:#888')); return; }

    const names = { video:'Видео', audio:'Аудио', stream:'Потоки', image:'Изображения', file:'Файлы', blob:'Blob-потоки', other:'Прочее' };
    const icons = { video:'🎬', audio:'🎵', stream:'📡', image:'🖼', file:'📄', blob:'💾', other:'🔗' };

    bodyEl.appendChild(mkDiv('Найдено: '+total, 'color:#9cf;margin-bottom:10px;font-weight:bold'));

    const allItems = [...seen.values()];

    const download = async it => {
      const url = it.url;
      let name;
      try {
        const u = new URL(url);
        name = decodeURIComponent(u.pathname.split('/').pop() || 'file');
      } catch(e){ name = 'file'; }
      if(!name || name === '/') name = 'file';

      if(url.startsWith('blob:')){
        const a = document.createElement('a'); a.href = url; a.download = name; a.click(); return;
      }
      if(/\.(m3u8|mpd)(\?|#|$)/i.test(url)){ window.open(url,'_blank'); return; }
      try {
        const r = await fetch(url, { credentials:'include' });
        if(!r.ok) throw 0;
        const b = await r.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      } catch(e){
        window.open(url, '_blank');
      }
    };

    const dAll = mkBtn('⬇ Скачать всё ('+total+')', () => {
      allItems.forEach((it,i) => setTimeout(() => download(it), i*400));
    });
    dAll.style.marginBottom = '10px';
    if(isMobile) dAll.style.width = '100%';
    bodyEl.appendChild(dAll);

    for(const kind of Object.keys(groups)){
      const items = groups[kind];
      if(!items.length) continue;

      bodyEl.appendChild(mkDiv(icons[kind]+' '+names[kind]+' · '+items.length, 'color:#9cf;margin:12px 0 6px;font-weight:bold'));

      for(const it of items){
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px;background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:6px;overflow:hidden';

        // Thumbnail
        if(kind === 'image'){
          const th = document.createElement('img');
          th.loading = 'lazy';
          th.src = it.url;
          th.style.cssText = 'width:44px;height:44px;object-fit:cover;border-radius:6px;background:#000;flex-shrink:0';
          th.onerror = () => { th.style.display = 'none'; };
          row.appendChild(th);
        } else {
          const ic = document.createElement('div');
          ic.textContent = icons[kind] || '•';
          ic.style.cssText = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:#000;border-radius:6px;flex-shrink:0;font-size:20px';
          row.appendChild(ic);
        }

        const info = document.createElement('div');
        info.style.cssText = 'flex:1;min-width:0;overflow:hidden';

        let fname, ext, host;
        try {
          const u = new URL(it.url);
          fname = decodeURIComponent(u.pathname.split('/').pop() || u.hostname) || it.url;
          const m = fname.match(/\.([a-z0-9]+)$/i);
          ext = m ? m[1].toUpperCase() : (it.kind === 'blob' ? 'BLOB' : '');
          host = u.hostname;
        } catch(e){ fname = it.url; ext = ''; host = ''; }

        const title = document.createElement('div');
        title.textContent = fname;
        title.title = it.url;
        title.style.cssText = 'font-size:'+(isMobile?'13px':'12px')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#eee';
        info.appendChild(title);

        const sub = document.createElement('div');
        sub.textContent = [ext, host].filter(Boolean).join(' · ');
        sub.style.cssText = 'font-size:10px;color:#777;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px';
        info.appendChild(sub);

        row.appendChild(info);

        const dl = mkBtn('⬇', () => download(it));
        dl.style.flexShrink = '0';
        if(isMobile) dl.style.padding = '10px 14px';
        row.appendChild(dl);

        bodyEl.appendChild(row);
      }
    }
  };

  const show = i => {
    tabEls.forEach((b,j) => b.style.background = j === i ? '#2a2a2a' : '#111');
    [() => renderStorage('local'), () => renderStorage('session'), renderCookies, renderWindow, renderMedia][i]();
  };
  tabEls.forEach((b,i) => b.onclick = () => show(i));
  show(0);
})();
