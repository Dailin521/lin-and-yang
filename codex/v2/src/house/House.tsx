import { useState, type FormEvent, type ReactNode } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  Routes,
  Route,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Droplets,
  Home,
  LampDesk,
  Leaf,
  Maximize2,
  MessageCircle,
  Moon,
  Paintbrush,
  Plus,
  Settings,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import {
  dayOffset,
  names,
  today,
  uid,
  useDraft,
  useStore,
} from "../shared/store";
import { AssetImage, Dialog, StorageMessage } from "../shared/ui";
import s from "./House.module.css";

type Area = "all" | "window" | "sofa" | "fridge";
type Slot = "plant" | "rug" | "art";
type Note = {
  id: string;
  text: string;
  role: number;
  position: number;
  date: string;
};
type Data = {
  role: number;
  night: boolean;
  area: Area;
  decor: Record<Slot, number>;
  notes: Note[];
  water: { date: string; role: number }[];
};
const defaults = { plant: 0, rug: 0, art: 0 };
const seed = (): Data => ({
  role: 0,
  night: false,
  area: "all",
  decor: { ...defaults },
  notes: [
    {
      id: "milk",
      text: "牛奶放在第二层。早上记得热一下。",
      role: 1,
      position: 0,
      date: today(),
    },
    {
      id: "soup",
      text: "今晚煮一锅汤吧，等你一起。",
      role: 0,
      position: 1,
      date: today(),
    },
    {
      id: "slow",
      text: "周末没有安排，就在家发呆。",
      role: 1,
      position: 2,
      date: dayOffset(-1),
    },
  ],
  water: [
    { date: dayOffset(-2), role: 0 },
    { date: dayOffset(-1), role: 1 },
  ],
});
const areas: { id: Area; name: string }[] = [
  { id: "all", name: "看看全景" },
  { id: "window", name: "窗边" },
  { id: "sofa", name: "沙发" },
  { id: "fridge", name: "冰箱" },
];
const slots: { id: Slot; name: string; options: string[] }[] = [
  { id: "plant", name: "窗边的绿意", options: ["小小龟背竹", "一盆小雏菊"] },
  { id: "rug", name: "脚下的温柔", options: ["奶油棋盘格", "海盐蓝条纹"] },
  { id: "art", name: "墙上的风景", options: ["去海边", "慢慢旅行"] },
];
type Store = ReturnType<typeof useStore<Data>>;

