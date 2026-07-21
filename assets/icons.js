/**
 * assets/icons.js — biblioteca de ícones SVG vetoriais inline (sem dependências externas)
 */
(function (global) {
  'use strict';
  const PATHS = {
    mic: 'M9 2h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z M5 11a7 7 0 0 0 14 0 M12 18v4 M8 22h8',
    notebook: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M9 3v18 M4 7h1 M4 12h1 M4 17h1',
    home: 'M3 11.5 12 4l9 7.5 M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9',
    calendar: 'M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z M16 3v4 M8 3v4 M3 10h18',
    book: 'M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z M17 7h2a1 1 0 0 1 1 1v12',
    chart: 'M4 20V10 M10 20V4 M16 20v-7 M4 20h16',
    timer: 'M12 8v5l3 2 M12 3v2 M9 3h6 M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    checklist: 'M9 6h11 M9 12h11 M9 18h11 M4 6l1 1 2-2 M4 12l1 1 2-2 M4 18l1 1 2-2',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 13.5a7.9 7.9 0 0 0 0-3l1.9-1.4-2-3.4-2.2.8a8 8 0 0 0-2.6-1.5L14 2h-4l-.5 2.3a8 8 0 0 0-2.6 1.5l-2.2-.8-2 3.4L4.6 10a7.9 7.9 0 0 0 0 3l-1.9 1.5 2 3.4 2.2-.8a8 8 0 0 0 2.6 1.5L10 22h4l.5-2.3a8 8 0 0 0 2.6-1.5l2.2.8 2-3.4Z',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35',
    plus: 'M12 5v14 M5 12h14',
    'chevron-right': 'M9 6l6 6-6 6',
    'chevron-left': 'M15 6l-6 6 6 6',
    close: 'M6 6l12 12 M18 6 6 18',
    check: 'M5 13l4 4L19 7',
    flame: 'M12 2c1 4-4 5-4 9a4 4 0 0 0 8 0c0-1-1-2-1-2 2 1 3 3 3 5a6 6 0 1 1-12 0c0-4 3-5 4-9 0 3 2 3 2-3Z',
    star: 'M12 3.5l2.5 5.2 5.7.6-4.3 3.9 1.2 5.6L12 16l-5.1 2.8 1.2-5.6-4.3-3.9 5.7-.6Z',
    trophy: 'M8 21h8 M12 17v4 M7 4h10v4a5 5 0 0 1-10 0V4Z M7 5H4a3 3 0 0 0 3 4 M17 5h3a3 3 0 0 1-3 4',
    bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M12 1v3 M12 20v3 M4.2 4.2l2.1 2.1 M17.7 17.7l2.1 2.1 M1 12h3 M20 12h3 M4.2 19.8l2.1-2.1 M17.7 6.3l2.1-2.1',
    moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z',
    dots: 'M5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z M19 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 14h10l1-14 M10 11v6 M14 11v6',
    edit: 'M4 20h4l11-11-4-4L4 16v4Z M14 6l4 4',
    download: 'M12 3v13 M7 12l5 5 5-5 M4 21h16',
    upload: 'M12 21V8 M7 12l5-5 5 5 M4 3h16',
    refresh: 'M4 12a8 8 0 0 1 14-5.3L21 9 M20 12a8 8 0 0 1-14 5.3L3 15 M17 3v4h-4 M7 21v-4h4',
    play: 'M8 5v14l11-7Z',
    pause: 'M7 5h4v14H7Z M13 5h4v14h-4Z',
    stop: 'M6 6h12v12H6Z',
    back: 'M20 12H6 M12 6l-6 6 6 6',
    filter: 'M4 6h16 M7 12h10 M10 18h4',
    building: 'M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16 M13 21V9h5a1 1 0 0 1 1 1v11 M8 7h1 M8 11h1 M8 15h1 M3 21h18',
    bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
    ledger: 'M4 4h16v16H4Z M4 9h16 M8 4v16',
    scale: 'M12 3v18 M5 7h14 M5 7 2 13a3 3 0 0 0 6 0L5 7Z M19 7l-3 6a3 3 0 0 0 6 0l-3-6Z M8 21h8',
    columns: 'M4 21V10 M10 21V4 M16 21v-7 M22 21H2',
    flag: 'M5 21V4 M5 4h13l-3 4 3 4H5',
    text: 'M5 6h14 M5 12h14 M5 18h9',
    chip: 'M8 4v3 M16 4v3 M8 17v3 M16 17v3 M4 8h3 M4 16h3 M17 8h3 M17 16h3 M7 7h10v10H7Z',
    shield: 'M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6Z',
    puzzle: 'M9 4h4v2a2 2 0 0 0 4 0V4h4v4h-2a2 2 0 0 0 0 4h2v4h-4v-2a2 2 0 0 0-4 0v2H9v-4H7a2 2 0 0 1 0-4h2Z',
    coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v10 M9 9.5c0-1 1-1.8 3-1.8s3 .8 3 1.8-1 1.5-3 1.8-3 .8-3 1.9 1 1.8 3 1.8 3-.8 3-1.8',
    briefcase: 'M4 8h16v11H4Z M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2 M4 13h16',
    gavel: 'M14 5l5 5 M8 11l5 5-6 6-5-5Z M2 22h9 M17 4l3 3-8 8-3-3Z',
    folder: 'M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z',
    sitemap: 'M12 3h4v4h-4Z M4 17h4v4H4Z M16 17h4v4h-4Z M14 5H8a2 2 0 0 0-2 2v7 M18 7v7',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 3',
    seal: 'M12 3l2.2 1.3 2.5-.4 1 2.4 2.2 1.3-.4 2.5 1.3 2.2-1.3 2.2.4 2.5-2.2 1.3-1 2.4-2.5-.4L12 21l-2.2-1.3-2.5.4-1-2.4-2.2-1.3.4-2.5L3.2 12l1.3-2.2-.4-2.5 2.2-1.3 1-2.4 2.5.4Z M9 12l2 2 4-4'
  };
  function icon(name, opts) {
    const o = opts || {};
    const d = PATHS[name] || PATHS.dots;
    const fill = o.fill || 'none';
    const stroke = o.stroke === false ? 'none' : 'currentColor';
    return `<svg viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${o.weight || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
      d.split(' M').map((seg, i) => `<path d="${i === 0 ? seg : 'M' + seg}"/>`).join('')
    }</svg>`;
  }
  global.Icon = icon;
})(window);
