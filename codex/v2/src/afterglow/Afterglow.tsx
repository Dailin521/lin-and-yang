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
  Album,
  Archive,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import {
  collectUnusedImages,
  dayOffset,
  deleteImage,
  saveImage,
  today,
  uid,
  useDraft,
  useStore,
} from "../shared/store";
import { AssetImage, Dialog, StorageMessage } from "../shared/ui";
import s from "./Afterglow.module.css";

type Memory = {
  id: string;
  date: string;
  title: string;
  body: string;
  photos: string[];
  albumId: string | null;
};
type Book = {
  id: string;
  title: string;
  description: string;
  cover: string;
  memoryIds: string[];
};
type Letter = {
  id: string;
  from: number;
  to: number;
  title: string;
  body: string;
  status: "draft" | "sent" | "archived";
  read: boolean;
  date: string;
};
type Data = {
  role: number;
  names: string[];
  albums: Book[];
  memories: Memory[];
  letters: Letter[];
};
const seed = (): Data => ({
  role: 0,
  names: ["阿澄", "小满"],
  albums: [
    {
      id: "coast",
      title: "去有海的地方",
      description: "风把时间吹慢了。三天，两个人，一片没有尽头的海。",
      cover: "/assets/coast.png",
      memoryIds: ["sea-one", "sea-two"],
    },
    {
      id: "train",
      title: "慢一点的旅途",
      description: "车窗里的风景，和坐在我身旁的你。",
      cover: "/assets/train.png",
      memoryIds: ["train-one", "train-two"],
    },
    {
      id: "ordinary",
      title: "寻常的好日子",
      description: "没有特别的安排，只是碰巧，都在。",
      cover: "/assets/morning.png",
      memoryIds: ["morning-one", "morning-two"],
    },
  ],
  memories: [
    {
      id: "sea-one",
      date: dayOffset(-16),
      title: "风停在你的肩上",
      body: "我们比日落早到了一会儿。\n你说，等到最后一班船开走再回去吧。于是我们坐在堤岸上，听海水一遍遍把白天收回去。\n\n那天没有拍很多照片。只记得你的外套很暖，和回去时，鞋子里倒不完的沙。",
      photos: ["/assets/coast.png"],
      albumId: "coast",
    },
    {
      id: "sea-two",
      date: dayOffset(-15),
      title: "明天还想再看一次海",
      body: "早餐后沿着海岸一直走。路边的小店还没有开门，只有一只橘猫跟了我们半条街。\n\n你把捡来的贝壳放进口袋，说这是今天的纪念品。现在它躺在书桌左边的抽屉里。",
      photos: ["/assets/coast.png", "/assets/morning.png"],
      albumId: "coast",
    },
    {
      id: "train-one",
      date: dayOffset(-39),
      title: "坐在靠窗的那一边",
      body: "车次没有选最快的。我们想多看一会儿窗外。\n\n你带了两本书，最后只读了三页。剩下的时间，都在认田野里的树，和给远处的云取名字。",
      photos: ["/assets/train.png"],
      albumId: "train",
    },
    {
      id: "train-two",
      date: dayOffset(-38),
      title: "下一站，哪里都好",
      body: "到了一个没听过名字的小站。雨刚停，站台上的灯倒映在地面。\n你问我饿不饿，我们就跟着香味，找到了那家只卖热汤的小店。",
      photos: ["/assets/train.png", "/assets/coast.png"],
      albumId: "train",
    },
    {
      id: "morning-one",
      date: dayOffset(-3),
      title: "星期天，暂时没有计划",
      body: "阳光到餐桌的时候，我们才刚刚吃完早饭。\n\n把窗打开，给花换水。你在厨房磨咖啡，我在找一本上次没看完的书。一个上午，足够用来什么也不做。",
      photos: ["/assets/morning.png"],
      albumId: "ordinary",
    },
    {
      id: "morning-two",
      date: dayOffset(-1),
      title: "留一点光，给回家的人",
      body: "今天比平时晚了一点。打开门的时候，桌上有一杯温水，灯只亮了靠窗的那一盏。\n\n我们聊了一些很小的事。楼下新开的花店，忘记买的牛奶，还有明天的天气。",
      photos: ["/assets/morning.png"],
      albumId: "ordinary",
    },
  ],
  letters: [
    {
      id: "first-letter",
      from: 1,
      to: 0,
      title: "想把这些小事都记下来",
      body: "阿澄：\n\n有时候，我会忘记我们一起走过哪条路，吃过哪一家的面。但我一直记得，在那些地方，我很安心。\n\n所以想留一个地方，收好这些不太起眼的日子。以后翻到的时候，还能想起那天的风，和你看着我笑的样子。\n\n小满",
      status: "sent",
      read: false,
      date: dayOffset(-2),
    },
    {
      id: "draft-letter",
      from: 0,
      to: 1,
      title: "等下一个晴天",
      body: "小满：\n\n下一次去海边，我们再多住一天吧。",
      status: "draft",
      read: false,
      date: today(),
    },
  ],
});
type Store = ReturnType<typeof useStore<Data>>;
const Context = createContext<Store | null>(null);
const useAfterglow = () => useContext(Context)!;
const fmt = (date: string, year = false) =>
  new Date(date + "T12:00:00").toLocaleDateString("zh-CN", {
    ...(year ? { year: "numeric" as const } : {}),
    month: "long",
    day: "numeric",
  });
