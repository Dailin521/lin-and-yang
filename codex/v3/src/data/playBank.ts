import type { Question, Idea, Filters } from "./model";
export const bank: Question[] = [
  {
    id: "breakfast",
    kind: "日常频道",
    prompt: "一个不用早起的周末，我们会先做什么？",
    options: [
      "赖床，再聊五分钟",
      "找一家没吃过的早餐店",
      "买菜，慢慢做早饭",
      "各自放空一会儿",
    ],
  },
  {
    id: "weather",
    kind: "日常频道",
    prompt: "出门突然下雨，最像我们的反应是？",
    options: [
      "找间咖啡店躲一躲",
      "买把伞，继续原来的计划",
      "回家看一部老电影",
      "在屋檐下听一会儿雨",
    ],
  },
  {
    id: "care",
    kind: "日常频道",
    prompt: "累了一天，最想收到哪一种照顾？",
    options: [
      "一个不用说话的拥抱",
      "一顿热乎乎的饭",
      "听我慢慢把事情讲完",
      "留一点安静的时间给我",
    ],
  },
  {
    id: "walk",
    kind: "出门频道",
    prompt: "一起散步，走到一个没见过的路口时？",
    options: [
      "朝有树荫的那边走",
      "跟着好闻的香味走",
      "看谁先发现有趣的小店",
      "掷个硬币决定吧",
    ],
  },
  {
    id: "weekend",
    kind: "出门频道",
    prompt: "突然多出半天空闲，我们最想去哪儿？",
    options: [
      "旧书店和附近的小馆子",
      "公园的草地上",
      "一座没去过的美术馆",
      "坐车去一个陌生的小站",
    ],
  },
  {
    id: "souvenir",
    kind: "出门频道",
    prompt: "旅行快结束了，我们会带什么回家？",
    options: [
      "一张一起拍的照片",
      "当地的小点心",
      "一路捡来的小东西",
      "下一次再来的约定",
    ],
  },
  {
    id: "surprise",
    kind: "脑洞频道",
    prompt: "给我们的小队取个名字，你会选？",
    options: [
      "今天也不赶时间",
      "两位快乐观察员",
      "随时可以吃点什么",
      "先出发再说小分队",
    ],
  },
  {
    id: "power",
    kind: "脑洞频道",
    prompt: "如果两个人能共用一种超能力？",
    options: [
      "瞬间移动到想去的地方",
      "把喜欢的瞬间暂停",
      "听懂小动物在聊什么",
      "把普通食材变成大餐",
    ],
  },
  {
    id: "shop",
    kind: "脑洞频道",
    prompt: "假如一起开一家小店，最像哪一种？",
    options: [
      "只有四张桌子的早餐店",
      "有猫有书的小书店",
      "开到深夜的唱片店",
      "种满花草的杂货铺",
    ],
  },
];
export const ideas: Idea[] = [
  {
    id: "window",
    title: "给窗外画一张明信片",
    description:
      "坐在同一扇窗边，各画一张眼前的风景。画完交换，写一句今天才想说的话。",
    time: "1h",
    budget: "free",
    location: "indoors",
    kit: "两张纸、一支笔，不需要画得像。",
  },
  {
    id: "songs",
    title: "办一场两个人的点歌会",
    description:
      "轮流放三首歌：最近常听的、想到对方的、想一起在路上听的。每首讲一个理由。",
    time: "1h",
    budget: "free",
    location: "indoors",
    kit: "一对耳朵，和一点不被打扰的时间。",
  },
  {
    id: "walk",
    title: "在附近找三种颜色",
    description:
      "选三种颜色，一起在街区里寻找。拍下最喜欢的三张，给这条散步路线起个名字。",
    time: "1h",
    budget: "free",
    location: "outdoors",
    kit: "穿舒服的鞋，带上手机。",
  },
  {
    id: "cloud",
    title: "去公园给云取名字",
    description: "找一张长椅，各自给经过的云取名字。最后选出今天最离谱的一个。",
    time: "1h",
    budget: "free",
    location: "outdoors",
    kit: "白天、好天气，记得防晒。",
  },
  {
    id: "dessert",
    title: "盲选一份没吃过的甜点",
    description:
      "去附近的面包店，各替对方挑一样没尝过的味道。找个位置，交换第一口的评价。",
    time: "1h",
    budget: "under100",
    location: "indoors",
    kit: "两人合计预计 40–80 元。",
  },
  {
    id: "flowers",
    title: "买一束今天的心情",
    description:
      "去附近花店，各选一种花，组成一束只属于今天的小花束。一起决定把它放在哪里。",
    time: "1h",
    budget: "under100",
    location: "outdoors",
    kit: "两人合计预计 30–80 元。",
  },
  {
    id: "coffee",
    title: "互相调一杯秘密饮料",
    description:
      "在家准备几种喜欢的食材，互相设计一杯饮料。取个夸张的名字，再认真打个分。",
    time: "1h",
    budget: "under100",
    location: "indoors",
    kit: "超市买食材，两人合计预计 30–60 元。",
  },
  {
    id: "craft",
    title: "做一对不太完美的小陶器",
    description:
      "找一家附近的陶艺体验店，给彼此做一个可以日常使用的小东西。先查询营业和预约。",
    time: "halfday",
    budget: "under300",
    location: "indoors",
    kit: "两人合计预计 180–280 元，预约前确认价格。",
  },
  {
    id: "book",
    title: "替对方找一本意外的书",
    description:
      "去公共图书馆，各用二十分钟挑一本觉得对方会喜欢的书。找个安静角落读一会儿。",
    time: "halfday",
    budget: "free",
    location: "indoors",
    kit: "带借书证，出发前确认开放时间。",
  },
  {
    id: "gallery",
    title: "做半天的作品观察员",
    description:
      "挑一场免费的公开展览。不查解说，各选一件喜欢的作品，讲讲自己看到了什么。",
    time: "halfday",
    budget: "free",
    location: "indoors",
    kit: "查询附近免费展览及预约规则。",
  },
  {
    id: "picnic",
    title: "把午餐搬到树荫下面",
    description:
      "一起准备简单的午餐，到附近公园野餐。把手机收起来，留半天给聊天、读书和发呆。",
    time: "halfday",
    budget: "under100",
    location: "outdoors",
    kit: "两人合计预计 40–90 元，带垫子和垃圾袋。",
  },
  {
    id: "photo",
    title: "沿着一条河拍十张照片",
    description:
      "选一段适合散步的河岸。轮流决定下一张拍什么，最后一起删选出今天的十张。",
    time: "halfday",
    budget: "free",
    location: "outdoors",
    kit: "自带水和相机，确认步道开放与天气。",
  },
  {
    id: "cook",
    title: "复刻记忆里的一顿饭",
    description:
      "选一道两个人都记得的菜，一起买食材、找做法。把第一次的成品照和做法一起留下。",
    time: "halfday",
    budget: "under100",
    location: "indoors",
    kit: "两人合计预计 50–90 元，厨房用品自备。",
  },
  {
    id: "cinema",
    title: "给彼此选一部意外的电影",
    description:
      "各提一部没看过的电影，用掷硬币决定今天看哪部。散场后找个地方聊最喜欢的镜头。",
    time: "halfday",
    budget: "under300",
    location: "indoors",
    kit: "两人合计预计 100–220 元，按实际场次购票。",
  },
  {
    id: "cycling",
    title: "骑去还没到过的街区",
    description:
      "规划一条安全的慢骑路线，中途找个小店休息。目的地可以普通一点，路上要慢一点。",
    time: "halfday",
    budget: "under100",
    location: "outdoors",
    kit: "两人合计预计 30–90 元，检查车辆并佩戴头盔。",
  },
  {
    id: "hike",
    title: "走一条轻松的近郊步道",
    description:
      "选交通可达、无需门票的成熟步道，一起走到观景处。途中给彼此拍一张喜欢的照片。",
    time: "day",
    budget: "under100",
    location: "outdoors",
    kit: "两人交通餐食合计预计 60–90 元，确认天气与开放。",
  },
  {
    id: "city",
    title: "用一天重新认识这座城",
    description:
      "选一片不熟悉的老街，步行串起早餐、老建筑和傍晚的公园。每个人负责安排一半路线。",
    time: "day",
    budget: "under300",
    location: "outdoors",
    kit: "两人交通餐食合计预计 120–260 元。",
  },
  {
    id: "home",
    title: "把家变成一天的小旅馆",
    description:
      "准备早餐菜单，换上干净床单，排一个双人电影场次。今天暂时不处理家务清单。",
    time: "day",
    budget: "under100",
    location: "indoors",
    kit: "两人食材合计预计 60–90 元，用品用家里现成的。",
  },
  {
    id: "museum",
    title: "在一座博物馆里慢慢逛",
    description:
      "选一座免费的公共博物馆，慢慢看完每个展厅。各自找三个有趣细节，下午再交换发现。",
    time: "day",
    budget: "under100",
    location: "indoors",
    kit: "两人交通餐食合计预计 50–90 元，确认免费入场和预约。",
  },
  {
    id: "garden",
    title: "一起记录公园的一整天",
    description:
      "在步行可达的公园，从上午逛到日落。写下光线、声音、植物和心情的变化。",
    time: "day",
    budget: "free",
    location: "outdoors",
    kit: "自带午餐、水和笔记本，确认天气。",
  },
];
export const timeLabel = { "1h": "一小时", halfday: "半天", day: "一整天" };
export const budgetLabel = {
  free: "不花钱",
  under100: "100 元以内",
  under300: "300 元以内",
};
export const locationLabel = {
  indoors: "室内",
  outdoors: "户外",
  any: "都可以",
};
const budgetRank = { free: 0, under100: 1, under300: 2 };
export const matches = (idea: Idea, filters: Filters) =>
  idea.time === filters.time &&
  budgetRank[idea.budget] <= budgetRank[filters.budget] &&
  (filters.location === "any" || idea.location === filters.location);

export function shuffle<T>(items: T[]) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
