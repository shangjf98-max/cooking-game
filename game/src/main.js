// 主循环：开始界面 → 游玩 → 结算；键盘鼠标都接；每帧重画。
import { VIEW_W, VIEW_H } from './config.js';
import {
  createWorld, startGame, endGame, stepWorld,
  takeIngredient, workStation, serveDish,
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER,
} from './world.js';
import { draw } from './render.js';
import { createInput } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);

function mulberry(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const world = createWorld(mulberry(20261125));
window.__cooking = world; // 供实机测试读状态，不影响游玩。
try {
  world.best = Number(window.localStorage.getItem('cooking-best') || 0) || 0;
} catch {
  world.best = 0;
}
let paused = false;
const isShot = applyShot(world, params);

function announce(message) {
  status.textContent = message;
}

function saveBest() {
  try { window.localStorage.setItem('cooking-best', String(world.best)); } catch { /* 离线也照常玩 */ }
}

function resize() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.width = Math.round(VIEW_W * scale * window.devicePixelRatio);
  canvas.height = Math.round(VIEW_H * scale * window.devicePixelRatio);
  canvas.style.width = `${Math.round(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.round(VIEW_H * scale)}px`;
  ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function confirm() {
  if (world.screen === SCREEN_TITLE) {
    startGame(world);
    announce('开始做饭！先做第一单。');
  } else if (world.screen === SCREEN_OVER) {
    startGame(world);
    announce('再来一局！');
  } else if (world.readyToServe) {
    serveDish(world);
  }
}

createInput(canvas, {
  click(hit) {
    if (!hit) return;
    if (hit.kind === 'confirm') { confirm(); return; }
    if (world.screen !== SCREEN_PLAY) return;
    if (hit.kind === 'ingredient') takeIngredient(world, hit.ing);
    else if (hit.kind === 'station') workStation(world, hit.action);
    else if (hit.kind === 'serve') serveDish(world);
  },
  ingredient(ingId) { takeIngredient(world, ingId); },
  station(action) { workStation(world, action); },
  space() {
    if (world.screen === SCREEN_PLAY && world.readyToServe) serveDish(world);
    else confirm();
  },
  confirm() { confirm(); },
  pause() {
    if (world.screen === SCREEN_PLAY) {
      paused = !paused;
      announce(paused ? '已暂停，按 P 继续。' : '继续做饭！');
    }
  },
});

// 截图模式：摆好造型后只画一帧，蒸汽和计时都定格，方便复现。
if (isShot) {
  draw(ctx, world);
  announce('截图已就绪。');
} else {
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!paused) stepWorld(world, dt);
    if (world.screen === SCREEN_OVER && world.best > 0) saveBest();
    draw(ctx, world);
  }
  requestAnimationFrame(frame);
}
