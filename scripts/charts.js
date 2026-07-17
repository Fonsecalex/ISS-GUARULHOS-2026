/**
 * scripts/charts.js — gráficos em <canvas> puro (sem bibliotecas externas).
 * Fornece: barChart, lineChart, donutChart. Todos desenham em alta resolução
 * (devicePixelRatio) e são responsivos à largura do container.
 */
(function (global) {
  'use strict';

  function setupCanvas(canvas, heightCss) {
    const dpr = window.devicePixelRatio || 1;
    const widthCss = canvas.parentElement.clientWidth;
    canvas.style.width = widthCss + 'px';
    canvas.style.height = heightCss + 'px';
    canvas.width = Math.round(widthCss * dpr);
    canvas.height = Math.round(heightCss * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: widthCss, h: heightCss };
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /** Gráfico de barras verticais simples: labels[], values[] */
  function barChart(canvas, labels, values, opts) {
    opts = opts || {};
    const { ctx, w, h } = setupCanvas(canvas, opts.height || 160);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(1, ...values);
    const padBottom = 22, padTop = 10;
    const usableH = h - padBottom - padTop;
    const barGap = 10;
    const barW = (w - barGap * (values.length + 1)) / values.length;
    const color = opts.color || cssVar('--gold') || '#C9A227';
    const textColor = cssVar('--ink-2') || '#888';

    values.forEach((v, i) => {
      const barH = max > 0 ? (v / max) * usableH : 0;
      const x = barGap + i * (barW + barGap);
      const y = padTop + (usableH - barH);
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, colorAlpha(color, 0.55));
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, barW, Math.max(barH, 2), 5);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i] || '', x + barW / 2, h - 6);
    });
  }

  /** Gráfico de linha: labels[], values[] */
  function lineChart(canvas, labels, values, opts) {
    opts = opts || {};
    const { ctx, w, h } = setupCanvas(canvas, opts.height || 160);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const padBottom = 22, padTop = 14, padX = 8;
    const usableH = h - padBottom - padTop;
    const usableW = w - padX * 2;
    const stepX = values.length > 1 ? usableW / (values.length - 1) : 0;
    const color = opts.color || cssVar('--ledger-blue') || '#3E6AE1';

    const points = values.map((v, i) => ({
      x: padX + i * stepX,
      y: padTop + usableH - ((v - min) / (max - min || 1)) * usableH
    }));

    // área preenchida
    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + usableH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padTop + usableH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + usableH);
    grad.addColorStop(0, colorAlpha(color, 0.28));
    grad.addColorStop(1, colorAlpha(color, 0.02));
    ctx.fillStyle = grad;
    ctx.fill();

    // linha
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // pontos
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // labels eixo x (mostra só alguns para não poluir)
    const textColor = cssVar('--ink-2') || '#888';
    ctx.fillStyle = textColor;
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const showEvery = Math.ceil(labels.length / 6);
    labels.forEach((l, i) => { if (i % showEvery === 0) ctx.fillText(l, points[i].x, h - 6); });
  }

  /** Gráfico de rosca (donut): values[] com cores[] correspondentes */
  function donutChart(canvas, values, colors, opts) {
    opts = opts || {};
    const size = opts.size || 140;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    canvas.width = size * dpr; canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const total = values.reduce((a, b) => a + b, 0) || 1;
    const cx = size / 2, cy = size / 2, rOuter = size / 2 - 4, rInner = rOuter * (opts.thickness || 0.62);
    let angle = -Math.PI / 2;

    values.forEach((v, i) => {
      const slice = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, angle, angle + slice);
      ctx.arc(cx, cy, rInner, angle + slice, angle, true);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      angle += slice;
    });

    if (opts.centerText) {
      ctx.fillStyle = cssVar('--ink-0') || '#14181F';
      ctx.font = '700 20px -apple-system, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(opts.centerText, cx, cy - (opts.centerSub ? 8 : 0));
      if (opts.centerSub) {
        ctx.font = '600 10px -apple-system, sans-serif';
        ctx.fillStyle = cssVar('--ink-2') || '#888';
        ctx.fillText(opts.centerSub, cx, cy + 12);
      }
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function colorAlpha(hex, alpha) {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  global.Charts = { barChart, lineChart, donutChart, colorAlpha };
})(window);
