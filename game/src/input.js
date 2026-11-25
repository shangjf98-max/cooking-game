// 输入：把鼠标点击和键盘映射到游戏坐标（1280x800 逻辑画布）。
import { VIEW_W, VIEW_H, INGREDIENTS, LAYOUT } from './config.js';

function toGame(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW_W,
    y: ((clientY - rect.top) / rect.height) * VIEW_H,
  };
}

function inside(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

// 点击落在哪个可点区域：食材、砧板、煎锅、汤锅、上菜按钮/出餐盘、开始按钮。
export function hitTest(p) {
  const L = LAYOUT;
  for (let i = 0; i < INGREDIENTS.length; i++) {
    const bx = L.bins.x + i * (L.bins.binW + L.bins.gap);
    if (inside(p, { x: bx, y: L.bins.y, w: L.bins.binW, h: L.bins.h })) {
      return { kind: 'ingredient', ing: INGREDIENTS[i].id };
    }
  }
  if (inside(p, L.board)) return { kind: 'station', action: 'chop' };
  if (inside(p, L.pan)) return { kind: 'station', action: 'fry' };
  if (inside(p, L.pot)) return { kind: 'station', action: 'boil' };
  if (inside(p, L.serveBtn) || inside(p, L.servePlate)) return { kind: 'serve' };
  if (inside(p, { x: 490, y: 320, w: 300, h: 64 }) || inside(p, { x: 490, y: 480, w: 300, h: 64 })) return { kind: 'confirm' };
  return null;
}

export function createInput(canvas, handlers) {
  canvas.addEventListener('click', (event) => {
    handlers.click(hitTest(toGame(canvas, event.clientX, event.clientY)));
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const ing = INGREDIENTS.find((item) => item.key === key);
    if (ing) { handlers.ingredient(ing.id); return; }
    if (key === 'c') handlers.station('chop');
    else if (key === 'f') handlers.station('fry');
    else if (key === 'b') handlers.station('boil');
    else if (key === ' ') { event.preventDefault(); handlers.space(); }
    else if (key === 'enter') handlers.confirm();
    else if (key === 'p' || key === 'escape') handlers.pause();
  });
}
