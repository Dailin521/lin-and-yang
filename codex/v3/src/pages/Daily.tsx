import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { useUniverse } from "../data/context";
import { dateText, sortedEvents, type Event } from "../data/model";
import { today, localDate, uid, useDraft } from "../shared/store";
import {
  Avatar,
  Back,
  Button,
  Chip,
  Confirm,
  DeleteButton,
  Empty,
  Missing,
  MoodIcon,
  moodOptions,
  PageTitle,
  PhotoInput,
} from "../shared/components";
import { Dialog } from "../shared/ui";

function DailyTabs({ active }: { active: string }) {
  return (
    <nav className="tabs" aria-label="日常页面">
      <Link className={active === "today" ? "active" : ""} to="/today">
        今天的我们
      </Link>
      <Link className={active === "calendar" ? "active" : ""} to="/calendar">
        共同日历
      </Link>
    </nav>
  );
}
export function EventRow({ event }: { event: Event }) {
  const d = new Date(event.date + "T12:00:00");
  return (
    <Link
      className={`eventRow ${event.done ? "done" : ""}`}
      to={`/events/${event.id}`}
    >
      <span className="eventDate">
        {d.getMonth() + 1} 月<strong>{d.getDate()}</strong>
      </span>
      <div>
        <h3>{event.title}</h3>
        <p>
          {event.done
            ? "已完成"
            : event.allDay
              ? "全天"
              : event.time || "时间待定"}{" "}
          · {event.type === "anniversary" ? "纪念日" : "我们的约定"}
          {event.wishId ? " · 来自心愿" : ""}
        </p>
      </div>
      {event.done ? <Check size={16} /> : <ArrowUpRight size={16} />}
    </Link>
  );
}
function Today() {
  const { data, change, saving, notify } = useUniverse();
  const [mood, setMood] = useState(false),
    [note, setNote] = useState(false);
  const [draft, setDraft, clear] = useDraft(`universe:today:${today()}`, {
    body: data.notes[today()]?.body || "",
  });
  const upcoming = sortedEvents(
    data.events.filter((e) => !e.done && e.date >= today()),
  ).slice(0, 3);
  return (
    <div className="page">
      <PageTitle
        title="日常电台"
        description="那些没什么特别、却想和你分享的一天。"
      >
        <Link className="button secondary" to="/calendar">
          <CalendarDays size={17} />
          共同日历
        </Link>
      </PageTitle>
      <DailyTabs active="today" />
      <div className="twoColumns">
        <div className="stack">
          <section className="panel">
            <div className="dailyDate">
              {dateText(today(), true)} · 此刻的心情
            </div>
            <h2>今天，你的天空是什么颜色？</h2>
            <div className="moodPeople">
              {data.people.map((p, i) => (
                <div className="moodPerson" key={i}>
                  <Avatar person={p} size="large" />
                  <h3>
                    {p.name}
                    {data.role === i ? " · 我" : ""}
                  </h3>
                  <span className="moodValue">
                    <MoodIcon value={data.moods[today()]?.[i] || ""} />
                    {data.moods[today()]?.[i] || "等你留下心情"}
                  </span>
                  {data.role === i ? (
                    <button
                      className="textLink"
                      style={{ border: 0, background: "none" }}
                      onClick={() => setMood(true)}
                    >
                      换一个心情 <ArrowRight size={14} />
                    </button>
                  ) : (
                    <small className="subtle">来自另一颗星星</small>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="panel">
            <div className="row between">
              <h2>给今天留句话</h2>
              <Button secondary onClick={() => setNote(true)}>
                <MessageCircle size={15} />
                {data.notes[today()] ? "修改便笺" : "写一句话"}
              </Button>
            </div>
            <p className="noteText">
              {data.notes[today()]?.body || "有一句想说的话，在等你写下。"}
            </p>
            {data.notes[today()] && (
              <p className="subtle">
                {data.people[data.notes[today()].author]?.name} 留下的今日便笺
              </p>
            )}
          </section>
        </div>
        <section className="panel">
          <div className="row between">
            <h2>下一次见面</h2>
            <Link className="iconButton" aria-label="添加约定" to="/events/new">
              <Plus size={18} />
            </Link>
          </div>
          {upcoming.length ? (
            upcoming.map((e) => <EventRow key={e.id} event={e} />)
          ) : (
            <Empty
              title="把一个明天留给彼此"
              action={
                <Link className="button secondary" to="/events/new">
                  添加约定
                </Link>
              }
            >
              还没有安排，去抽一个约会也不错。
            </Empty>
          )}
          <Link to="/wishes" className="textLink">
            从心愿里找点灵感 <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      {mood && (
        <Dialog title="今天的我，有一点……" onClose={() => setMood(false)}>
          <div className="moodChoices">
            {moodOptions.map(({ label, Icon }) => (
              <button
                key={label}
                disabled={saving}
                className={
                  data.moods[today()]?.[data.role] === label ? "selected" : ""
                }
                onClick={async () => {
                  if (
                    await change((v) => ({
                      ...v,
                      moods: {
                        ...v.moods,
                        [today()]: { ...v.moods[today()], [v.role]: label },
                      },
                    }))
                  ) {
                    setMood(false);
                    notify("今天的心情，已经传到另一颗星星。");
                  }
                }}
              >
                <Icon size={26} />
                {label}
              </button>
            ))}
          </div>
        </Dialog>
      )}
      {note && (
        <Dialog title="给今天留句话" onClose={() => setNote(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await change((v) => ({
                  ...v,
                  notes: {
                    ...v.notes,
                    [today()]: { body: draft.body.trim(), author: v.role },
                  },
                }))
              ) {
                clear();
                setNote(false);
                notify("今天的小事，已经收好了。");
              }
            }}
          >
            <label className="field">
              想分享的事
              <textarea
                required
                maxLength={1200}
                value={draft.body}
                onChange={(e) => setDraft({ body: e.target.value })}
                placeholder="刚刚看到一朵很像你的云……"
              />
            </label>
            <p className="formHint">
              两个人都能修改，署名会跟随这次保存的身份。
            </p>
            <div className="formActions">
              <Button type="submit" disabled={saving}>
                留下这句话
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
function Calendar() {
  const { data } = useUniverse();
  const [mode, setMode] = useState("month"),
    [selected, setSelected] = useState(today()),
    [month, setMonth] = useState(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
  const start = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - ((month.getDay() + 6) % 7),
  );
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const shown = sortedEvents(
    data.events.filter((e) => mode === "agenda" || e.date === selected),
  );
  return (
    <div className="page">
      <PageTitle
        title="把明天，留给彼此"
        description="约定和纪念日，在这里慢慢靠近。"
      >
        <Link to={`/events/new?date=${selected}`} className="button">
          <Plus size={17} />
          添加约定
        </Link>
      </PageTitle>
      <DailyTabs active="calendar" />
      <div className="tabs">
        <button
          className={mode === "month" ? "active" : ""}
          onClick={() => setMode("month")}
        >
          月历
        </button>
        <button
          className={mode === "agenda" ? "active" : ""}
          onClick={() => setMode("agenda")}
        >
          全部议程
        </button>
      </div>
      <div className={mode === "month" ? "twoColumns" : "form wide"}>
        {mode === "month" && (
          <section className="panel">
            <div className="calendarHeader">
              <h2>
                {month.getFullYear()} 年 {month.getMonth() + 1} 月
              </h2>
              <div className="row">
                <button
                  className="iconButton"
                  aria-label="上个月"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                    )
                  }
                >
                  <ChevronLeft size={17} />
                </button>
                <Button
                  secondary
                  onClick={() => {
                    setSelected(today());
                    setMonth(
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1,
                      ),
                    );
                  }}
                >
                  今天
                </Button>
                <button
                  className="iconButton"
                  aria-label="下个月"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                    )
                  }
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
            <div className="calendarGrid">
              {"一二三四五六日".split("").map((w) => (
                <span key={w} className="weekday">
                  {w}
                </span>
              ))}
              {days.map((d) => {
                const date = localDate(d);
                return (
                  <button
                    key={date}
                    aria-label={`${date}${data.events.some((e) => e.date === date) ? " 有安排" : ""}`}
                    aria-pressed={selected === date}
                    className={`calendarDay ${date === today() ? "today" : ""} ${selected === date ? "selected" : ""} ${d.getMonth() !== month.getMonth() ? "outside" : ""}`}
                    onClick={() => setSelected(date)}
                  >
                    {d.getDate()}
                    {data.events.some((e) => e.date === date) && <i />}
                  </button>
                );
              })}
            </div>
          </section>
        )}
        <section className="panel">
          <h2>
            {mode === "month" ? dateText(selected) + "的约定" : "所有约定"}
          </h2>
          {shown.length ? (
            shown.map((e) => <EventRow key={e.id} event={e} />)
          ) : (
            <Empty
              title="这一天，还留着空白"
              action={
                <Link
                  className="button secondary"
                  to={`/events/new?date=${selected}`}
                >
                  安排一件小事
                </Link>
              }
            >
              约个会，或者记住一个特别的日子。
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}
function EventEditor() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const { data, change, saving, notify } = useUniverse();
  const navigate = useNavigate();
  const current = data.events.find((e) => e.id === id);
  const wish = data.wishes.find((w) => w.id === search.get("wish"));
  const draw = data.draw?.id === search.get("draw") ? data.draw : null;
  const [confirm, setConfirm] = useState(false);
  const [draft, setDraft, clear] = useDraft(
    `universe:event:${id || search.toString() || "new"}`,
    {
      title: current?.title || wish?.title || draw?.idea.title || "",
      date: current?.date || search.get("date") || today(),
      time: current?.time || "18:00",
      allDay: current?.allDay || false,
      type: current?.type || "date",
      note: current?.note || wish?.note || draw?.idea.description || "",
    },
  );
  if (id && !current) return <Missing to="/calendar" />;
  const already = draw && data.events.find((e) => e.drawId === draw.id);
  return (
    <div className="page">
      <Back to="/calendar">回到共同日历</Back>
      <PageTitle
        title={current ? "这一天，和你有约" : "把一个明天留给你"}
        description={
          current?.done
            ? "这段约定已经成为回忆。日期与备注仍可以修改。"
            : "约定不必盛大，在一起就很好。"
        }
      />
      <form
        className="form panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (already) {
            navigate("/events/" + already.id);
            return;
          }
          const eid = id || uid();
          if (
            await change((v) => ({
              ...v,
              events: current
                ? v.events.map((x) =>
                    x.id === id
                      ? {
                          ...x,
                          ...draft,
                          title: draft.title.trim(),
                          time: draft.allDay ? "" : draft.time,
                        }
                      : x,
                  )
                : [
                    ...v.events,
                    {
                      ...draft,
                      title: draft.title.trim(),
                      time: draft.allDay ? "" : draft.time,
                      id: eid,
                      done: false,
                      memoryIds: [],
                      wishId: wish?.id,
                      idea: draw?.idea,
                      drawId: draw?.id,
                    },
                  ],
            }))
          ) {
            clear();
            notify("这一天，已经为我们留好了。");
            navigate("/calendar");
          }
        }}
      >
        {(wish || draw || current?.wishId) && (
          <p className="notice">
            {wish || current?.wishId
              ? "这份约定连着一个心愿。完成后，会一起点亮它。"
              : "来自约会抽签。完成后，可以把它收进回忆与票根。"}
          </p>
        )}
        <label className="field">
          约定的名字
          <input
            required
            maxLength={80}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="比如，去看一场晚霞"
          />
        </label>
        <div className="formGrid">
          <label className="field">
            日期
            <input
              required
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </label>
          <label className="field">
            类型
            <select
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as Event["type"] })
              }
            >
              <option value="date">一起做的事</option>
              <option value="anniversary">纪念日</option>
            </select>
          </label>
        </div>
        <label className="checkField">
          <input
            type="checkbox"
            checked={draft.allDay}
            onChange={(e) => setDraft({ ...draft, allDay: e.target.checked })}
          />
          把一整天留出来
        </label>
        {!draft.allDay && (
          <label className="field">
            时间
            <input
              required
              type="time"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            />
          </label>
        )}
        <label className="field">
          一些小备注
          <textarea
            maxLength={3000}
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="在哪里见面，有什么想带给对方的……"
          />
        </label>
        <div className="formActions">
          <Button type="submit" disabled={saving}>
            {already ? "查看已安排的约定" : "保存约定"}
          </Button>
          {current && !current.done && (
            <Link className="button secondary" to={`/events/${id}/complete`}>
              <Check size={17} />
              完成，留下回忆
            </Link>
          )}
          {current?.done && (
            <Button
              secondary
              disabled={saving}
              onClick={async () => {
                if (
                  await change((v) => ({
                    ...v,
                    events: v.events.map((e) =>
                      e.id === id
                        ? { ...e, done: false, completedAt: undefined }
                        : e,
                    ),
                    wishes: v.wishes.map((w) =>
                      w.id === current.wishId
                        ? { ...w, done: false, completedAt: undefined }
                        : w,
                    ),
                  }))
                )
                  notify("约定重新开启，原来的回忆和票根仍然保留。");
              }}
            >
              重新开启
            </Button>
          )}
        </div>
        {current?.memoryIds.some((mid) =>
          data.memories.some((m) => m.id === mid),
        ) && (
          <div className="notice" style={{ marginTop: 25 }}>
            {current.memoryIds
              .filter((mid) => data.memories.some((m) => m.id === mid))
              .map((mid) => (
                <Link key={mid} className="textLink" to={`/memories/${mid}`}>
                  重温这次约定 <ArrowRight size={15} />
                </Link>
              ))}
          </div>
        )}
        <p className="formHint">离开时保留编辑草稿；点击保存后写入本机。</p>
        {current && (
          <div className="dangerZone">
            <DeleteButton onClick={() => setConfirm(true)}>
              删除这份约定
            </DeleteButton>
          </div>
        )}
      </form>
      {confirm && (
        <Confirm
          title="删除这份约定？"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (
              await change((v) => ({
                ...v,
                events: v.events.filter((e) => e.id !== id),
              }))
            ) {
              clear();
              notify("约定已删除，已有回忆和票根仍保留。");
              navigate("/calendar");
            }
          }}
        >
          只移除日历中的约定，已经留下的回忆、票根和心愿会保留。
        </Confirm>
      )}
    </div>
  );
}
function Wishes() {
  const { data } = useUniverse();
  const [filter, setFilter] = useState("waiting");
  const wishes = data.wishes.filter(
    (w) => filter === "all" || w.done === (filter === "done"),
  );
  return (
    <div className="page">
      <PageTitle title="心愿星球" description="总有一些事，想和你一起完成。">
        <Link className="button" to="/wishes/new">
          <Plus size={17} />
          种下一颗心愿
        </Link>
      </PageTitle>
      <div className="tabs">
        {[
          ["waiting", "等我们出发"],
          ["done", "已经点亮"],
          ["all", "所有心愿"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={filter === id ? "active" : ""}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {wishes.length ? (
        <div className="wishGrid">
          {wishes.map((w) => {
            const event = data.events.find((e) => e.wishId === w.id && !e.done);
            return (
              <article
                key={w.id}
                className={`wishCard ${w.done ? "done" : ""}`}
              >
                {w.done ? (
                  <Check size={29} />
                ) : (
                  <Star size={29} strokeWidth={1.3} />
                )}
                <h2>
                  <Link to={`/wishes/${w.id}`}>{w.title}</Link>
                </h2>
                <p>{w.note || "这颗心愿，等着我们一起赋予意义。"}</p>
                <div>
                  <Chip>{w.tag}</Chip>
                </div>
                <div className="row between">
                  <Link
                    className="textLink"
                    to={
                      w.done
                        ? `/wishes/${w.id}`
                        : event
                          ? `/events/${event.id}`
                          : `/events/new?wish=${w.id}`
                    }
                  >
                    {w.done
                      ? "重温这颗心愿"
                      : event
                        ? `${dateText(event.date)} 已有约定`
                        : "为它选一天"}{" "}
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    className="iconButton"
                    aria-label={`编辑${w.title}`}
                    to={`/wishes/${w.id}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title={
            filter === "done"
              ? "第一颗被点亮的心愿，正在路上"
              : "下一颗心愿，会是什么？"
          }
          action={
            <Link className="button" to="/wishes/new">
              <Plus size={17} />
              写下一个心愿
            </Link>
          }
        >
          从一件小事开始，给下一次见面一点期待。
        </Empty>
      )}
    </div>
  );
}
function WishEditor() {
  const { id } = useParams();
  const { data, change, saving, notify } = useUniverse();
  const navigate = useNavigate();
  const wish = data.wishes.find((w) => w.id === id);
  const [confirm, setConfirm] = useState(false);
  const [draft, setDraft, clear] = useDraft(`universe:wish:${id || "new"}`, {
    title: wish?.title || "",
    note: wish?.note || "",
    tag: wish?.tag || "小小日常",
  });
  if (id && !wish) return <Missing to="/wishes" />;
  const events = data.events.filter((e) => e.wishId === id);
  return (
    <div className="page">
      <Back to="/wishes">回到心愿星球</Back>
      <PageTitle
        title={wish ? "这一颗，关于我们的心愿" : "想和你一起……"}
        description="远一点的旅行，或一个寻常的夜晚，都值得期待。"
      />
      <form
        className="form panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const wid = id || uid();
          if (
            await change((v) => ({
              ...v,
              wishes: wish
                ? v.wishes.map((w) =>
                    w.id === id
                      ? { ...w, ...draft, title: draft.title.trim() }
                      : w,
                  )
                : [
                    ...v.wishes,
                    {
                      ...draft,
                      id: wid,
                      title: draft.title.trim(),
                      done: false,
                    },
                  ],
            }))
          ) {
            clear();
            notify("心愿已经在这里，等我们出发。");
            navigate("/wishes");
          }
        }}
      >
        <label className="field">
          想一起做的事
          <input
            required
            maxLength={90}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="一起去一个没有去过的地方"
          />
        </label>
        <label className="field">
          属于哪一种期待
          <select
            value={draft.tag}
            onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
          >
            {["小小日常", "去远方", "新尝试", "特别时刻"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          再说一点
          <textarea
            maxLength={3000}
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="为什么想做，或者已经有了一点怎样的想象……"
          />
        </label>
        <div className="formActions">
          <Button type="submit" disabled={saving}>
            保存心愿
          </Button>
          {wish && !wish.done && (
            <Link
              className="button secondary"
              to={
                events.find((e) => !e.done)
                  ? "/events/" + events.find((e) => !e.done)!.id
                  : `/events/new?wish=${id}`
              }
            >
              <CalendarDays size={16} />
              安排日期
            </Link>
          )}
          {wish?.done && (
            <Button
              secondary
              disabled={saving}
              onClick={async () => {
                if (
                  await change((v) => ({
                    ...v,
                    wishes: v.wishes.map((w) =>
                      w.id === id
                        ? { ...w, done: false, completedAt: undefined }
                        : w,
                    ),
                  }))
                )
                  notify("心愿重新开启。再做一次，也很好。");
              }}
            >
              重新开启心愿
            </Button>
          )}
        </div>
        {wish && !wish.done && (
          <Button
            secondary
            style={{ marginTop: 16, width: "100%" }}
            disabled={saving}
            onClick={async () => {
              const existing = events.find((e) => !e.done);
              if (existing) {
                navigate("/events/" + existing.id + "/complete");
                return;
              }
              const eid = uid();
              if (
                await change((v) => ({
                  ...v,
                  events: [
                    ...v.events,
                    {
                      id: eid,
                      title: wish.title,
                      date: today(),
                      time: "",
                      allDay: true,
                      type: "date",
                      note: wish.note,
                      done: false,
                      wishId: wish.id,
                      memoryIds: [],
                    },
                  ],
                }))
              )
                navigate("/events/" + eid + "/complete");
            }}
          >
            <Sparkles size={16} />
            已经一起做到了，留下记录
          </Button>
        )}
        {events.length > 0 && (
          <div style={{ marginTop: 22 }}>
            {events.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
        <p className="formHint">编辑中的文字会作为草稿保留。</p>
        {wish && (
          <div className="dangerZone">
            <DeleteButton onClick={() => setConfirm(true)}>
              删除这颗心愿
            </DeleteButton>
          </div>
        )}
      </form>
      {confirm && (
        <Confirm
          title="取下这颗心愿？"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (
              await change((v) => ({
                ...v,
                wishes: v.wishes.filter((w) => w.id !== id),
                events: v.events.map((e) =>
                  e.wishId === id ? { ...e, wishId: undefined } : e,
                ),
              }))
            ) {
              clear();
              navigate("/wishes");
              notify("心愿已取下，相关约定和回忆保留。");
            }
          }}
        >
          只移除这条心愿，已经安排的日期与留下的回忆仍然保留。
        </Confirm>
      )}
    </div>
  );
}
function Complete() {
  const { id } = useParams();
  const { data, change, saving, notify } = useUniverse();
  const event = data.events.find((e) => e.id === id);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [draft, setDraft, clear] = useDraft(`universe:complete:${id}`, {
    date: today(),
    body: "",
    photos: [] as string[],
  });
  if (!event) return <Missing to="/calendar" />;
  if (event.done)
    return (
      <Empty
        title="这段约定已经收进星光里"
        action={
          <Link
            className="button"
            to={
              event.memoryIds.find((mid) =>
                data.memories.some((m) => m.id === mid),
              )
                ? "/memories/" +
                  event.memoryIds.find((mid) =>
                    data.memories.some((m) => m.id === mid),
                  )
                : "/play/tickets"
            }
          >
            重温这次约定 <ArrowRight size={16} />
          </Link>
        }
      >
        可以在回忆和票根收藏里找到它。
      </Empty>
    );
  return (
    <div className="page">
      <Back to={`/events/${id}`}>回到这份约定</Back>
      <PageTitle title="这一刻，值得被记住" description={event.title} />
      <form
        className="form panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const mid = uid(),
            tid = uid();
          if (
            await change((v) => {
              const current = v.events.find((e) => e.id === id);
              if (!current || current.done) return v;
              const album = v.albums.find((a) => a.id === "days");
              const memory = {
                id: mid,
                title: event.title,
                date: draft.date,
                body: draft.body.trim(),
                photos: draft.photos,
                albumId: album?.id || null,
                author: v.role,
                eventId: id,
              };
              return {
                ...v,
                events: v.events.map((e) =>
                  e.id === id
                    ? {
                        ...e,
                        done: true,
                        completedAt: draft.date,
                        memoryIds: [...e.memoryIds, mid],
                      }
                    : e,
                ),
                wishes: v.wishes.map((w) =>
                  w.id === event.wishId
                    ? { ...w, done: true, completedAt: draft.date }
                    : w,
                ),
                memories: [...v.memories, memory],
                albums: v.albums.map((a) =>
                  a.id === album?.id
                    ? { ...a, memoryIds: [...a.memoryIds, mid] }
                    : a,
                ),
                tickets: [
                  ...v.tickets,
                  {
                    id: tid,
                    sourceId: mid,
                    kind: "date",
                    title: event.title,
                    date: draft.date,
                    names: v.people.map((p) => p.name),
                    reflection: draft.body.trim(),
                    photos: draft.photos,
                    memoryId: mid,
                    eventId: id,
                  },
                ],
              };
            })
          ) {
            clear();
            notify("约定已完成，回忆和票根都收好了。");
            navigate("/memories/" + mid);
          }
        }}
      >
        <div className="notice">
          留下感想，就会生成一段回忆和一张约会票根。
          {event.wishId ? "相连的心愿也会一起点亮。" : ""}
        </div>
        <label className="field">
          发生在这一天
          <input
            required
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
        </label>
        <label className="field">
          想留下的那一刻
          <textarea
            required
            maxLength={6000}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder="今天最想记住的是……"
          />
        </label>
        <div className="field">
          <span>照片 · 可以稍后再添加</span>
          <PhotoInput
            photos={draft.photos}
            onChange={(photos) => setDraft((v) => ({ ...v, photos }))}
            onBusy={setBusy}
          />
        </div>
        <div className="formActions">
          <Button type="submit" disabled={saving || busy}>
            <Sparkles size={17} />
            把它收进我们的星空
          </Button>
        </div>
        <p className="formHint">照片与感想会保存在当前浏览器。</p>
      </form>
    </div>
  );
}
export default function Daily({ page }: { page: string }) {
  const { id } = useParams();
  const [query] = useSearchParams();
  return page === "today" ? (
    <Today />
  ) : page === "calendar" ? (
    <Calendar />
  ) : page === "wishes" ? (
    <Wishes />
  ) : page === "wish" ? (
    <WishEditor key={id || "new"} />
  ) : page === "complete" ? (
    <Complete key={id} />
  ) : (
    <EventEditor key={id || query.toString() || "new"} />
  );
}
