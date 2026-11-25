// 渲染：全部手绘 Canvas 矢量画，没有一张外部图片。
import { VIEW_W, VIEW_H, INGREDIENTS, ING_BY_ID, RECIPE_BY_ID, LAYOUT } from './config.js';
import { activeOrder, currentStep, SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './world.js';

const CREAM = '#FFF3D6';
const BROWN = '#5E3A17';
const WOOD = '#B07A45';
const WOOD_DARK = '#8A5A2B';
const RED = '#E4572E';
const GREEN = '#5A9E4B';
const YELLOW = '#FFC53D';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---- 食材手绘 ----
export function drawIngredient(ctx, id, cx, cy, s, chopped = false) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'tomato') {
    ctx.fillStyle = '#E4572E';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5A9E4B';
    ctx.beginPath(); ctx.moveTo(0, -s * 0.42); ctx.lineTo(-s * 0.2, -s * 0.18); ctx.lineTo(0, -s * 0.28); ctx.lineTo(s * 0.2, -s * 0.18); ctx.closePath(); ctx.fill();
    if (chopped) { ctx.strokeStyle = '#B23A17'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s * 0.3, 0); ctx.lineTo(s * 0.3, 0); ctx.stroke(); }
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#5A9E4B';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * s * 0.22, 0, s * 0.26, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#7BC96A';
    ctx.beginPath(); ctx.arc(0, -s * 0.08, s * 0.2, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'bread') {
    ctx.fillStyle = '#E8A94F';
    rr(ctx, -s * 0.45, -s * 0.3, s * 0.9, s * 0.6, s * 0.2); ctx.fill();
    ctx.fillStyle = '#F7D9A8';
    rr(ctx, -s * 0.35, -s * 0.18, s * 0.7, s * 0.36, s * 0.12); ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = '#8B5A2B';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.48, s * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5E3A17';
    for (const [dx, dy] of [[-0.2, -0.05], [0.15, 0.08], [0, -0.12]]) { ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.05, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'cheese') {
    ctx.fillStyle = '#FFC53D';
    ctx.beginPath(); ctx.moveTo(-s * 0.45, s * 0.3); ctx.lineTo(s * 0.45, s * 0.3); ctx.lineTo(0, -s * 0.35); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#D99A12';
    for (const [dx, dy] of [[-0.1, 0.1], [0.15, 0.15]]) { ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.07, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'pasta') {
    ctx.strokeStyle = '#F2D38A'; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, i * s * 0.22);
      ctx.bezierCurveTo(-s * 0.15, i * s * 0.22 - s * 0.18, s * 0.15, i * s * 0.22 + s * 0.18, s * 0.4, i * s * 0.22);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSteam(ctx, x, y, t) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 3; i++) {
    const p = ((t * 0.5 + i / 3) % 1);
    ctx.globalAlpha = 0.7 * (1 - p);
    ctx.beginPath(); ctx.arc(x + Math.sin((t + i * 2) * 1.5) * 8, y - p * 34, 5 + p * 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, s, filled) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20);
  ctx.fillStyle = filled ? '#E4572E' : '#D8C3A5';
  ctx.beginPath();
  ctx.moveTo(0, 6); ctx.bezierCurveTo(-11, -4, -6, -12, 0, -5); ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.fill(); ctx.restore();
}