const formatNumber = (n: number) => String(n).padStart(2, "0");
function albumMemories(book: Book, data: Data) {
  return book.memoryIds
    .map((id) => data.memories.find((m) => m.id === id))
    .filter((v): v is Memory => !!v);
}
async function pruneImages(refs: string[], data: Data) {
  const used = new Set([
    ...data.memories.flatMap((m) => m.photos),
    ...data.albums.map((a) => a.cover),
  ]);
  let drafts = "";
  try {
    drafts = Object.keys(localStorage)
      .filter((k) => k.startsWith("draft:afterglow:"))
      .map((k) => localStorage.getItem(k) || "")
      .join(" ");
  } catch {
    return;
  }
  await Promise.all(
    refs
      .filter(
        (ref, i) =>
          refs.indexOf(ref) === i &&
          ref.startsWith("image:") &&
          !used.has(ref) &&
          !drafts.includes(ref),
      )
      .map((ref) => deleteImage(ref).catch(() => {})),
  );
  await collectUnusedImages("afterglow");
}
function Action({
  children,
  onClick,
  type = "button",
  muted = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  muted?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      className={muted ? s.outline : s.action}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function Missing({
  text = "这一页已经被收走了。",
  to = "/afterglow",
}: {
  text?: string;
  to?: string;
}) {
  return (
    <div className={s.empty}>
      <Album size={28} />
      <h1>{text}</h1>
      <p>记录可能已被删除，其他回忆还在这里。</p>
      <Link to={to}>
        回到相册 <ArrowRight size={16} />
      </Link>
    </div>
  );
}
function Back({
  to = "/afterglow",
  children = "回到相册",
}: {
  to?: string;
  children?: ReactNode;
}) {
  return (
    <Link to={to} className={s.back}>
      <ArrowLeft size={15} />
      {children}
    </Link>
  );
}

export default function Afterglow() {
  const store = useStore<Data>("afterglow", seed);
  const [settings, setSettings] = useState(false);
  const unread = store.data.letters.filter(
    (l) => l.to === store.data.role && l.status === "sent" && !l.read,
  ).length;
  return (
    <Context.Provider value={store}>
      <div className={s.app}>
        <header className={s.header}>
          <Link className={s.brand} to="/afterglow">
            <span className={s.brandMark} />
            <span>
              余温<small>Afterglow</small>
            </span>
          </Link>
          <nav className={s.desktopNav} aria-label="余温导航">
            <NavLink
              end
              to="/afterglow"
              className={({ isActive }) => (isActive ? s.activeNav : "")}
            >
              相册
            </NavLink>
            <NavLink
              to="/afterglow/archive"
              className={({ isActive }) => (isActive ? s.activeNav : "")}
            >
              时间档案
            </NavLink>
            <NavLink
              to="/afterglow/letters"
              className={({ isActive }) => (isActive ? s.activeNav : "")}
            >
              写给你 {unread > 0 && <i>{unread}</i>}
            </NavLink>
          </nav>
          <div className={s.headerActions}>
            <Link to="/afterglow/memory/new" className={s.headerAdd}>
              <Plus size={16} />
              记录此刻
            </Link>
            <button
              className={s.roleButton}
              onClick={() => setSettings(true)}
              aria-label="身份与余温设置"
            >
              <span>{store.data.names[store.data.role].slice(0, 1)}</span>
              <small>{store.data.names[store.data.role]}</small>
              <MoreHorizontal size={16} />
            </button>
            <Link to="/" className={s.spaceLink} aria-label="返回四个空间">
              <ArrowDownLeft size={18} />
              <span>四个空间</span>
            </Link>
          </div>
        </header>
        <main className={s.main}>
          <StorageMessage error={store.error} saving={store.saving} />
          {store.ready ? (
            <Routes>
              <Route index element={<Albums />} />
              <Route path="album/:id" element={<AlbumPage />} />
              <Route path="memory/new" element={<MemoryEditorPage />} />
              <Route path="memory/:id/edit" element={<MemoryEditorPage />} />
              <Route path="memory/:id" element={<MemoryPage />} />
              <Route path="archive" element={<Chronology />} />
              <Route path="letters" element={<Letters />} />
              <Route path="letters/new" element={<LetterPage />} />
              <Route path="letters/:id" element={<LetterPage />} />
              <Route path="*" element={<Navigate to="/afterglow" replace />} />
            </Routes>
          ) : (
            <p className={s.loading}>正在翻开我们的相册…</p>
          )}
        </main>
        <footer className={s.footer}>
          <span>为那些不想忘记的瞬间。</span>
          <span>
            本机双人演示 · {store.data.names[store.data.role]}正在翻阅
          </span>
        </footer>
        <nav className={s.mobileNav} aria-label="余温移动导航">
          <NavLink
            end
            to="/afterglow"
            className={({ isActive }) => (isActive ? s.activeNav : "")}
          >
            <Album size={20} />
            相册
          </NavLink>
          <NavLink
            to="/afterglow/archive"
            className={({ isActive }) => (isActive ? s.activeNav : "")}
          >
            <Archive size={19} />
            时间
          </NavLink>
          <NavLink
            to="/afterglow/letters"
            className={({ isActive }) => (isActive ? s.activeNav : "")}
          >
            <span>
              <Mail size={20} />
              {unread > 0 && <i />}
            </span>
            写给你
          </NavLink>
          <Link
            to="/afterglow/memory/new"
            className={s.mobileNew}
            aria-label="新增回忆"
          >
            <Plus size={23} />
          </Link>
        </nav>
        {settings && <SettingsPanel onClose={() => setSettings(false)} />}
      </div>
    </Context.Provider>
  );
}
function Heading({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.pageHeading}>
      <div>
        <p>{note}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
function Albums() {
  const { data } = useAfterglow();
  const [adding, setAdding] = useState(false);
  const first = data.albums[0];
  const others = data.albums.slice(1);
  const uncategorized = data.memories.filter((m) => !m.albumId);
  return (
    <>
      <Heading
        title="日子留下的光"
        note={`${data.names.join(" 与 ")}的私人相册`}
      >
        <button className={s.textButton} onClick={() => setAdding(true)}>
          <Plus size={16} />
          新建相册
        </button>
      </Heading>
      {first ? (
        <div className={s.albumSpread}>
          <Link to={`/afterglow/album/${first.id}`} className={s.featureAlbum}>
            <AssetImage src={first.cover} alt={first.title} />
            <div className={s.photoShade} />
            <div className={s.featureCopy}>
              <small>{albumMemories(first, data).length} 段回忆</small>
              <h2>{first.title}</h2>
              <p>{first.description}</p>
              <span>
                翻开这一页 <ArrowRight size={18} />
              </span>
            </div>
            <span className={s.photoCorner}>我们的相册</span>
          </Link>
          <div className={s.sideAlbums}>
            {others.slice(0, 2).map((book, i) => (
              <AlbumTile key={book.id} book={book} crop={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className={s.empty}>
          <Album />
          <h2>给回忆一个安放的地方。</h2>
          <Action onClick={() => setAdding(true)}>建立第一本相册</Action>
        </div>
      )}
      {others.length > 2 && (
        <div className={s.moreAlbums}>
          {others.slice(2).map((book) => (
            <AlbumTile key={book.id} book={book} />
          ))}
        </div>
      )}
      <div className={s.indexLine}>
        <span>{formatNumber(data.albums.length)} 本相册</span>
        <i />
        <span>{formatNumber(data.memories.length)} 段被留住的时光</span>
        <Link to="/afterglow/archive">
          按时间翻阅 <ArrowRight size={15} />
        </Link>
      </div>
      {uncategorized.length > 0 && (
        <section className={s.uncategorized}>
          <div>
            <h2>还没有归入相册</h2>
            <p>这些回忆仍在，好好地收着。</p>
          </div>
          <div className={s.looseStrip}>
            {uncategorized.map((m) => (
              <Link key={m.id} to={`/afterglow/memory/${m.id}`}>
                <AssetImage src={m.photos[0]} alt={m.title} />
                <span>{m.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className={s.homeNote}>
        <span className={s.smallOrbit} />
        <p>
          有些瞬间很轻。
          <br />
          被记住之后，就有了分量。
        </p>
        <Link to="/afterglow/memory/new">
          记下今天 <Plus size={15} />
        </Link>
      </div>
      {adding && <AlbumForm onClose={() => setAdding(false)} />}
    </>
  );
}
function AlbumTile({ book, crop = 0 }: { book: Book; crop?: number }) {
  const { data } = useAfterglow();
  return (
    <Link to={`/afterglow/album/${book.id}`} className={s.albumTile}>
      <div className={s.albumTilePhoto}>
        <AssetImage
          src={book.cover}
          alt={book.title}
          style={{ objectPosition: crop % 2 ? "50% 62%" : "50% 50%" }}
        />
        <span>
          <ArrowRight size={18} />
        </span>
      </div>
      <div className={s.albumTileCaption}>
        <h2>{book.title}</h2>
        <small>{formatNumber(albumMemories(book, data).length)} 段回忆</small>
      </div>
    </Link>
  );
}
function AlbumPage() {
  const { id } = useParams();
  const store = useAfterglow();
  const { data, change, saving } = store;
  const book = data.albums.find((a) => a.id === id);
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  const [reorder, setReorder] = useState(false);
  const navigate = useNavigate();
  if (!book) return <Missing />;
  const memories = albumMemories(book, data);
  async function shift(index: number, direction: number) {
    if (!book) return;
    await change((p) => ({
      ...p,
      albums: p.albums.map((a) => {
        if (a.id !== book.id) return a;
        const ids = a.memoryIds.filter((v) =>
          p.memories.some((m) => m.id === v),
        );
        const target = index + direction;
        if (target < 0 || target >= ids.length) return a;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        return { ...a, memoryIds: ids };
      }),
    }));
  }
  async function deleteBook() {
    if (!book) return;
    let next!: Data;
    const ok = await change((p) => {
      next = {
        ...p,
        albums: p.albums.filter((a) => a.id !== book.id),
        memories: p.memories.map((m) =>
          m.albumId === book.id ? { ...m, albumId: null } : m,
        ),
      };
      return next;
    });
    if (ok) {
      void pruneImages([book.cover], next);
      navigate("/afterglow");
    }
  }
  return (
    <>
      <div className={s.albumToolbar}>
        <Back />
        <div>
          <button className={s.textButton} onClick={() => setEdit(true)}>
            <Pencil size={14} />
            编辑相册
          </button>
          <button
            className={s.iconButton}
            onClick={() => setRemove(true)}
            aria-label="删除相册"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <section className={s.albumHero}>
        <AssetImage src={book.cover} alt={book.title} />
        <div className={s.photoShade} />
        <div>
          <span>{formatNumber(memories.length)} 段回忆</span>
          <h1>{book.title}</h1>
          <p>{book.description}</p>
        </div>
      </section>
      <div className={s.albumContentHead}>
        <p>把每一个当时，再看一遍。</p>
        <div>
          <button
            className={s.textButton}
            aria-pressed={reorder}
            onClick={() => setReorder(!reorder)}
          >
            <ArrowUp size={14} />
            {reorder ? "完成排序" : "调整顺序"}
          </button>
          <Link
            to={`/afterglow/memory/new?album=${book.id}`}
            className={s.textButton}
          >
            <Plus size={16} />
            添加回忆
          </Link>
        </div>
      </div>
      {memories.length > 0 ? (
        <div className={s.contactSheet}>
          {memories.map((m, index) => (
            <article key={m.id} className={s.contactItem}>
              <Link to={`/afterglow/memory/${m.id}`}>
                <div className={s.contactPhoto}>
                  <AssetImage src={m.photos[0]} alt={m.title} />
                  <span>{formatNumber(index + 1)}</span>
                </div>
                <div className={s.contactCaption}>
                  <small>{fmt(m.date, true)}</small>
                  <h2>{m.title}</h2>
                  <p>{m.body.split("\n")[0]}</p>
                </div>
              </Link>
              {reorder && (
                <div className={s.reorder}>
                  <span>第 {index + 1} 段</span>
                  <button
                    disabled={saving || index === 0}
                    onClick={() => shift(index, -1)}
                    aria-label={`向前移动：${m.title}`}
                  >
                    <ArrowUp size={15} />
                    向前
                  </button>
                  <button
                    disabled={saving || index === memories.length - 1}
                    onClick={() => shift(index, 1)}
                    aria-label={`向后移动：${m.title}`}
                  >
                    <ArrowDown size={15} />
                    向后
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <ImagePlus />
          <h2>这本相册，等第一段回忆。</h2>
          <Link
            to={`/afterglow/memory/new?album=${book.id}`}
            className={s.action}
          >
            添加回忆
          </Link>
        </div>
      )}
      {edit && <AlbumForm initial={book} onClose={() => setEdit(false)} />}
      {remove && (
        <Dialog
          title="把相册收起来？"
          onClose={() => setRemove(false)}
          className={s.dialog}
        >
          <p>
            「{book.title}」会被删除。其中的 {memories.length}{" "}
            段回忆会保留在时间档案，之后可以重新归入其他相册。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <Action muted onClick={() => setRemove(false)}>
              保留相册
            </Action>
            <Action disabled={saving} onClick={deleteBook}>
              删除相册，保留回忆
            </Action>
          </div>
        </Dialog>
      )}
    </>
  );
}
function AlbumForm({
  initial,
  onClose,
}: {
  initial?: Book;
  onClose: () => void;
}) {
  const store = useAfterglow();
  const [form, setForm, clear] = useDraft<Book>(
    "afterglow:album:" + (initial?.id || "new"),
    initial || {
      id: uid(),
      title: "",
      description: "",
      cover: "/assets/coast.png",
      memoryIds: [],
    },
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const cover = await saveImage(file, "afterglow");
      setForm((p) => ({ ...p, cover }));
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    let next!: Data;
    if (
      await store.change((p) => {
        next = {
          ...p,
          albums: initial
            ? p.albums.map((a) =>
                a.id === initial.id
                  ? {
                      ...form,
                      title: form.title.trim(),
                      memoryIds: a.memoryIds,
                    }
                  : a,
              )
            : [...p.albums, { ...form, title: form.title.trim() }],
        };
        return next;
      })
    ) {
      clear();
      void pruneImages(initial ? [initial.cover] : [], next);
      onClose();
    }
  }
  return (
    <Dialog
      title={initial ? "编辑这本相册" : "新建一本相册"}
      onClose={onClose}
      className={s.dialog}
    >
      <form className={s.editor} onSubmit={submit}>
        <label>
          相册的名字
          <input
            required
            maxLength={40}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="给这段时光取个名字"
          />
        </label>
        <label>
          关于这段时光
          <textarea
            maxLength={300}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            placeholder="一起去了哪里，或是想留下的心情。"
          />
        </label>
        <label>封面</label>
        <div className={s.coverPreview}>
          <AssetImage src={form.cover} alt="相册封面预览" />
          <label className={s.uploadControl}>
            <ImagePlus size={16} />
            更换照片
            <input
              type="file"
              disabled={uploading}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
        </div>
        <div className={s.coverChoices}>
          {[
            "/assets/coast.png",
            "/assets/train.png",
            "/assets/morning.png",
            ...store.data.memories
              .flatMap((m) => m.photos)
              .filter((p) => p.startsWith("image:")),
          ]
            .filter((ref, i, refs) => refs.indexOf(ref) === i)
            .map((ref) => (
              <button
                key={ref}
                type="button"
                onClick={() => setForm((p) => ({ ...p, cover: ref }))}
                className={form.cover === ref ? s.selectedCover : ""}
                aria-label="使用这张封面"
                aria-pressed={form.cover === ref}
              >
                <AssetImage src={ref} alt="可选封面" />
                {form.cover === ref && <Check size={14} />}
              </button>
            ))}
        </div>
        {uploadError && (
          <p role="alert" className={s.formError}>
            {uploadError}
          </p>
        )}
        <StorageMessage error={store.error} saving={store.saving} />
        <div className={s.formActions}>
          <Action muted onClick={onClose}>
            稍后再写
          </Action>
          <Action
            type="submit"
            disabled={store.saving || uploading || !form.title.trim()}
          >
            {uploading ? "正在收好照片…" : "保存相册"}
          </Action>
        </div>
        <p className={s.draftHint}>关闭后，未保存的草稿会留在本机。</p>
      </form>
    </Dialog>
  );
}

function MemoryPage() {
  const { id } = useParams();
  const store = useAfterglow();
  const { data } = store;
  const memory = data.memories.find((m) => m.id === id);
  const [remove, setRemove] = useState(false);
  const navigate = useNavigate();
  if (!memory) return <Missing />;
  const book = data.albums.find((a) => a.id === memory.albumId);
  const list = book
    ? albumMemories(book, data)
    : [...data.memories].sort((a, b) => b.date.localeCompare(a.date));
  const index = list.findIndex((m) => m.id === memory.id);
  const previous = list[index - 1];
  const next = list[index + 1];
  async function deleteMemory() {
    if (!memory) return;
    let nextData!: Data;
    if (
      await store.change((p) => {
        nextData = {
          ...p,
          memories: p.memories.filter((m) => m.id !== memory.id),
          albums: p.albums.map((a) => ({
            ...a,
            memoryIds: a.memoryIds.filter((v) => v !== memory.id),
          })),
        };
        return nextData;
      })
    ) {
      void pruneImages(memory.photos, nextData);
      navigate(book ? "/afterglow/album/" + book.id : "/afterglow/archive");
    }
  }
  return (
    <article className={s.memoryPage}>
      <div className={s.albumToolbar}>
        <Back to={book ? `/afterglow/album/${book.id}` : "/afterglow/archive"}>
          {book?.title || "时间档案"}
        </Back>
        <div>
          <Link
            className={s.textButton}
            to={`/afterglow/memory/${memory.id}/edit`}
          >
            <Pencil size={14} />
            编辑回忆
          </Link>
          <button
            className={s.iconButton}
            onClick={() => setRemove(true)}
            aria-label="删除回忆"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className={s.memoryHero}>
        {memory.photos[0] ? (
          <AssetImage src={memory.photos[0]} alt={memory.title} />
        ) : (
          <div className={s.noPhoto}>这一刻，留在文字里。</div>
        )}
        <span>{fmt(memory.date, true)}</span>
      </div>
      <div className={s.memoryReading}>
        <div className={s.memoryTitle}>
          <small>{book?.title || "未归入相册"}</small>
          <h1>{memory.title}</h1>
          <span>
            {formatNumber(index + 1)} / {formatNumber(list.length)}
          </span>
        </div>
        <div className={s.memoryBody}>
          {memory.body || "这一刻，已经被好好记住。"}
        </div>
      </div>
      {memory.photos.length > 1 && (
        <div className={s.memoryPhotos}>
          {memory.photos.slice(1).map((photo, i) => (
            <figure key={photo + i}>
              <AssetImage
                src={photo}
                alt={`${memory.title}，第 ${i + 2} 张照片`}
              />
              <figcaption>
                {formatNumber(i + 2)} / {formatNumber(memory.photos.length)}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <div className={s.memoryPager}>
        {previous ? (
          <Link to={`/afterglow/memory/${previous.id}`}>
            <ChevronLeft size={18} />
            <div>
              <small>上一段回忆</small>
              <span>{previous.title}</span>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/afterglow/memory/${next.id}`}>
            <div>
              <small>下一段回忆</small>
              <span>{next.title}</span>
            </div>
            <ChevronRight size={18} />
          </Link>
        ) : (
          <Link
            to={book ? `/afterglow/album/${book.id}` : "/afterglow/archive"}
          >
            <div>
              <small>已经翻到最后一页</small>
              <span>回到{book ? "这本相册" : "时间档案"}</span>
            </div>
            <Album size={18} />
          </Link>
        )}
      </div>
      {remove && (
        <Dialog
          title="删除这段回忆？"
          onClose={() => setRemove(false)}
          className={s.dialog}
        >
          <p>
            「{memory.title}
            」的文字和照片会从档案中移除。其他回忆和相册封面仍会保留。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <Action muted onClick={() => setRemove(false)}>
              继续珍藏
            </Action>
            <Action disabled={store.saving} onClick={deleteMemory}>
              确认删除
            </Action>
          </div>
        </Dialog>
      )}
    </article>
  );
}
function MemoryEditorPage() {
  const { id } = useParams();
  const [query] = useSearchParams();
  const { data } = useAfterglow();
  const existing = data.memories.find((m) => m.id === id);
  if (id && !existing) return <Missing />;
  return (
    <MemoryEditor
      key={id || "new"}
      existing={existing}
      albumId={query.get("album")}
    />
  );
}
function MemoryEditor({
  existing,
  albumId,
}: {
  existing?: Memory;
  albumId: string | null;
}) {
  const store = useAfterglow();
  const { data } = store;
  const navigate = useNavigate();
  const [form, setForm, clear] = useDraft<Memory>(
    "afterglow:memory:" + (existing?.id || "new"),
    existing || {
      id: uid(),
      date: today(),
      title: "",
      body: "",
      photos: [],
      albumId: data.albums.some((a) => a.id === albumId) ? albumId : null,
    },
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  async function upload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setUploadError("");
    const refs: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, 12 - form.photos.length))
        refs.push(await saveImage(file, "afterglow"));
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      if (refs.length)
        setForm((p) => ({ ...p, photos: [...p.photos, ...refs] }));
      setUploading(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    let next!: Data;
    const value = {
      ...form,
      title: form.title.trim(),
      albumId: data.albums.some((a) => a.id === form.albumId)
        ? form.albumId
        : null,
    };
    if (
      await store.change((p) => {
        next = {
          ...p,
          memories: existing
            ? p.memories.map((m) => (m.id === existing.id ? value : m))
            : [...p.memories, value],
          albums: p.albums.map((a) => ({
            ...a,
            memoryIds:
              a.id === value.albumId
                ? a.memoryIds.includes(value.id)
                  ? a.memoryIds
                  : [...a.memoryIds, value.id]
                : a.memoryIds.filter((v) => v !== value.id),
          })),
        };
        return next;
      })
    ) {
      clear();
      void pruneImages(existing?.photos || [], next);
      navigate("/afterglow/memory/" + value.id);
    }
  }
  return (
    <>
      <Back to={existing ? `/afterglow/memory/${existing.id}` : "/afterglow"}>
        {existing ? "回到这段回忆" : "回到相册"}
      </Back>
      <Heading
        title={existing ? "再看一眼，那一天" : "留住这一刻"}
        note="照片会褪色，记得的细节不会。"
      />
      <form className={`${s.editor} ${s.memoryEditor}`} onSubmit={submit}>
        <div className={s.editorMain}>
          <label>
            回忆的名字
            <input
              required
              maxLength={70}
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="那天，你最想记住什么？"
              className={s.titleInput}
            />
          </label>
          <div className={s.editorRow}>
            <label>
              是哪一天
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </label>
            <label>
              放进哪本相册
              <select
                value={form.albumId || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, albumId: e.target.value || null }))
                }
              >
                <option value="">暂不归入相册</option>
                {data.albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            写下一点细节
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              rows={10}
              maxLength={20000}
              placeholder="那时的天气，说过的话，或是一个很小的瞬间…"
            />
          </label>
        </div>
        <div className={s.editorPhotos}>
          <div className={s.photoHeading}>
            <span>那天的照片</span>
            <small>{form.photos.length} / 12</small>
          </div>
          <div className={s.uploadGrid}>
            {form.photos.map((ref, i) => (
              <div key={ref + i} className={s.uploadThumb}>
                <AssetImage src={ref} alt={`待保存照片 ${i + 1}`} />
                <button
                  type="button"
                  aria-label={`移除第 ${i + 1} 张照片`}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      photos: p.photos.filter((_, n) => n !== i),
                    }))
                  }
                >
                  <X size={15} />
                </button>
                {i === 0 && <small>首图</small>}
                <div className={s.photoOrder}>
                  <button
                    type="button"
                    aria-label={`将第 ${i + 1} 张照片前移`}
                    disabled={i === 0}
                    onClick={() =>
                      setForm((p) => {
                        const photos = [...p.photos];
                        [photos[i - 1], photos[i]] = [photos[i], photos[i - 1]];
                        return { ...p, photos };
                      })
                    }
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label={`将第 ${i + 1} 张照片后移`}
                    disabled={i === form.photos.length - 1}
                    onClick={() =>
                      setForm((p) => {
                        const photos = [...p.photos];
                        [photos[i], photos[i + 1]] = [photos[i + 1], photos[i]];
                        return { ...p, photos };
                      })
                    }
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
            {form.photos.length < 12 && (
              <label className={s.photoUpload}>
                <ImagePlus size={27} />
                <span>{uploading ? "正在收好照片…" : "添加照片"}</span>
                <small>JPG / PNG / WebP / GIF</small>
                <input
                  type="file"
                  multiple
                  disabled={uploading}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    upload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          <p className={s.draftHint}>
            第一张照片将成为回忆首图。每张限 15 MB，最多 12 张。
          </p>
          {uploadError && (
            <p role="alert" className={s.formError}>
              {uploadError}
            </p>
          )}
        </div>
        <div className={s.editorSave}>
          <p>
            未保存的输入和照片会留在这台设备，
            <br />
            下次回来可以接着写。
          </p>
          <StorageMessage error={store.error} saving={store.saving} />
          <div className={s.formActions}>
            <Link
              to={existing ? `/afterglow/memory/${existing.id}` : "/afterglow"}
              className={s.outline}
            >
              稍后再写
            </Link>
            <Action
              type="submit"
              disabled={store.saving || uploading || !form.title.trim()}
            >
              收好这段回忆
            </Action>
          </div>
        </div>
      </form>
    </>
  );
}
function Chronology() {
  const { data } = useAfterglow();
  const [filter, setFilter] = useState("all");
  const sorted = [...data.memories]
    .filter(
      (m) =>
        filter === "all" ||
        (filter === "loose" ? !m.albumId : m.albumId === filter),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const groups = sorted.reduce<Record<string, Memory[]>>((all, m) => {
    const month = m.date.slice(0, 7);
    (all[month] ||= []).push(m);
    return all;
  }, {});
  return (
    <>
      <Heading title="时间，替我们收着" note="按日子，把过去慢慢翻开。">
        <label className={s.filter}>
          <span>筛选相册</span>
          <select
            aria-label="筛选相册"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">所有回忆</option>
            {data.albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
            <option value="loose">未归入相册</option>
          </select>
        </label>
      </Heading>
      <div className={s.chronology}>
        {Object.entries(groups).map(([month, memories]) => (
          <section className={s.monthGroup} key={month}>
            <div className={s.monthLabel}>
              <strong>
                {new Date(month + "-01T12:00:00").getMonth() + 1}
                <small>月</small>
              </strong>
              <span>{month.slice(0, 4)}</span>
              <p>{memories.length} 段回忆</p>
            </div>
            <div className={s.archiveItems}>
              {memories.map((m) => (
                <Link
                  to={`/afterglow/memory/${m.id}`}
                  key={m.id}
                  className={s.archiveItem}
                >
                  <span className={s.archiveDay}>{m.date.slice(-2)}</span>
                  <div className={s.archivePhoto}>
                    {m.photos[0] ? (
                      <AssetImage src={m.photos[0]} alt={m.title} />
                    ) : (
                      <Album size={30} />
                    )}
                  </div>
                  <div className={s.archiveText}>
                    <small>
                      {data.albums.find((a) => a.id === m.albumId)?.title ||
                        "未归入相册"}
                    </small>
                    <h2>{m.title}</h2>
                    <p>{m.body.split("\n")[0]}</p>
                  </div>
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      {!sorted.length && (
        <div className={s.empty}>
          <Archive />
          <h2>这一页还没有回忆。</h2>
          <Link to="/afterglow/memory/new">
            记下一段 <Plus size={16} />
          </Link>
        </div>
      )}
    </>
  );
}

function Letters() {
  const { data } = useAfterglow();
  const [tab, setTab] = useState("inbox");
  const letters = data.letters
    .filter((l) =>
      tab === "inbox"
        ? l.to === data.role && l.status === "sent"
        : tab === "sent"
          ? l.from === data.role && l.status !== "draft"
          : tab === "draft"
            ? l.from === data.role && l.status === "draft"
            : l.to === data.role && l.status === "archived",
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <Heading
        title="有些话，只写给你"
        note={`现在是${data.names[data.role]}的信箱`}
      >
        <Link className={s.textButton} to="/afterglow/letters/new">
          <Pencil size={16} />
          写一封信
        </Link>
      </Heading>
      <div className={s.letterLayout}>
        <aside className={s.letterAside}>
          <span className={s.letterDrawing}>
            <Mail size={75} strokeWidth={0.55} />
            <i />
          </span>
          <p>
            说不出口的，
            <br />
            写在这里。
            <br />
            想再说一次的，也可以。
          </p>
          <small>
            信件仅在本机双人演示中投递。
            <br />
            切换身份，可以看见彼此的来信。
          </small>
        </aside>
        <section className={s.letterInbox}>
          <div className={s.letterTabs}>
            {[
              { id: "inbox", name: "收到的信" },
              { id: "sent", name: "寄出的信" },
              { id: "draft", name: "草稿" },
              { id: "archive", name: "已收藏" },
            ].map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? s.activeTab : ""}
                onClick={() => setTab(t.id)}
              >
                {t.name}
                {t.id === "inbox" &&
                  data.letters.some(
                    (l) => l.to === data.role && l.status === "sent" && !l.read,
                  ) && <i />}
              </button>
            ))}
          </div>
          <div className={s.letterList}>
            {letters.map((l) => (
              <Link
                to={`/afterglow/letters/${l.id}`}
                key={l.id}
                className={s.letterRow}
              >
                <span className={s.letterSeal}>
                  {l.status === "draft" ? (
                    <Pencil size={19} strokeWidth={1} />
                  ) : (
                    "信"
                  )}
                </span>
                <div>
                  <small>
                    {l.status === "draft"
                      ? "未寄出 · "
                      : tab === "sent"
                        ? "写给 "
                        : "来自 "}
                    {
                      data.names[
                        tab === "sent" || l.status === "draft" ? l.to : l.from
                      ]
                    }
                    <span>{fmt(l.date)}</span>
                  </small>
                  <h2>
                    {l.title || "还没取名字的信"}
                    {!l.read && l.to === data.role && l.status === "sent" && (
                      <i />
                    )}
                  </h2>
                  <p>{l.body.replace(/\n/g, " ").slice(0, 48)}</p>
                </div>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
          {!letters.length && (
            <div className={s.empty}>
              <Mail size={26} />
              <h2>
                {tab === "inbox"
                  ? "还没有新的来信。"
                  : tab === "draft"
                    ? "没有没写完的话。"
                    : tab === "sent"
                      ? "第一封信，等你提笔。"
                      : "读过的心意，可以收在这里。"}
              </h2>
              <Link to="/afterglow/letters/new">
                写一封信 <Pencil size={15} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function LetterPage() {
  const { id } = useParams();
  const { data } = useAfterglow();
  const letter = data.letters.find((l) => l.id === id);
  if (id && !letter)
    return <Missing text="这封信已不在信箱里。" to="/afterglow/letters" />;
  if (
    letter &&
    letter.from !== data.role &&
    (letter.status === "draft" || letter.to !== data.role)
  )
    return <Missing text="这封草稿属于另一位。" to="/afterglow/letters" />;
  if (!letter || letter.status === "draft")
    return (
      <LetterEditor key={letter?.id || "new:" + data.role} initial={letter} />
    );
  return <LetterReading key={letter.id} letter={letter} />;
}
function LetterEditor({ initial }: { initial?: Letter }) {
  const store = useAfterglow();
  const { data } = store;
  const navigate = useNavigate();
  const [form, setForm, clear] = useDraft<Letter>(
    "afterglow:letter:" + (initial?.id || "new:" + data.role),
    initial || {
      id: uid(),
      from: data.role,
      to: data.role === 0 ? 1 : 0,
      title: "",
      body: "",
      status: "draft",
      read: false,
      date: today(),
    },
  );
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function save(deliver = false) {
    if (deliver && (!form.title.trim() || !form.body.trim())) return;
    const letter = {
      ...form,
      title: form.title.trim(),
      status: deliver ? ("sent" as const) : ("draft" as const),
      date: today(),
      read: false,
    };
    if (
      await store.change((p) => ({
        ...p,
        letters: p.letters.some((l) => l.id === form.id)
          ? p.letters.map((l) => (l.id === form.id ? letter : l))
          : [...p.letters, letter],
      }))
    ) {
      clear();
      navigate(
        deliver ? "/afterglow/letters/" + letter.id : "/afterglow/letters",
      );
    }
  }
  return (
    <>
      <Back to="/afterglow/letters">回到信箱</Back>
      <Heading
        title="把想说的话，慢慢写"
        note={`从${data.names[form.from]}，写给${data.names[form.to]}。`}
      />
      <form
        className={`${s.editor} ${s.letterEditor}`}
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
      >
        <div className={s.letterPaper}>
          <span className={s.paperAddress}>致 {data.names[form.to]}</span>
          <label>
            <span className={s.srOnly}>信的标题</span>
            <input
              value={form.title}
              maxLength={80}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="给这封信起一个名字"
              className={s.letterTitleInput}
            />
          </label>
          <label>
            <span className={s.srOnly}>信的正文</span>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              maxLength={30000}
              rows={12}
              placeholder="此刻，我想对你说…"
            />
          </label>
          <div className={s.paperSign}>
            <span>{data.names[form.from]}</span>
            <small>{fmt(today(), true)}</small>
          </div>
        </div>
        <StorageMessage error={store.error} saving={store.saving} />
        <div className={s.letterEditorActions}>
          <p>
            草稿只有写信的人能看见。
            <br />
            寄出后，文字会定格，无法再修改。
          </p>
          <div className={s.formActions}>
            <Action muted type="submit" disabled={store.saving}>
              保存草稿
            </Action>
            <Action
              disabled={store.saving || !form.title.trim() || !form.body.trim()}
              onClick={() => setSending(true)}
            >
              <Send size={15} />
              寄给{data.names[form.to]}
            </Action>
          </div>
        </div>
        {initial && (
          <button
            type="button"
            className={s.dangerButton}
            onClick={() => setDeleting(true)}
          >
            <Trash2 size={14} />
            删除这封草稿
          </button>
        )}
      </form>
      {sending && (
        <Dialog
          title={`把这封信交给${data.names[form.to]}？`}
          onClose={() => setSending(false)}
          className={s.dialog}
        >
          <p>
            「{form.title}
            」会进入对方在本机的收件箱。寄出后，信件文字不能再修改。此演示不会发送真实邮件。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <Action muted onClick={() => setSending(false)}>
              再读一遍
            </Action>
            <Action disabled={store.saving} onClick={() => save(true)}>
              确认寄出
            </Action>
          </div>
        </Dialog>
      )}
      {deleting && (
        <Dialog
          title="删除这封没寄出的信？"
          onClose={() => setDeleting(false)}
          className={s.dialog}
        >
          <p>草稿将被移除，之后无法找回。</p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <Action muted onClick={() => setDeleting(false)}>
              留下这封信
            </Action>
            <Action
              disabled={store.saving}
              onClick={async () => {
                if (
                  await store.change((p) => ({
                    ...p,
                    letters: p.letters.filter((l) => l.id !== initial?.id),
                  }))
                ) {
                  clear();
                  navigate("/afterglow/letters");
                }
              }}
            >
              确认删除草稿
            </Action>
          </div>
        </Dialog>
      )}
    </>
  );
}
function LetterReading({ letter }: { letter: Letter }) {
  const store = useAfterglow();
  const { data } = store;
  const navigate = useNavigate();
  const recipient = data.role === letter.to;
  return (
    <>
      <Back to="/afterglow/letters">回到信箱</Back>
      <div className={s.readingMeta}>
        <span>
          {data.names[letter.from]} 写给 {data.names[letter.to]}
        </span>
        <span>
          {!recipient
            ? "已寄出 · 文字已定格"
            : letter.status === "archived"
              ? "已收藏"
              : letter.read
                ? "已读"
                : "未读"}
        </span>
      </div>
      <article className={s.letterPaper}>
        <span className={s.paperAddress}>致 {data.names[letter.to]}</span>
        <h1>{letter.title}</h1>
        <div className={s.letterBody}>{letter.body}</div>
        <div className={s.paperSign}>
          <span>{data.names[letter.from]}</span>
          <small>{fmt(letter.date, true)}</small>
        </div>
      </article>
      <div className={s.letterReadActions}>
        {recipient && !letter.read && (
          <Action
            disabled={store.saving}
            muted
            onClick={() =>
              store.change((p) => ({
                ...p,
                letters: p.letters.map((l) =>
                  l.id === letter.id ? { ...l, read: true } : l,
                ),
              }))
            }
          >
            <Check size={15} />
            我读过了
          </Action>
        )}
        {recipient && (
          <Action
            muted
            disabled={store.saving}
            onClick={async () => {
              if (
                await store.change((p) => ({
                  ...p,
                  letters: p.letters.map((l) =>
                    l.id === letter.id
                      ? {
                          ...l,
                          status:
                            letter.status === "archived" ? "sent" : "archived",
                          read: true,
                        }
                      : l,
                  ),
                }))
              )
                navigate("/afterglow/letters");
            }}
          >
            <Archive size={15} />
            {letter.status === "archived" ? "放回收件箱" : "收藏这封信"}
          </Action>
        )}
        {recipient && (
          <Link to="/afterglow/letters/new" className={s.action}>
            <Pencil size={15} />
            写一封回信
          </Link>
        )}
        {!recipient && (
          <p>寄出的文字不能再修改。对方切换到自己的身份后，就能在本机读到。</p>
        )}
      </div>
    </>
  );
}
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const store = useAfterglow();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const { data } = store;
  return (
    <Dialog
      title={resetting ? "让余温重新开始？" : "谁在翻阅这段时光"}
      onClose={onClose}
      className={s.dialog}
    >
      {resetting ? (
        <>
          <p>
            余温中的相册、回忆、信件、上传照片和草稿会恢复为虚构示例。其他三个空间会继续保留。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.formActions}>
            <Action muted onClick={() => setResetting(false)}>
              保留这些时光
            </Action>
            <Action
              disabled={store.saving}
              onClick={async () => {
                if (await store.reset()) {
                  onClose();
                  navigate("/afterglow");
                }
              }}
            >
              确认重置余温
            </Action>
          </div>
        </>
      ) : (
        <>
          <div className={s.roleChoices}>
            {data.names.map((name, index) => (
              <button
                key={name}
                disabled={store.saving}
                className={data.role === index ? s.selectedRole : ""}
                onClick={async () => {
                  if (await store.change((p) => ({ ...p, role: index })))
                    onClose();
                }}
              >
                <span>{name.slice(0, 1)}</span>
                <strong>{name}</strong>
                {data.role === index ? (
                  <Check size={18} />
                ) : (
                  <ArrowRight size={17} />
                )}
              </button>
            ))}
          </div>
          <p>
            本机双人演示。相册由两个人共同整理，信件按当前身份区分收件与草稿。这里不会发送真实邮件，也没有远程同步。
          </p>
          <StorageMessage error={store.error} />
          <div className={s.settingsLinks}>
            <Link to="/" onClick={onClose}>
              <ArrowDownLeft size={16} />
              返回四个空间
            </Link>
            <button
              className={s.dangerButton}
              onClick={() => setResetting(true)}
            >
              重置余温演示数据
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
