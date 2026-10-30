import {
  createContext,
  useContext,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Coins,
  Dices,
  Flag,
  Heart,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { dayOffset, today, uid, useDraft, useStore } from "../shared/store";
import { Dialog, StorageMessage } from "../shared/ui";
import s from "./Arcade.module.css";

type Question = { id: string; kind: string; prompt: string; options: string[] };
type Filters = {
  time: "1h" | "halfday" | "day";
  budget: "free" | "under100" | "under300";
  location: "any" | "indoors" | "outdoors";
};
type Idea = {
  id: string;
  title: string;
  description: string;
  time: Filters["time"];
  budget: Filters["budget"];
  location: "indoors" | "outdoors";
  kit: string;
};
type Round = {
  id: string;
  questions: Question[];
  firstRole: number;
  secondRole: number;
  first: Record<string, string>;
  second: Record<string, string>;
  stage: "first" | "handoff" | "second" | "reveal";
  step: number;
  date: string;
};
type Plan = {
  id: string;
  sourceId: string;
  idea: Idea;
  date: string;
  note: string;
  status: "planned" | "completed";
  reflection: string;
  completedAt?: string;
  historyIds: string[];
};
type Stub = {
  id: string;
  sourceId: string;
  kind: "quiz" | "date";
  date: string;
  title: string;
  quiz?: Round;
  plan?: {
    id: string;
    idea: Idea;
    date: string;
    note: string;
    reflection: string;
    names: string[];
  };
  names: string[];
};
type Data = {
  role: number;
  names: string[];
  round: Round | null;
  draw: { id: string; idea: Idea; filterKey: string } | null;
  plans: Plan[];
  tickets: Stub[];
};
const bank: Question[] = [
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
const ideas: Idea[] = [
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
const timeLabel = { "1h": "一小时", halfday: "半天", day: "一整天" };
const budgetLabel = {
  free: "不花钱",
  under100: "100 元以内",
  under300: "300 元以内",
};
const locationLabel = { indoors: "室内", outdoors: "户外", any: "都可以" };
const budgetRank = { free: 0, under100: 1, under300: 2 };
const matches = (idea: Idea, filters: Filters) =>
  idea.time === filters.time &&
  budgetRank[idea.budget] <= budgetRank[filters.budget] &&
  (filters.location === "any" || idea.location === filters.location);
const seed = (): Data => ({
  role: 0,
  names: ["阿澄", "小满"],
  round: null,
  draw: null,
  plans: [
    {
      id: "first-plan",
      sourceId: "seed:plan",
      idea: ideas.find((i) => i.id === "picnic")!,
      date: dayOffset(2),
      note: "带上那本还没看完的书，水果各选一种。",
      status: "planned",
      reflection: "",
      historyIds: [],
    },
  ],
  tickets: [],
});
type Store = ReturnType<typeof useStore<Data>>;
const Context = createContext<Store | null>(null);
const useArcade = () => useContext(Context)!;
const fmt = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
function PhysicalButton({
  children,
  onClick,
  type = "button",
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      className={secondary ? s.secondary : s.button}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function PageHeading({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.heading}>
      <div>
        <p>{text}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
function Back({
  to = "/arcade",
  children = "回到游乐场",
}: {
  to?: string;
  children?: ReactNode;
}) {
  return (
    <Link className={s.back} to={to}>
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.empty}>
      <Star size={31} />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
function IdeaTags({ idea }: { idea: Idea }) {
  return (
    <div className={s.ideaTags}>
      <span>
        <Clock3 size={13} />
        {timeLabel[idea.time]}
      </span>
      <span>
        <Coins size={13} />
        {budgetLabel[idea.budget]}
      </span>
      <span>
        <MapPin size={13} />
        {locationLabel[idea.location]}
      </span>
    </div>
  );
}

export default function Arcade() {
  const store = useStore<Data>("arcade", seed);
  const [settings, setSettings] = useState(false);
  const location = useLocation();
  const focused = location.pathname === "/arcade/quiz" && !!store.data.round;
  return (
    <Context.Provider value={store}>
      <div className={`${s.app} ${focused ? s.focused : ""}`}>
        <header className={s.header}>
          <Link to="/arcade" className={s.brand}>
            <span className={s.brandIcon}>
              <Heart size={22} fill="currentColor" />
            </span>
            <span>
              心动游乐场<small>PLAY FOR TWO</small>
            </span>
          </Link>
          <nav className={s.desktopNav} aria-label="游乐场导航">
            <Navigation />
          </nav>
          <div className={s.headerEnd}>
            <button
              onClick={() => setSettings(true)}
              className={s.roleButton}
              aria-label="身份与游乐场设置"
            >
              <Users size={16} />
              <span>{store.data.names[store.data.role]}</span>
              <Settings size={13} />
            </button>
            <Link className={s.chooser} to="/" aria-label="返回四个空间">
              <ArrowDownLeft size={16} />
              <span>四个空间</span>
            </Link>
          </div>
        </header>
        <main className={s.main}>
          <StorageMessage error={store.error} saving={store.saving} />
          {store.ready ? (
            <Routes>
              <Route index element={<Hall />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="draw" element={<Draw />} />
              <Route path="plans" element={<Plans />} />
              <Route path="plans/:id" element={<PlanPage />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="tickets/:id" element={<TicketPage />} />
              <Route path="*" element={<Navigate to="/arcade" replace />} />
            </Routes>
          ) : (
            <div className={s.loading}>游乐场正在开门…</div>
          )}
        </main>
        <footer className={s.footer}>
          <span>
            <Heart size={11} fill="currentColor" />
            两人一队，快乐加倍。
          </span>
          <span>本机双人演示 · 所有记录留在此浏览器</span>
        </footer>
        <nav className={s.mobileNav} aria-label="游乐场移动导航">
          <Navigation />
        </nav>
        {settings && <SettingsPanel onClose={() => setSettings(false)} />}
      </div>
    </Context.Provider>
  );
}
function Navigation() {
  return (
    <div className={s.navItems}>
      {[
        { to: "/arcade", name: "游乐场", icon: Flag, end: true },
        { to: "/arcade/draw", name: "约会抽签", icon: Dices },
        { to: "/arcade/plans", name: "待出发", icon: Heart },
        { to: "/arcade/tickets", name: "票根", icon: Ticket },
      ].map(({ to, name, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? s.activeNav : "")}
        >
          <Icon size={17} />
          <span>{name}</span>
        </NavLink>
      ))}
    </div>
  );
}
function Hall() {
  const { data } = useArcade();
  const nextPlan = data.plans
    .filter((p) => p.status === "planned")
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))[0];
  return (
    <>
      <PageHeading
        title="选一台，开始玩。"
        text={`${data.names[0]} + ${data.names[1]}，今天也组队。`}
      >
        <span className={s.openStamp}>
          <i />
          双人营业中
        </span>
      </PageHeading>
      <div className={s.hall}>
        <section className={s.quizDevice}>
          <div className={s.deviceTop}>
            <span>
              <i />
              <i />
            </span>
            <small>默契测试机</small>
            <Star size={19} fill="currentColor" />
          </div>
          <div className={s.quizWindow}>
            <div className={s.consoleMeter}>
              <span>一起作答</span>
              <i />
              <i />
              <i />
              <small>3 QUESTIONS</small>
            </div>
            <div className={s.playerTokens}>
              <div className={s.playerToken}>
                <span>?</span>
                <small>{data.names[0]}</small>
              </div>
              <Heart className={s.windowHeart} fill="currentColor" size={32} />
              <div className={`${s.playerToken} ${s.secondToken}`}>
                <span>?</span>
                <small>{data.names[1]}</small>
              </div>
            </div>
            <p>
              同一个问题，
              <br />
              我们会选一样的答案吗？
            </p>
            <div className={s.soundDots}>
              {Array.from({ length: 9 }).map((_, i) => (
                <i key={i} />
              ))}
            </div>
          </div>
          <div className={s.deviceFoot}>
            <div>
              <h2>默契碰碰机</h2>
              <p>各答 3 题，再一起揭晓。</p>
            </div>
            <Link to="/arcade/quiz" className={s.yellowButton}>
              {data.round && data.round.stage !== "reveal"
                ? "继续这局"
                : "来玩一局"}
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className={s.coinSlot}>
            <span />
            FOR TWO
          </div>
        </section>
        <section className={s.drawDevice}>
          <div className={s.drawDeviceHead}>
            <span>约会灵感补给站</span>
            <Sparkles size={18} />
          </div>
          <div className={s.gacha}>
            <div className={s.gachaRing}>
              <div className={s.gachaGlass}>
                <div className={s.capsuleOne} />
                <div className={s.capsuleTwo} />
                <div className={s.capsuleThree} />
                <span className={s.glassShine} />
              </div>
              <span className={s.gachaStar}>✦</span>
            </div>
            <div className={s.gachaBase}>
              <span className={s.gachaDial}>
                <i />
              </span>
              <span className={s.gachaOutlet} />
            </div>
            <span className={s.gachaShadow} />
          </div>
          <div className={s.drawDeviceCopy}>
            <h2>今天，去哪儿？</h2>
            <p>
              把纠结交给抽签，
              <br />
              把时间留给彼此。
            </p>
            <Link to="/arcade/draw" className={s.creamButton}>
              转出一个约会 <Dices size={18} />
            </Link>
          </div>
        </section>
      </div>
      <div className={s.hallBottom}>
        <Link
          to={nextPlan ? `/arcade/plans/${nextPlan.id}` : "/arcade/plans"}
          className={s.departure}
        >
          <span className={s.departureIcon}>
            <Flag size={22} />
          </span>
          <div>
            <small>下一站 · 待出发</small>
            <h3>{nextPlan?.idea.title || "还没有安排好的约会"}</h3>
            <p>
              {nextPlan
                ? `${nextPlan.date ? fmt(nextPlan.date) : "日期待定"} · ${nextPlan.note || "记得为彼此留一点时间。"}`
                : "抽到心仪的灵感，就把它放进计划里。"}
            </p>
          </div>
          <ChevronRight size={20} />
        </Link>
        <Link to="/arcade/tickets" className={s.ticketCounter}>
          <Ticket size={30} strokeWidth={1.6} />
          <strong>{String(data.tickets.length).padStart(2, "0")}</strong>
          <span>
            张快乐票根
            <br />
            <small>一起玩过，都算数。</small>
          </span>
          <ArrowRight size={18} />
        </Link>
      </div>
      {data.round && data.round.stage !== "reveal" && (
        <Link to="/arcade/quiz" className={s.resumeNotice}>
          <ShieldCheck size={17} />
          有一局还没玩完。答案已收好，点击继续。
          <ArrowRight size={16} />
        </Link>
      )}
    </>
  );
}

function Quiz() {
  const store = useArcade();
  const { data, change, saving } = store;
  const round = data.round;
  const [resumed, setResumed] = useState(false);
  const [abandon, setAbandon] = useState(false);
  const [kind, setKind] = useDraft("arcade:quiz-kind", "全部频道");
  async function start() {
    const questions = shuffle(
      bank.filter((q) => kind === "全部频道" || q.kind === kind),
    ).slice(0, 3);
    if (
      await change((p) => ({
        ...p,
        round: {
          id: uid(),
          questions,
          firstRole: p.role,
          secondRole: p.role === 0 ? 1 : 0,
          first: {},
          second: {},
          stage: "first",
          step: 0,
          date: today(),
        },
      }))
    )
      setResumed(true);
  }
  async function abandonRound() {
    if (await change((p) => ({ ...p, round: null }))) {
      setAbandon(false);
      setResumed(false);
    }
  }
  const unfinished = round && round.stage !== "reveal";
  return (
    <>
      <Back />
      <PageHeading title="默契碰碰机" text="没有标准答案，只有多知道你一点。">
        <span className={s.gameTag}>双人 / 3 题</span>
      </PageHeading>
      {!round ? (
        <section className={s.quizStart}>
          <div className={s.quizRules}>
            <span className={s.rulesIcon}>
              <Users size={45} strokeWidth={1.6} />
            </span>
            <h2>两个人，分开作答。</h2>
            <p>
              第一位答完后，把设备交给对方。
              <br />
              两个人都答完，才会揭晓彼此的选择。
            </p>
            <ol>
              <li>
                <strong>1</strong>
                <span>{data.names[data.role]}先回答 3 题</span>
              </li>
              <li>
                <strong>2</strong>
                <span>
                  交给{data.names[data.role === 0 ? 1 : 0]}，独立回答同样的题
                </span>
              </li>
              <li>
                <strong>3</strong>
                <span>一起揭晓，留一张专属票根</span>
              </li>
            </ol>
          </div>
          <div className={s.quizChannel}>
            <h3>今天想聊哪个频道？</h3>
            <div className={s.channelChoices}>
              {["全部频道", "日常频道", "出门频道", "脑洞频道"].map((k) => (
                <button
                  aria-pressed={kind === k}
                  key={k}
                  className={kind === k ? s.selectedChannel : ""}
                  onClick={() => setKind(k)}
                >
                  <span>
                    {k === "全部频道"
                      ? "✦"
                      : k === "日常频道"
                        ? "☼"
                        : k === "出门频道"
                          ? "↗"
                          : "⌁"}
                  </span>
                  {k}
                  {kind === k && <Check size={17} />}
                </button>
              ))}
            </div>
            <PhysicalButton disabled={saving} onClick={start}>
              由{data.names[data.role]}开始 <ArrowRight size={17} />
            </PhysicalButton>
            <p className={s.smallPrint}>
              每局从本地题库抽取 3 题。
              <br />
              想换先答的人，可在右上角切换身份。
            </p>
          </div>
        </section>
      ) : !resumed ? (
        <section className={s.resumeScreen}>
          <span className={s.lockedRound}>
            <ShieldCheck size={48} strokeWidth={1.5} />
          </span>
          <p className={s.gameTag}>这一局，已经为你留好</p>
          <h2>
            {round.stage === "handoff"
              ? `等${data.names[round.secondRole]}接棒`
              : round.stage === "reveal"
                ? "答案已经揭晓，随时重温。"
                : `轮到${data.names[round.stage === "first" ? round.firstRole : round.secondRole]}作答`}
          </h2>
          <p>
            {round.stage === "reveal"
              ? "你们的共同选择，和那些有趣的小差别，都在里面。"
              : "未完成前不会展示任何一方的完整答案。"}
          </p>
          <PhysicalButton onClick={() => setResumed(true)}>
            {round.stage === "reveal" ? "重温这局结果" : "继续这一局"}
            <ArrowRight size={17} />
          </PhysicalButton>
          {unfinished && (
            <button className={s.underlined} onClick={() => setAbandon(true)}>
              放弃这局，重新开始
            </button>
          )}
        </section>
      ) : round.stage === "handoff" ? (
        <section className={s.handoff}>
          <div className={s.handoffPlayers}>
            <span>
              {data.names[round.firstRole].slice(0, 1)}
              <Check size={20} />
            </span>
            <ArrowRight size={32} />
            <span>
              {data.names[round.secondRole].slice(0, 1)}
              <i>?</i>
            </span>
          </div>
          <span className={s.gameTag}>先把屏幕交给对方</span>
          <h2>{data.names[round.firstRole]}的答案，已经封好。</h2>
          <p>
            现在请{data.names[round.secondRole]}独立回答同样的 3 道题。
            <br />
            答完之前，彼此的选择不会显示。
          </p>
          <PhysicalButton
            disabled={saving}
            onClick={() =>
              change((p) =>
                p.round
                  ? {
                      ...p,
                      role: p.round.secondRole,
                      round: { ...p.round, stage: "second", step: 0 },
                    }
                  : p,
              )
            }
          >
            我是{data.names[round.secondRole]}，开始作答{" "}
            <ArrowRight size={17} />
          </PhysicalButton>
          <button className={s.underlined} onClick={() => setAbandon(true)}>
            放弃这一局
          </button>
        </section>
      ) : round.stage === "reveal" ? (
        <RoundReveal
          round={round}
          onNew={async () => {
            if (await change((p) => ({ ...p, round: null }))) setResumed(false);
          }}
        />
      ) : (
        <QuizQuestion round={round} onAbandon={() => setAbandon(true)} />
      )}
      {abandon && (
        <Dialog
          title="这局先不玩了吗？"
          onClose={() => setAbandon(false)}
          className={s.dialog}
        >
          <p>本局尚未揭晓的答案会被清除。已经保存的票根和约会计划会保留。</p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <PhysicalButton secondary onClick={() => setAbandon(false)}>
              继续这局
            </PhysicalButton>
            <PhysicalButton disabled={saving} onClick={abandonRound}>
              确认放弃
            </PhysicalButton>
          </div>
        </Dialog>
      )}
    </>
  );
}
function QuizQuestion({
  round,
  onAbandon,
}: {
  round: Round;
  onAbandon: () => void;
}) {
  const { data, change, saving } = useArcade();
  const first = round.stage === "first";
  const role = first ? round.firstRole : round.secondRole;
  const answers = first ? round.first : round.second;
  const question = round.questions[round.step];
  if (data.role !== role)
    return (
      <section className={s.resumeScreen}>
        <span className={s.lockedRound}>
          <ShieldCheck size={48} />
        </span>
        <h2>这一题，先留给{data.names[role]}。</h2>
        <p>
          当前是{data.names[data.role]}的身份。
          <br />
          请把设备交回{data.names[role]}，完成这轮作答后再交接。
        </p>
        <PhysicalButton
          disabled={saving}
          onClick={() => change((p) => ({ ...p, role }))}
        >
          {data.names[role]}回来了，继续
        </PhysicalButton>
        <Back>先回游乐场</Back>
      </section>
    );
  if (!question)
    return (
      <Empty title="这一局暂时无法继续" text="可以放弃这一局，重新抽取三道题。">
        <PhysicalButton onClick={onAbandon}>重新开始</PhysicalButton>
      </Empty>
    );
  const chosen = answers[question.id];
  async function select(answer: string) {
    await change((p) =>
      p.round && p.round.id === round.id
        ? {
            ...p,
            round: {
              ...p.round,
              [first ? "first" : "second"]: {
                ...p.round[first ? "first" : "second"],
                [question.id]: answer,
              },
            },
          }
        : p,
    );
  }
  async function next() {
    if (!chosen) return;
    await change((p) =>
      p.round && p.round.id === round.id
        ? {
            ...p,
            round: {
              ...p.round,
              step: round.step < 2 ? round.step + 1 : 0,
              stage:
                round.step < 2 ? round.stage : first ? "handoff" : "reveal",
            },
          }
        : p,
    );
  }
  return (
    <div className={s.quizPlay}>
      <aside className={s.playerPanel}>
        <span className={s.playerBadge}>{data.names[role].slice(0, 1)}</span>
        <small>现在由你作答</small>
        <h2>{data.names[role]}</h2>
        <div className={s.roundProgress}>
          {round.questions.map((q, i) => (
            <span
              key={q.id}
              className={
                i === round.step
                  ? s.currentStep
                  : answers[q.id]
                    ? s.finishedStep
                    : ""
              }
            >
              {answers[q.id] && i !== round.step ? <Check size={15} /> : i + 1}
            </span>
          ))}
        </div>
        <p>
          <ShieldCheck size={15} />
          {first ? "你的答案暂时保密。" : "对方的答案仍然封存。"}
        </p>
        <button className={s.underlined} onClick={onAbandon}>
          放弃本局
        </button>
      </aside>
      <section className={s.questionPanel}>
        <div className={s.questionTop}>
          <span>{question.kind}</span>
          <strong>
            {String(round.step + 1).padStart(2, "0")}
            <small> / 03</small>
          </strong>
        </div>
        <h2>{question.prompt}</h2>
        <div className={s.answerChoices}>
          {question.options.map((option, i) => (
            <button
              disabled={saving}
              key={option}
              aria-pressed={chosen === option}
              className={chosen === option ? s.chosenAnswer : ""}
              onClick={() => select(option)}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              <strong>{option}</strong>
              {chosen === option ? <Check size={20} /> : <i />}
            </button>
          ))}
        </div>
        <div className={s.questionActions}>
          {round.step > 0 ? (
            <button
              disabled={saving}
              className={s.textButton}
              onClick={() =>
                change((p) =>
                  p.round
                    ? {
                        ...p,
                        round: {
                          ...p.round,
                          step: Math.max(0, p.round.step - 1),
                        },
                      }
                    : p,
                )
              }
            >
              <ArrowLeft size={15} />
              上一题
            </button>
          ) : (
            <span />
          )}
          <PhysicalButton disabled={saving || !chosen} onClick={next}>
            {round.step < 2
              ? "下一题"
              : first
                ? "答好了，交给对方"
                : "一起揭晓答案"}
            <ArrowRight size={16} />
          </PhysicalButton>
        </div>
      </section>
    </div>
  );
}
function RoundReveal({ round, onNew }: { round: Round; onNew: () => void }) {
  const { data, change, saving } = useArcade();
  const saved = data.tickets.find((t) => t.sourceId === "quiz:" + round.id);
  const [savedNow, setSavedNow] = useState(false);
  async function save() {
    const ok = await change((p) =>
      p.tickets.some((t) => t.sourceId === "quiz:" + round.id)
        ? p
        : {
            ...p,
            tickets: [
              {
                id: uid(),
                sourceId: "quiz:" + round.id,
                kind: "quiz",
                date: today(),
                title: "我们的小默契",
                quiz: structuredClone(round),
                names: [...p.names],
              },
              ...p.tickets,
            ],
          },
    );
    if (ok) setSavedNow(true);
  }
  return (
    <>
      <QuizResult round={round} names={data.names} />
      <div className={s.revealActions}>
        <PhysicalButton secondary disabled={saving} onClick={onNew}>
          <RotateCcw size={16} />
          换个频道，再来一局
        </PhysicalButton>
        {saved ? (
          <Link className={s.button} to={`/arcade/tickets/${saved.id}`}>
            <Ticket size={17} />
            {savedNow ? "票根收好啦，去看看" : "查看这张票根"}
          </Link>
        ) : (
          <PhysicalButton disabled={saving} onClick={save}>
            <Ticket size={17} />
            收好这张默契票根
          </PhysicalButton>
        )}
      </div>
    </>
  );
}
function QuizResult({ round, names }: { round: Round; names: string[] }) {
  const count = round.questions.filter(
    (q) => round.first[q.id] === round.second[q.id],
  ).length;
  return (
    <div className={s.result}>
      <section className={s.scorePanel}>
        <span className={s.gameTag}>本局心动成绩单</span>
        <div className={s.score}>
          <strong>{count}</strong>
          <span>/ 3</span>
          <Star size={40} fill="currentColor" />
        </div>
        <h2>
          {count === 3
            ? "这次，我们想到一起了！"
            : count === 0
              ? "三种不同，多认识你一点。"
              : "有默契，也有新发现。"}
        </h2>
        <p>选择不同也很好，正好听听你的理由。</p>
        <div className={s.resultPlayers}>
          <span>{names[round.firstRole]}</span>
          <Heart size={15} fill="currentColor" />
          <span>{names[round.secondRole]}</span>
        </div>
      </section>
      <section className={s.answerReveal}>
        {round.questions.map((q, i) => {
          const same = round.first[q.id] === round.second[q.id];
          return (
            <article key={q.id} className={s.revealedQuestion}>
              <div>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <small className={same ? s.matchPill : s.differentPill}>
                  {same ? "碰上了！" : "不一样的可爱"}
                </small>
              </div>
              <h3>{q.prompt}</h3>
              <p>
                <strong>{names[round.firstRole]}</strong>
                <span>{round.first[q.id] || "未记录"}</span>
              </p>
              <p>
                <strong>{names[round.secondRole]}</strong>
                <span>{round.second[q.id] || "未记录"}</span>
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Draw() {
  const store = useArcade();
  const { data, change, saving } = store;
  const [filters, setFilters] = useDraft<Filters>("arcade:draw-filters", {
    time: "1h",
    budget: "under100",
    location: "any",
  });
  const [empty, setEmpty] = useState(false);
  const [rolling, setRolling] = useState(false);
  const pool = ideas.filter((i) => matches(i, filters));
  const filterKey = JSON.stringify(filters);
  const current = data.draw?.filterKey === filterKey ? data.draw : null;
  const saved = current
    ? data.plans.find((p) => p.sourceId === "draw:" + current.id)
    : undefined;
  async function draw() {
    if (!pool.length) {
      setEmpty(true);
      return;
    }
    setRolling(true);
    setEmpty(false);
    const different = pool.filter((i) => i.id !== current?.idea.id);
    const chosen = shuffle(different.length ? different : pool)[0];
    try {
      await change((p) => ({
        ...p,
        draw: { id: uid(), idea: chosen, filterKey },
      }));
    } finally {
      setRolling(false);
    }
  }
  async function savePlan() {
    if (!current) return;
    await change((p) =>
      p.plans.some((plan) => plan.sourceId === "draw:" + current.id)
        ? p
        : {
            ...p,
            plans: [
              ...p.plans,
              {
                id: uid(),
                sourceId: "draw:" + current.id,
                idea: structuredClone(current.idea),
                date: "",
                note: "",
                status: "planned",
                reflection: "",
                historyIds: [],
              },
            ],
          },
    );
  }
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setEmpty(false);
  };
  return (
    <>
      <Back />
      <PageHeading
        title="转出今天的约会"
        text="先选一个范围，剩下的交给一点运气。"
      >
        <span className={s.gameTag}>{ideas.length} 个本地灵感</span>
      </PageHeading>
      <div className={s.drawLayout}>
        <section className={s.filterPanel}>
          <div className={s.filterTitle}>
            <Dices size={26} />
            <h2>今天的出发条件</h2>
          </div>
          <fieldset>
            <legend>
              <Clock3 size={15} />
              我们有多少时间？
            </legend>
            <div className={s.filterChoices}>
              {(["1h", "halfday", "day"] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={filters.time === value}
                  className={filters.time === value ? s.selectedFilter : ""}
                  onClick={() => update("time", value)}
                >
                  {timeLabel[value]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <Coins size={15} />
              两个人的预算
            </legend>
            <div className={s.filterChoices}>
              {(["free", "under100", "under300"] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={filters.budget === value}
                  className={filters.budget === value ? s.selectedFilter : ""}
                  onClick={() => update("budget", value)}
                >
                  {budgetLabel[value]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <MapPin size={15} />
              想待在哪里？
            </legend>
            <div className={s.filterChoices}>
              {(["any", "indoors", "outdoors"] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={filters.location === value}
                  className={filters.location === value ? s.selectedFilter : ""}
                  onClick={() => update("location", value)}
                >
                  {locationLabel[value]}
                </button>
              ))}
            </div>
          </fieldset>
          <div className={s.poolCount}>
            <span>{pool.length}</span>个灵感符合今天的条件
          </div>
          <PhysicalButton onClick={draw} disabled={saving || rolling}>
            <Dices size={18} />
            {rolling ? "灵感出签中…" : current ? "再转一次" : "抽一个，一起去"}
          </PhysicalButton>
          <p className={s.smallPrint}>
            预算按两人合计估算，低于所选上限的灵感也会入选。交通及开放时间，出发前再确认。
          </p>
        </section>
        <section
          className={`${s.drawOutput} ${current ? s.hasDraw : ""}`}
          aria-live="polite"
        >
          {current ? (
            <>
              <div className={s.outputSlot}>
                <span />
              </div>
              <article key={current.id} className={s.drawSlip}>
                <div className={s.slipTop}>
                  <span>双人约会签</span>
                  <Star size={18} fill="currentColor" />
                  <span>出发吧</span>
                </div>
                <span className={s.slipDoodle}>
                  <MapPin size={40} strokeWidth={1.6} />
                  <Sparkles size={23} />
                </span>
                <h2>{current.idea.title}</h2>
                <IdeaTags idea={current.idea} />
                <p>{current.idea.description}</p>
                <div className={s.kit}>
                  <strong>出发前的小准备</strong>
                  <span>{current.idea.kit}</span>
                </div>
                <div className={s.slipDashed} />
                <div className={s.slipFoot}>
                  {saved ? (
                    <>
                      <span>
                        <Check size={15} />
                        {saved.status === "completed"
                          ? "这次约会已经一起完成"
                          : "已经在待出发里啦"}
                      </span>
                      <Link
                        className={s.button}
                        to={`/arcade/plans/${saved.id}`}
                      >
                        {saved.status === "completed"
                          ? "重温这次约会"
                          : "安排哪一天"}{" "}
                        <ArrowRight size={16} />
                      </Link>
                    </>
                  ) : (
                    <PhysicalButton disabled={saving} onClick={savePlan}>
                      <Plus size={17} />
                      放进我们的待出发
                    </PhysicalButton>
                  )}
                </div>
              </article>
            </>
          ) : empty || !pool.length ? (
            <div className={s.drawWaiting}>
              <span className={s.emptyMachine}>
                <Dices size={45} />
              </span>
              <h2>这次的条件有点严格。</h2>
              <p>
                暂时没有完全符合的灵感，
                <br />
                放宽一点范围，再转一次吧。
              </p>
              <PhysicalButton
                secondary
                onClick={() => {
                  setFilters({
                    time: "halfday",
                    budget: "under300",
                    location: "any",
                  });
                  setEmpty(false);
                }}
              >
                放宽条件，看看更多
              </PhysicalButton>
            </div>
          ) : (
            <div className={s.drawWaiting}>
              <div className={s.waitingDice}>
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <h2>今天的灵感，还在里面。</h2>
              <p>
                选好左边的条件，
                <br />
                一起转出一个小小的可能。
              </p>
              <span className={s.outputHint}>不做选择题，做行动派。</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Plans() {
  const { data } = useArcade();
  const [tab, setTab] = useState("planned");
  const list = data.plans
    .filter((p) => p.status === tab)
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  return (
    <>
      <PageHeading
        title="下一站，一起出发。"
        text="灵感收好了，把它变成真正的一天。"
      >
        <Link className={s.button} to="/arcade/draw">
          <Plus size={17} />
          再抽一个
        </Link>
      </PageHeading>
      <div className={s.planTabs}>
        <button
          className={tab === "planned" ? s.activeTab : ""}
          onClick={() => setTab("planned")}
        >
          待出发{" "}
          <span>{data.plans.filter((p) => p.status === "planned").length}</span>
        </button>
        <button
          className={tab === "completed" ? s.activeTab : ""}
          onClick={() => setTab("completed")}
        >
          我们去过{" "}
          <span>
            {data.plans.filter((p) => p.status === "completed").length}
          </span>
        </button>
      </div>
      <div className={s.planList}>
        {list.map((p) => (
          <Link to={`/arcade/plans/${p.id}`} key={p.id} className={s.planItem}>
            <div
              className={`${s.planDate} ${p.status === "completed" ? s.completedDate : ""}`}
            >
              {p.status === "completed" ? (
                <Check size={27} />
              ) : p.date ? (
                <>
                  <strong>{new Date(p.date + "T12:00:00").getDate()}</strong>
                  <small>
                    {new Date(p.date + "T12:00:00").getMonth() + 1} 月
                  </small>
                </>
              ) : (
                <>
                  <Flag size={24} />
                  <small>日期待定</small>
                </>
              )}
            </div>
            <div className={s.planInfo}>
              <div className={s.planItemTop}>
                <small>
                  {p.status === "completed"
                    ? `完成于 ${p.completedAt ? fmt(p.completedAt) : "那一天"}`
                    : p.date
                      ? fmt(p.date)
                      : "等一个空闲的日子"}
                </small>
                <span>
                  {p.status === "completed"
                    ? `${p.historyIds.filter((id) => data.tickets.some((t) => t.id === id)).length} 张历史票根`
                    : "双人约会"}
                </span>
              </div>
              <h2>{p.idea.title}</h2>
              <IdeaTags idea={p.idea} />
              <p>
                {p.status === "completed"
                  ? p.reflection || "这一天，我们一起完成了。"
                  : p.note || p.idea.description}
              </p>
            </div>
            <ChevronRight size={22} />
          </Link>
        ))}
      </div>
      {!list.length && (
        <Empty
          title={
            tab === "planned" ? "下一次约会，还没抽到。" : "等一场真正的出发。"
          }
          text={
            tab === "planned"
              ? "去转一个灵感，给下一次见面留个位置。"
              : "把待出发的约会标记完成，就会在这里留下足迹。"
          }
        >
          <Link
            className={s.button}
            to={tab === "planned" ? "/arcade/draw" : "/arcade/plans"}
            onClick={() => setTab("planned")}
          >
            {tab === "planned" ? "去抽一个约会" : "看看待出发"}
            <ArrowRight size={16} />
          </Link>
        </Empty>
      )}
    </>
  );
}
function PlanPage() {
  const { id } = useParams();
  const { data } = useArcade();
  const plan = data.plans.find((p) => p.id === id);
  return plan ? (
    <PlanEditor key={plan.id + ":" + plan.status} plan={plan} />
  ) : (
    <>
      <Back to="/arcade/plans">回到待出发</Back>
      <Empty
        title="这个计划已经不在了。"
        text="也许它被删除了。已经留下的历史票根还会保留。"
      >
        <Link to="/arcade/plans" className={s.button}>
          看看其他计划
        </Link>
      </Empty>
    </>
  );
}
function PlanEditor({ plan }: { plan: Plan }) {
  const store = useArcade();
  const { data, change, saving } = store;
  const navigate = useNavigate();
  const [form, setForm, clear] = useDraft("arcade:plan:" + plan.id, {
    date: plan.date,
    note: plan.note,
  });
  const [remove, setRemove] = useState(false);
  const [complete, setComplete] = useState(false);
  const [reopen, setReopen] = useState(false);
  const [saved, setSaved] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (
      await change((p) => ({
        ...p,
        plans: p.plans.map((v) =>
          v.id === plan.id ? { ...v, date: form.date, note: form.note } : v,
        ),
      }))
    ) {
      clear();
      setSaved(true);
    }
  }
  return (
    <>
      <Back to="/arcade/plans">回到待出发</Back>
      <PageHeading
        title={plan.idea.title}
        text={
          plan.status === "completed"
            ? "我们一起去过的地方，也可以再去一次。"
            : "把偶然抽到的灵感，认真安排一下。"
        }
      />
      <div className={s.planDetail}>
        <section className={s.planDescription}>
          <span className={s.planFlag}>
            <Flag size={35} fill="currentColor" />
          </span>
          <IdeaTags idea={plan.idea} />
          <p>{plan.idea.description}</p>
          <div className={s.kit}>
            <strong>出发前的小准备</strong>
            <span>{plan.idea.kit}</span>
          </div>
          {plan.status === "completed" && (
            <div className={s.reflectionPreview}>
              <span>
                <Check size={15} />
                已经一起完成
              </span>
              <h2>那天的小感受</h2>
              <p>{plan.reflection || "这一天，和你一起完成。"}</p>
            </div>
          )}
          <div className={s.planHistory}>
            <h3>这次约会的历史票根</h3>
            {plan.historyIds
              .filter((id) => data.tickets.some((t) => t.id === id))
              .map((id) => (
                <Link key={id} to={`/arcade/tickets/${id}`}>
                  <Ticket size={16} />
                  {fmt(data.tickets.find((t) => t.id === id)!.date)} 的快乐票根
                  <ArrowRight size={14} />
                </Link>
              ))}
            {!plan.historyIds.some((id) =>
              data.tickets.some((t) => t.id === id),
            ) && <p>完成约会后，就会在这里留下票根。</p>}
          </div>
        </section>
        <form className={s.editor} onSubmit={save}>
          <div className={s.editorHeader}>
            <Pencil size={18} />
            <h2>
              {plan.status === "completed"
                ? "这次约会的安排"
                : "我们的出发安排"}
            </h2>
          </div>
          <label>
            安排在哪一天
            <input
              type="date"
              value={form.date}
              onChange={(e) => {
                setSaved(false);
                setForm((p) => ({ ...p, date: e.target.value }));
              }}
            />
          </label>
          <label>
            记下一点小安排
            <textarea
              rows={5}
              maxLength={1500}
              value={form.note}
              onChange={(e) => {
                setSaved(false);
                setForm((p) => ({ ...p, note: e.target.value }));
              }}
              placeholder="在哪见面，带些什么，或是想和对方说的话。"
            />
          </label>
          <StorageMessage error={store.error} saving={saving} />
          {saved && (
            <p className={s.saveSuccess} role="status">
              <Check size={15} />
              安排已经收好。
            </p>
          )}
          <div className={s.formActions}>
            <PhysicalButton secondary type="submit" disabled={saving}>
              保存安排
            </PhysicalButton>
            {plan.status === "planned" ? (
              <PhysicalButton
                disabled={saving}
                onClick={() => setComplete(true)}
              >
                <Check size={16} />
                我们去过啦
              </PhysicalButton>
            ) : (
              <PhysicalButton disabled={saving} onClick={() => setReopen(true)}>
                <RotateCcw size={15} />
                再去一次
              </PhysicalButton>
            )}
          </div>
          <p className={s.smallPrint}>
            未保存的安排会留在本机。
            {plan.status === "completed"
              ? "修改安排不会改动已经生成的历史票根。"
              : "标记完成时，会同时保存当前安排并生成一张票根。"}
          </p>
          <button
            type="button"
            className={s.dangerButton}
            onClick={() => setRemove(true)}
          >
            <Trash2 size={15} />
            删除这个计划
          </button>
        </form>
      </div>
      {complete && (
        <CompletePlan
          plan={plan}
          arrangement={form}
          onClose={() => setComplete(false)}
          onSaved={clear}
        />
      )}
      {remove && (
        <Dialog
          title="删除这次约会计划？"
          onClose={() => setRemove(false)}
          className={s.dialog}
        >
          <p>
            「{plan.idea.title}」会从计划中移除，已经留下的历史票根会继续保留。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <PhysicalButton secondary onClick={() => setRemove(false)}>
              继续保留
            </PhysicalButton>
            <PhysicalButton
              disabled={saving}
              onClick={async () => {
                if (
                  await change((p) => ({
                    ...p,
                    plans: p.plans.filter((v) => v.id !== plan.id),
                  }))
                ) {
                  clear();
                  navigate("/arcade/plans");
                }
              }}
            >
              确认删除计划
            </PhysicalButton>
          </div>
        </Dialog>
      )}
      {reopen && (
        <Dialog
          title="把这次约会再安排一次？"
          onClose={() => setReopen(false)}
          className={s.dialog}
        >
          <p>
            计划会重新进入「待出发」。已有的票根和当时的感受会保留，再次完成会生成一张新的历史票根。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <PhysicalButton secondary onClick={() => setReopen(false)}>
              先留在回忆里
            </PhysicalButton>
            <PhysicalButton
              disabled={saving}
              onClick={async () => {
                if (
                  await change((p) => ({
                    ...p,
                    plans: p.plans.map((v) =>
                      v.id === plan.id
                        ? {
                            ...v,
                            status: "planned",
                            date: form.date,
                            note: form.note,
                          }
                        : v,
                    ),
                  }))
                ) {
                  clear();
                  setReopen(false);
                }
              }}
            >
              重新放进待出发
            </PhysicalButton>
          </div>
        </Dialog>
      )}
    </>
  );
}
function CompletePlan({
  plan,
  arrangement,
  onClose,
  onSaved,
}: {
  plan: Plan;
  arrangement: { date: string; note: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const store = useArcade();
  const navigate = useNavigate();
  const [reflection, setReflection, clear] = useDraft(
    "arcade:reflection:" + plan.id,
    "",
  );
  const [ticketId] = useState(uid);
  async function complete(e: FormEvent) {
    e.preventDefault();
    if (
      await store.change((p) => {
        const current = p.plans.find((v) => v.id === plan.id);
        if (
          !current ||
          current.status === "completed" ||
          p.tickets.some((t) => t.id === ticketId)
        )
          return p;
        const ticket: Stub = {
          id: ticketId,
          sourceId: "plan:" + plan.id + ":" + ticketId,
          kind: "date",
          date: today(),
          title: plan.idea.title,
          names: [...p.names],
          plan: {
            id: plan.id,
            idea: structuredClone(plan.idea),
            date: arrangement.date,
            note: arrangement.note,
            reflection: reflection.trim(),
            names: [...p.names],
          },
        };
        return {
          ...p,
          plans: p.plans.map((v) =>
            v.id === plan.id
              ? {
                  ...v,
                  ...arrangement,
                  status: "completed",
                  completedAt: today(),
                  reflection: reflection.trim(),
                  historyIds: [...v.historyIds, ticketId],
                }
              : v,
          ),
          tickets: [ticket, ...p.tickets],
        };
      })
    ) {
      clear();
      onSaved();
      navigate("/arcade/tickets/" + ticketId);
    }
  }
  return (
    <Dialog
      title="把这一天，做成一张票根。"
      onClose={onClose}
      className={s.dialog}
    >
      <form className={s.editor} onSubmit={complete}>
        <p>
          完成「{plan.idea.title}
          」，留下一点当时的感受。票根会保存这次安排的快照。
        </p>
        <label>
          这次约会，想记住什么？
          <textarea
            autoFocus
            rows={5}
            maxLength={2000}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="最开心的瞬间、一个小意外，或者下次还想一起做什么…"
          />
        </label>
        <StorageMessage error={store.error} saving={store.saving} />
        <div className={s.formActions}>
          <PhysicalButton secondary onClick={onClose}>
            再想一想
          </PhysicalButton>
          <PhysicalButton disabled={store.saving} type="submit">
            <Ticket size={16} />
            完成并收好票根
          </PhysicalButton>
        </div>
        <p className={s.smallPrint}>也可以不写感受，先把这一天收好。</p>
      </form>
    </Dialog>
  );
}

function Tickets() {
  const { data } = useArcade();
  const [kind, setKind] = useState("all");
  const [remove, setRemove] = useState<Stub | null>(null);
  const list = data.tickets.filter((t) => kind === "all" || t.kind === kind);
  return (
    <>
      <PageHeading
        title="快乐，凭票留存。"
        text="一起玩过的每一局，认真赴过的每一次约。"
      >
        <span className={s.collectionCount}>
          {String(data.tickets.length).padStart(2, "0")}
          <small>张票根</small>
        </span>
      </PageHeading>
      <div className={s.planTabs}>
        {[
          { key: "all", label: "全部票根" },
          { key: "quiz", label: "默契测试" },
          { key: "date", label: "约会纪念" },
        ].map((t) => (
          <button
            key={t.key}
            className={kind === t.key ? s.activeTab : ""}
            onClick={() => setKind(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={s.ticketGrid}>
        {list.map((t) => (
          <article
            key={t.id}
            className={`${s.ticketCard} ${t.kind === "date" ? s.dateTicket : ""}`}
          >
            <Link to={`/arcade/tickets/${t.id}`}>
              <div className={s.ticketCardTop}>
                <span>{t.kind === "quiz" ? "双人默契票" : "约会纪念票"}</span>
                <Ticket size={20} />
              </div>
              <div className={s.ticketCardBody}>
                <span className={s.stubDate}>{fmt(t.date)}</span>
                <h2>{t.title}</h2>
                {t.kind === "quiz" && t.quiz ? (
                  <strong>
                    {
                      t.quiz.questions.filter(
                        (q) => t.quiz!.first[q.id] === t.quiz!.second[q.id],
                      ).length
                    }
                    <small> / 3 个同频答案</small>
                  </strong>
                ) : (
                  <p>{t.plan?.reflection || "这一天，我们一起完成了。"}</p>
                )}
                <span className={s.stubNames}>{t.names.join(" + ")}</span>
              </div>
              <div className={s.ticketTear}>
                <i />
                <span>
                  翻开看看 <ArrowRight size={15} />
                </span>
                <i />
              </div>
              <div className={s.barcode}>
                {Array.from({ length: 26 }).map((_, i) => (
                  <i key={i} style={{ width: [1, 3, 1, 2, 4, 1][i % 6] }} />
                ))}
                <span>{t.id.slice(0, 8)}</span>
              </div>
            </Link>
            <button
              className={s.deleteTicket}
              aria-label={`删除票根：${t.title}`}
              onClick={() => setRemove(t)}
            >
              <Trash2 size={14} />
            </button>
          </article>
        ))}
      </div>
      {!list.length && (
        <Empty
          title="票夹还在等第一份快乐。"
          text="完成一局默契测试，或者去赴一场抽到的约会。"
        >
          <Link className={s.button} to="/arcade/quiz">
            先来玩一局
            <ArrowRight size={16} />
          </Link>
        </Empty>
      )}
      {remove && (
        <DeleteTicket ticket={remove} onClose={() => setRemove(null)} />
      )}
    </>
  );
}
function TicketPage() {
  const { id } = useParams();
  const { data } = useArcade();
  const ticket = data.tickets.find((t) => t.id === id);
  const [remove, setRemove] = useState(false);
  const navigate = useNavigate();
  if (!ticket)
    return (
      <>
        <Back to="/arcade/tickets">回到票夹</Back>
        <Empty
          title="这张票根已经不在了。"
          text="它可能已被删除，其他快乐还在票夹里。"
        >
          <Link className={s.button} to="/arcade/tickets">
            看看其他票根
          </Link>
        </Empty>
      </>
    );
  return (
    <>
      <div className={s.ticketToolbar}>
        <Back to="/arcade/tickets">回到票夹</Back>
        <button className={s.dangerButton} onClick={() => setRemove(true)}>
          <Trash2 size={14} />
          删除票根
        </button>
      </div>
      <PageHeading
        title={ticket.title}
        text={`${fmt(ticket.date)} · ${ticket.names.join(" + ")}的${ticket.kind === "quiz" ? "默契成绩单" : "约会纪念"}`}
      />
      <div className={s.savedBadge}>
        <Ticket size={16} />
        已收好的票根 · 当时的记录不会随计划修改
      </div>
      {ticket.kind === "quiz" && ticket.quiz ? (
        <QuizResult round={ticket.quiz} names={ticket.names} />
      ) : ticket.plan ? (
        <article className={s.dateResult}>
          <div className={s.dateResultTop}>
            <div className={s.dateResultSeal}>
              <Flag size={38} />
              <span>一起完成</span>
            </div>
            <div>
              <span className={s.gameTag}>两个人的约会纪念</span>
              <h2>{ticket.plan.idea.title}</h2>
              <IdeaTags idea={ticket.plan.idea} />
            </div>
          </div>
          <p className={s.dateResultDescription}>
            {ticket.plan.idea.description}
          </p>
          <div className={s.dateResultSections}>
            <section>
              <h3>那天的小安排</h3>
              <p>
                <strong>
                  {ticket.plan.date
                    ? fmt(ticket.plan.date)
                    : "没有预先定日期，想出发就出发。"}
                </strong>
              </p>
              <p>{ticket.plan.note || "没有多余的安排，和你一起就好。"}</p>
            </section>
            <section>
              <h3>留给这一天的感受</h3>
              <p className={s.reflectionText}>
                {ticket.plan.reflection || "这一天，我们一起完成了。"}
              </p>
            </section>
          </div>
          <div className={s.dateResultFoot}>
            <span>{ticket.plan.names.join(" + ")}</span>
            <Heart size={17} fill="currentColor" />
            <span>{fmt(ticket.date)}</span>
          </div>
        </article>
      ) : (
        <Empty title="这张票根缺少结果内容" text="可以返回票夹查看其他记录。" />
      )}
      <div className={s.ticketPageActions}>
        {ticket.kind === "quiz" ? (
          <Link className={s.button} to="/arcade/quiz">
            再玩一局
            <ArrowRight size={16} />
          </Link>
        ) : ticket.plan && data.plans.some((p) => p.id === ticket.plan!.id) ? (
          <Link className={s.button} to={`/arcade/plans/${ticket.plan.id}`}>
            查看这次约会计划
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link className={s.button} to="/arcade/draw">
            再抽一个约会
            <Dices size={16} />
          </Link>
        )}
      </div>
      {remove && (
        <DeleteTicket
          ticket={ticket}
          onClose={() => setRemove(false)}
          onDeleted={() => navigate("/arcade/tickets")}
        />
      )}
    </>
  );
}
function DeleteTicket({
  ticket,
  onClose,
  onDeleted,
}: {
  ticket: Stub;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const store = useArcade();
  return (
    <Dialog title="删除这张快乐票根？" onClose={onClose} className={s.dialog}>
      <p>
        「{ticket.title}」的这份历史记录会被移除。
        {ticket.kind === "date"
          ? "约会计划的完成状态会保留。"
          : "其他轮次的测试结果会继续保留。"}
      </p>
      <StorageMessage error={store.error} />
      <div className={s.formActions}>
        <PhysicalButton secondary onClick={onClose}>
          继续珍藏
        </PhysicalButton>
        <PhysicalButton
          disabled={store.saving}
          onClick={async () => {
            if (
              await store.change((p) => ({
                ...p,
                tickets: p.tickets.filter((t) => t.id !== ticket.id),
                plans: p.plans.map((plan) => ({
                  ...plan,
                  historyIds: plan.historyIds.filter((id) => id !== ticket.id),
                })),
              }))
            ) {
              onClose();
              onDeleted?.();
            }
          }}
        >
          确认删除票根
        </PhysicalButton>
      </div>
    </Dialog>
  );
}
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const store = useArcade();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const { data } = store;
  return (
    <Dialog
      title={resetting ? "游乐场，重新开场？" : "今天，谁来先玩？"}
      onClose={onClose}
      className={s.dialog}
    >
      {resetting ? (
        <>
          <p>
            游乐场中的当前测试、抽签结果、计划、票根和草稿会恢复为虚构示例。其他三个空间会保留。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <PhysicalButton secondary onClick={() => setResetting(false)}>
              保留这些快乐
            </PhysicalButton>
            <PhysicalButton
              disabled={store.saving}
              onClick={async () => {
                if (await store.reset()) {
                  onClose();
                  navigate("/arcade");
                }
              }}
            >
              确认重置游乐场
            </PhysicalButton>
          </div>
        </>
      ) : (
        <>
          <div className={s.roleChoices}>
            {data.names.map((name, role) => (
              <button
                key={name}
                disabled={store.saving}
                onClick={async () => {
                  if (await store.change((p) => ({ ...p, role }))) onClose();
                }}
                className={data.role === role ? s.selectedRole : ""}
              >
                <span>{name.slice(0, 1)}</span>
                <strong>{name}</strong>
                {data.role === role ? (
                  <Check size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            ))}
          </div>
          <p>
            本机双人演示。测试中，先后顺序在开局时确定；切换身份不会提前打开对方的答案。所有数据只保存在此浏览器。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.settingsFoot}>
            <Link to="/" onClick={onClose}>
              <ArrowDownLeft size={15} />
              四个空间
            </Link>
            <button
              className={s.dangerButton}
              onClick={() => setResetting(true)}
            >
              重置游乐场演示数据
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
