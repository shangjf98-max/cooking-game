// 小厨神 · 快炒厨房 — 静态配置：画布尺寸、食材、菜谱、计时。
// 全部原创手绘：没有外部图片、字体或网络请求。

export const VIEW_W = 1280;
export const VIEW_H = 800;

export const SHIFT_SECONDS = 180;
export const ORDER_SECONDS = 50;
export const MAX_HEARTS = 3;

// 食材：id、中文名、颜色、键盘键、加工方式、加工次数。
export const INGREDIENTS = [
  { id: 'tomato', name: '番茄', key: '1', color: '#E4572E', dark: '#B23A17', action: 'chop', hits: 3 },
  { id: 'lettuce', name: '生菜', key: '2', color: '#5A9E4B', dark: '#3E7034', action: 'chop', hits: 3 },
  { id: 'bread', name: '面包', key: '3', color: '#E8A94F', dark: '#B97A26', action: 'place', hits: 1 },
  { id: 'patty', name: '肉饼', key: '4', color: '#8B5A2B', dark: '#5E3A17', action: 'fry', hits: 5 },
  { id: 'cheese', name: '芝士', key: '5', color: '#FFC53D', dark: '#D99A12', action: 'place', hits: 1 },
  { id: 'pasta', name: '意面', key: '6', color: '#F2D38A', dark: '#C9A44A', action: 'boil', hits: 4 },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

// 菜谱：每道菜是按顺序做的步骤，每步一个食材 + 一种加工。
export const RECIPES = [
  {
    id: 'salad', name: '番茄沙拉', base: 100,
    steps: [
      { ing: 'lettuce', label: '切生菜' },
      { ing: 'tomato', label: '切番茄' },
    ],
  },
  {
    id: 'burger', name: '芝士汉堡', base: 160,
    steps: [
      { ing: 'bread', label: '放面包' },
      { ing: 'patty', label: '煎肉饼' },
      { ing: 'cheese', label: '放芝士' },
      { ing: 'lettuce', label: '切生菜' },
    ],
  },
  {
    id: 'pasta', name: '番茄意面', base: 140,
    steps: [
      { ing: 'pasta', label: '煮意面' },
      { ing: 'tomato', label: '切番茄' },
      { ing: 'cheese', label: '放芝士' },
    ],
  },
  {
    id: 'double', name: '双层汉堡', base: 220,
    steps: [
      { ing: 'bread', label: '放面包' },
      { ing: 'patty', label: '煎肉饼' },
      { ing: 'cheese', label: '放芝士' },
      { ing: 'patty', label: '再煎肉饼' },
      { ing: 'lettuce', label: '切生菜' },
    ],
  },
];

// 上菜越多，单越急：每上 3 单，新单时限少 5 秒，最少 30 秒。
export const ORDER_SECONDS_FLOOR = 30;

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

// 布局：左点菜单、中间厨房、右出餐口、下方食材台。
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  orders: { x: 16, y: 80, w: 272, h: 540, gap: 12, cardH: 168 },
  kitchen: { x: 304, y: 80, w: 660, h: 540 },
  board: { x: 340, y: 300, w: 250, h: 150 },
  pan: { x: 620, y: 180, w: 170, h: 110 },
  pot: { x: 800, y: 180, w: 150, h: 110 },
  plate: { x: 620, y: 330, w: 220, h: 130 },
  serve: { x: 980, y: 80, w: 284, h: 540 },
  servePlate: { x: 1010, y: 300, w: 224, h: 140 },
  serveBtn: { x: 1010, y: 460, w: 224, h: 64 },
  bins: { x: 16, y: 636, w: 1248, h: 148, gap: 12, binW: 198 },
};
