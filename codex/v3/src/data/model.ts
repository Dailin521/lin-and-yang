import { dayOffset, today } from "../shared/store";
export type Person = { name: string; avatar: string; accent: string };
export type Wish = {
  id: string;
  title: string;
  note: string;
  tag: string;
  done: boolean;
  completedAt?: string;
};
export type Idea = {
  id: string;
  title: string;
  description: string;
  time: Filters["time"];
  budget: Filters["budget"];
  location: "indoors" | "outdoors";
  kit: string;
};
export type Filters = {
  time: "1h" | "halfday" | "day";
  budget: "free" | "under100" | "under300";
  location: "any" | "indoors" | "outdoors";
};
export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  allDay: boolean;
  type: "date" | "anniversary";
  note: string;
  done: boolean;
  wishId?: string;
  idea?: Idea;
  drawId?: string;
  memoryIds: string[];
  completedAt?: string;
};
export type Memory = {
  id: string;
  title: string;
  date: string;
  body: string;
  photos: string[];
  albumId: string | null;
  author: number;
  eventId?: string;
};
export type Album = {
  id: string;
  title: string;
  description: string;
  cover: string;
  memoryIds: string[];
};
export type Letter = {
  id: string;
  from: number;
  to: number;
  title: string;
  body: string;
  date: string;
  status: "draft" | "sent" | "archived";
  read: boolean;
  names?: string[];
};
export type Question = {
  id: string;
  kind: string;
  prompt: string;
  options: string[];
};
export type Round = {
  id: string;
  questions: Question[];
  firstRole: number;
  secondRole: number;
  first: Record<string, string>;
  second: Record<string, string>;
  stage: "first" | "handoff" | "second" | "reveal";
  step: number;
  date: string;
  names: string[];
};
export type Ticket = {
  id: string;
  sourceId: string;
  kind: "quiz" | "date";
  title: string;
  date: string;
  names: string[];
  quiz?: Round;
  reflection?: string;
  photos?: string[];
  memoryId?: string;
  eventId?: string;
};
export type Universe = {
  people: Person[];
  role: number;
  since: string;
  moods: Record<string, Record<string, string>>;
  notes: Record<string, { body: string; author: number }>;
  wishes: Wish[];
  events: Event[];
  memories: Memory[];
  albums: Album[];
  letters: Letter[];
  round: Round | null;
  draw: { id: string; idea: Idea; filterKey: string } | null;
  tickets: Ticket[];
};
export const seed = (): Universe => ({
  people: [
    { name: "阿澄", avatar: "sun", accent: "cyan" },
    { name: "小满", avatar: "moon", accent: "pink" },
  ],
  role: 0,
  since: dayOffset(-128),
  moods: { [today()]: { "0": "晴朗", "1": "有点想你" } },
  notes: {
    [today()]: {
      body: "今天路过那家花店，又想起了上次一起散步的傍晚。",
      author: 1,
    },
  },
  wishes: [
    {
      id: "sea",
      title: "一起去看海上星空",
      note: "找一片安静的海滩，等日落，也等第一颗星星。",
      tag: "去远方",
      done: false,
    },
    {
      id: "gallery",
      title: "逛一场没有做攻略的展览",
      note: "各选一幅最喜欢的画，再交换彼此的理由。",
      tag: "小小日常",
      done: false,
    },
    {
      id: "film",
      title: "交换一部最喜欢的电影",
      note: "先不看简介，留一点未知给这个晚上。",
      tag: "新尝试",
      done: false,
    },
  ],
  events: [
    {
      id: "gallery-date",
      title: "周末，一起去看展",
      date: dayOffset(2),
      time: "14:30",
      allDay: false,
      type: "date",
      note: "在地铁站见，结束后找一家小店吃晚饭。",
      done: false,
      wishId: "gallery",
      memoryIds: [],
    },
    {
      id: "night-walk",
      title: "沿着河边慢慢走",
      date: dayOffset(5),
      time: "18:30",
      allDay: false,
      type: "date",
      note: "不赶时间，走到哪儿算哪儿。",
      done: false,
      memoryIds: [],
    },
  ],
  albums: [
    {
      id: "coast",
      title: "去有海的地方",
      description: "风把时间吹慢了。海浪，日落，和身旁的你。",
      cover: "/assets/coast.png",
      memoryIds: ["coast-one"],
    },
    {
      id: "journey",
      title: "慢一点的旅途",
      description: "有些风景，想和你一起经过。",
      cover: "/assets/train.png",
      memoryIds: ["train-one"],
    },
    {
      id: "days",
      title: "寻常日子的微光",
      description: "那些没有特别安排，却很想记住的时刻。",
      cover: "/assets/morning.png",
      memoryIds: ["morning-one"],
    },
  ],
  memories: [
    {
      id: "coast-one",
      title: "风停在你的肩上",
      date: dayOffset(-16),
      body: "我们比日落早到了一会儿。\n你说，等最后一班船开走再回去吧。\n\n于是坐在堤岸上，听海水一遍遍把白天收回去。回程的时候，鞋子里都是沙，手机里是舍不得删掉的天空。",
      photos: ["/assets/coast.png"],
      albumId: "coast",
      author: 0,
    },
    {
      id: "train-one",
      title: "下一站，哪里都好",
      date: dayOffset(-38),
      body: "车次没有选最快的。我们想多看一会儿窗外。\n\n带来的书只读了三页，剩下的时间，都在给远处的云取名字。原来同行本身，就可以是目的地。",
      photos: ["/assets/train.png", "/assets/coast.png"],
      albumId: "journey",
      author: 1,
    },
    {
      id: "morning-one",
      title: "把这个早晨留久一点",
      date: dayOffset(-3),
      body: "那家小店刚刚开门，靠窗的位置正好空着。\n两杯热咖啡，一本翻到一半的书。我们聊了很久，直到阳光慢慢移到了桌子的另一边。",
      photos: ["/assets/morning.png"],
      albumId: "days",
      author: 0,
    },
  ],
  letters: [
    {
      id: "first-light",
      from: 1,
      to: 0,
      title: "想把这些小事都记下来",
      body: "阿澄：\n\n有时候，会忘记一起走过哪条路，喝过哪一家的咖啡。但我记得，在那些地方，我很开心。\n\n所以想有这样一个地方，收好那些不太起眼的时刻。以后再翻到的时候，还能想起那天的风。\n\n下一次见面，再去散步吧。\n\n小满",
      date: dayOffset(-1),
      status: "sent",
      read: false,
      names: ["阿澄", "小满"],
    },
  ],
  round: null,
  draw: null,
  tickets: [],
});
export const dateText = (date: string, year = false) =>
  new Date(date + "T12:00:00").toLocaleDateString("zh-CN", {
    ...(year ? { year: "numeric" as const } : {}),
    month: "long",
    day: "numeric",
  });
export const sortedEvents = (events: Event[]) =>
  [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
