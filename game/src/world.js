// 游戏世界：订单、步骤、分数、连击、计时、胜负。纯逻辑，不画画。
import {
  INGREDIENTS, ING_BY_ID, RECIPES, RECIPE_BY_ID,
  SHIFT_SECONDS, ORDER_SECONDS, MAX_HEARTS,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

let nextOrderId = 1;

export function makeOrder(recipeId, seedRand) {
  const recipe = RECIPE_BY_ID[recipeId];
  return {
    id: nextOrderId++,
    recipeId,
    name: recipe.name,
    base: recipe.base,
    steps: recipe.steps.map((s) => ({ ...s, done: false })),
    stepIndex: 0,
    timeLeft: ORDER_SECONDS,
    // 顾客头像色，用订单 id 轮换，保证截图里每单顾客不一样。
    customer: ['#E4572E', '#2E86AB', '#F2A541', '#7B5EA7'][(nextOrderId + (seedRand ? 1 : 0)) % 4],
  };
}

export function pickRecipe(rand) {
  return RECIPES[Math.floor(rand() * RECIPES.length)].id;
}

export function createWorld(rand) {
  return {
    screen: SCREEN_TITLE,
    rand,
    score: 0,
    best: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    timeLeft: SHIFT_SECONDS,
    orders: [makeOrder('burger', rand), makeOrder('salad', rand), makeOrder('pasta', rand)],
    // 当前正在加工的那一步：{ orderId, ing, action, progress, hits }
    activeStep: null,
    // 已装盘的食材（当前单），按步骤顺序放。
    plated: [],
    readyToServe: false,
    hint: '点食材开始做第一单',
    hintUntil: 0,
    servedCount: 0,
    failedCount: 0,
    elapsed: 0,
    flash: 0,
    overReason: '',
  };
}

export function activeOrder(world) {
  return world.orders[0] || null;
}

export function currentStep(order) {
  if (!order) return null;
  return order.steps[order.stepIndex] || null;
}

export function setHint(world, text) {
  world.hint = text;
  world.hintUntil = world.elapsed + 2.5;
}

// 点食材台：只有当前单下一步要的食材才开工，否则提示。
export function takeIngredient(world, ingId) {
  if (world.screen !== SCREEN_PLAY) return false;
  const order = activeOrder(world);
  if (!order) return false;
  if (world.activeStep) {
    setHint(world, '先把手上的做完：点砧板 / 煎锅 / 汤锅');
    return false;
  }
  const step = currentStep(order);
  if (!step) return false;
  if (step.ing !== ingId) {
    const need = ING_BY_ID[step.ing];
    setHint(world, `这单下一步要：${need.name}（${step.label}）`);
    return false;
  }
  const ing = ING_BY_ID[ingId];
  if (ing.action === 'place') {
    finishStep(world, order, step);
    setHint(world, `${ing.name}已上盘`);
    return true;
  }
  world.activeStep = {
    orderId: order.id, ing: ingId, action: ing.action,
    progress: 0, hits: ing.hits, max: ing.hits,
  };
  setHint(world, ing.action === 'chop' ? '点砧板切菜！' : ing.action === 'fry' ? '点煎锅煎肉饼！' : '点汤锅煮面，搅拌更快！');
  return true;
}

// 点加工台：推进当前步骤；煎肉饼过火会糊，要重煎。
export function workStation(world, action) {
  if (world.screen !== SCREEN_PLAY) return false;
  const step = world.activeStep;
  if (!step || step.action !== action) return false;
  const order = activeOrder(world);
  if (!order || step.orderId !== order.id) { world.activeStep = null; return false; }
  if (action === 'fry') {
    step.progress += 1;
    // 煎 5 下正好，超过 7 下糊了：重做这一步。
    if (step.progress > step.max + 2) {
      world.activeStep = null;
      setHint(world, '肉饼煎糊了！重新煎一块');
      return true;
    }
  } else if (action === 'boil') {
    step.progress += 1;
  } else {
    step.progress += 1;
  }
  if (step.progress >= step.max) {
    const done = currentStep(order);
    world.activeStep = null;
    if (done) finishStep(world, order, done);
  }
  return true;
}

function finishStep(world, order, step) {
  step.done = true;
  order.stepIndex += 1;
  world.plated.push(step.ing);
  if (order.stepIndex >= order.steps.length) {
    world.readyToServe = true;
    setHint(world, `${order.name}做好了！点出餐口上菜`);
  }
}

// 上菜：按剩余时间给分，连击加成。
export function serveDish(world) {
  if (world.screen !== SCREEN_PLAY) return false;
  if (!world.readyToServe) {
    setHint(world, '菜还没做好：先把步骤做完');
    return false;
  }
  const order = activeOrder(world);
  if (!order) return false;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  const timeBonus = Math.round(order.timeLeft * 2);
  const comboBonus = (world.combo - 1) * 25;
  const gained = order.base + timeBonus + comboBonus;
  world.score += gained;
  world.servedCount += 1;
  world.orders.shift();
  world.orders.push(makeOrder(pickRecipe(world.rand), world.rand));
  world.plated = [];
  world.readyToServe = false;
  world.activeStep = null;
  world.flash = 0.4;
  setHint(world, `上菜！+${gained} 分（连击 x${world.combo}）`);
  return true;
}

function failOrder(world, order) {
  world.orders.shift();
  world.orders.push(makeOrder(pickRecipe(world.rand), world.rand));
  world.hearts -= 1;
  world.combo = 0;
  world.failedCount += 1;
  world.plated = [];
  world.readyToServe = false;
  world.activeStep = null;
  setHint(world, `${order.name}超时了！扣 1 颗心`);
  if (world.hearts <= 0) endGame(world, '三颗心都掉光了');
}

export function endGame(world, reason) {
  world.screen = SCREEN_OVER;
  world.overReason = reason;
  world.best = Math.max(world.best, world.score);
}

export function startGame(world) {
  const fresh = createWorld(world.rand);
  fresh.best = world.best;
  Object.assign(world, fresh);
  world.screen = SCREEN_PLAY;
  setHint(world, '开始！先做第一单：点面包');
}

// 每帧推进：订单倒计时、全局倒计时、煎锅自然回落。
export function stepWorld(world, dt) {
  if (world.screen !== SCREEN_PLAY) return;
  world.elapsed += dt;
  world.timeLeft -= dt;
  if (world.flash > 0) world.flash -= dt;
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    endGame(world, '打烊了！180 秒到了');
    return;
  }
  const order = activeOrder(world);
  if (order) {
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) failOrder(world, order);
  }
  // 煮面会自动冒泡推进一半，搅拌（点汤锅）才快。
  if (world.activeStep && world.activeStep.action === 'boil') {
    world.activeStep.progress += dt * 0.25;
    if (world.activeStep.progress >= world.activeStep.max) {
      const done = currentStep(activeOrder(world));
      world.activeStep = null;
      if (done) finishStep(world, activeOrder(world), done);
    }
  }
}

export { INGREDIENTS, ING_BY_ID };
