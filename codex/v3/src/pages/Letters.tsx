import { useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  ArrowRight,
  Heart,
  Mail,
  MailOpen,
  PenLine,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { useUniverse } from "../data/context";
import { dateText, type Letter } from "../data/model";
import { today, uid, useDraft } from "../shared/store";
import {
  Back,
  Button,
  Chip,
  Confirm,
  DeleteButton,
  Empty,
  Missing,
  PageTitle,
} from "../shared/components";
function LetterBox() {
  const { data } = useUniverse();
  const [tab, setTab] = useState("inbox");
  const letters = data.letters
    .filter((l) =>
      tab === "drafts"
        ? l.status === "draft" && l.from === data.role
        : tab === "sent"
          ? l.status !== "draft" && l.from === data.role
          : tab === "archive"
            ? l.status === "archived" && l.to === data.role
            : l.status === "sent" && l.to === data.role,
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="page">
      <PageTitle
        title="时光邮局"
        description="有些话，想写下来，慢慢地交给你。"
      >
        <Link className="button" to="/letters/new">
          <PenLine size={17} />
          写一封信
        </Link>
      </PageTitle>
      <div className="notice">
        这是 {data.people[data.role].name}{" "}
        的信箱。切换右上角身份，就能以另一人的视角收信。
      </div>
      <div className="tabs">
        {[
          ["inbox", "收到的信"],
          ["sent", "寄出的信"],
          ["drafts", "还没寄出的"],
          ["archive", "珍藏的信"],
        ].map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "active" : ""}
          >
            {l}
          </button>
        ))}
      </div>
      {letters.length ? (
        <div className="letterGrid">
          {letters.map((l) => (
            <Link
              key={l.id}
              className="envelope"
              to={
                l.status === "draft"
                  ? `/letters/${l.id}/edit`
                  : `/letters/${l.id}`
              }
            >
              {l.read || l.from === data.role ? (
                <MailOpen size={29} strokeWidth={1.25} />
              ) : (
                <Mail size={29} strokeWidth={1.25} />
              )}
              <Chip>
                {l.status === "draft"
                  ? "草稿"
                  : l.status === "archived"
                    ? "珍藏"
                    : l.from === data.role
                      ? "已寄出"
                      : l.read
                        ? "已读"
                        : "未拆封"}
              </Chip>
              <h2>{l.title || "还没想好的信题"}</h2>
              <small>
                {l.from === data.role
                  ? "写给 " + (l.names?.[l.to] || data.people[l.to].name)
                  : "来自 " +
                    (l.names?.[l.from] || data.people[l.from].name)}{" "}
                · {dateText(l.date)}
              </small>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title={
            tab === "drafts"
              ? "下一封信，等你落笔"
              : tab === "sent"
                ? "把想说的话，写给那个人"
                : tab === "archive"
                  ? "慢慢收好每一封来信"
                  : "还没有新的来信"
          }
          action={
            <Link className="button secondary" to="/letters/new">
              <PenLine size={16} />
              写一封信
            </Link>
          }
        >
          {tab === "inbox"
            ? "可以切换另一位角色，写一封信放进这个信箱。"
            : "一些平时没说出口的话，可以从这里开始。"}
        </Empty>
      )}
    </div>
  );
}
function LetterEditor() {
  const { id } = useParams();
  const { data, change, saving, notify } = useUniverse();
  const navigate = useNavigate();
  const letter = data.letters.find((l) => l.id === id);
  const [confirm, setConfirm] = useState(false),
    [deleting, setDeleting] = useState(false);
  const [draft, setDraft, clear] = useDraft(
    `universe:letter:${id || "new-" + data.role}`,
    { title: letter?.title || "", body: letter?.body || "" },
  );
  if (id && (!letter || letter.status !== "draft" || letter.from !== data.role))
    return (
      <Empty
        title="这份草稿属于另一颗星星"
        action={
          <Link className="button secondary" to="/letters">
            回到我的信箱
          </Link>
        }
      >
        只有写信的人可以继续修改自己的草稿。已投递的信件会保留原文。
      </Empty>
    );
  async function save(sent: boolean) {
    const lid = id || uid();
    if (
      await change((v) => {
        const item: Letter = {
          id: lid,
          title: draft.title.trim() || "未命名的信",
          body: draft.body,
          date: today(),
          from: v.role,
          to: 1 - v.role,
          status: sent ? "sent" : "draft",
          read: false,
          ...(sent ? { names: v.people.map((p) => p.name) } : {}),
        };
        return {
          ...v,
          letters: letter
            ? v.letters.map((l) => (l.id === id ? item : l))
            : [...v.letters, item],
        };
      })
    ) {
      clear();
      notify(sent ? "信已放入对方的信箱。" : "还没说完的话，已经存为草稿。");
      navigate("/letters");
    }
  }
  return (
    <div className="page">
      <Back to="/letters">回到时光邮局</Back>
      <PageTitle
        title={`写给${data.people[1 - data.role].name}`}
        description="不用着急，让那些细小的心事慢慢落在纸上。"
      />
      <form
        className="form letterPaper"
        onSubmit={(e) => {
          e.preventDefault();
          const action = (e.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;
          if (action?.value === "send") {
            setConfirm(true);
          } else void save(false);
        }}
      >
        <span className="letterStamp">
          <Mail size={30} strokeWidth={1.3} />
        </span>
        <label className="field">
          这一封信，想叫作
          <input
            required
            maxLength={90}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="有件小事，想告诉你"
          />
        </label>
        <label className="field">
          想说的话
          <textarea
            required
            rows={11}
            maxLength={15000}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder={`${data.people[1 - data.role].name}：\n\n今天忽然想起……`}
          />
        </label>
        <p className="subtle">
          来自 {data.people[data.role].name} · {dateText(today(), true)}
        </p>
        <div className="formActions">
          <Button
            type="submit"
            secondary
            value="draft"
            formNoValidate
            disabled={saving}
          >
            存为草稿
          </Button>
          <Button type="submit" value="send" disabled={saving}>
            <Send size={16} />
            放进对方信箱
          </Button>
        </div>
        <p className="formHint">
          输入会保留为本机草稿。寄出后保持原文，不能再修改。
        </p>
        {letter && (
          <div className="dangerZone">
            <DeleteButton onClick={() => setDeleting(true)}>
              删除草稿
            </DeleteButton>
          </div>
        )}
      </form>
      {confirm && (
        <Confirm
          title={`寄给${data.people[1 - data.role].name}？`}
          label="寄出这封信"
          onClose={() => setConfirm(false)}
          onConfirm={() => save(true)}
        >
          信件会放入对方在本机的信箱，寄出后保留此刻的原文。切换身份即可拆信。
        </Confirm>
      )}
      {deleting && (
        <Confirm
          title="删除这份草稿？"
          onClose={() => setDeleting(false)}
          onConfirm={async () => {
            if (
              await change((v) => ({
                ...v,
                letters: v.letters.filter((l) => l.id !== id),
              }))
            ) {
              clear();
              navigate("/letters");
              notify("草稿已删除。");
            }
          }}
        >
          还没有寄出的这些文字会被删除。
        </Confirm>
      )}
    </div>
  );
}
function LetterRead() {
  const { id } = useParams();
  const { data, change, saving, notify } = useUniverse();
  const navigate = useNavigate();
  const letter = data.letters.find((l) => l.id === id);
  if (!letter || letter.status === "draft") return <Missing to="/letters" />;
  const receiver = letter.to === data.role;
  const names = letter.names || data.people.map((p) => p.name);
  if (receiver && !letter.read)
    return (
      <div className="page">
        <Back to="/letters">回到时光邮局</Back>
        <section className="letterUnopened">
          <Mail strokeWidth={1} />
          <h1>有一封来自 {names[letter.from]} 的信</h1>
          <p>
            {letter.title}
            <br />
            {dateText(letter.date, true)} · 只写给你
          </p>
          <Button
            disabled={saving}
            onClick={async () => {
              if (
                await change((v) => ({
                  ...v,
                  letters: v.letters.map((l) =>
                    l.id === id ? { ...l, read: true } : l,
                  ),
                }))
              )
                notify("慢慢读，写信的人也在想着你。");
            }}
          >
            <MailOpen size={18} />
            拆开这封信
          </Button>
        </section>
      </div>
    );
  return (
    <div className="page">
      <Back to="/letters">回到时光邮局</Back>
      <article className="letterPaper">
        <span className="letterStamp">
          <Heart size={28} strokeWidth={1.2} />
        </span>
        <h1>{letter.title}</h1>
        <p className="subtle">
          {names[letter.from]} 写给 {names[letter.to]} ·{" "}
          {dateText(letter.date, true)}
        </p>
        <p className="bodyText">{letter.body}</p>
        <div className="formActions">
          {receiver && (
            <>
              <Button
                secondary
                disabled={saving}
                onClick={async () => {
                  if (
                    await change((v) => ({
                      ...v,
                      letters: v.letters.map((l) =>
                        l.id === id
                          ? {
                              ...l,
                              status:
                                l.status === "archived" ? "sent" : "archived",
                            }
                          : l,
                      ),
                    }))
                  )
                    notify(
                      letter.status === "archived"
                        ? "信件已放回收件箱。"
                        : "这封信，已好好珍藏。",
                    );
                }}
              >
                <Archive size={16} />
                {letter.status === "archived" ? "放回收件箱" : "珍藏这封信"}
              </Button>
              <Link className="button" to="/letters/new">
                <PenLine size={16} />
                给你回一封
              </Link>
            </>
          )}
        </div>
        <p className="formHint">已寄出的信，保留写下时的名字和原文。</p>
      </article>
    </div>
  );
}
function EditorWrapper() {
  const { id } = useParams();
  const { data } = useUniverse();
  return <LetterEditor key={`${id || "new"}-${data.role}`} />;
}
export default function Letters() {
  return (
    <Routes>
      <Route index element={<LetterBox />} />
      <Route path="new" element={<EditorWrapper />} />
      <Route path=":id/edit" element={<EditorWrapper />} />
      <Route path=":id" element={<LetterRead />} />
      <Route path="*" element={<Missing to="/letters" />} />
    </Routes>
  );
}
