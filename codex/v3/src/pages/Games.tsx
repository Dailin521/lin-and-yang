import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Dices,
  Heart,
  LockKeyhole,
  Orbit,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Ticket as TicketIcon,
  WandSparkles,
} from "lucide-react";
import { useUniverse } from "../data/context";
import {
  dateText,
  sortedEvents,
  type Filters,
  type Round,
} from "../data/model";
import {
  bank,
  ideas,
  matches,
  shuffle,
  timeLabel,
  budgetLabel,
  locationLabel,
} from "../data/playBank";
import { today, uid, useDraft } from "../shared/store";
import {
  Avatar,
  Back,
  Button,
  Chip,
  Confirm,
  DeleteButton,
  Empty,
  Missing,
  PageTitle,
} from "../shared/components";
import { AssetImage } from "../shared/ui";
import { EventRow } from "./Daily";
function Lobby() {
  const { data } = useUniverse();
  const plans = sortedEvents(data.events.filter((e) => !e.done && e.idea));
  return (
    <div className="page">
      <PageTitle
        title="双人游乐场"
        description="把一点好奇心，交给今天的我们。"
      >
        <Link className="button secondary" to="/play/tickets">
          <TicketIcon size={17} />
          我们的票根
        </Link>
      </PageTitle>
      <div className="gameLobby">
        <section className="gameCard">
          <div className="gameIllustration">
            <Orbit />
            <span>×</span>
            <Heart />
          </div>
          <h2>两颗星，会想到一起吗？</h2>
          <p>
            三道小问题，轮流写下答案。
            <br />
            相同的选择很甜，不同的答案也很有趣。
          </p>
          <Link className="button" to="/play/quiz">
            {data.round ? "继续这场默契问答" : "开始默契问答"}{" "}
            <ArrowRight size={17} />
          </Link>
        </section>
        <section className="gameCard drawCard">
          <div className="gameIllustration">
            <Dices />
            <span>✧</span>
            <Star />
          </div>
          <h2>把下一次约会，交给星星</h2>
          <p>
            选好时间和预算，抽一点新鲜灵感。
            <br />
            也许，一场意想不到的约会就要开始。
          </p>
          <Link className="button secondary" to="/play/draw">
            抽一个约会 <ArrowRight size={17} />
          </Link>
        </section>
      </div>
      <section className="panel">
        <div className="row between">
          <h2>抽中之后，真的去做吧</h2>
          <Link className="textLink" to="/calendar">
            共同日历 <ArrowRight size={16} />
          </Link>
        </div>
        {plans.length ? (
          plans.map((e) => <EventRow event={e} key={e.id} />)
        ) : (
          <p>保存抽中的灵感，选一个日期。完成后，就能收获属于那一天的票根。</p>
        )}
      </section>
    </div>
  );
}
export function Results({ round }: { round: Round }) {
  const same = round.questions.filter(
    (q) => round.first[q.id] === round.second[q.id],
  ).length;
  return (
    <>
      <header className="resultHero">
        <div className="resultOrbit">
          <strong>{same}</strong>
          <span>/ 3</span>
        </div>
        <h1>
          {same === 3
            ? "原来，我们想到一起去了"
            : same === 0
              ? "你的不同，我也想慢慢了解"
              : "有些默契，藏在小事里"}
        </h1>
        <p>
          {same} 个相同的选择，{3 - same} 个继续聊下去的理由。
        </p>
      </header>
      <div>
        {round.questions.map((q, i) => {
          const match = round.first[q.id] === round.second[q.id];
          return (
            <section className="answerCompare" key={q.id}>
              <div className="row between" style={{ marginBottom: 13 }}>
                <small className="subtle">第 {i + 1} 颗星</small>
                <Chip>{match ? "同一片星光" : "不同，也很可爱"}</Chip>
              </div>
              <h3>{q.prompt}</h3>
              <div className="row">
                <div>
                  <small>{round.names[round.firstRole]}</small>
                  <p>{round.first[q.id]}</p>
                </div>
                <div>
                  <small>{round.names[round.secondRole]}</small>
                  <p>{round.second[q.id]}</p>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
function Quiz() {
  const { data, change, saving, notify } = useUniverse();
  const navigate = useNavigate();
  const [kind, setKind] = useState(bank[0].kind),
    [exit, setExit] = useState(false);
  const round = data.round;
  const channels = [...new Set(bank.map((q) => q.kind))];
  const ticket = round && data.tickets.find((t) => t.sourceId === round.id);
  async function discard() {
    if (await change((v) => ({ ...v, round: null }))) {
      setExit(false);
      notify("这一局已结束。");
    }
  }
  if (!round)
    return (
      <div className="page">
        <Back to="/play">回到双人游乐场</Back>
        <div className="quizShell">
          <PageTitle
            title="让两颗星，交换一点心事"
            description="选一个频道，每局三题。两个人分别作答，再一起揭晓。"
          />
          <section className="panel">
            <div className="row">
              <Avatar person={data.people[data.role]} />
              <div>
                <h2>{data.people[data.role].name} 先来</h2>
                <p className="subtle" style={{ marginTop: 6 }}>
                  接着把屏幕交给 {data.people[1 - data.role].name}
                </p>
              </div>
            </div>
            <div className="quizChannels">
              {channels.map((k) => (
                <button
                  key={k}
                  className={kind === k ? "selected" : ""}
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                >
                  {k}
                </button>
              ))}
            </div>
            <p className="notice">
              双方的答案都由体验者输入。交接时会遮住前一人的答案，等两个人都完成后再揭晓。
            </p>
            <Button
              disabled={saving}
              onClick={async () => {
                const questions = shuffle(
                  bank.filter((q) => q.kind === kind),
                ).slice(0, 3);
                await change((v) => ({
                  ...v,
                  round: {
                    id: uid(),
                    questions,
                    firstRole: v.role,
                    secondRole: 1 - v.role,
                    first: {},
                    second: {},
                    stage: "first",
                    step: 0,
                    date: today(),
                    names: v.people.map((p) => p.name),
                  },
                }));
              }}
            >
              <Sparkles size={17} />
              开始这一局
            </Button>
          </section>
        </div>
      </div>
    );
  const currentRole =
    round.stage === "second" ? round.secondRole : round.firstRole;
  const question = round.questions[round.step];
  const answers = round.stage === "second" ? round.second : round.first;
  const mismatch =
    (round.stage === "first" || round.stage === "second") &&
    data.role !== currentRole;
  const exitDialog = exit && (
    <Confirm
      title="结束这场问答？"
      label="结束这一局"
      onClose={() => setExit(false)}
      onConfirm={discard}
    >
      未收藏的本局答案会被清除。已经收藏的票根仍然保留。
    </Confirm>
  );
  if (round.stage === "handoff")
    return (
      <>
        <section className="handoff">
          <Avatar person={data.people[round.secondRole]} size="large" />
          <Chip>
            <LockKeyhole size={12} />
            答案已收好
          </Chip>
          <h1 style={{ marginTop: 25 }}>
            现在，把屏幕交给
            <br />
            {round.names[round.secondRole]}
          </h1>
          <p>
            {round.names[round.firstRole]} 的选择暂时藏在星星背后。
            <br />
            轮到你啦，凭第一感觉回答就好。
          </p>
          <Button
            disabled={saving}
            onClick={() =>
              void change((v) => ({
                ...v,
                role: round.secondRole,
                round: v.round
                  ? { ...v.round, stage: "second", step: 0 }
                  : null,
              }))
            }
          >
            我是 {round.names[round.secondRole]}，准备好了{" "}
            <ArrowRight size={16} />
          </Button>
          <Link className="textLink" style={{ marginTop: 20 }} to="/play">
            稍后继续
          </Link>
        </section>
        {exitDialog}
      </>
    );
  if (mismatch)
    return (
      <section className="handoff">
        <LockKeyhole size={50} />
        <h1 style={{ marginTop: 25 }}>
          现在是 {round.names[currentRole]} 的回合
        </h1>
        <p>回到这一位的身份后，才能继续查看和填写答案。</p>
        <Button
          disabled={saving}
          onClick={() => void change((v) => ({ ...v, role: currentRole }))}
        >
          切回 {round.names[currentRole]}
        </Button>
        <Link className="textLink" to="/play">
          回到游乐场
        </Link>
      </section>
    );
  if (round.stage === "reveal")
    return (
      <div className="page">
        <div className="quizShell">
          <Back to="/play">回到双人游乐场</Back>
          <Results round={round} />
          <div className="formActions">
            {ticket ? (
              <Link className="button" to={`/play/tickets/${ticket.id}`}>
                <TicketIcon size={17} />
                查看收藏的票根
              </Link>
            ) : (
              <Button
                disabled={saving}
                onClick={async () => {
                  const tid = uid();
                  if (
                    await change((v) =>
                      v.tickets.some((t) => t.sourceId === round.id)
                        ? v
                        : {
                            ...v,
                            tickets: [
                              ...v.tickets,
                              {
                                id: tid,
                                kind: "quiz",
                                sourceId: round.id,
                                title: "两颗星的默契",
                                date: today(),
                                names: round.names,
                                quiz: structuredClone(round),
                              },
                            ],
                          },
                    )
                  )
                    notify("这一局的题目与答案，已收进票根。");
                }}
              >
                <TicketIcon size={17} />
                收藏这次默契
              </Button>
            )}
            <Button
              secondary
              disabled={saving}
              onClick={() => (ticket ? void discard() : setExit(true))}
            >
              <RotateCcw size={16} />
              再玩一局
            </Button>
          </div>
          <p className="formHint">
            票根会保留这一局的题目、名字与答案，之后可以随时重看。
          </p>
        </div>
        {exitDialog}
      </div>
    );
  return (
    <div className="page">
      <div className="quizShell">
        <div className="quizTop">
          <div className="row">
            <Avatar person={data.people[currentRole]} size="small" />
            <span className="small">{round.names[currentRole]} 的回合</span>
          </div>
          <Chip>{round.step + 1} / 3</Chip>
        </div>
        <div
          className="quizProgress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={round.step + 1}
          aria-label={`第 ${round.step + 1} 题，共三题`}
        >
          {[0, 1, 2].map((i) => (
            <span className={i <= round.step ? "filled" : ""} key={i} />
          ))}
        </div>
        <p className="subtle">{question.kind} · 凭第一感觉，就很好</p>
        <h1 className="quizPrompt">{question.prompt}</h1>
        <div className="answerGrid">
          {question.options.map((option, i) => (
            <button
              key={option}
              disabled={saving}
              aria-pressed={answers[question.id] === option}
              className={`answerOption ${answers[question.id] === option ? "selected" : ""}`}
              onClick={() =>
                void change((v) => {
                  if (!v.round) return v;
                  const key = v.round.stage === "second" ? "second" : "first";
                  return {
                    ...v,
                    round: {
                      ...v.round,
                      [key]: { ...v.round[key], [question.id]: option },
                    },
                  };
                })
              }
            >
              <span>
                {answers[question.id] === option ? (
                  <Check size={15} />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              {option}
            </button>
          ))}
        </div>
        <div className="formActions">
          {round.step > 0 && (
            <Button
              secondary
              disabled={saving}
              onClick={() =>
                void change((v) => ({
                  ...v,
                  round: v.round
                    ? { ...v.round, step: v.round.step - 1 }
                    : null,
                }))
              }
            >
              <ArrowLeft size={16} />
              上一题
            </Button>
          )}
          <Button
            disabled={saving || !answers[question.id]}
            onClick={() =>
              void change((v) => {
                if (!v.round) return v;
                return {
                  ...v,
                  round:
                    v.round.step < 2
                      ? { ...v.round, step: v.round.step + 1 }
                      : {
                          ...v.round,
                          step: 0,
                          stage:
                            v.round.stage === "first" ? "handoff" : "reveal",
                        },
                };
              })
            }
          >
            {round.step < 2
              ? "下一题"
              : round.stage === "first"
                ? "收好答案，交给对方"
                : "一起揭晓"}{" "}
            <ArrowRight size={17} />
          </Button>
        </div>
        <div className="quizExit">
          <Link className="textLink" to="/play">
            保存进度，稍后继续
          </Link>
          <button
            className="dangerLink"
            style={{ marginLeft: 20 }}
            onClick={() => setExit(true)}
          >
            结束本局
          </button>
        </div>
      </div>
      {exitDialog}
    </div>
  );
}
function Draw() {
  const { data, change, saving, notify } = useUniverse();
  const [filters, setFilters] = useDraft<Filters>("universe:draw-filters", {
    time: "halfday",
    budget: "under100",
    location: "any",
  });
  const [drawing, setDrawing] = useState(false),
    [attempted, setAttempted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const pool = ideas.filter((i) => matches(i, filters));
  const key = JSON.stringify(filters);
  const current = data.draw?.filterKey === key ? data.draw : null;
  const plan = current && data.events.find((e) => e.drawId === current.id);
  async function draw() {
    setAttempted(true);
    if (!pool.length) return;
    setDrawing(true);
    const rest = pool.filter((i) => i.id !== current?.idea.id);
    const chosen = shuffle(rest.length ? rest : pool)[0];
    timer.current = setTimeout(
      async () => {
        const ok = await change((v) => ({
          ...v,
          draw: { id: uid(), idea: chosen, filterKey: key },
        }));
        setDrawing(false);
        if (ok) notify("星星挑好了这一次的灵感。");
      },
      document.documentElement.dataset.motion === "off" ? 0 : 650,
    );
  }
  return (
    <div className="page">
      <Back to="/play">回到双人游乐场</Back>
      <PageTitle
        title="今天，星星想带我们去哪儿"
        description="不用做太多准备，留一点空白给惊喜。"
      />
      <div className="drawLayout">
        <section className="panel">
          <h2 style={{ marginBottom: 25 }}>给约会一点线索</h2>
          <label className="field">
            有多少时间
            <select
              id="draw-time"
              disabled={drawing}
              value={filters.time}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  time: e.target.value as Filters["time"],
                });
                setAttempted(false);
              }}
            >
              {Object.entries(timeLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            两个人的预算
            <select
              disabled={drawing}
              value={filters.budget}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  budget: e.target.value as Filters["budget"],
                });
                setAttempted(false);
              }}
            >
              {Object.entries(budgetLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            想待在哪里
            <select
              disabled={drawing}
              value={filters.location}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  location: e.target.value as Filters["location"],
                });
                setAttempted(false);
              }}
            >
              {Object.entries(locationLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <Button
            style={{ width: "100%" }}
            disabled={saving || drawing}
            onClick={() => void draw()}
          >
            <Dices size={18} />
            {drawing
              ? "星星正在挑选…"
              : current
                ? "再抽一个灵感"
                : "交给星星吧"}
          </Button>
          <p className="formHint">
            从本机创意库里挑选，不需要联网。预算为活动参考，实际花费由你们决定。
          </p>
        </section>
        <section
          className={`drawResult ${drawing ? "drawing" : ""}`}
          aria-live="polite"
        >
          {drawing ? (
            <>
              <Orbit className="loadingDots" />
              <h2>让星光转一会儿</h2>
              <p>一个新的约会，正在靠近。</p>
            </>
          ) : !pool.length && attempted ? (
            <>
              <Star />
              <h2>这片星空，暂时没有合适的灵感</h2>
              <p>换一点时间、预算或地点偏好，再试一次吧。</p>
              <Button
                secondary
                onClick={() => document.getElementById("draw-time")?.focus()}
              >
                调整筛选 <ArrowLeft size={16} />
              </Button>
            </>
          ) : current ? (
            <>
              <Sparkles />
              <div className="row" style={{ marginBottom: 25 }}>
                <Chip>{timeLabel[current.idea.time]}</Chip>
                <Chip>{budgetLabel[current.idea.budget]}</Chip>
                <Chip>{locationLabel[current.idea.location]}</Chip>
              </div>
              <h2>{current.idea.title}</h2>
              <p>{current.idea.description}</p>
              <p className="kit">出发前：{current.idea.kit}</p>
              <div className="row" style={{ marginTop: 30 }}>
                <Link
                  className="button"
                  to={
                    plan
                      ? `/events/${plan.id}`
                      : `/events/new?draw=${current.id}`
                  }
                >
                  <CalendarDays size={17} />
                  {plan ? "看看已经安排的约定" : "选一天，真的去做"}
                </Link>
                <Button
                  secondary
                  disabled={saving}
                  onClick={() => void draw()}
                  aria-label="换一个约会灵感"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Dices />
              <h2>下一次约会，先不告诉你</h2>
              <p>
                选好左边的线索，
                <br />
                让星星给你一点意想不到的灵感。
              </p>
              <Chip>{pool.length} 个灵感等待开启</Chip>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
function Tickets() {
  const { data } = useUniverse();
  const [filter, setFilter] = useState("all");
  const tickets = [...data.tickets]
    .filter((t) => filter === "all" || t.kind === filter)
    .reverse();
  return (
    <div className="page">
      <Back to="/play">回到双人游乐场</Back>
      <PageTitle
        title="我们的星光票根"
        description="每一张，都是认真在一起的证据。"
      />
      <div className="tabs">
        {[
          ["all", "全部收藏"],
          ["quiz", "默契问答"],
          ["date", "真实的约会"],
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
      {tickets.length ? (
        <div className="ticketGrid">
          {tickets.map((t) => (
            <Link className="ticket" key={t.id} to={`/play/tickets/${t.id}`}>
              <small>
                {t.kind === "quiz"
                  ? "两颗星 · 默契纪念"
                  : "一起出发 · 约会纪念"}
              </small>
              <h2>{t.title}</h2>
              <div>
                <span>{dateText(t.date, true)}</span>
                <span>{t.names.join(" & ")}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="第一张票根，等我们一起获得"
          action={
            <Link className="button" to="/play">
              去创造一点新回忆 <ArrowRight size={16} />
            </Link>
          }
        >
          完成一场问答，或真正赴一次约会，就能把它留在这里。
        </Empty>
      )}
    </div>
  );
}
function TicketDetail() {
  const { id } = useParams();
  const { data, change, notify } = useUniverse();
  const navigate = useNavigate();
  const ticket = data.tickets.find((t) => t.id === id);
  const [confirm, setConfirm] = useState(false);
  if (!ticket) return <Missing to="/play/tickets" />;
  return (
    <div className="page">
      <Back to="/play/tickets">回到票根收藏</Back>
      <article className="ticketDetail">
        {ticket.quiz ? (
          <Results round={ticket.quiz} />
        ) : (
          <>
            <PageTitle
              title={ticket.title}
              description={`${dateText(ticket.date, true)} · ${ticket.names.join(" & ")}`}
            />
            <section className="panel">
              <div
                className="row"
                style={{ color: "var(--lilac)", marginBottom: 25 }}
              >
                <TicketIcon size={25} />
                <h2>我们真的一起做到了</h2>
              </div>
              <p className="bodyText">{ticket.reflection}</p>
              {ticket.photos?.length ? (
                <div className="memoryPhotos" style={{ marginTop: 25 }}>
                  {ticket.photos.map((p, i) => (
                    <AssetImage
                      key={p + i}
                      src={p}
                      alt={`约会纪念照片 ${i + 1}`}
                    />
                  ))}
                </div>
              ) : null}
              {ticket.memoryId &&
                data.memories.some((m) => m.id === ticket.memoryId) && (
                  <Link
                    className="textLink"
                    style={{ marginTop: 25 }}
                    to={"/memories/" + ticket.memoryId}
                  >
                    回到那段回忆 <ArrowRight size={16} />
                  </Link>
                )}
            </section>
          </>
        )}
        <p className="formHint">
          这张票根保留收藏当时的内容，之后修改原记录也不会改变它。
        </p>
        <div className="dangerZone">
          <DeleteButton onClick={() => setConfirm(true)}>
            删除这张票根
          </DeleteButton>
        </div>
      </article>
      {confirm && (
        <Confirm
          title="取下这张收藏票根？"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (
              await change((v) => ({
                ...v,
                tickets: v.tickets.filter((t) => t.id !== id),
              }))
            ) {
              notify("票根已删除，原来的回忆与约定仍保留。");
              navigate("/play/tickets");
            }
          }}
        >
          只删除这一张票根，不会删除相连的回忆和约定。
        </Confirm>
      )}
    </div>
  );
}
export default function Games() {
  return (
    <Routes>
      <Route index element={<Lobby />} />
      <Route path="quiz" element={<Quiz />} />
      <Route path="draw" element={<Draw />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="tickets/:id" element={<TicketDetail />} />
      <Route path="*" element={<Missing to="/play" />} />
    </Routes>
  );
}
