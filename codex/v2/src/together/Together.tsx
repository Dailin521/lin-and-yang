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
  useSearchParams,
} from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Flower2,
  Waves,
  ChevronLeft,
  ChevronRight,
  Circle,
  Coffee,
  Heart,
  Infinity as InfinityIcon,
  List,
  Pencil,
  Plus,
  Settings,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import {
  collectUnusedImages,
  dayOffset,
  localDate,
  saveImage,
  today,
  uid,
  useDraft,
  useStore,
} from "../shared/store";
import { AssetImage, Dialog, StorageMessage } from "../shared/ui";
import s from "./Together.module.css";

type Person = { name: string; avatar: string };
type Plan = {
  id: string;
  title: string;
  date: string;
  time: string;
  allDay: boolean;
  type: "appointment" | "anniversary";
  note: string;
  wishId?: string;
  done?: boolean;
};
type Wish = {
  id: string;
  title: string;
  note: string;
  tag: string;
  done: boolean;
  completedAt?: string;
};
type Data = {
  people: Person[];
  role: number;
  anniversary: string;
  moods: Record<string, Record<string, string>>;
  notes: Record<string, string>;
  events: Plan[];
  wishes: Wish[];
};
const seed = (): Data => ({
  people: [
    { name: "阿澄", avatar: "☀" },
    { name: "小满", avatar: "✿" },
  ],
  role: 0,
  anniversary: dayOffset(-728),
  moods: { [today()]: { "0": "晴朗", "1": "想抱抱" } },
  notes: { [today()]: "下班绕一点路吧，去买那家刚出炉的栗子蛋糕。" },
  events: [
    {
      id: "dinner",
      title: "一起做一顿晚饭",
      date: today(),
      time: "19:00",
      allDay: false,
      type: "appointment",
      note: "你洗菜，我来掌勺。",
    },
    {
      id: "flower",
      title: "周末去花市",
      date: dayOffset(2),
      time: "10:30",
      allDay: false,
      type: "appointment",
      note: "带一个空花瓶出门。",
      wishId: "flowers",
    },
    {
      id: "anniversary",
      title: "我们的第 730 天",
      date: dayOffset(2),
      time: "",
      allDay: true,
      type: "anniversary",
      note: "平凡日子，也值得庆祝。",
    },
    {
      id: "film",
      title: "留一个电影之夜",
      date: dayOffset(6),
      time: "20:00",
      allDay: false,
      type: "appointment",
      note: "投影、毛毯和一点爆米花。",
    },
  ],
  wishes: [
    {
      id: "flowers",
      title: "把阳台变成小花园",
      note: "先从一盆好养的薄荷和一束洋甘菊开始。",
      tag: "日常的小事",
      done: false,
    },
    {
      id: "sea",
      title: "去海边等一次日出",
      note: "找一个不用赶回来的周末，坐早班车出发。",
      tag: "出去走走",
      done: false,
    },
    {
      id: "pasta",
      title: "学会做手工意面",
      note: "不求像餐厅，能一起把厨房弄乱就好。",
      tag: "一起尝试",
      done: false,
    },
    {
      id: "walk",
      title: "走完河边那条小路",
      note: "带着相机，没有目的地地走。",
      tag: "出去走走",
      done: true,
      completedAt: dayOffset(-4),
    },
  ],
});
type Store = ReturnType<typeof useStore<Data>>;
const Context = createContext<Store | null>(null);
const useTogether = () => useContext(Context)!;
const dateLabel = (value: string, full = false) =>
  new Date(value + "T12:00:00").toLocaleDateString(
    "zh-CN",
    full
      ? { year: "numeric", month: "long", day: "numeric", weekday: "long" }
      : { month: "long", day: "numeric", weekday: "short" },
  );