export default function House() {
  const store = useStore("house", seed);
  const { data, change, error, saving, ready } = store;
  const navigate = useNavigate(),
    location = useLocation();
  const [settings, setSettings] = useState(false),
    [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useDraft<Record<Slot, number> | null>(
    "house:decor-preview",
    null,
  );
  const decorating = location.pathname === "/house/decorate";
  const applied = decorating && preview ? preview : data.decor;
  const hasPanel =
    location.pathname !== "/house" && location.pathname !== "/house/";
  const observedArea: Area = hasPanel
    ? location.pathname.includes("/plant")
      ? "window"
      : location.pathname.includes("/decorate")
        ? "sofa"
        : "fridge"
    : data.area;
  const watered = data.water.some(
    (w) => w.date === today() && w.role === data.role,
  );
  function open(route: string) {
    navigate("/house/" + route);
  }
  return (
    <div className={`${s.app} ${data.night ? s.night : ""}`}>
      <header className={s.header}>
        <Link to="/house" className={s.brand}>
          <Home size={25} />
          <span>
            小屋<small>our little home</small>
          </span>
        </Link>
        <div className={s.headerTools}>
          <Link to="/" className={s.backSpaces}>
            四个空间 <ArrowUpRight size={15} />
          </Link>
          <button aria-label="小屋设置" onClick={() => setSettings(true)}>
            <Settings size={20} />
          </button>
        </div>
      </header>
      <main className={s.main}>
        <div className={s.greeting}>
          <div>
            <span className={s.dayLabel}>
              {new Date().toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </span>
            <h1>
              {data.night ? "灯亮着，慢慢回家。" : "把日子，安放在这里。"}
            </h1>
            <p>{names[data.role]}，欢迎回家。今天想先照顾哪一小块？</p>
          </div>
          <button
            className={s.lightToggle}
            onClick={() => change((p) => ({ ...p, night: !p.night }))}
            aria-label={data.night ? "切换白天" : "切换夜晚"}
            aria-pressed={data.night}
          >
            {data.night ? <Moon size={22} /> : <Sun size={22} />}
            <span>{data.night ? "夜晚" : "白天"}</span>
          </button>
        </div>
        <StorageMessage error={error} saving={saving} />
        {!ready ? (
          <div className={s.loading}>正在推开家的门…</div>
        ) : (
          <div className={`${s.roomLayout} ${hasPanel ? s.withPanel : ""}`}>
            <div className={s.sceneSection}>
              <div className={s.sceneViewport}>
                <div
                  className={`${s.sceneCanvas} ${s[observedArea]} ${data.night ? s.sceneNight : ""}`}
                >
                  <AssetImage
                    src="/assets/room.png"
                    className={s.roomImage}
                    alt="阳光穿过拱窗，绿色沙发、木地板与奶油色冰箱组成两个人的小屋"
                  />
                  <div
                    className={`${s.rug} ${applied.rug === 1 ? s.rugBlue : ""}`}
                    aria-hidden="true"
                  />
                  <div className={s.wallArt} aria-hidden="true">
                    <AssetImage
                      src={
                        applied.art ? "/assets/train.png" : "/assets/coast.png"
                      }
                      alt=""
                    />
                  </div>
                  <AssetImage
                    className={`${s.plant} ${watered ? s.plantHappy : ""}`}
                    src={`/assets/plant-${applied.plant ? "b" : "a"}.png`}
                    alt=""
                  />
                  <div className={s.lightLayer} />
                  <div className={s.lampGlow} />
                  {data.notes.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className={`${s.fridgeSlip} ${s["slip" + n.position]}`}
                      aria-hidden="true"
                    />
                  ))}
                  <button
                    aria-label="照顾植物"
                    className={`${s.hotspot} ${s.plantSpot}`}
                    onClick={() => open("plant")}
                  >
                    <Leaf size={15} />
                    <span>{watered ? "绿意正好" : "照顾植物"}</span>
                  </button>
                  <button
                    aria-label="布置小屋"
                    className={`${s.hotspot} ${s.decorSpot}`}
                    onClick={() => open("decorate")}
                  >
                    <Paintbrush size={15} />
                    <span>布置一下</span>
                  </button>
                  <button
                    aria-label="查看冰箱留言"
                    className={`${s.hotspot} ${s.noteSpot}`}
                    onClick={() => open("notes")}
                  >
                    <MessageCircle size={15} />
                    <span>{data.notes.length} 张留言</span>
                  </button>
                </div>
                <div className={s.sceneHint}>
                  <span className={s.hintDot} />
                  点点屋里的物件，会有小事发生
                </div>
              </div>
              <nav className={s.areaNav} aria-label="观察小屋区域">
                {areas.map((a) => (
                  <button
                    key={a.id}
                    className={observedArea === a.id ? s.activeArea : ""}
                    aria-pressed={observedArea === a.id}
                    onClick={() => {
                      void change((p) => ({ ...p, area: a.id }));
                      if (hasPanel) navigate("/house");
                    }}
                  >
                    {a.id === "all" && <Maximize2 size={14} />} {a.name}
                  </button>
                ))}
              </nav>
            </div>
            {hasPanel ? (
              <aside className={s.panel}>
                <Routes>
                  <Route path="plant" element={<Plant store={store} />} />
                  <Route path="notes" element={<Notes store={store} />} />
                  <Route
                    path="notes/:id"
                    element={
                      <NoteEditor key={location.pathname} store={store} />
                    }
                  />
                  <Route
                    path="decorate"
                    element={
                      <Decorate
                        store={store}
                        preview={preview}
                        onPreview={setPreview}
                      />
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Panel title="这扇门暂时找不到了">
                        <Link to="/house" className={s.primary}>
                          回到小屋
                        </Link>
                      </Panel>
                    }
                  />
                </Routes>
              </aside>
            ) : (
              <aside className={s.homeAside}>
                <div className={s.welcomeNote}>
                  <span>家的留言簿</span>
                  <p>{data.notes[0]?.text || "今天的第一张便笺，等你来写。"}</p>
                  <small>
                    {data.notes[0] ? names[data.notes[0].role] : "小屋"}{" "}
                    留在这里
                  </small>
                  <Link to="/house/notes">
                    去冰箱看看 <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className={s.plantSummary}>
                  <AssetImage
                    src={`/assets/plant-${data.decor.plant ? "b" : "a"}.png`}
                    alt="窗边的植物"
                  />
                  <div>
                    <h2>一起养大的绿意</h2>
                    <p>已经留下 {data.water.length} 次照料</p>
                    <Link to="/house/plant">
                      {watered ? "看看成长记录" : "给它一点水"}{" "}
                      <Droplets size={15} />
                    </Link>
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
        {!hasPanel && (
          <div className={s.activityDock}>
            <button onClick={() => open("notes/new")}>
              <MessageCircle />
              <span>
                留一句话<small>贴在冰箱上</small>
              </span>
              <Plus size={17} />
            </button>
            <button onClick={() => open("plant")}>
              <Leaf />
              <span>
                照顾植物
                <small>
                  {watered ? "今天已经照顾过了" : "一点点，一起长大"}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </button>
            <button onClick={() => open("decorate")}>
              <Paintbrush />
              <span>
                换个小摆设<small>家也可以常常不同</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          </div>
        )}
        <footer className={s.footer}>
          <span>
            属于 {names[0]} 和 {names[1]} 的小屋
          </span>
          <span>
            此刻的身份：{names[data.role]}{" "}
            <button onClick={() => change((p) => ({ ...p, role: 1 - p.role }))}>
              换一个人
            </button>
          </span>
        </footer>
      </main>
      {settings && (
        <Dialog
          title="小屋里的我们"
          onClose={() => setSettings(false)}
          className={s.dialog}
        >
          <p>本机双人演示。房间、留言与照料记录只保存在当前浏览器。</p>
          <div className={s.roleButtons}>
            {names.map((n, i) => (
              <button
                className={data.role === i ? s.selected : ""}
                key={n}
                onClick={() => change((p) => ({ ...p, role: i }))}
              >
                {n}
                {data.role === i && <Check size={17} />}
              </button>
            ))}
          </div>
          <button
            className={s.danger}
            onClick={() => {
              setSettings(false);
              setConfirm(true);
            }}
          >
            重置小屋演示数据
          </button>
        </Dialog>
      )}
      {confirm && (
        <Dialog
          title="把小屋恢复成最初的样子？"
          onClose={() => setConfirm(false)}
          className={s.dialog}
        >
          <p>
            将清除小屋中的留言、布置和照料记录，恢复虚构示例。其他三个空间不受影响。
          </p>
          <StorageMessage error={error} />
          <div className={s.actions}>
            <button className={s.secondary} onClick={() => setConfirm(false)}>
              保留现在的小屋
            </button>
            <button
              className={s.primary}
              disabled={saving}
              onClick={async () => {
                if (await store.reset()) {
                  setConfirm(false);
                  setPreview(null);
                  navigate("/house");
                }
              }}
            >
              确认重置小屋
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Panel({
  title,
  children,
  to = "/house",
}: {
  title: string;
  children: ReactNode;
  to?: string;
}) {
  return (
    <section className={s.panelInner}>
      <div className={s.panelHead}>
        <Link to={to} aria-label={to === "/house" ? "回到小屋" : "返回留言"}>
          <ChevronLeft size={21} />
        </Link>
        <h2>{title}</h2>
        <LampDesk size={19} />
      </div>
      {children}
    </section>
  );
}
function Plant({ store }: { store: Store }) {
  const { data, change, saving, error } = store;
  const [justWatered, setJustWatered] = useState(false);
  const watered = data.water.some(
    (w) => w.date === today() && w.role === data.role,
  );
  const days = new Set(data.water.map((w) => w.date)).size;
  async function water() {
    if (watered) return;
    if (
      await change((p) =>
        p.water.some((w) => w.date === today() && w.role === p.role)
          ? p
          : { ...p, water: [...p.water, { date: today(), role: p.role }] },
      )
    )
      setJustWatered(true);
  }
  return (
    <Panel title="窗边的绿意">
      <div className={`${s.plantPortrait} ${justWatered ? s.watered : ""}`}>
        <span className={s.sunCircle} />
        <AssetImage
          src={`/assets/plant-${data.decor.plant ? "b" : "a"}.png`}
          alt={data.decor.plant ? "一盆小雏菊" : "小小龟背竹"}
        />
        {justWatered && (
          <span className={s.waterDrop}>
            <Droplets />
          </span>
        )}
      </div>
      <h3 className={s.centerTitle}>
        {data.decor.plant ? "有花开的日子" : "慢一点，也在长大"}
      </h3>
      <p className={s.centerText}>
        一起照顾的第 {days} 天。
        <br />
        每一次回来，都算数。
      </p>
      <button
        className={s.primaryWide}
        disabled={watered || saving}
        onClick={water}
      >
        {watered ? <Check size={18} /> : <Droplets size={18} />}{" "}
        {watered ? `${names[data.role]}今天已经浇过水` : "给它一点水"}
      </button>
      <StorageMessage error={error} />
      {justWatered && (
        <p className={s.success} role="status">
          水浇好了，叶子也精神了一点。
        </p>
      )}
      <div className={s.carePeople}>
        {names.map((name, role) => (
          <span key={name}>
            {data.water.some((w) => w.date === today() && w.role === role) ? (
              <Check size={14} />
            ) : (
              <Droplets size={14} />
            )}{" "}
            {name}：
            {data.water.some((w) => w.date === today() && w.role === role)
              ? "今天已照料"
              : "今天未照料"}
          </span>
        ))}
      </div>
      <h3 className={s.smallHeading}>成长记录</h3>
      <ol className={s.careLog}>
        {[...data.water].reverse().map((w, i) => (
          <li key={`${w.date}-${w.role}-${i}`}>
            <span className={s.logLeaf}>
              <Leaf size={15} />
            </span>
            <div>
              <strong>{names[w.role]}浇了一点水</strong>
              <small>{w.date === today() ? "今天" : w.date}</small>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
function Notes({ store }: { store: Store }) {
  const { data } = store;
  return (
    <Panel title="冰箱上的小留言">
      <p className={s.panelIntro}>
        不用等一个特别的时刻，
        <br />
        想说的话，就留在这里。
      </p>
      <Link to="/house/notes/new" className={s.primaryWide}>
        <Plus size={18} />
        贴一张新便笺
      </Link>
      <div className={s.noteStack}>
        {[...data.notes]
          .sort((a, b) => a.position - b.position)
          .map((note) => (
            <Link
              to={`/house/notes/${note.id}`}
              key={note.id}
              className={`${s.paperNote} ${s["paper" + note.position]}`}
            >
              <span className={s.pin} />
              <p>{note.text}</p>
              <small>
                {names[note.role]} ·{" "}
                {note.date === today() ? "今天" : note.date}
              </small>
              <span className={s.noteCorner}>
                <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
      </div>
      {!data.notes.length && (
        <div className={s.empty}>
          <MessageCircle size={30} />
          <p>
            冰箱门还是空的。
            <br />
            贴上今天第一句想说的话吧。
          </p>
        </div>
      )}
    </Panel>
  );
}
function NoteEditor({ store }: { store: Store }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, change, error, saving } = store;
  const original = data.notes.find((n) => n.id === id);
  const isNew = id === "new";
  const [form, setForm, clear] = useDraft<Note>(
    "house:note:" + id,
    original || {
      id: uid(),
      text: "",
      role: data.role,
      position: data.notes.length % 3,
      date: today(),
    },
  );
  const [deleting, setDeleting] = useState(false);
  if (!isNew && !original)
    return (
      <Panel title="便笺已经被收起来了" to="/house/notes">
        <p>这里已经没有这张便笺了。</p>
        <Link to="/house/notes">查看其他留言</Link>
      </Panel>
    );
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.text.trim()) return;
    const item = { ...form, text: form.text.trim() };
    if (
      await change((p) => ({
        ...p,
        notes: isNew
          ? [item, ...p.notes]
          : p.notes.map((n) => (n.id === id ? item : n)),
      }))
    ) {
      clear();
      navigate("/house/notes");
    }
  }
  return (
    <Panel title={isNew ? "留一句话" : "看看这张便笺"} to="/house/notes">
      <form className={s.noteForm} onSubmit={submit}>
        <label>
          想说的话
          <textarea
            autoFocus
            required
            maxLength={180}
            value={form.text}
            onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
            placeholder="比如：汤在锅里，晚点回来也没关系。"
            rows={5}
          />
        </label>
        <div className={s.charCount}>{form.text.length} / 180</div>
        <fieldset>
          <legend>贴在哪里</legend>
          <div className={s.positionPicker}>
            {["左上角", "正中间", "右下角"].map((label, position) => (
              <button
                type="button"
                aria-pressed={form.position === position}
                className={form.position === position ? s.selected : ""}
                key={label}
                onClick={() => setForm((p) => ({ ...p, position }))}
              >
                <span
                  className={`${s.positionMini} ${s["position" + position]}`}
                />
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className={s.noteSignature}>
          署名：{names[form.role]} <span>未保存内容会留在本机</span>
        </p>
        <StorageMessage error={error} />
        <button
          className={s.primaryWide}
          disabled={saving || !form.text.trim()}
          type="submit"
        >
          <Check size={17} />
          {isNew ? "贴到冰箱上" : "保存这张便笺"}
        </button>
      </form>
      {!isNew && (
        <button className={s.danger} onClick={() => setDeleting(true)}>
          <Trash2 size={16} />
          取下这张便笺
        </button>
      )}
      {deleting && (
        <Dialog
          title="把这张便笺取下来？"
          onClose={() => setDeleting(false)}
          className={s.dialog}
        >
          <p>这条留言将从冰箱上删除。</p>
          <StorageMessage error={error} />
          <div className={s.actions}>
            <button className={s.secondary} onClick={() => setDeleting(false)}>
              继续留着
            </button>
            <button
              className={s.primary}
              disabled={saving}
              onClick={async () => {
                if (
                  await change((p) => ({
                    ...p,
                    notes: p.notes.filter((n) => n.id !== id),
                  }))
                ) {
                  clear();
                  navigate("/house/notes");
                }
              }}
            >
              确认取下
            </button>
          </div>
        </Dialog>
      )}
    </Panel>
  );
}
function Decorate({
  store,
  preview,
  onPreview,
}: {
  store: Store;
  preview: Record<Slot, number> | null;
  onPreview: (value: Record<Slot, number> | null) => void;
}) {
  const { data, change, saving, error } = store;
  const [slot, setSlot] = useState<Slot>("plant"),
    [saved, setSaved] = useState(false),
    [resetting, setResetting] = useState(false);
  const selection = preview || data.decor;
  const current = slots.find((v) => v.id === slot)!;
  async function apply(value: Record<Slot, number>) {
    if (await change((p) => ({ ...p, decor: value }))) {
      onPreview(null);
      setSaved(true);
      setResetting(false);
    }
  }
  return (
    <Panel title="让家有一点新变化">
      <p className={s.panelIntro}>
        选一个小物件，
        <br />
        看看它在家里的样子。
      </p>
      <div className={s.decorTabs}>
        {slots.map((v) => (
          <button
            key={v.id}
            className={slot === v.id ? s.selected : ""}
            onClick={() => {
              setSlot(v.id);
              setSaved(false);
            }}
          >
            {v.id === "plant" ? "盆栽" : v.id === "rug" ? "地毯" : "挂画"}
          </button>
        ))}
      </div>
      <h3 className={s.smallHeading}>{current.name}</h3>
      <div className={s.decorOptions}>
        {current.options.map((name, index) => (
          <button
            key={name}
            className={selection[slot] === index ? s.chosenDecor : ""}
            onClick={() => {
              onPreview({ ...selection, [slot]: index });
              setSaved(false);
            }}
          >
            <div className={s.decorThumb}>
              {slot === "plant" ? (
                <AssetImage src={`/assets/plant-${index ? "b" : "a"}.png`} alt="" />
              ) : slot === "art" ? (
                <AssetImage
                  className={s.artThumb}
                  src={index ? "/assets/train.png" : "/assets/coast.png"}
                  alt=""
                />
              ) : (
                <span className={`${s.rugThumb} ${index ? s.rugBlue : ""}`} />
              )}
            </div>
            <span>{name}</span>
            {selection[slot] === index && <Check size={16} />}
          </button>
        ))}
      </div>
      <p className={s.previewHint}>
        {preview
          ? "正在预览，保存后才会留在小屋里。"
          : "换个角度看看，也可以选一种新的。"}
      </p>
      <StorageMessage error={error} />
      <button
        className={s.primaryWide}
        disabled={!preview || saving}
        onClick={() => apply(selection)}
      >
        <Check size={17} />
        就这样布置
      </button>
      {saved && (
        <p role="status" className={s.success}>
          新布置已经留在家里了。
        </p>
      )}
      {preview && (
        <button className={s.textButton} onClick={() => onPreview(null)}>
          取消这次预览
        </button>
      )}
      <button className={s.textButton} onClick={() => setResetting(true)}>
        恢复最初的布置
      </button>
      {resetting && (
        <Dialog
          title="恢复最初的布置？"
          onClose={() => setResetting(false)}
          className={s.dialog}
        >
          <p>三个装饰位将恢复默认款式，留言和照料记录会保留。</p>
          <div className={s.actions}>
            <button className={s.secondary} onClick={() => setResetting(false)}>
              保留现在的
            </button>
            <button
              className={s.primary}
              onClick={() => apply({ ...defaults })}
            >
              恢复默认布置
            </button>
          </div>
        </Dialog>
      )}
    </Panel>
  );
}