function drawOrderCard(ctx, order, x, y, w, h, isActive, t) {
  const recipe = RECIPE_BY_ID[order.recipeId];
  ctx.save();
  rr(ctx, x, y, w, h, 14); ctx.fillStyle = isActive ? '#FFFFFF' : '#FFF8E7'; ctx.fill();
  ctx.lineWidth = isActive ? 4 : 2; ctx.strokeStyle = isActive ? RED : '#E0C9A0'; ctx.stroke();
  // 顾客头像
  ctx.fillStyle = order.customer;
  ctx.beginPath(); ctx.arc(x + 28, y + 30, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF3D6'; ctx.beginPath(); ctx.arc(x + 28, y + 26, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 28, y + 40, 11, Math.PI, 0); ctx.fill();
  text(ctx, order.name, x + 54, y + 26, 24, BROWN);
  text(ctx, isActive ? '正在做 ★' : '排队中', x + 54, y + 52, 15, isActive ? RED : '#9A7B4F');
  // 步骤（4 步的菜也要整行露出来，倒计时条留在卡底）
  order.steps.forEach((step, i) => {
    const sy = y + 76 + i * 23;
    const ing = ING_BY_ID[step.ing];
    ctx.fillStyle = step.done ? GREEN : '#C9B18C';
    ctx.beginPath(); ctx.arc(x + 22, sy, 9, 0, Math.PI * 2); ctx.fill();
    text(ctx, step.done ? '✓' : String(i + 1), x + 22, sy + 1, 13, '#fff', '800', 'center');
    drawIngredient(ctx, step.ing, x + 52, sy, 30);
    text(ctx, `${ing.name} · ${step.label}`, x + 72, sy, 17, step.done ? '#7A9A6A' : BROWN);
  });
  // 倒计时条 + 秒数（秒数放右上角，不压步骤）
  const frac = Math.max(0, order.timeLeft / 50);
  text(ctx, `${Math.ceil(order.timeLeft)}s`, x + w - 14, y + 26, 16, frac < 0.3 ? RED : '#9A7B4F', '800', 'right');
  rr(ctx, x + 14, y + h - 16, w - 28, 8, 4); ctx.fillStyle = '#EADFC6'; ctx.fill();
  rr(ctx, x + 14, y + h - 16, (w - 28) * frac, 8, 4); ctx.fillStyle = frac < 0.3 ? RED : GREEN; ctx.fill();
  ctx.restore();
}

export function drawGame(ctx, world) {
  const t = world.elapsed;
  const L = LAYOUT;
  // 墙 + 地
  ctx.fillStyle = '#F7D9A8'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#F2C184';
  for (let row = 0; row < 3; row++) for (let col = 0; col < 16; col++) {
    ctx.fillRect(col * 84 + (row % 2 ? 42 : 0) - 42, 64 + row * 26, 80, 22);
  }
  ctx.fillStyle = '#E8B06A'; ctx.fillRect(0, 140, VIEW_W, 6);
  // 顶栏
  ctx.fillStyle = BROWN; ctx.fillRect(0, 0, VIEW_W, 64);
  text(ctx, '小厨神 · 快炒厨房', 20, 34, 28, CREAM);
  text(ctx, `分数 ${world.score}`, 560, 34, 26, YELLOW, '800', 'center');
  text(ctx, `连击 x${world.combo}`, 760, 34, 22, world.combo >= 2 ? '#FF9A3D' : CREAM, '800', 'center');
  const mm = Math.floor(Math.max(0, world.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, world.timeLeft) % 60);
  text(ctx, `${mm}:${String(ss).padStart(2, '0')}`, 1080, 34, 28, world.timeLeft < 30 ? '#FF8A7A' : CREAM, '800', 'center');
  for (let i = 0; i < 3; i++) drawHeart(ctx, 1180 + i * 30, 32, 22, i < world.hearts);

  // ---- 左：点菜单 ----
  world.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, L.orders.x, L.orders.y + i * (L.orders.cardH + L.orders.gap), L.orders.w, L.orders.cardH, i === 0, t);
  });

  // ---- 中：厨房 ----
  const K = L.kitchen;
  rr(ctx, K.x, K.y, K.w, K.h, 16); ctx.fillStyle = '#FFF8E7'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#E0C9A0'; ctx.stroke();
  // 架子 + 罐子
  ctx.fillStyle = WOOD; ctx.fillRect(K.x + 20, K.y + 16, K.w - 40, 10);
  ['#E4572E', '#5A9E4B', '#FFC53D', '#2E86AB'].forEach((c, i) => {
    ctx.fillStyle = c; rr(ctx, K.x + 40 + i * 70, K.y - 6, 44, 34, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(K.x + 40 + i * 70 + 6, K.y + 2, 32, 8);
  });
  text(ctx, '厨房', K.x + 16, K.y + 52, 18, '#9A7B4F');
  // 灶台：煎锅 + 汤锅
  ctx.fillStyle = '#3A3A3A'; rr(ctx, L.pan.x - 10, L.pan.y + 70, 190, 16, 8); ctx.fill();
  ctx.fillStyle = '#2B2B2B'; ctx.beginPath(); ctx.ellipse(L.pan.x + 85, L.pan.y + 55, 85, 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4A4A4A'; ctx.beginPath(); ctx.ellipse(L.pan.x + 85, L.pan.y + 48, 78, 28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B6B6B'; ctx.fillRect(L.pan.x + 160, L.pan.y + 30, 46, 10);
  ctx.fillStyle = '#7A7A7A'; ctx.beginPath(); ctx.ellipse(L.pot.x + 75, L.pot.y + 55, 72, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9A9A9A'; ctx.beginPath(); ctx.ellipse(L.pot.x + 75, L.pot.y + 48, 64, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E8D9B0'; ctx.beginPath(); ctx.ellipse(L.pot.x + 75, L.pot.y + 48, 56, 18, 0, 0, Math.PI * 2); ctx.fill();
  drawSteam(ctx, L.pot.x + 75, L.pot.y + 20, t);
  drawSteam(ctx, L.pan.x + 85, L.pan.y + 20, t * 0.7);
  // 加工中的食材
  const step = world.activeStep;
  if (step) {
    if (step.action === 'fry') {
      drawIngredient(ctx, 'patty', L.pan.x + 85, L.pan.y + 48, 90);
      const frac = Math.min(1, step.progress / step.max);
      rr(ctx, L.pan.x + 10, L.pan.y + 92, 150, 10, 5); ctx.fillStyle = '#EADFC6'; ctx.fill();
      rr(ctx, L.pan.x + 10, L.pan.y + 92, 150 * frac, 10, 5); ctx.fillStyle = frac > 0.8 ? RED : '#E8A94F'; ctx.fill();
      text(ctx, '煎肉饼…点煎锅！', L.pan.x + 85, L.pan.y + 116, 15, BROWN, '700', 'center');
    } else if (step.action === 'boil') {
      drawIngredient(ctx, 'pasta', L.pot.x + 75, L.pot.y + 48, 80);
      const frac = Math.min(1, step.progress / step.max);
      rr(ctx, L.pot.x, L.pot.y + 92, 150, 10, 5); ctx.fillStyle = '#EADFC6'; ctx.fill();
      rr(ctx, L.pot.x, L.pot.y + 92, 150 * frac, 10, 5); ctx.fillStyle = '#2E86AB'; ctx.fill();
      text(ctx, '煮意面…点汤锅搅拌！', L.pot.x + 75, L.pot.y + 116, 15, BROWN, '700', 'center');
    }
  }
  // 砧板
  ctx.fillStyle = '#D9A05B'; rr(ctx, L.board.x, L.board.y, L.board.w, L.board.h, 12); ctx.fill();
  ctx.strokeStyle = '#B97A26'; ctx.lineWidth = 3; rr(ctx, L.board.x, L.board.y, L.board.w, L.board.h, 12); ctx.stroke();
  text(ctx, '砧板', L.board.x + 14, L.board.y + 20, 16, '#8A5A2B');
  if (step && step.action === 'chop') {
    drawIngredient(ctx, step.ing, L.board.x + 110, L.board.y + 88, 84, step.progress >= 2);
    const frac = step.progress / step.max;
    rr(ctx, L.board.x + 20, L.board.y + 126, 210, 10, 5); ctx.fillStyle = '#EADFC6'; ctx.fill();
    rr(ctx, L.board.x + 20, L.board.y + 126, 210 * frac, 10, 5); ctx.fillStyle = GREEN; ctx.fill();
    text(ctx, '切菜…点砧板！', L.board.x + 125, L.board.y + 34, 15, BROWN, '700', 'center');
    // 菜刀
    ctx.save(); ctx.translate(L.board.x + 200, L.board.y + 60); ctx.rotate(0.5);
    ctx.fillStyle = '#C0C0C0'; ctx.fillRect(0, 0, 52, 14); ctx.fillStyle = BROWN; ctx.fillRect(52, 3, 22, 8); ctx.restore();
  } else {
    text(ctx, '点食材，菜会来到这里', L.board.x + 125, L.board.y + 75, 15, '#9A7B4F', '600', 'center');
  }
  // 装盘区
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(L.plate.x + 110, L.plate.y + 70, 100, 42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#D8C3A5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(L.plate.x + 110, L.plate.y + 70, 100, 42, 0, 0, Math.PI * 2); ctx.stroke();
  world.plated.forEach((ingId, i) => {
    drawIngredient(ctx, ingId, L.plate.x + 110, L.plate.y + 62 - i * 14, 64);
  });
  text(ctx, world.readyToServe ? '装盘完成！' : `已装盘 ${world.plated.length} 样`, L.plate.x + 110, L.plate.y + 118, 16, world.readyToServe ? GREEN : BROWN, '700', 'center');
  // 提示
  if (world.elapsed < world.hintUntil || world.screen === SCREEN_PLAY) {
    rr(ctx, K.x + 20, K.y + K.h - 44, K.w - 40, 32, 10); ctx.fillStyle = '#FFF3D6'; ctx.fill();
    text(ctx, world.hint, K.x + 30, K.y + K.h - 27, 17, BROWN);
  }

  // ---- 右：出餐口 ----
  const S = L.serve;
  rr(ctx, S.x, S.y, S.w, S.h, 16); ctx.fillStyle = '#FFE9C2'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#E0C9A0'; ctx.stroke();
  text(ctx, '出餐口', S.x + 16, S.y + 30, 22, BROWN);
  const cust = activeOrder(world);
  if (cust) {
    ctx.fillStyle = cust.customer;
    ctx.beginPath(); ctx.arc(S.x + 142, S.y + 96, 42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF3D6'; ctx.beginPath(); ctx.arc(S.x + 142, S.y + 86, 16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(S.x + 142, S.y + 122, 26, Math.PI, 0); ctx.fill();
    text(ctx, `等着吃${cust.name}`, S.x + 142, S.y + 158, 18, BROWN, '700', 'center');
  }
  // 上菜的盘子
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(L.servePlate.x + 112, L.servePlate.y + 70, 104, 44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = world.readyToServe ? GREEN : '#D8C3A5'; ctx.lineWidth = world.readyToServe ? 5 : 3;
  ctx.beginPath(); ctx.ellipse(L.servePlate.x + 112, L.servePlate.y + 70, 104, 44, 0, 0, Math.PI * 2); ctx.stroke();
  if (world.readyToServe && cust) {
    cust.steps.forEach((s, i) => drawIngredient(ctx, s.ing, L.servePlate.x + 112, L.servePlate.y + 62 - i * 12, 62));
    text(ctx, `${cust.name} · 可以上菜！`, L.servePlate.x + 112, L.servePlate.y + 126, 17, GREEN, '800', 'center');
  } else {
    text(ctx, '空盘子 · 等上菜', L.servePlate.x + 112, L.servePlate.y + 70, 17, '#9A7B4F', '700', 'center');
  }
  // 上菜按钮
  const pulse = world.readyToServe ? 1 + Math.sin(t * 6) * 0.04 : 1;
  ctx.save(); ctx.translate(L.serveBtn.x + 112, L.serveBtn.y + 32); ctx.scale(pulse, pulse);
  rr(ctx, -112, -32, 224, 64, 16); ctx.fillStyle = world.readyToServe ? GREEN : '#C9B18C'; ctx.fill();
  ctx.restore();
  text(ctx, world.readyToServe ? '上菜！(空格)' : '上菜', L.serveBtn.x + 112, L.serveBtn.y + 34, 24, '#fff', '800', 'center');
  text(ctx, `已上 ${world.servedCount} 单 · 最佳连击 x${world.bestCombo}`, S.x + 142, S.y + 500, 16, '#9A7B4F', '600', 'center');

  // ---- 下：食材台 ----
  text(ctx, '食材台 · 点食材 / 按 1-6', 16, 628, 18, BROWN);
  INGREDIENTS.forEach((ing, i) => {
    const bx = L.bins.x + i * (L.bins.binW + L.bins.gap);
    const by = L.bins.y;
    const need = currentStep(activeOrder(world));
    const isNext = world.screen === SCREEN_PLAY && need && need.ing === ing.id && !world.activeStep;
    rr(ctx, bx, by, L.bins.binW, L.bins.h, 14); ctx.fillStyle = isNext ? '#FFF' : '#FFF8E7'; ctx.fill();
    ctx.lineWidth = isNext ? 4 : 2; ctx.strokeStyle = isNext ? RED : '#E0C9A0'; ctx.stroke();
    drawIngredient(ctx, ing.id, bx + 99, by + 52, 84);
    text(ctx, ing.name, bx + 99, by + 108, 20, BROWN, '700', 'center');
    rr(ctx, bx + 8, by + 8, 28, 28, 8); ctx.fillStyle = BROWN; ctx.fill();
    text(ctx, ing.key, bx + 22, by + 23, 16, '#fff', '800', 'center');
    text(ctx, ing.action === 'chop' ? '切' : ing.action === 'fry' ? '煎' : ing.action === 'boil' ? '煮' : '放', bx + L.bins.binW - 14, by + 22, 15, '#9A7B4F', '700', 'right');
    if (isNext) text(ctx, '下一步 ★', bx + 99, by + 132, 15, RED, '800', 'center');
  });

  // 闪光（上菜成功）
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255,197,61,${world.flash * 0.5})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}

function drawOverlay(ctx, world, title, lines, btnLabel) {
  ctx.fillStyle = 'rgba(94,58,23,0.55)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  rr(ctx, 340, 140, 600, 460, 24); ctx.fillStyle = CREAM; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.stroke();
  text(ctx, title, 640, 210, 44, RED, '900', 'center');
  lines.forEach((line, i) => text(ctx, line, 640, 290 + i * 40, 22, BROWN, '600', 'center'));
  rr(ctx, 490, 480, 300, 64, 16); ctx.fillStyle = GREEN; ctx.fill();
  text(ctx, btnLabel, 640, 513, 26, '#fff', '800', 'center');
  text(ctx, '鼠标点 / 按 Enter 开始', 640, 572, 16, '#9A7B4F', '600', 'center');
}

export function draw(ctx, world) {
  drawGame(ctx, world);
  if (world.screen === SCREEN_TITLE) {
    drawOverlay(ctx, world, '小厨神 · 快炒厨房', [
      '接单 → 切菜 / 煎 / 煮 → 装盘 → 上菜',
      '准时上菜得分，连击加分；超时扣一颗心',
      '鼠标点食材和灶台，也能按 1-6、C、空格玩',
      `最高分 ${world.best} · 180 秒一局`,
    ], '开始做饭！');
  } else if (world.screen === SCREEN_OVER) {
    drawOverlay(ctx, world, '打烊了！', [
      world.overReason,
      `分数 ${world.score} · 上菜 ${world.servedCount} 单`,
      `最佳连击 x${world.bestCombo} · 最高分 ${world.best}`,
    ], '再来一局');
  }
}