const moods = [
  { title: "晴朗", emoji: "☀️" },
  { title: "平静", emoji: "🍃" },
  { title: "有点累", emoji: "☁️" },
  { title: "想抱抱", emoji: "🫶" },
  { title: "好开心", emoji: "✨" },
];
const sortPlans = (a: Plan, b: Plan) =>
  `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);

function Avatar({
  person,
  small = false,
}: {
  person: Person;
  small?: boolean;
}) {
  return (
    <span className={`${s.avatar} ${small ? s.smallAvatar : ""}`}>
      {person.avatar.startsWith("image:") ? (
        <AssetImage src={person.avatar} alt={person.name} />
      ) : (
        person.avatar
      )}
    </span>
  );
}
function Button({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={secondary ? s.secondary : s.primary}
    >
      {children}
    </button>
  );
}
function Missing({
  text = "这条记录已经不在了。",
  to = "/together/calendar",
}: {
  text?: string;
  to?: string;
}) {
  return (
    <div className={s.empty}>
      <Sun size={32} />
      <h2>{text}</h2>
      <Link to={to}>返回看看</Link>
    </div>
  );
}

export default function Together() {
  const store = useStore<Data>("together", seed);
  const { data, error, saving, ready } = store;
  return (
    <Context.Provider value={store}>
      <div className={s.app}>
        <aside className={s.rail}>
          <Link className={s.brand} to="/together">
            <InfinityIcon strokeWidth={2.2} />
            <span>
              同频<small>Together</small>
            </span>
          </Link>
          <div className={s.railCaption}>把日子，过在一起。</div>
          <Navigation />
          <div className={s.railBottom}>
            <div className={s.pair}>
              <Avatar person={data.people[0]} small />
              <Avatar person={data.people[1]} small />
            </div>
            <span>
              {data.people[0].name} & {data.people[1].name}
            </span>
            <Link to="/">
              四个空间 <ArrowDownLeft size={14} />
            </Link>
          </div>
        </aside>
        <div className={s.body}>
          <header className={s.mobileHeader}>
            <Link className={s.mobileBrand} to="/together">
              <InfinityIcon size={27} /> 同频
            </Link>
            <Link to="/" className={s.switchSpace}>
              四个空间 <ArrowDownLeft size={14} />
            </Link>
          </header>
          <div className={s.mainGrid}>
            <main className={s.main}>
              <StorageMessage error={error} saving={saving} />
              {!ready ? (
                <p className={s.loading}>正在打开我们的日常…</p>
              ) : (
                <Routes>
                  <Route index element={<Today />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="calendar/new" element={<EventPage />} />
                  <Route path="calendar/event/:id" element={<EventPage />} />
                  <Route path="wishes" element={<Wishes />} />
                  <Route path="wishes/:id" element={<Wishes />} />
                  <Route path="us" element={<Us />} />
                  <Route
                    path="*"
                    element={<Navigate to="/together" replace />}
                  />
                </Routes>
              )}
            </main>
            <Upcoming />
          </div>
          <nav className={s.bottomNav} aria-label="同频导航">
            <Navigation />
          </nav>
        </div>
      </div>
    </Context.Provider>
  );
}
function Navigation() {
  return (
    <div className={s.navLinks}>
      {[
        { to: "/together", icon: Sun, title: "今天", end: true },
        { to: "/together/calendar", icon: CalendarDays, title: "日历" },
        { to: "/together/wishes", icon: Heart, title: "一起做" },
        { to: "/together/us", icon: Users, title: "我们" },
      ].map(({ to, icon: Icon, title, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? s.navActive : "")}
        >
          <Icon size={21} strokeWidth={1.7} />
          <span>{title}</span>
        </NavLink>
      ))}
    </div>
  );
}
function Upcoming() {
  const { data } = useTogether();
  const plans = data.events
    .filter((e) => e.date >= today() && !e.done)
    .sort(sortPlans)
    .slice(0, 3);
  return (
    <aside className={s.upcoming}>
      <div className={s.sideDate}>
        <span>{new Date().toLocaleDateString("en", { month: "short" })}</span>
        <strong>{new Date().getDate()}</strong>
        <small>
          {new Date().toLocaleDateString("zh", { weekday: "long" })}
        </small>
      </div>
      <h3>接下来的小期待</h3>
      <div className={s.sidePlans}>
        {plans.map((e) => (
          <Link key={e.id} to={`/together/calendar/event/${e.id}`}>
            <span className={s.sideDot} />
            <small>
              {e.date === today() ? "今天" : dateLabel(e.date)} ·{" "}
              {e.allDay ? "全天" : e.time}
            </small>
            <strong>{e.title}</strong>
            <ChevronRight size={15} />
          </Link>
        ))}
      </div>
      <Link to="/together/calendar/new" className={s.textLink}>
        <Plus size={16} /> 添加一个约定
      </Link>
      <div className={s.sideArt}>
        <div className={s.vase}>
          <Flower2 size={52} strokeWidth={1.3} />
        </div>
        <p>
          在普通的一天里，
          <br />
          为彼此留一点时间。
        </p>
      </div>
      <p className={s.localLabel}>本机双人演示 · 数据保存在此浏览器</p>
    </aside>
  );
}
function PageHead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={s.pageHead}>
      <div>
        <p>{description}</p>
        <h1>{title}</h1>
      </div>
      {action}
    </div>
  );
}

function Today() {
  const { data, change, saving, error } = useTogether();
  const [editing, setEditing] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [note, setNote, clear] = useDraft(
    "together:note:" + today(),
    data.notes[today()] || "",
  );
  const next = data.events
    .filter((e) => e.date >= today() && !e.done)
    .sort(sortPlans)[0];
  const active = data.wishes.filter((w) => !w.done);
  async function saveNote(e: FormEvent) {
    e.preventDefault();
    if (
      await change((p) => ({
        ...p,
        notes: { ...p.notes, [today()]: note.trim() },
      }))
    ) {
      clear();
      setEditing(false);
    }
  }
  return (
    <>
      <PageHead
        title="今天，也在一起"
        description={dateLabel(today(), true)}
        action={
          <span className={s.weather}>
            <Sun size={20} /> 适合想念
          </span>
        }
      />
      <section className={s.moodSection}>
        <div className={s.sectionLabel}>
          <h2>此刻的我们</h2>
          <span>一点心情，彼此知道</span>
        </div>
        <div className={s.moodPair}>
          {data.people.map((person, index) => {
            const mood = moods.find(
              (m) => m.title === data.moods[today()]?.[String(index)],
            );
            return (
              <button
                key={index}
                aria-label={`${person.name}的心情：${mood?.title || "还未记录"}，点击切换身份并编辑`}
                onClick={async () => {
                  if (
                    index === data.role ||
                    (await change((p) => ({ ...p, role: index })))
                  )
                    setMoodOpen(true);
                }}
                className={`${s.moodPerson} ${index === data.role ? s.currentMood : ""}`}
              >
                <Avatar person={person} />
                <div>
                  <strong>
                    {person.name}
                    <small>{index === data.role ? "我" : "对方"}</small>
                  </strong>
                  <span>
                    {mood?.emoji || "○"} {mood?.title || "还没留下心情"}
                  </span>
                </div>
                <Pencil size={14} />
              </button>
            );
          })}
        </div>
      </section>
      <section className={s.todayNote}>
        <div className={s.noteMark}>“</div>
        <div className={s.noteContent}>
          <div className={s.sectionLabel}>
            <h2>留给今天的一句话</h2>
            <button
              aria-label="编辑今天的话"
              onClick={() => setEditing(!editing)}
            >
              <Pencil size={17} />
            </button>
          </div>
          {editing ? (
            <form onSubmit={saveNote} className={s.noteForm}>
              <textarea
                aria-label="今天的一句话"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                autoFocus
                placeholder="今天想和你说…"
              />
              <div className={s.formActions}>
                <Button secondary onClick={() => setEditing(false)}>
                  收起
                </Button>
                <Button type="submit" disabled={saving}>
                  保存这句话
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p>{data.notes[today()] || "今天想对彼此说的话，就写在这里。"}</p>
              <small>我们的小便签 · {dateLabel(today())}</small>
            </>
          )}
        </div>
      </section>
      <section className={s.flowSection}>
        <div className={s.sectionLabel}>
          <h2>把今天慢慢过</h2>
          <Link to="/together/calendar">
            全部约定 <ArrowRight size={15} />
          </Link>
        </div>
        {next ? (
          <Link
            to={`/together/calendar/event/${next.id}`}
            className={s.nextPlan}
          >
            <div className={s.timeRail}>
              <span>{next.allDay ? "全天" : next.time}</span>
              <i />
            </div>
            <div className={s.nextBody}>
              <span className={s.pill}>
                {next.date === today() ? "今天的约定" : dateLabel(next.date)}
              </span>
              <h3>{next.title}</h3>
              <p>{next.note || "为这件小事，留一段只属于我们的时间。"}</p>
              <span className={s.planPeople}>
                {data.people.map((p, i) => (
                  <Avatar key={i} person={p} small />
                ))}
                <small>我们两个人</small>
              </span>
            </div>
            <ChevronRight size={20} />
          </Link>
        ) : (
          <div className={s.empty}>
            <Coffee />
            <p>今天还没有约定，留一点空白也很好。</p>
            <Link to="/together/calendar/new">添加约定</Link>
          </div>
        )}
      </section>
      <section className={s.wishPreview}>
        <div className={s.sectionLabel}>
          <h2>下一件，一起做</h2>
          <Link to="/together/wishes">
            愿望清单 <ArrowRight size={15} />
          </Link>
        </div>
        <div className={s.previewGrid}>
          {active.slice(0, 2).map((w, i) => (
            <Link
              key={w.id}
              to={`/together/wishes/${w.id}`}
              className={s.wishSmall}
            >
              <span className={s.wishSymbol}>
                <WishMark index={i} />
              </span>
              <small>{w.tag}</small>
              <h3>{w.title}</h3>
              <span>
                把期待放进日历 <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
        {!active.length && (
          <p className={s.quiet}>清单都完成了，写下下一个小期待吧。</p>
        )}
      </section>
      {moodOpen && (
        <Dialog
          title={`${data.people[data.role].name}，今天是什么天气？`}
          onClose={() => setMoodOpen(false)}
          className={s.dialog}
        >
          <p className={s.quiet}>
            当前身份：{data.people[data.role].name}。可在「我们」中切换。
          </p>
          <div className={s.moodOptions}>
            {moods.map((m) => (
              <button
                disabled={saving}
                key={m.title}
                className={
                  data.moods[today()]?.[String(data.role)] === m.title
                    ? s.selectedMood
                    : ""
                }
                onClick={async () => {
                  if (
                    await change((p) => ({
                      ...p,
                      moods: {
                        ...p.moods,
                        [today()]: {
                          ...p.moods[today()],
                          [String(p.role)]: m.title,
                        },
                      },
                    }))
                  )
                    setMoodOpen(false);
                }}
              >
                <span>{m.emoji}</span>
                {m.title}
              </button>
            ))}
          </div>
          <StorageMessage error={error} saving={saving} />
        </Dialog>
      )}
    </>
  );
}

function Calendar() {
  const { data } = useTogether();
  const [month, setMonth] = useState(today().slice(0, 7));
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(today());
  const date = new Date(month + "-01T12:00:00");
  const offset = (date.getDay() + 6) % 7;
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const monthPlans = data.events
    .filter((e) => e.date.startsWith(month))
    .sort(sortPlans);
  const shown =
    view === "agenda"
      ? monthPlans
      : data.events.filter((e) => e.date === selected).sort(sortPlans);
  function move(amount: number) {
    const d = new Date(month + "-01T12:00:00");
    d.setMonth(d.getMonth() + amount);
    const next = localDate(d);
    setMonth(next.slice(0, 7));
    setSelected(next);
  }
  return (
    <>
      <PageHead
        title="我们的日历"
        description="把想见的日子，提前圈起来。"
        action={
          <Link to="/together/calendar/new" className={s.primary}>
            <Plus size={18} /> 新约定
          </Link>
        }
      />
      <div className={s.calendarTools}>
        <div className={s.monthControl}>
          <button aria-label="上个月" onClick={() => move(-1)}>
            <ChevronLeft size={20} />
          </button>
          <label>
            <span>
              {date.getFullYear()} 年 {date.getMonth() + 1} 月
            </span>
            <input
              aria-label="选择月份"
              type="month"
              value={month}
              onChange={(e) => {
                if (e.target.value) {
                  setMonth(e.target.value);
                  setSelected(e.target.value + "-01");
                }
              }}
            />
          </label>
          <button aria-label="下个月" onClick={() => move(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className={s.segment}>
          <button
            className={view === "month" ? s.segmentActive : ""}
            onClick={() => setView("month")}
          >
            <CalendarDays size={16} />
            月历
          </button>
          <button
            className={view === "agenda" ? s.segmentActive : ""}
            onClick={() => setView("agenda")}
          >
            <List size={16} />
            日程
          </button>
        </div>
      </div>
      {view === "month" && (
        <div className={s.calendar}>
          <div className={s.weekdays}>
            {"一二三四五六日".split("").map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className={s.days}>
            {Array.from({ length: offset }).map((_, i) => (
              <span key={"blank" + i} className={s.blankDay} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = `${month}-${String(i + 1).padStart(2, "0")}`;
              const events = data.events.filter((e) => e.date === day);
              return (
                <button
                  key={day}
                  aria-label={`${dateLabel(day)}，${events.length} 个约定`}
                  aria-pressed={selected === day}
                  className={`${s.day} ${selected === day ? s.selectedDay : ""} ${day === today() ? s.todayDay : ""}`}
                  onClick={() => setSelected(day)}
                >
                  <span>{i + 1}</span>
                  <div className={s.dayEvents}>
                    {events.slice(0, 2).map((e) => (
                      <i
                        key={e.id}
                        className={e.type === "anniversary" ? s.annivDot : ""}
                      >
                        {e.title}
                      </i>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className={s.sectionLabel}>
        <h2>{view === "month" ? dateLabel(selected) : "这个月的约定"}</h2>
        <span>{shown.length} 个约定</span>
      </div>
      <div className={s.agenda}>
        {shown.map((e) => (
          <PlanRow key={e.id} plan={e} showDate={view === "agenda"} />
        ))}
        {!shown.length && (
          <div className={s.empty}>
            <CalendarDays size={27} />
            <p>这一天，等一个小约定。</p>
            <Link to={`/together/calendar/new?date=${selected}`}>
              为这天添加约定
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
function PlanRow({
  plan: e,
  showDate = false,
}: {
  plan: Plan;
  showDate?: boolean;
}) {
  return (
    <Link
      to={`/together/calendar/event/${e.id}`}
      className={`${s.planRow} ${e.done ? s.finishedPlan : ""}`}
    >
      <span className={s.planIcon}>
        {e.type === "anniversary" ? (
          <Heart size={20} />
        ) : (
          <CalendarDays size={20} />
        )}
      </span>
      <div>
        <small>
          {showDate ? dateLabel(e.date) + " · " : ""}
          {e.allDay ? "全天" : e.time || "时间待定"}
          {e.done ? " · 已完成" : ""}
        </small>
        <h3>{e.title}</h3>
        {e.note && <p>{e.note}</p>}
      </div>
      <ChevronRight size={18} />
    </Link>
  );
}
function EventPage() {
  const { id } = useParams();
  const { data } = useTogether();
  const [search] = useSearchParams();
  const event = data.events.find((e) => e.id === id);
  const wish = data.wishes.find((w) => w.id === search.get("wish"));
  if (id && !event) return <Missing />;
  return (
    <EventForm
      key={id || "new:" + search.toString()}
      initial={
        event || {
          id: uid(),
          title: wish?.title || "",
          date: search.get("date") || dayOffset(1),
          time: "19:00",
          allDay: false,
          type: "appointment",
          note: wish?.note || "",
          wishId: wish?.id,
        }
      }
      existing={!!event}
    />
  );
}
function EventForm({
  initial,
  existing,
}: {
  initial: Plan;
  existing: boolean;
}) {
  const store = useTogether();
  const { data, change, saving } = store;
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [form, setForm, clear] = useDraft<Plan>(
    "together:event:" + (existing ? initial.id : initial.wishId || "new"),
    initial,
  );
  const update = <K extends keyof Plan>(key: K, value: Plan[K]) =>
    setForm((p) => ({ ...p, [key]: value }));
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const value = { ...form, title: form.title.trim() };
    if (
      await change((p) => ({
        ...p,
        events: existing
          ? p.events.map((v) =>
              v.id === initial.id ? { ...value, done: v.done } : v,
            )
          : [...p.events, value],
      }))
    ) {
      clear();
      navigate("/together/calendar");
    }
  }
  async function remove() {
    if (
      await change((p) => ({
        ...p,
        events: p.events.filter((e) => e.id !== initial.id),
      }))
    ) {
      clear();
      navigate("/together/calendar");
    }
  }
  async function complete() {
    if (
      await change((p) => {
        const current = p.events.find((e) => e.id === initial.id);
        const done = !current?.done;
        const events = p.events.map((e) =>
          e.id === initial.id ? { ...e, done } : e,
        );
        const wishes = p.wishes.map((w) => {
          if (w.id !== current?.wishId) return w;
          const complete = events
            .filter((e) => e.wishId === w.id)
            .every((e) => e.done);
          return {
            ...w,
            done: complete,
            completedAt: complete ? today() : undefined,
          };
        });
        return { ...p, events, wishes };
      })
    ) {
      clear();
      navigate("/together/calendar");
    }
  }
  return (
    <>
      <Link to="/together/calendar" className={s.back}>
        <ArrowLeft size={17} />
        回到日历
      </Link>
      <PageHead
        title={existing ? "约好的这一天" : "留一个一起的时间"}
        description={
          initial.wishId
            ? "从小小的愿望，到真实的一天。"
            : "认真对待每一个见面的理由。"
        }
      />
      {initial.done && (
        <p className={s.success}>
          <Check size={16} />
          这个约定已经完成，留在日历里。
        </p>
      )}
      <form onSubmit={submit} className={s.editor}>
        <label>
          约定的名字
          <input
            required
            maxLength={60}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="比如：一起去逛周末花市"
          />
        </label>
        <div className={s.fieldRow}>
          <label>
            哪一天
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
          <label>
            几点见
            <input
              type="time"
              disabled={form.allDay}
              required={!form.allDay}
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
            />
          </label>
        </div>
        <label className={s.checkLabel}>
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => update("allDay", e.target.checked)}
          />{" "}
          全天约定，不用赶时间
        </label>
        <label>
          这是什么日子
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value as Plan["type"])}
          >
            <option value="appointment">一个约定</option>
            <option value="anniversary">值得纪念的日子</option>
          </select>
        </label>
        <label>
          再记下一点
          <textarea
            value={form.note}
            maxLength={1000}
            onChange={(e) => update("note", e.target.value)}
            placeholder="地点、想吃的东西，或是一点悄悄话…"
            rows={4}
          />
        </label>
        <StorageMessage error={store.error} saving={saving} />
        <div className={s.formActions}>
          <Link to="/together/calendar" className={s.secondary}>
            稍后再写
          </Link>
          <Button type="submit" disabled={saving}>
            保存约定
          </Button>
        </div>
        <p className={s.draftHint}>
          未保存的输入会留在这台设备，回来可以继续写。
        </p>
      </form>
      {existing && (
        <div className={s.editorFooter}>
          <Button secondary onClick={complete} disabled={saving}>
            <Check size={17} />
            {initial.done ? "重新打开约定" : "我们完成了"}
          </Button>
          <button className={s.dangerText} onClick={() => setConfirm(true)}>
            <Trash2 size={16} />
            删除约定
          </button>
        </div>
      )}
      {confirm && (
        <Dialog
          title="删除这个约定？"
          onClose={() => setConfirm(false)}
          className={s.dialog}
        >
          <p>「{initial.title}」将从日历中移除，关联的愿望会继续保留。</p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <Button secondary onClick={() => setConfirm(false)}>
              保留约定
            </Button>
            <Button onClick={remove} disabled={saving}>
              确认删除
            </Button>
          </div>
        </Dialog>
      )}
      <p className={s.quiet}>
        参与人：{data.people.map((p) => p.name).join("、")}
      </p>
    </>
  );
}

function Wishes() {
  const { data, change, saving, error } = useTogether();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Wish | null>(null);
  const current = data.wishes.find((w) => w.id === id);
  const list = data.wishes.filter((w) => (tab === "done" ? w.done : !w.done));
  async function toggle(wish: Wish) {
    await change((p) => {
      const done = !p.wishes.find((w) => w.id === wish.id)?.done;
      return {
        ...p,
        wishes: p.wishes.map((w) =>
          w.id === wish.id
            ? { ...w, done, completedAt: done ? today() : undefined }
            : w,
        ),
        events: p.events.map((e) =>
          e.wishId === wish.id ? { ...e, done } : e,
        ),
      };
    });
  }
  return (
    <>
      <PageHead
        title="想和你一起做的事"
        description="不急，一件一件，把期待变成回忆。"
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus size={18} />
            写下愿望
          </Button>
        }
      />
      <div className={s.wishTabs}>
        <button
          className={tab === "active" ? s.activeWishTab : ""}
          onClick={() => setTab("active")}
        >
          还在期待 <span>{data.wishes.filter((w) => !w.done).length}</span>
        </button>
        <button
          className={tab === "done" ? s.activeWishTab : ""}
          onClick={() => setTab("done")}
        >
          一起完成 <span>{data.wishes.filter((w) => w.done).length}</span>
        </button>
      </div>
      <div className={s.wishList}>
        {list.map((w, index) => {
          const plan = data.events.find((e) => e.wishId === w.id && !e.done);
          return (
            <article
              className={`${s.wishItem} ${w.done ? s.wishDone : ""}`}
              key={w.id}
            >
              <div className={s.wishItemTop}>
                <span className={s.wishSymbol}>
                  <WishMark index={index} />
                </span>
                <span className={s.pill}>{w.tag}</span>
                <button
                  aria-label={
                    w.done ? `重新打开：${w.title}` : `标记完成：${w.title}`
                  }
                  disabled={saving}
                  onClick={() => toggle(w)}
                  className={s.completeButton}
                >
                  {w.done ? <Check size={20} /> : <Circle size={22} />}
                </button>
              </div>
              <Link to={`/together/wishes/${w.id}`}>
                <h2>{w.title}</h2>
              </Link>
              <p>{w.note}</p>
              <div className={s.wishItemFoot}>
                {w.done ? (
                  <small>
                    完成于 {w.completedAt ? dateLabel(w.completedAt) : "那一天"}
                  </small>
                ) : plan ? (
                  <Link to={`/together/calendar/event/${plan.id}`}>
                    <CalendarDays size={15} />
                    已约在 {dateLabel(plan.date)}
                  </Link>
                ) : (
                  <Link to={`/together/calendar/new?wish=${w.id}`}>
                    <CalendarDays size={15} />
                    安排一个时间
                  </Link>
                )}
                <div>
                  <button
                    aria-label={`编辑：${w.title}`}
                    onClick={() => navigate(`/together/wishes/${w.id}`)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    aria-label={`删除：${w.title}`}
                    onClick={() => setDeleting(w)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!list.length && (
        <div className={s.empty}>
          <Heart />
          <h2>
            {tab === "done"
              ? "未来的回忆，从一件小事开始。"
              : "想和对方做的下一件事是什么？"}
          </h2>
          <Button onClick={() => setAdding(true)}>写下一个愿望</Button>
        </div>
      )}
      {(adding || current) && (
        <WishForm
          key={current?.id || "new"}
          initial={current}
          onClose={() => {
            setAdding(false);
            if (id) navigate("/together/wishes");
          }}
        />
      )}
      {id && !current && (
        <Dialog
          title="愿望已经不在清单里"
          onClose={() => navigate("/together/wishes")}
          className={s.dialog}
        >
          <p>它可能已被删除。可以继续写下新的期待。</p>
          <Button onClick={() => navigate("/together/wishes")}>回到清单</Button>
        </Dialog>
      )}
      {deleting && (
        <Dialog
          title="删除这个愿望？"
          onClose={() => setDeleting(null)}
          className={s.dialog}
        >
          <p>删除「{deleting.title}」后，已排好的日历约定仍会保留。</p>
          <StorageMessage error={error} />
          <div className={s.formActions}>
            <Button secondary onClick={() => setDeleting(null)}>
              保留愿望
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                if (
                  await change((p) => ({
                    ...p,
                    wishes: p.wishes.filter((w) => w.id !== deleting.id),
                  }))
                )
                  setDeleting(null);
              }}
            >
              确认删除
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
function WishForm({
  initial,
  onClose,
}: {
  initial?: Wish;
  onClose: () => void;
}) {
  const { change, saving, error } = useTogether();
  const [form, setForm, clear] = useDraft<Wish>(
    "together:wish:" + (initial?.id || "new"),
    initial || {
      id: uid(),
      title: "",
      note: "",
      tag: "日常的小事",
      done: false,
    },
  );
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (
      await change((p) => ({
        ...p,
        wishes: initial
          ? p.wishes.map((w) =>
              w.id === initial.id
                ? {
                    ...w,
                    title: form.title.trim(),
                    note: form.note,
                    tag: form.tag,
                  }
                : w,
            )
          : [...p.wishes, { ...form, title: form.title.trim() }],
      }))
    ) {
      clear();
      onClose();
    }
  }
  return (
    <Dialog
      title={initial ? "把这个愿望说得更具体" : "想和你一起…"}
      onClose={onClose}
      className={s.dialog}
    >
      <form className={s.editor} onSubmit={submit}>
        <label>
          这件事叫什么
          <input
            required
            value={form.title}
            maxLength={60}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="比如：找一个周末去看海"
          />
        </label>
        <label>
          属于哪一种期待
          <select
            value={form.tag}
            onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
          >
            {["日常的小事", "出去走走", "一起尝试", "认真纪念"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          为什么想一起做
          <textarea
            value={form.note}
            maxLength={1000}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            placeholder="记下一点画面，或者还没说出口的理由。"
            rows={4}
          />
        </label>
        <StorageMessage error={error} saving={saving} />
        <div className={s.formActions}>
          <Button secondary onClick={onClose}>
            稍后再写
          </Button>
          <Button type="submit" disabled={saving || !form.title.trim()}>
            保存愿望
          </Button>
        </div>
        <p className={s.draftHint}>输入会留在本机，关闭后也能继续写。</p>
      </form>
    </Dialog>
  );
}
function Us() {
  const store = useTogether();
  const { data, change, saving, reset } = store;
  const [edit, setEdit] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const elapsed = Math.max(
    0,
    Math.floor(
      (new Date(today() + "T12:00:00").getTime() -
        new Date(data.anniversary + "T12:00:00").getTime()) /
        86400000,
    ),
  );
  return (
    <>
      <PageHead
        title="我们的小小宇宙"
        description="两个人，和只属于我们的日常。"
        action={
          <button
            className={s.iconButton}
            aria-label="编辑我们的资料"
            onClick={() => setEdit(true)}
          >
            <Settings size={21} />
          </button>
        }
      />
      <section className={s.usProfile}>
        <div className={s.usAvatars}>
          <Avatar person={data.people[0]} />
          <Heart size={24} fill="currentColor" />
          <Avatar person={data.people[1]} />
        </div>
        <h2>
          {data.people[0].name} <span>&</span> {data.people[1].name}
        </h2>
        <p>从 {dateLabel(data.anniversary)} 开始</p>
        <div className={s.daysTogether}>
          <strong>{elapsed.toLocaleString()}</strong>
          <span>天的日常，有你在场</span>
        </div>
        <Button secondary onClick={() => setEdit(true)}>
          <Pencil size={16} />
          编辑我们的资料
        </Button>
      </section>
      <section className={s.settingsSection}>
        <h2>现在，谁在这里？</h2>
        <p>本机双人演示：切换身份，为自己记录心情。</p>
        <div className={s.rolePicker}>
          {data.people.map((p, index) => (
            <button
              disabled={saving}
              key={index}
              className={data.role === index ? s.roleActive : ""}
              onClick={() => change((v) => ({ ...v, role: index }))}
            >
              <Avatar person={p} small />
              <span>{p.name}</span>
              {data.role === index && <Check size={18} />}
            </button>
          ))}
        </div>
      </section>
      <section className={s.settingsSection}>
        <h2>关于这个空间</h2>
        <p>
          资料、照片和日常只保存在当前浏览器。此演示没有远程同步，切换身份不会发送真实通知。
        </p>
        <div className={s.stats}>
          <span>
            <strong>{data.events.length}</strong>个约定
          </span>
          <span>
            <strong>{data.wishes.filter((w) => w.done).length}</strong>
            个完成的愿望
          </span>
          <span>
            <strong>{Object.keys(data.notes).length}</strong>句日常
          </span>
        </div>
        <button className={s.dangerText} onClick={() => setConfirmReset(true)}>
          重置同频演示数据
        </button>
      </section>
      {edit && <ProfileForm onClose={() => setEdit(false)} />}
      {confirmReset && (
        <Dialog
          title="重新开始这个小空间？"
          onClose={() => setConfirmReset(false)}
          className={s.dialog}
        >
          <p>
            同频中的约定、愿望、头像、资料和未保存草稿会恢复为虚构示例。其他三个空间不会受影响。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <Button secondary onClick={() => setConfirmReset(false)}>
              保留我的日常
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                if (await reset()) setConfirmReset(false);
              }}
            >
              确认重置同频
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
function ProfileForm({ onClose }: { onClose: () => void }) {
  const { data, change, saving, error } = useTogether();
  const [form, setForm, clear] = useDraft("together:profiles", {
    people: data.people,
    anniversary: data.anniversary,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  async function upload(file: File | undefined, index: number) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const ref = await saveImage(file, "together");
      setForm((p) => ({
        ...p,
        people: p.people.map((v, i) =>
          i === index ? { ...v, avatar: ref } : v,
        ),
      }));
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (
      await change((p) => ({
        ...p,
        ...form,
        people: form.people.map((v) => ({ ...v, name: v.name.trim() })),
      }))
    ) {
      clear();
      await collectUnusedImages("together");
      onClose();
    }
  }
  return (
    <Dialog title="我们的资料" onClose={onClose} className={s.dialog}>
      <form className={s.editor} onSubmit={submit}>
        {form.people.map((person, index) => (
          <fieldset key={index} className={s.profileField}>
            <legend>{index === 0 ? "第一位" : "第二位"}</legend>
            <div className={s.profileRow}>
              <Avatar person={person} />
              <label>
                名字
                <input
                  required
                  maxLength={12}
                  value={person.name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      people: p.people.map((v, i) =>
                        i === index ? { ...v, name: e.target.value } : v,
                      ),
                    }))
                  }
                />
              </label>
            </div>
            <div className={s.avatarOptions}>
              {["☀", "✿", "☾", "♧", "☕"].map((avatar) => (
                <button
                  aria-label={`选择头像 ${avatar}`}
                  className={person.avatar === avatar ? s.selectedAvatar : ""}
                  key={avatar}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      people: p.people.map((v, i) =>
                        i === index ? { ...v, avatar } : v,
                      ),
                    }))
                  }
                >
                  {avatar}
                </button>
              ))}
              <label className={s.uploadLabel}>
                上传照片
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploading}
                  onChange={(e) => upload(e.target.files?.[0], index)}
                />
              </label>
            </div>
          </fieldset>
        ))}
        <label>
          我们开始的那一天
          <input
            type="date"
            required
            max={today()}
            value={form.anniversary}
            onChange={(e) =>
              setForm((p) => ({ ...p, anniversary: e.target.value }))
            }
          />
        </label>
        {uploadError && (
          <p role="alert" className={s.error}>
            {uploadError}
          </p>
        )}
        <StorageMessage error={error} saving={saving} />
        <div className={s.formActions}>
          <Button secondary onClick={onClose}>
            稍后再写
          </Button>
          <Button
            type="submit"
            disabled={
              saving || uploading || form.people.some((p) => !p.name.trim())
            }
          >
            {uploading ? "正在保存照片…" : "保存资料"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function WishMark({ index }: { index: number }) {
  const Icon = [Flower2, Waves, Coffee, Sun][index % 4];
  return <Icon size={30} strokeWidth={1.4} />;
}
