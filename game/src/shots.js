// 定格截图：?shot=start|play|serve|rush&seed=1 时，把世界摆成
// 截图要的样子（不改玩法，只 preset 状态），截图是真实渲染。
import { makeOrder, SCREEN_PLAY } from './world.js';

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function applyShot(world, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  const rand = seeded(Number(params.get('seed') || 1));
  world.rand = rand;
  world.screen = SCREEN_PLAY;
  world.elapsed = 12;
  world.timeLeft = 142;
  world.score = 320;
  world.combo = 2;
  world.bestCombo = 3;
  world.hearts = 3;
  world.servedCount = 4;
  world.orders = [makeOrder('burger', rand), makeOrder('salad', rand), makeOrder('pasta', rand)];
  world.plated = [];
  world.activeStep = null;
  world.readyToServe = false;

  if (shot === 'start') {
    world.screen = 'title';
    world.score = 0; world.combo = 0; world.servedCount = 0;
    return true;
  }
  if (shot === 'play') {
    // 汉堡做到一半：面包已上盘，肉饼正在煎，番茄等着切。
    world.orders[0].steps[0].done = true;
    world.orders[0].stepIndex = 1;
    world.plated = ['bread'];
    world.activeStep = { orderId: world.orders[0].id, ing: 'patty', action: 'fry', progress: 3, hits: 5, max: 5 };
    world.hint = '点煎锅煎肉饼！';
    world.hintUntil = 999;
    return true;
  }
  if (shot === 'serve') {
    // 汉堡全做好，放在出餐盘上，等上菜；连击 x3。
    const order = world.orders[0];
    order.steps.forEach((s) => { s.done = true; });
    order.stepIndex = order.steps.length;
    order.timeLeft = 28;
    world.plated = ['bread', 'patty', 'cheese', 'lettuce'];
    world.readyToServe = true;
    world.score = 650;
    world.combo = 3;
    world.servedCount = 7;
    world.hint = '芝士汉堡做好了！点出餐口上菜';
    world.hintUntil = 999;
    return true;
  }
  if (shot === 'rush') {
    // 高峰：三单都快超时，计时器见红，分数高。
    world.timeLeft = 38;
    world.score = 980;
    world.combo = 4;
    world.bestCombo = 5;
    world.hearts = 2;
    world.servedCount = 11;
    world.orders.forEach((o) => { o.timeLeft = 9 + o.id * 3; });
    world.orders[0].steps[0].done = true;
    world.orders[0].stepIndex = 1;
    world.plated = ['pasta'];
    world.activeStep = { orderId: world.orders[0].id, ing: 'tomato', action: 'chop', progress: 2, hits: 3, max: 3 };
    world.hint = '快！三单都要超时了！';
    world.hintUntil = 999;
    return true;
  }
  return false;
}
