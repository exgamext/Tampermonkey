// ==UserScript==
// @name         IGG Games — Modern UI v21
// @namespace    https://igg-games.com/
// @version      21.0
// @description  Redesign premium para igg-games.com
// @author       You
// @match        https://igg-games.com/
// @match        https://igg-games.com/?*
// @match        https://igg-games.com/page/*
// @match        https://igg-games.com/*free-download*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  /* ── FastComments interceptor ──
     IGG calls window.FastCommentsUI(el, config) from an inline script.
     We proxy it: capture the config, suppress the original call,
     then re-call with our container + dark theme once our UI is built.
  */
  let _fcConfig = null;
  const _fcOriginal = window.FastCommentsUI;
  window.FastCommentsUI = function(el, config) {
    _fcConfig = config; // capture tenantId, urlId, etc.
    // suppress original render — we'll re-render in our container
  };
  // Restore original after page scripts run (in case it's called again later)
  // We'll call it ourselves with our container in the comments section

  const PATH  = location.pathname;
  const QUERY = location.search;
  const IS_GAME   = /free-download/.test(PATH);
  const IS_SEARCH = /[?&]s=/.test(QUERY);
  const IS_HOME   = !IS_GAME && (/^\/$/.test(PATH) || /^\/page\/\d+/.test(PATH) || IS_SEARCH);
  if (!IS_HOME && !IS_GAME) return;

  /* ── FONTS ── */
  const fl = document.createElement('link');
  fl.rel = 'stylesheet';
  fl.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap';
  document.head.appendChild(fl);

  GM_addStyle(`
    :root {
      --bg:    #07090e; --surf:  #0c0f1a; --card:  #111420; --card2: #171b28;
      --bdr:   rgba(255,255,255,.055); --bdr2: rgba(255,255,255,.10);
      --acc:   #6c63ff; --acc2:  #8b87ff; --accS: rgba(108,99,255,.12); --accG: rgba(108,99,255,.22);
      --green: #2dd4a0; --yellow:#f0c040; --red:  #f87171;
      --txt:   #bdc7dc; --muted: #4a5168; --white: #edf1fb;
      --r: 16px; --rs: 10px; --nav: 60px; --maxw: 940px;
      --ease: cubic-bezier(.4,0,.2,1); --f: 'Outfit', system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html { scroll-behavior:smooth; }
    body { background:var(--bg)!important; color:var(--txt)!important; font-family:var(--f)!important; -webkit-font-smoothing:antialiased; }
    body > *:not(#igg-nav):not(#igg-root):not(#igg-lb):not(#g-floatnav):not(script):not(style):not(link):not(noscript):not(meta) { display:none!important; }

    /* ══ NAV ══ */
    #igg-nav { position:fixed; top:0; left:0; right:0; z-index:9999; height:var(--nav); background:rgba(7,9,14,.88); backdrop-filter:blur(24px) saturate(180%); -webkit-backdrop-filter:blur(24px) saturate(180%); border-bottom:1px solid var(--bdr); display:grid; grid-template-columns:1fr auto 1fr; align-items:center; padding:0 24px; gap:16px; }
    .nl { display:flex; align-items:center; gap:9px; text-decoration:none; flex-shrink:0; justify-self:start; }
    .nl-badge { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#6c63ff,#a78bfa); display:grid; place-items:center; }
    .nl-text { font-size:16px; font-weight:800; letter-spacing:-.3px; color:var(--white); }
    .nl-text em { color:var(--acc2); font-style:normal; }
    .n-title { font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--muted); white-space:nowrap; justify-self:center; }
    .n-title em { color:var(--acc2); font-style:normal; }
    .ns { position:relative; justify-self:end; width:280px; }
    .ns svg.ns-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; transition:color .18s; z-index:1; }
    .ns:focus-within svg.ns-ico { color:var(--acc2); }
    #igg-search { width:100%; background:rgba(255,255,255,.04); border:1.5px solid var(--bdr2); border-radius:999px;
      color:var(--white); font-family:var(--f); font-size:13px; padding:8px 42px 8px 36px; outline:none;
      transition:border-color .2s, box-shadow .2s, background .2s; }
    #igg-search::placeholder { color:var(--muted); }
    #igg-search:focus { border-color:var(--acc); box-shadow:0 0 0 3px var(--accS); background:rgba(108,99,255,.06); }
    .ns-kbd { position:absolute; right:11px; top:50%; transform:translateY(-50%); background:var(--card2);
      border:1px solid var(--bdr2); border-radius:5px; font-size:9.5px; font-weight:700; color:var(--muted);
      padding:2px 5px; pointer-events:none; letter-spacing:.3px; transition:opacity .18s; }
    #igg-search:focus ~ .ns-kbd { opacity:0; }

    /* ══ ROOT / PAGE ══ */
    #igg-root { padding-top:var(--nav); min-height:100vh; }
    .igg-page { max-width:1280px; margin:0 auto; padding:32px 20px 80px; }
    .igg-center { max-width:var(--maxw); margin:0 auto; }

    /* ══ HOME ══ */
    .h-top { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:24px; gap:12px; flex-wrap:wrap; }
    .h-title { font-size:24px; font-weight:800; color:var(--white); letter-spacing:-.4px; }
    .h-title span { color:var(--acc2); }
    .h-sub { font-size:12.5px; color:var(--muted); margin-top:2px; }
    .hgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }

    /* ══ CARDS ══ */
    .hgrid { perspective: 1200px; }

    .hcard {
      position: relative; display: flex; flex-direction: column;
      text-decoration: none !important;
      border-radius: 14px; overflow: hidden;
      background: var(--card);
      border: 1px solid var(--bdr);
      transform-style: preserve-3d;
      transition: transform .1s ease, box-shadow .1s ease, border-color .15s;
      will-change: transform;
      cursor: pointer;
    }
    .hcard:hover { border-color: rgba(255,255,255,.12); box-shadow: 0 24px 48px rgba(0,0,0,.55); }

    /* image: square (original IGG thumbnails are 1:1) */
    .hcard-img { width: 100%; aspect-ratio: 1/1; overflow: hidden; flex-shrink: 0; background: var(--surf); }
    .hcard-img img { width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform .45s var(--ease); }
    .hcard:hover .hcard-img img { transform: scale(1.07); }

    /* spotlight — follows cursor */
    .hcard-spot {
      position: absolute; inset: 0; pointer-events: none; border-radius: 14px;
      background: radial-gradient(circle at var(--mx,50%) var(--my,50%),
        rgba(255,255,255,.055) 0%, transparent 55%);
      opacity: 0; transition: opacity .18s;
    }
    .hcard:hover .hcard-spot { opacity: 1; }

    /* info area */
    .hcard-body {
      flex: 1; padding: 11px 12px 12px;
      display: flex; flex-direction: column; gap: 7px;
      /* reset ALL inherited WP styles that cause the glow */
      text-shadow: none !important;
      -webkit-text-stroke: 0 !important;
      filter: none !important;
    }
    .hcard-title {
      font-size: 12.5px; font-weight: 700; line-height: 1.35;
      color: #ffffff !important;
      text-shadow: none !important;
      -webkit-text-stroke: 0 !important;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .hcard-meta { display: flex; align-items: center; justify-content: space-between; gap: 4px; flex-wrap: wrap; margin-top: auto; }
    .hcard-cats { display: flex; flex-wrap: wrap; gap: 3px; }
    .hcard-cat {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
      padding: 2px 7px; border-radius: 20px;
      background: rgba(108,99,255,.15); color: #a78bfa !important;
      border: 1px solid rgba(108,99,255,.22);
      text-shadow: none !important;
    }
    .hcard-date { font-size: 10px; color: rgba(255,255,255,.35) !important; white-space: nowrap; text-shadow: none !important; }

    /* ── Pagination ── */
    .hpager { display:flex; align-items:center; justify-content:center; gap:5px; margin-top:40px; flex-wrap:wrap; }
    .hpager a,.hpager span { display:flex; align-items:center; justify-content:center; min-width:38px; height:38px; padding:0 12px; border-radius:var(--rs); font-size:13px; font-weight:600; text-decoration:none; background:var(--card); border:1px solid var(--bdr2); color:var(--muted); transition:background .15s,color .15s,border-color .15s; }
    .hpager a:hover { background:var(--accS); color:var(--white); border-color:var(--acc); }
    .hpager span.cur { background:var(--acc); color:#fff; border-color:var(--acc); }
    .hpager a.arr { font-size:22px; font-weight:300; min-width:44px; color:var(--acc2); border-color:rgba(108,99,255,.3); background:var(--accS); }
    .hpager a.arr:hover { background:var(--acc); color:#fff; border-color:var(--acc); }

    /* ══ GAME HERO ══ */
    .ghero { position:relative; border-radius:20px; overflow:hidden; min-height:340px; border:1px solid var(--bdr); margin-bottom:10px; }
    .ghero-bg { position:absolute; inset:0; background-size:cover; background-position:center 20%; filter:blur(8px) saturate(1.5) brightness(.4); transform:scale(1.08); }
    .ghero-grad { position:absolute; inset:0; background:linear-gradient(160deg,rgba(7,9,14,.2) 0%,rgba(7,9,14,.72) 55%,rgba(7,9,14,.97) 100%); }
    .ghero-body { position:relative; z-index:2; display:flex; gap:28px; padding:44px 44px 40px; min-height:340px; align-items:flex-end; }
    .ghero-cover { width:155px; flex-shrink:0; aspect-ratio:1/1; object-fit:cover; border-radius:12px; border:2px solid rgba(255,255,255,.13); box-shadow:0 20px 50px rgba(0,0,0,.75); display:block; align-self:flex-end; }
    .ghero-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:12px; }
    .ghero-pills { display:flex; flex-wrap:wrap; gap:5px; }
    .gpill { font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; padding:3px 9px; border-radius:20px; text-decoration:none; background:var(--accS); color:var(--acc2); border:1px solid rgba(108,99,255,.22); transition:background .14s,color .14s; }
    .gpill:hover { background:var(--acc); color:#fff; }
    .gpill.date-pill { background:rgba(255,255,255,.06); color:var(--muted); border-color:var(--bdr2); cursor:default; }
    .ghero-title { font-size:clamp(20px,3.2vw,42px); font-weight:900; color:var(--white); line-height:1.06; letter-spacing:-.6px; }
    .ghero-byline { font-size:13px; color:var(--muted); }
    .ghero-byline strong { color:var(--txt); }
    .ghero-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:4px; }
    .ghero-btn { display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-family:var(--f); font-size:13.5px; font-weight:700; padding:11px 22px; border-radius:var(--rs); cursor:pointer; border:none; transition:all .18s var(--ease); }
    .ghero-btn.primary { background:var(--acc); color:#fff; }
    .ghero-btn.primary:hover { background:var(--acc2); transform:translateY(-1px); }
    .ghero-btn.ghost { background:rgba(255,255,255,.07); color:var(--white); border:1px solid var(--bdr2); }
    .ghero-btn.ghost:hover { background:rgba(255,255,255,.13); }

    /* horizontal sticky nav removed - vertical float nav is used instead */
    .g-snav { display:none!important; }

    /* ══ FLOATING VERTICAL NAV ══ */
    #g-floatnav { position:fixed; left:18px; top:50%; transform:translateY(-50%); z-index:9998;
      display:flex; flex-direction:column; align-items:flex-start; gap:0;
      opacity:1; pointer-events:all; transition:none; }

    .gfn-item { display:flex; align-items:center; gap:10px; cursor:pointer; padding:5px 0; position:relative; }

    /* dot */
    .gfn-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.18);
      border:1.5px solid rgba(255,255,255,.1); flex-shrink:0;
      transition:all .2s var(--ease); }
    .gfn-item:hover .gfn-dot,
    .gfn-item.active .gfn-dot { background:var(--acc); border-color:var(--acc); transform:scale(1.4); box-shadow:0 0 0 3px var(--accS); }

    /* label badge - hidden by default, visible on hover OR active */
    .gfn-label { font-size:11px; font-weight:700; letter-spacing:.3px;
      color:var(--muted); background:var(--card); border:1px solid var(--bdr2);
      border-radius:20px; padding:4px 11px; white-space:nowrap;
      opacity:0; transform:translateX(-6px);
      transition:opacity .18s var(--ease), transform .18s var(--ease), color .18s, background .18s;
      box-shadow:0 3px 12px rgba(0,0,0,.4); pointer-events:none; }
    .gfn-item:hover .gfn-label { opacity:1; transform:translateX(0); pointer-events:all; color:var(--white); }
    /* active: badge always visible, accent style */
    .gfn-item.active .gfn-label { opacity:1; transform:translateX(0); pointer-events:all;
      color:var(--acc2); background:var(--accS); border-color:rgba(108,99,255,.3); }

    /* connector line between dots */
    .gfn-line { width:1.5px; height:10px; background:rgba(255,255,255,.07); margin-left:3px; }

    /* ══ SECTIONS ══ */
    .gsec { margin-bottom:14px; scroll-margin-top:calc(var(--nav) + 78px); }
    .gsec-card { background:var(--card); border:1px solid var(--bdr); border-radius:var(--r); overflow:hidden; }
    .gsec-head { display:flex; align-items:center; gap:10px; padding:18px 22px 16px; border-bottom:1px solid var(--bdr); }
    .gsec-icon { width:30px; height:30px; border-radius:8px; background:var(--accS); display:grid; place-items:center; flex-shrink:0; }
    .gsec-icon svg { color:var(--acc2); }
    .gsec-label { font-size:11.5px; font-weight:800; letter-spacing:.8px; text-transform:uppercase; color:var(--white); }
    .gsec-body { padding:20px 22px; }

    /* INFO GRID */
    .ginfo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }
    .ginfo-item { background:var(--surf); border-radius:var(--rs); padding:13px 15px; border:1px solid var(--bdr); }
    .ginfo-k { font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); margin-bottom:5px; }
    .ginfo-v { font-size:14px; font-weight:600; color:var(--white); line-height:1.3; }

    /* DESCRIPTION */
    .gdesc { color:var(--txt); font-size:14.5px; line-height:1.85; }
    .gdesc p { margin-bottom:14px; }
    .gdesc p:last-child { margin-bottom:0; }

    /* SCREENSHOTS */
    .gshots { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; }
    .gshot { width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:var(--rs); border:1px solid var(--bdr); cursor:zoom-in; display:block; transition:transform .2s var(--ease),border-color .2s,box-shadow .2s; }
    .gshot:hover { transform:scale(1.03); border-color:var(--bdr2); box-shadow:0 8px 24px rgba(0,0,0,.5); }

    /* ══ DOWNLOAD SECTION ══ */
    /* Torrent banner */
    .dl-torrent-card { display:flex; align-items:center; justify-content:space-between; gap:14px; background:rgba(240,192,64,.07); border:1px solid rgba(240,192,64,.25); border-radius:var(--rs); padding:14px 18px; margin-bottom:18px; flex-wrap:wrap; }
    .dl-torrent-info { display:flex; align-items:center; gap:10px; }
    .dl-torrent-dot { width:8px; height:8px; border-radius:50%; background:var(--yellow); flex-shrink:0; }
    .dl-torrent-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--yellow); }
    .dl-torrent-desc { font-size:12px; color:var(--muted); }
    .dl-torrent-btn { display:inline-flex; align-items:center; gap:6px; background:var(--yellow); color:#000; font-family:var(--f); font-size:12.5px; font-weight:800; padding:8px 16px; border-radius:var(--rs); text-decoration:none; border:none; cursor:pointer; transition:opacity .14s,transform .14s; flex-shrink:0; }
    .dl-torrent-btn:hover { opacity:.88; transform:translateY(-1px); }

    /* Provider = MegaUp block */
    .dl-provider { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--rs); overflow:hidden; }
    .dl-provider-head { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid var(--bdr); background:var(--card2); }
    .dl-provider-name { display:flex; align-items:center; gap:8px; }
    .dl-prov-dot { width:7px; height:7px; border-radius:50%; background:var(--acc); flex-shrink:0; }
    .dl-prov-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--white); }
    .dl-open-all { display:inline-flex; align-items:center; gap:5px; background:var(--accS); border:1px solid rgba(108,99,255,.25); color:var(--acc2); border-radius:6px; font-family:var(--f); font-size:11px; font-weight:700; padding:5px 11px; cursor:pointer; transition:all .14s; }
    .dl-open-all:hover { background:var(--acc); color:#fff; border-color:var(--acc); }
    .dl-parts { display:flex; flex-wrap:wrap; gap:8px; padding:16px 18px; }
    .dl-part { display:inline-flex; align-items:center; gap:5px; background:var(--card2); border:1px solid var(--bdr2); color:var(--txt); text-decoration:none; font-size:12.5px; font-weight:600; padding:8px 14px; border-radius:var(--rs); transition:all .15s var(--ease); }
    .dl-part:hover { background:var(--acc); border-color:var(--acc); color:#fff; transform:translateY(-1px); }
    /* Uploading badge — animated */
    .dl-uploading { display:inline-flex; align-items:center; gap:7px;
      background:rgba(251,191,36,.07); border:1px solid rgba(251,191,36,.22);
      color:#f0c040; font-size:11.5px; font-weight:700; padding:7px 13px;
      border-radius:20px; letter-spacing:.3px; position:relative; overflow:hidden; }
    .dl-uploading::before { content:''; width:7px; height:7px; border-radius:50%;
      background:#f0c040; animation:pulse 1.2s ease-in-out infinite; flex-shrink:0; }
    /* shimmer sweep */
    .dl-uploading::after { content:''; position:absolute; inset:0;
      background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.06) 50%,transparent 100%);
      background-size:200% 100%; animation:shimmer 1.8s linear infinite; }
    @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
    /* uploading section info bar */
    .dl-uploading-bar { display:flex; align-items:center; gap:10px; padding:14px 18px;
      background:rgba(251,191,36,.04); border-radius:var(--rs);
      border:1px dashed rgba(251,191,36,.2); }
    .dl-uploading-bar .dl-uploading-msg { font-size:12.5px; color:var(--muted); }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }

    /* ══ UPDATES ══ */
    .upd-list { display:flex; flex-direction:column; gap:12px; }
    .upd-item { background:var(--surf); border:1px solid rgba(45,212,160,.18); border-radius:var(--rs); overflow:hidden; }
    .upd-head { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; background:rgba(45,212,160,.05); border-bottom:1px solid rgba(45,212,160,.12); flex-wrap:wrap; gap:8px; }
    .upd-ver { display:inline-flex; align-items:center; gap:6px; }
    .upd-dot { width:7px; height:7px; border-radius:50%; background:var(--green); }
    .upd-ver-label { font-size:13px; font-weight:800; color:var(--green); letter-spacing:.3px; }
    .upd-open-all { display:inline-flex; align-items:center; gap:5px; background:rgba(45,212,160,.1); border:1px solid rgba(45,212,160,.28); color:var(--green); border-radius:6px; font-family:var(--f); font-size:11px; font-weight:700; padding:5px 11px; cursor:pointer; transition:all .14s; }
    .upd-open-all:hover { background:var(--green); color:#000; border-color:var(--green); }
    .upd-parts { display:flex; flex-wrap:wrap; gap:7px; padding:14px 18px; }
    .upd-part { display:inline-flex; align-items:center; gap:5px; background:rgba(45,212,160,.06); border:1px solid rgba(45,212,160,.2); color:var(--green); text-decoration:none; font-size:12.5px; font-weight:600; padding:7px 13px; border-radius:var(--rs); transition:all .15s var(--ease); }
    .upd-part:hover { background:var(--green); color:#000; border-color:var(--green); transform:translateY(-1px); }
    .upd-note { font-size:12px; color:var(--muted); padding:10px 18px 12px; font-style:italic; }

    /* SYS REQ */
    .greq-cols { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    @media(max-width:600px){ .greq-cols { grid-template-columns:1fr; } }
    .greq-side { background:var(--surf); border-radius:var(--rs); border:1px solid var(--bdr); overflow:hidden; }
    .greq-side-head { display:flex; align-items:center; gap:8px; padding:11px 15px; border-bottom:1px solid var(--bdr); background:var(--card2); }
    .greq-dot { width:8px; height:8px; border-radius:50%; background:var(--acc); flex-shrink:0; }
    .greq-dot.rec { background:var(--green); }
    .greq-hl { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:var(--white); }
    .greq-list { display:flex; flex-direction:column; }
    .greq-item { font-size:12.5px; color:var(--txt); padding:9px 15px; border-bottom:1px solid var(--bdr); line-height:1.5; }
    .greq-item:last-child { border-bottom:none; }
    .greq-item strong { color:var(--white); margin-right:3px; }

    /* INSTALL */
    .ginst-list { display:flex; flex-direction:column; gap:10px; }
    .ginst-step { display:flex; gap:14px; align-items:flex-start; }
    .ginst-num { width:26px; height:26px; border-radius:50%; background:var(--acc); color:#fff; font-size:12px; font-weight:800; display:grid; place-items:center; flex-shrink:0; margin-top:2px; }
    .ginst-txt { font-size:13.5px; color:var(--txt); line-height:1.65; padding-top:3px; }

    /* COMMENTS — FastComments renders in an iframe (cross-origin, can't style inside)
       We style the container, iframe dimensions, and inject a postMessage-based
       theme config so FC uses our color scheme. */
    .gcomments { }
    .gcomments #fastcomments-widget,
    .gcomments [id*="fastcomment"],
    #igg-fc-container { display:block!important; width:100%!important; }
    .gcomments iframe,
    #igg-fc-container iframe { display:block!important; width:100%!important; min-height:500px!important;
      border:none!important; border-radius:var(--rs)!important; background:transparent!important; }

    /* LIGHTBOX */
    #igg-lb { display:none; position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,.96);
      flex-direction:column; align-items:center; justify-content:center; gap:0; }
    #igg-lb.on { display:flex; }

    /* main image area */
    #igg-lb-stage { position:relative; display:flex; align-items:center; justify-content:center;
      flex:1; width:100%; min-height:0; padding:48px 64px 12px; box-sizing:border-box; }
    #igg-lb-img { max-width:100%; max-height:100%; border-radius:var(--r);
      object-fit:contain; display:block; transition:opacity .18s; }
    #igg-lb-img.fade { opacity:0; }

    /* close */
    #igg-lb-x { position:absolute; top:14px; right:18px; width:34px; height:34px;
      display:grid; place-items:center; border-radius:50%; cursor:pointer;
      background:rgba(255,255,255,.08); color:#fff; font-size:20px; line-height:1;
      transition:background .15s; z-index:2; }
    #igg-lb-x:hover { background:rgba(255,255,255,.18); }

    /* counter */
    #igg-lb-count { position:absolute; top:18px; left:50%; transform:translateX(-50%);
      font-size:12px; color:rgba(255,255,255,.4); font-weight:600; letter-spacing:.5px; }

    /* prev / next arrows */
    .igg-lb-arr { position:absolute; top:50%; transform:translateY(-50%);
      width:44px; height:44px; border-radius:50%; display:grid; place-items:center;
      background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
      color:#fff; cursor:pointer; font-size:22px; line-height:1; z-index:2;
      transition:background .15s; user-select:none; }
    .igg-lb-arr:hover { background:rgba(255,255,255,.18); }
    #igg-lb-prev { left:14px; }
    #igg-lb-next { right:14px; }

    /* thumbnails strip */
    #igg-lb-thumbs { width:100%; padding:10px 16px 16px; box-sizing:border-box;
      display:flex; gap:7px; justify-content:center; flex-wrap:nowrap;
      overflow-x:auto; scrollbar-width:none; flex-shrink:0; }
    #igg-lb-thumbs::-webkit-scrollbar { display:none; }
    .igg-lb-thumb { width:72px; height:44px; object-fit:cover; border-radius:6px;
      border:2px solid transparent; cursor:pointer; opacity:.5; flex-shrink:0;
      transition:opacity .15s, border-color .15s; }
    .igg-lb-thumb:hover { opacity:.8; }
    .igg-lb-thumb.active { border-color:var(--acc); opacity:1; }

    .igg-foot { text-align:center; padding:36px 0 14px; margin-top:50px; border-top:1px solid var(--bdr); font-size:12px; color:var(--muted); }
    .igg-foot a { color:var(--acc2); text-decoration:none; }
    ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:var(--bg); } ::-webkit-scrollbar-thumb { background:var(--card2); border-radius:3px; } ::-webkit-scrollbar-thumb:hover { background:var(--acc); }
    ::selection { background:var(--acc); color:#fff; }
  `);

  /* ════════════════════
     HELPERS
  ════════════════════ */
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const fmtDate = s => { try { const d=new Date(s); return isNaN(d)?s:d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){ return s; } };

  const SVG = {
    search:  '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    layers:  '<polygon points="12 2 2 7 12 12 22 7"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    book:    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    image:   '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    dl:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    term:    '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    chat:    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    magnet:  '<line x1="6" y1="3" x2="6" y2="8"/><path d="M6 8a6 6 0 0 0 12 0"/><line x1="18" y1="3" x2="18" y2="8"/><line x1="4" y1="3" x2="8" y2="3"/><line x1="16" y1="3" x2="20" y2="3"/>',
    arrow:   '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
    upload:  '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    zap:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  };
  const ico = (k,sz=14) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVG[k]||''}</svg>`;

  /* ── BluemMedia bypass: fetch redirect page, extract real URL ──
     a <a id="download-link"> or a meta refresh or a JS redirect.
     We fetch the page and extract the destination.
  */

  function mkSection(id, iconKey, label) {
    const sec = document.createElement('div');
    sec.className = 'gsec gsec-card'; sec.id = id;
    sec.innerHTML = `<div class="gsec-head"><div class="gsec-icon">${ico(iconKey,15)}</div><div class="gsec-label">${label}</div></div>`;
    const body = document.createElement('div'); body.className = 'gsec-body';
    sec.appendChild(body);
    return { sec, body };
  }

  /* ════════════════════
     NAV
  ════════════════════ */
  document.body.insertAdjacentHTML('afterbegin', `
    <nav id="igg-nav">
      <a href="https://igg-games.com/" class="nl">
        <div class="nl-badge">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2.5"/>
            <path d="M8 10h1M11 10h1M9 8v4M15 8h2M15 11h2"/>
          </svg>
        </div>
        <span class="nl-text">IGG<em>GAMES</em></span>
      </a>
      <div class="n-title">IGG Modern UI &nbsp;<em>V21</em></div>
      <div class="ns">
        <svg class="ns-ico" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${SVG.search}</svg>
        <input id="igg-search" type="text" placeholder="Buscar jogo..." autocomplete="off"
          value="${IS_SEARCH ? decodeURIComponent((QUERY.match(/[?&]s=([^&]*)/) || ['',''])[1]).replace(/\+/g,' ') : ''}"/>
        <span class="ns-kbd">Enter ↵</span>
      </div>
    </nav>
    <div id="igg-root"></div>
    <div id="igg-lb">
      <div id="igg-lb-stage">
        <span id="igg-lb-count"></span>
        <span class="igg-lb-arr" id="igg-lb-prev">‹</span>
        <img id="igg-lb-img" src="" alt=""/>
        <span class="igg-lb-arr" id="igg-lb-next">›</span>
        <span id="igg-lb-x">×</span>
      </div>
      <div id="igg-lb-thumbs"></div>
    </div>
  `);

  document.getElementById('igg-search').addEventListener('keydown', e => {
    if (e.key==='Enter') { const q=e.target.value.trim(); if (q) location.href=`https://igg-games.com/?s=${encodeURIComponent(q)}`; }
  });
  /* ── Lightbox gallery ── */
  const lb       = document.getElementById('igg-lb');
  const lbImg    = document.getElementById('igg-lb-img');
  const lbThumbs = document.getElementById('igg-lb-thumbs');
  const lbCount  = document.getElementById('igg-lb-count');
  let _lbSrcs = [], _lbIdx = 0;

  const lbShow = idx => {
    _lbIdx = (idx + _lbSrcs.length) % _lbSrcs.length;
    lbImg.classList.add('fade');
    setTimeout(() => {
      lbImg.src = _lbSrcs[_lbIdx];
      lbImg.classList.remove('fade');
    }, 140);
    lbCount.textContent = `${_lbIdx + 1} / ${_lbSrcs.length}`;
    lbThumbs.querySelectorAll('.igg-lb-thumb').forEach((t,i) => t.classList.toggle('active', i===_lbIdx));
    // scroll active thumb into view
    const at = lbThumbs.children[_lbIdx];
    if (at) at.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
  };

  const openLb = (src, srcs) => {
    _lbSrcs = srcs || [src];
    // build thumbnails
    lbThumbs.innerHTML = '';
    if (_lbSrcs.length > 1) {
      _lbSrcs.forEach((s, i) => {
        const t = document.createElement('img');
        t.src = s; t.className = 'igg-lb-thumb'; t.loading = 'lazy';
        t.addEventListener('click', () => lbShow(i));
        lbThumbs.appendChild(t);
      });
    }
    lbShow(_lbSrcs.indexOf(src) >= 0 ? _lbSrcs.indexOf(src) : 0);
    lb.classList.add('on');
  };

  document.getElementById('igg-lb-x').onclick = () => lb.classList.remove('on');
  document.getElementById('igg-lb-prev').onclick = e => { e.stopPropagation(); lbShow(_lbIdx - 1); };
  document.getElementById('igg-lb-next').onclick = e => { e.stopPropagation(); lbShow(_lbIdx + 1); };
  lb.addEventListener('click', e => { if (e.target === lb || e.target.id === 'igg-lb-stage') lb.classList.remove('on'); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'ArrowLeft')  lbShow(_lbIdx - 1);
    if (e.key === 'ArrowRight') lbShow(_lbIdx + 1);
    if (e.key === 'Escape')     lb.classList.remove('on');
  });
  const ROOT = document.getElementById('igg-root');

  /* ════════════════════
     HOME
  ════════════════════ */
  if (IS_HOME) buildHome();

  function buildHome() {
    const articles = [...document.querySelectorAll('article')];
    const searchQ  = IS_SEARCH ? decodeURIComponent((QUERY.match(/[?&]s=([^&]*)/) || ['',''])[1]).replace(/\+/g,' ') : '';

    const games = articles.map(art => {
      const titleA = art.querySelector('h2 a[href], h3 a[href]');
      if (!titleA) return null;
      const href  = titleA.href;
      const title = titleA.textContent.trim();
      const thumbEl = art.querySelector('a[href*="free-download"] img, .post-thumbnail img, img[src*="cache"], img[src*="210x210"]') || art.querySelector('img');
      const thumb = thumbEl ? thumbEl.src : '';
      const timeEl = art.querySelector('time');
      const date = timeEl ? (timeEl.getAttribute('datetime') || timeEl.textContent).trim() : '';
      const metaP = art.querySelector('.entry-meta') || [...art.querySelectorAll('p')].find(p => /Posted on/i.test(p.textContent));
      const cats = metaP ? [...metaP.querySelectorAll('a')].map(a=>a.textContent.trim()).filter(c=>c&&c.length<30) : [];
      const excerptEl = art.querySelector('.entry-summary p') || [...art.querySelectorAll('p')].find(p=>p.textContent.trim().length>60&&!/Posted on/i.test(p.textContent));
      const desc = excerptEl ? excerptEl.textContent.trim().slice(0,120) : '';
      return { href, title, thumb, date, cats, desc };
    }).filter(Boolean);

    /* ── PAGINATION ──
       WP injects .page-numbers elements — collect from FIRST nav block only,
       deduplicate by href, render prev/next as styled arrow buttons.
    */
    let pagerHTML = '';
    const pagerSeen = new Set();
    // Prefer a specific nav container; fallback to grabbing the first occurrence
    const pagerCont = document.querySelector('.nav-links, .pagination, .page-nav');
    const rawEls = pagerCont
      ? [...pagerCont.querySelectorAll('.page-numbers')]
      : [...document.querySelectorAll('.page-numbers')];
    // Deduplicate: WP often outputs 2 identical nav blocks
    const pagerEls = rawEls.filter(el => {
      const key = el.href || el.textContent.trim();
      if (pagerSeen.has(key)) return false;
      pagerSeen.add(key); return true;
    });

    if (pagerEls.length) {
      pagerHTML = '<div class="hpager">';
      pagerEls.forEach(el => {
        const txt = el.textContent.trim();
        if (el.classList.contains('dots')) {
          pagerHTML += `<span style="background:none;border:none;color:var(--muted);min-width:auto;padding:0 4px">…</span>`;
        } else if (el.classList.contains('current')) {
          pagerHTML += `<span class="cur">${esc(txt)}</span>`;
        } else if (el.tagName === 'A') {
          if (el.classList.contains('prev')) {
            pagerHTML += `<a href="${esc(el.href)}" class="arr" title="Página anterior">‹</a>`;
          } else if (el.classList.contains('next')) {
            pagerHTML += `<a href="${esc(el.href)}" class="arr" title="Próxima página">›</a>`;
          } else {
            pagerHTML += `<a href="${esc(el.href)}">${esc(txt)}</a>`;
          }
        }
      });
      pagerHTML += '</div>';
    }

    const titleStr = IS_SEARCH ? `Resultados para: <span>"${esc(searchQ)}"</span>` : `Jogos <span>Recentes</span>`;
    const page = document.createElement('div');
    page.className = 'igg-page';
    page.innerHTML = `
      <div class="h-top">
        <div>
          <div class="h-title">${titleStr}</div>
          <div class="h-sub">${games.length} jogo${games.length!==1?'s':''} encontrado${games.length!==1?'s':''}</div>
        </div>
      </div>
      <div class="hgrid">
        ${games.map(g=>`
          <a class="hcard" href="${esc(g.href)}">
            <div class="hcard-img">
              ${g.thumb
                ? `<img src="${esc(g.thumb)}" alt="${esc(g.title)}" loading="lazy"/>`
                : `<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--muted);font-size:36px;">🎮</div>`}
            </div>
            <div class="hcard-spot"></div>
            <div class="hcard-body">
              <div class="hcard-title">${esc(g.title)}</div>
              <div class="hcard-meta">
                <div class="hcard-cats">${g.cats.slice(0,3).map(c=>`<span class="hcard-cat">${esc(c)}</span>`).join('')}</div>
                ${g.date?`<span class="hcard-date">${fmtDate(g.date)}</span>`:''}
              </div>
            </div>
          </a>`).join('')}
      </div>
      ${pagerHTML}
      <div class="igg-foot"><p>© IGG Games — Modern UI by <a href="https://exgamext.netlify.app/" target="_blank" rel="noopener">XCode</a></p></div>
    `;
    ROOT.appendChild(page);

    /* ── 3D tilt + spotlight on cards ── */
    const TILT_MAX = 8; // degrees
    page.querySelectorAll('.hcard').forEach(card => {
      const spot = card.querySelector('.hcard-spot');
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const cx = r.width / 2, cy = r.height / 2;
        const rotY =  ((x - cx) / cx) * TILT_MAX;
        const rotX = -((y - cy) / cy) * TILT_MAX;
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        if (spot) {
          spot.style.setProperty('--mx', `${(x/r.width*100).toFixed(1)}%`);
          spot.style.setProperty('--my', `${(y/r.height*100).toFixed(1)}%`);
        }
      });
      const reset = () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        card.style.transition = 'transform .35s ease, box-shadow .35s ease, border-color .35s';
        setTimeout(() => { card.style.transition = ''; }, 360);
      };
      card.addEventListener('mouseleave', reset);
    });
  }

  /* ════════════════════
     GAME PAGE
  ════════════════════ */
  if (IS_GAME) waitForEl('.entry-content, .post-content, article', buildGame, 6000);

  function waitForEl(sel, cb, timeout) {
    const el = document.querySelector(sel);
    if (el) { cb(el); return; }
    const t0 = Date.now();
    const obs = new MutationObserver(() => {
      const f = document.querySelector(sel);
      if (f) { obs.disconnect(); cb(f); }
      else if (Date.now()-t0>timeout) { obs.disconnect(); cb(null); }
    });
    obs.observe(document.body, { childList:true, subtree:true });
  }

  /* ─── Parse parts from a paragraph element ───
     Returns array of { label, href|null }
     A part with no href = "Uploading…"
  */
  function parseParts(para) {
    const clone = para.cloneNode(true);
    clone.querySelectorAll('strong,b').forEach(s => { if (/^link\s+/i.test(s.textContent)) s.remove(); });

    const parts = [];
    const walk = nodes => {
      [...nodes].forEach(node => {
        if (node.nodeType === 3) {
          const segments = node.textContent.split(/\s*[–\-|]\s*/);
          segments.forEach(seg => {
            seg = seg.trim();
            if (/part\s*\d+/i.test(seg) || /^\d+$/.test(seg)) {
              parts.push({ label: seg || 'Part', href: null });
            }
          });
        } else if (node.nodeType === 1 && node.tagName === 'A') {
          if (/\/tag\/|\/category\//.test(node.href)) return;
          const lbl = node.textContent.trim();
          parts.push({ label: lbl || 'Download', href: node.href });
        } else if (node.childNodes) {
          walk(node.childNodes);
        }
      });
    };
    walk(clone.childNodes);

    // If no parts found, check if the paragraph says "Uploading" — treat as 1 uploading slot
    if (parts.length === 0 && /uploading/i.test(clone.textContent)) {
      parts.push({ label: 'Uploading', href: null });
    }
    return parts;
  }

  function buildGame(EC) {
    /* ── title ── */
    const h1 = document.querySelector('h1.entry-title, h1');
    const TITLE = h1 ? h1.textContent.trim() : document.title.split(/[«–|]/)[0].trim();

    /* ── meta ── */
    const metaP = document.querySelector('.entry-meta')
      || [...document.querySelectorAll('p')].find(p=>/Posted on/i.test(p.textContent)&&p.querySelector('a'));
    const DATE = (() => {
      if (!metaP) return '';
      const t = metaP.querySelector('time');
      return t ? (t.getAttribute('datetime')||t.textContent).trim()
               : (metaP.textContent.match(/(\w+ \d+,\s*\d{4})/)||[''])[1]||'';
    })();
    const CATS = metaP
      ? [...metaP.querySelectorAll('a')].map(a=>({name:a.textContent.trim(),href:a.href})).filter(c=>c.name&&c.name.length<30)
      : [];

    /* ── images ── */
    const AD = ['ubfdrnfd','ggpick','urlbluemedia','gameadult','hentaihero','mangarpg'];
    const allImgs = EC ? [...EC.querySelectorAll('img')].filter(img=>{
      const src=img.src||'';
      if (!src.includes('wp-content/uploads')) return false;
      if (src.includes('iggsvg')||src.includes('igglogo')) return false;
      const pa=img.closest('a');
      if (pa&&AD.some(h=>(pa.href||'').includes(h))) return false;
      return true;
    }) : [];
    const COVER = (() => {
      const g=allImgs.find(i=>{const s=i.src.toLowerCase(); return !s.includes('torrent')&&!s.includes('-crack')&&!s.includes('210x210');});
      return g?g.src:(allImgs[0]?.src||'');
    })();
    const coverImg = allImgs.find(i=>i.src===COVER);
    const SHOTS = allImgs.filter(img=>{
      if (img===coverImg) return false;
      // Only skip if the image is wrapped in a link pointing to a torrent/crack site
      const pa = img.closest('a');
      if (pa) {
        const ph = (pa.href||'').toLowerCase();
        if (AD.some(h=>ph.includes(h))) return false;
        if (/pcgamestorrent|\.torrent$|magnet:/i.test(ph)) return false;
      }
      // Skip iggsvg icons (already filtered but double-check)
      const s = img.src.toLowerCase();
      if (s.includes('iggsvg') || s.includes('igglogo')) return false;
      return true;
    });

    /* ── description ── */
    const DESCS = EC ? [...EC.querySelectorAll('p')].filter(p=>{
      const t=p.textContent.trim();
      if (t.length<80) return false;
      if (/^(cracked|free download|direct link|all links are|see instructions)/i.test(t)) return false;
      if (/UPDATE\s+v[\d.]+/i.test(t)) return false;  // update lines
      if (/^Posted on/i.test(t)) return false;          // date/category meta line
      if (p.querySelector('img[src*="iggsvg"]')) return false;
      if (AD.some(h=>t.includes(h))) return false;
      const links=[...p.querySelectorAll('a')];
      // Skip SEO tag paragraphs
      if (links.length>2&&links.every(a=>/\/tag\//.test(a.href))) return false;
      // Skip download link paragraphs (have "Link X:" strong tag)
      if (p.querySelector('strong,b') && /^link\s+/i.test((p.querySelector('strong,b')||{}).textContent||'')) return false;
      // Skip paragraphs that contain proxy/redirect download links (urlbluemedia, etc.)
      if (links.some(a => /urlbluemedia|urlgeni|short\.am|shortlinks/i.test(a.href))) return false;
      // Skip paragraphs that are purely "X or Y or Z" download host lists
      if (links.length>=3 && /\bor\b.*\bor\b/i.test(t) && links.every(a=>a.href&&!/tag|category/.test(a.href))) return false;
      return true;
    }).slice(0,12) : [];

    /* ── info ── */
    const INFO=[];
    if (EC) EC.querySelectorAll('p').forEach(p=>{
      if (!p.querySelector('img[src*="iggsvg"]')) return;
      const txt=p.textContent.trim();
      [[/Developer[:\s]+(.+)/i,'Developer'],[/Publisher[:\s]+(.+)/i,'Publisher'],
       [/Release\s*Date[:\s]+(.+)/i,'Lançamento'],[/Genre[:\s]+(.+)/i,'Gênero']].forEach(([re,label])=>{
        const m=txt.match(re);
        if (m&&!INFO.find(r=>r.k===label)) INFO.push({k:label,v:m[1].trim()});
      });
    });

    /* ════════════════════════════════════════════
       DOWNLOAD PARSING
       We scan all <strong>/<b> with "Link …:" text.
       ─ TORRENT: host name contains "TORRENT" (case-insensitive)
       ─ MEGAUP:  host name matches /megaup/i (show with parts)
       ─ OTHERS:  ignored (not shown)

       UPDATE lines: paragraphs starting with "UPDATE vX.X.X:"
       ─ From each update paragraph, extract only the MegaUp link (text "MegaUp" or "MegaUp.net")
    ════════════════════════════════════════════ */
    let TORRENT = null;   // { label, href }
    let MEGAUP  = null;   // { parts: [{label, href|null}] }
    const UPDATES = [];   // [ { ver, megaLink: {label,href}|null } ]

    if (EC) {
      /* scan <strong> "Link X:" blocks */
      [...EC.querySelectorAll('strong, b')].forEach(s => {
        const raw = s.textContent.trim();
        if (!/^link\s+/i.test(raw)) return;
        const host = raw.replace(/^link\s+/i,'').replace(/:?\s*$/,'').trim();
        if (!host || host.length > 100) return;

        const para = s.closest('p') || s.parentElement;
        if (!para) return;

        if (/torrent/i.test(host)) {
          // First link in para = torrent link
          const a = para.querySelector('a[href]');
          if (a && !TORRENT) TORRENT = { label: host, href: a.href };
        } else if (/megaup/i.test(host)) {
          // Parse all parts (including uploading ones)
          const parts = parseParts(para);
          // Also check next sibling paragraph if it has no new Link header
          const nx = para.nextElementSibling;
          if (nx && !nx.querySelector('strong,b')) {
            parseParts(nx).forEach(p => parts.push(p));
          }
          if (!MEGAUP && parts.length) MEGAUP = { parts };
          else if (!MEGAUP && /uploading/i.test(para.textContent)) MEGAUP = { parts:[{label:'Uploading',href:null}] };
        }
      });

      /* scan UPDATE paragraphs
         Two possible structures on the site:
         A) Single <p>: "UPDATE v1.2.3: [MegaUp](url) or [Mega.nz](url)..."
         B) Two adjacent <p>s: first = "UPDATE v1.2.3:", second = "[MegaUp](url) or ..."
         We handle both by also checking the next sibling <p> for the MegaUp link.
      */
      const allParas = [...EC.querySelectorAll('p')];
      allParas.forEach((p, idx) => {
        const txt = p.textContent.trim();
        if (!/UPDATE\s+v[\d.]+/i.test(txt)) return;
        const ver = (txt.match(/UPDATE\s+(v[\d.]+)/i)||['','Update'])[1];

        // Collect candidate paragraphs: the update <p> itself + up to 2 next siblings
        // (in case links are on separate line(s))
        const candidates = [p];
        for (let i = 1; i <= 2; i++) {
          const sib = allParas[idx + i];
          if (!sib) break;
          const sibTxt = sib.textContent.trim();
          // Stop if the next sibling is another UPDATE line or a new "Link X:" block
          if (/UPDATE\s+v[\d.]+/i.test(sibTxt)) break;
          if (/^link\s+/i.test(sib.querySelector('strong,b')?.textContent || '')) break;
          candidates.push(sib);
        }

        // Find MegaUp link across all candidate paragraphs
        let megaLink = null;
        for (const cand of candidates) {
          const found = [...cand.querySelectorAll('a[href]')].find(a => /megaup/i.test(a.textContent.trim()));
          if (found) { megaLink = { label: 'MegaUp', href: found.href }; break; }
        }
        UPDATES.push({ ver, megaLink });
      });
    }

    /* ── sys req ── */
    const SYS={min:[],rec:[]};
    if (EC) {
      let mode=null;
      [...EC.querySelectorAll('li,p > strong,h2,h3,p')].forEach(el=>{
        const t=el.textContent.trim();
        if (/^minimum[:\s]*$/i.test(t)) { mode='min'; return; }
        if (/^recommended[:\s]*$/i.test(t)) { mode='rec'; return; }
        if (/^(previous|next|download link|system req)/i.test(t)) { mode=null; return; }
        if (el.tagName==='LI'&&mode&&t.length>2&&(t.includes(':')||/^requires/i.test(t)))
          (mode==='min'?SYS.min:SYS.rec).push(t);
      });
    }

    /* ── install steps ── */
    const STEPS = EC ? [...EC.querySelectorAll('ol li')].map(li=>li.innerHTML) : [];

    /* ── FastComments detection ──
       IGG embeds FastComments via:
         <script src="cdn.fastcomments.com/js/embed.min.js"></script>
         <div id="fastcomments-widget"></div>
         <script>window.FastCommentsUI(el, { tenantId:'XXX', urlId:'...' })</script>
       The widget is already rendered but hidden by our body>* rule.
       We extract tenantId from inline scripts and re-init in our container.
    */
    // Use intercepted FC config (captured before page scripts ran)
    const FC_TENANT = _fcConfig?.tenantId || null;
    const FC_URLID  = _fcConfig?.urlId    || null;
    // Hide original FC container if it exists (we re-render ours)
    document.querySelectorAll('#fastcomments-widget,[id*="fastcomment"],[class*="fastcomment"]').forEach(el=>{
      el.style.setProperty('display','none','important');
    });

    /* ══════════════════════════════════
       BUILD UI
    ══════════════════════════════════ */
    const page = document.createElement('div');
    page.className = 'igg-page';

    /* HERO */
    const hero = document.createElement('div');
    hero.className = 'ghero';
    if (COVER) hero.innerHTML=`<div class="ghero-bg" style="background-image:url('${esc(COVER)}')"></div>`;
    hero.innerHTML+=`<div class="ghero-grad"></div>
      <div class="ghero-body">
        ${COVER?`<img class="ghero-cover" src="${esc(COVER)}" alt="${esc(TITLE)}"/>`:''}
        <div class="ghero-info">
          <div class="ghero-pills">
            ${CATS.map(c=>`<a class="gpill" href="${esc(c.href)}">${esc(c.name)}</a>`).join('')}
          </div>
          <div class="ghero-title">${esc(TITLE)}</div>
          <div class="ghero-actions">
            <a class="ghero-btn primary" href="#sec-dl">${ico('dl',15)} Baixar Agora</a>
            ${SHOTS.length>0?`<a class="ghero-btn ghost" href="#sec-shots">${ico('image',15)} Screenshots</a>`:''}
          </div>
        </div>
      </div>`;
    page.appendChild(hero);

    /* CENTER */
    const center = document.createElement('div');
    center.className = 'igg-center';
    page.appendChild(center);

    /* STICKY NAV */
    const snav = document.createElement('div');
    snav.className = 'g-snav';
    const snavDefs = [
      ['sec-info','info','Informações'],
      ['sec-desc','book','Sobre o Jogo'],
      ['sec-dl','dl','Downloads'],
      ...(UPDATES.length?[['sec-upd','refresh','Updates']]:[]),
      ...(SYS.min.length||SYS.rec.length?[['sec-req','monitor','Requisitos']]:[]),
      ['sec-cmt','chat','Comentários'],
    ];
    snav.innerHTML = snavDefs.map(([id,icon,label])=>`<a href="#${id}">${ico(icon,13)} ${label}</a>`).join('');
    center.appendChild(snav);

    /* ── Floating vertical nav ── */
    const floatNav = document.createElement('div');
    floatNav.id = 'g-floatnav';
    document.body.appendChild(floatNav);

    const secObs = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if (en.isIntersecting) {
          snav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+en.target.id));
          floatNav.querySelectorAll('.gfn-item').forEach(el=>el.classList.toggle('active',el.dataset.target===en.target.id));
        }
      });
    },{ rootMargin:'-80px 0px -60% 0px' });

    // Float nav always visible on game pages

    /* ─ INFORMAÇÕES ─ */
    const infoSec = mkSection('sec-info','info','Informações');
    const infoGrid = document.createElement('div'); infoGrid.className='ginfo-grid';
    const infoRows=[];
    if (DATE) infoRows.push({k:'Data',v:fmtDate(DATE)});
    // Show all INFO rows including Gênero (from iggsvg tag), but NOT the CATS duplicates
    INFO.forEach(r=> infoRows.push({k:r.k,v:r.v}));
    infoRows.forEach(r=>{
      const item=document.createElement('div'); item.className='ginfo-item';
      item.innerHTML=`<div class="ginfo-k">${esc(r.k)}</div><div class="ginfo-v">${esc(r.v)}</div>`;
      infoGrid.appendChild(item);
    });
    infoSec.body.appendChild(infoGrid);
    center.appendChild(infoSec.sec);
    secObs.observe(infoSec.sec);

    // Populate floatNav (runs after all snavDefs are known)
    const _buildFloatNav = () => {
      floatNav.innerHTML = '';
      snavDefs.forEach(([id, iconKey, label], idx) => {
        if (idx > 0) {
          const line = document.createElement('div'); line.className = 'gfn-line';
          floatNav.appendChild(line);
        }
        const item = document.createElement('div');
        item.className = 'gfn-item'; item.dataset.target = id;
        item.innerHTML = `<div class="gfn-dot"></div><span class="gfn-label">${label}</span>`;
        item.addEventListener('click', () => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
        });
        floatNav.appendChild(item);
      });
    };
    _buildFloatNav();

    /* ─ SOBRE O JOGO ─ */
    if (DESCS.length>0) {
      const descSec=mkSection('sec-desc','book','Sobre o Jogo');
      const div=document.createElement('div'); div.className='gdesc';
      DESCS.forEach(p=>{
        const pp=document.createElement('p');
        [...p.childNodes].forEach(node=>{
          if (node.nodeType===1 && node.tagName==='IMG') {
            // Include game images inline in description, but skip ad/iggsvg images
            const src=(node.src||'').toLowerCase();
            if (src.includes('iggsvg')||src.includes('igglogo')) return;
            const par=node.closest('a');
            if (par&&AD.some(h=>(par.href||'').includes(h))) return;
            const img=node.cloneNode(true);
            img.style.cssText='max-width:100%;height:auto;border-radius:8px;margin:10px 0;display:block;';
            pp.appendChild(img);
            return;
          }
          pp.appendChild(node.cloneNode(true));
        });
        if (pp.textContent.trim()||pp.querySelector('img')) div.appendChild(pp);
      });
      descSec.body.appendChild(div);
      center.appendChild(descSec.sec);
      secObs.observe(descSec.sec);
    }

    /* ─ SCREENSHOTS ─ */
    if (SHOTS.length>0) {
      const shotSec=mkSection('sec-shots','image','Screenshots');
      shotSec.sec.id='sec-shots';
      const grid=document.createElement('div'); grid.className='gshots';
      const allShotSrcs = SHOTS.map(img=>img.src);
      SHOTS.forEach(img=>{
        const i=document.createElement('img');
        i.src=img.src; i.className='gshot'; i.loading='lazy';
        i.addEventListener('click',()=>openLb(i.src, allShotSrcs));
        grid.appendChild(i);
      });
      shotSec.body.appendChild(grid);
      center.appendChild(shotSec.sec);
    }

    /* ─ DOWNLOADS ─ */
    const dlSec=mkSection('sec-dl','dl','Downloads');
    dlSec.sec.id='sec-dl';
    const dlBody=dlSec.body;

    /* Torrent banner */
    if (TORRENT) {
      const card=document.createElement('div'); card.className='dl-torrent-card';
      card.innerHTML=`
        <div class="dl-torrent-info">
          <span class="dl-torrent-dot"></span>
          <div>
            <div class="dl-torrent-label">Torrent</div>
            <div class="dl-torrent-desc">Requer cliente BitTorrent (qBittorrent, uTorrent…)</div>
          </div>
        </div>
        <a class="dl-torrent-btn" href="${esc(TORRENT.href)}" target="_blank" rel="noopener">
          ${ico('magnet',14)} Baixar Torrent
        </a>`;
      dlBody.appendChild(card);
    }

    /* MegaUp provider */
    if (MEGAUP) {
      const prov=document.createElement('div'); prov.className='dl-provider';
      const head=document.createElement('div'); head.className='dl-provider-head';
      // Count real (non-uploading) links
      const realLinks=MEGAUP.parts.filter(p=>p.href);
      const nm=document.createElement('div'); nm.className='dl-provider-name';
      nm.innerHTML=`<span class="dl-prov-dot"></span><span class="dl-prov-label">MegaUp.net</span>`;
      head.appendChild(nm);
      if (realLinks.length>1) {
        const btn=document.createElement('button'); btn.className='dl-open-all';
        btn.innerHTML=`${ico('zap',11)} Abrir Todos`;
        btn.addEventListener('click',()=>realLinks.forEach(l=>{
          window.open(l.href, '_blank');
        }));
        head.appendChild(btn);
      }
      prov.appendChild(head);

      const realCount = MEGAUP.parts.filter(p=>p.href).length;
      if (realCount === 0) {
        // All uploading — show info bar instead of part buttons
        const bar = document.createElement('div'); bar.className='dl-uploading-bar';
        bar.innerHTML=`<span class="dl-uploading">${ico('upload',12)} Enviando arquivos…</span><span class="dl-uploading-msg">Os links de download estão sendo processados. Volte em breve.</span>`;
        prov.appendChild(bar);
      } else {
        const parts=document.createElement('div'); parts.className='dl-parts';
        let partIdx = 0;
        MEGAUP.parts.forEach((p,i)=>{
          if (p.href) {
            partIdx++;
            const btn=document.createElement('a'); btn.className='dl-part';
            btn.href=p.href; btn.target='_blank'; btn.rel='noopener';
            const lbl=p.label&&p.label.trim()&&!/^download$/i.test(p.label)?p.label:`Part ${partIdx}`;
            btn.innerHTML=`${ico('arrow',12)} ${esc(lbl)}`;
            parts.appendChild(btn);
          } else {
            const badge=document.createElement('span'); badge.className='dl-uploading';
            badge.textContent='Uploading…';
            parts.appendChild(badge);
          }
        });
        prov.appendChild(parts);
      }
      dlBody.appendChild(prov);
    } else if (!TORRENT) {
      dlBody.innerHTML=`<p style="color:var(--muted);font-size:13.5px;">Nenhum link de download encontrado.</p>`;
    }

    center.appendChild(dlSec.sec);
    secObs.observe(dlSec.sec);

    /* ─ UPDATES ─ */
    if (UPDATES.length>0) {
      const updSec=mkSection('sec-upd','refresh','Updates & Fix');
      updSec.sec.id='sec-upd';
      const list=document.createElement('div'); list.className='upd-list';

      UPDATES.forEach(u=>{
        const item=document.createElement('div'); item.className='upd-item';
        const head=document.createElement('div'); head.className='upd-head';
        const verEl=document.createElement('div'); verEl.className='upd-ver';
        verEl.innerHTML=`<span class="upd-dot"></span><span class="upd-ver-label">${esc(u.ver)}</span>`;
        head.appendChild(verEl);
        item.appendChild(head);

        const partsEl=document.createElement('div'); partsEl.className='upd-parts';
        if (u.megaLink) {
          const a=document.createElement('a'); a.className='upd-part';
          a.href=u.megaLink.href; a.target='_blank'; a.rel='noopener';
          a.innerHTML=`${ico('arrow',12)} MegaUp`;
          partsEl.appendChild(a);
        } else {
          const badge=document.createElement('span'); badge.className='dl-uploading';
          badge.textContent='Aguardando upload…';
          partsEl.appendChild(badge);
        }
        item.appendChild(partsEl);
        list.appendChild(item);
      });
      updSec.body.appendChild(list);
      center.appendChild(updSec.sec);
      secObs.observe(updSec.sec);
    }

    /* ─ REQUISITOS ─ */
    if (SYS.min.length>0||SYS.rec.length>0) {
      const reqSec=mkSection('sec-req','monitor','Requisitos do Sistema');
      reqSec.sec.id='sec-req';
      const cols=document.createElement('div'); cols.className='greq-cols';
      ['min','rec'].forEach(t=>{
        const col=document.createElement('div'); col.className='greq-side';
        col.innerHTML=`<div class="greq-side-head"><span class="greq-dot${t==='rec'?' rec':''}"></span><span class="greq-hl">${t==='min'?'Mínimo':'Recomendado'}</span></div>`;
        const lst=document.createElement('div'); lst.className='greq-list';
        (SYS[t].length?SYS[t]:['—']).forEach(item=>{
          const div=document.createElement('div'); div.className='greq-item';
          div.innerHTML=item.replace(/^([^:]+):/,'<strong>$1:</strong>');
          lst.appendChild(div);
        });
        col.appendChild(lst); cols.appendChild(col);
      });
      reqSec.body.appendChild(cols);
      center.appendChild(reqSec.sec);
      secObs.observe(reqSec.sec);
    }

    /* ─ COMO INSTALAR ─ */
    if (STEPS.length>0) {
      const instSec=mkSection('sec-inst','term','Como Instalar');
      const lst=document.createElement('div'); lst.className='ginst-list';
      STEPS.forEach((s,i)=>{
        const step=document.createElement('div'); step.className='ginst-step';
        step.innerHTML=`<div class="ginst-num">${i+1}</div><div class="ginst-txt">${s}</div>`;
        lst.appendChild(step);
      });
      instSec.body.appendChild(lst);
      center.appendChild(instSec.sec);
    }

    /* ─ COMENTÁRIOS ─ */
    const cSec = mkSection('sec-cmt','chat','Comentários');
    cSec.sec.id = 'sec-cmt';
    center.appendChild(cSec.sec);
    secObs.observe(cSec.sec);

    // Helper: create fresh FC container and init widget
    const _initFC = (tenant, urlId) => {
      const fcDiv = document.createElement('div');
      fcDiv.id = 'igg-fc-container';
      fcDiv.style.cssText = 'min-height:120px;';
      cSec.body.appendChild(fcDiv);
      const tryInit = () => {
        // Use original FC function (we proxied it, restore it)
        const fcFn = _fcOriginal || window.FastCommentsUI;
        if (fcFn) {
          fcFn(fcDiv, {
            ...(typeof _fcConfig === 'object' ? _fcConfig : {}),
            tenantId: tenant,
            urlId: urlId || location.href,
            url: location.href,
            pageTitle: document.title,
            // FC theming config — dark mode matching our design
            customCSS: [
              'body,#app{background:transparent!important;color:#c8cad4!important;font-family:Outfit,sans-serif!important;}',
              '.comment-area{background:#161929!important;border:1px solid #1e2235!important;border-radius:10px!important;margin-bottom:10px!important;padding:14px 16px!important;}',
              '.comment-author{color:#ffffff!important;font-weight:700!important;font-size:13px!important;}',
              '.comment-date{color:#5b6080!important;font-size:11px!important;}',
              '.comment-body{color:#c8cad4!important;font-size:13.5px!important;line-height:1.75!important;}',
              'textarea,input[type="text"],input[type="email"]{background:#161929!important;border:1.5px solid #1e2235!important;border-radius:8px!important;color:#fff!important;font-family:Outfit,sans-serif!important;}',
              'textarea:focus,input:focus{border-color:#6c63ff!important;box-shadow:0 0 0 3px rgba(108,99,255,.18)!important;}',
              'button[type="submit"],.fc-button{background:#6c63ff!important;border:none!important;border-radius:8px!important;color:#fff!important;font-weight:700!important;font-family:Outfit,sans-serif!important;}',
              'a{color:#a78bfa!important;}',
              '.fc-pagination button{background:#161929!important;border:1px solid #1e2235!important;color:#c8cad4!important;border-radius:6px!important;}',
            ].join(''),
          });
        } else {
          // FC SDK not ready yet — wait for it
          setTimeout(tryInit, 200);
        }
      };
      tryInit();
    };

    if (FC_TENANT) {
      // Re-init FC widget from scratch in our container.
      // We never move the existing FC element — that destroys the iframe context.
      _initFC(FC_TENANT, FC_URLID);

    } else {
      // FC not detected yet — use MutationObserver to catch when it appears
      const fcObs = new MutationObserver(() => {
        const el = document.querySelector('[id*="fastcomment"],[class*="fastcomment"],iframe[src*="fastcomments"]');
        if (el && !cSec.body.contains(el)) {
          fcObs.disconnect();
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          cSec.body.appendChild(el);
        }
        // Also re-check scripts for tenantId (may load after us)
        if (!FC_TENANT) {
          [...document.querySelectorAll('script')].forEach(s => {
            const txt = s.textContent || '';
            if (txt.includes('tenantId')) {
              const tm = txt.match(/tenantId['"]?\s*[:=]\s*['"]([^'"]+)['"]/);
              const um = txt.match(/urlId['"]?\s*[:=]\s*['"]([^'"]+)['"]/);
              if (tm) { FC_TENANT = tm[1]; FC_URLID = um?.[1] || null; }
            }
          });
          if (FC_TENANT) { fcObs.disconnect(); _initFC(FC_TENANT, FC_URLID); }
        }
      });
      fcObs.observe(document.body, { childList:true, subtree:true });
      // Stop observing after 10s to avoid memory leak
      setTimeout(() => {
        fcObs.disconnect();
        if (!cSec.body.children.length) {
          cSec.body.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:12px 0;">Comentários não disponíveis.</p>';
        }
      }, 10000);
    }

    page.insertAdjacentHTML('beforeend','<div class="igg-foot"><p>© IGG Games — Modern UI by <a href="https://exgamext.netlify.app/" target="_blank" rel="noopener">XCode</a></p></div>');
    ROOT.appendChild(page);
  }

})();