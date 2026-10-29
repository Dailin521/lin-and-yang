import { useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Camera,
  Check,
  FolderPlus,
  ImagePlus,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";
import { useUniverse } from "../data/context";
import { dateText, type Album, type Memory } from "../data/model";
import { collectUnusedImages, today, uid, useDraft } from "../shared/store";
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
  PhotoInput,
} from "../shared/components";
import { AssetImage, Dialog } from "../shared/ui";
function MemoryTabs() {
  return (
    <nav className="tabs" aria-label="回忆页面">
      <NavLink end to="/memories">
        所有星光
      </NavLink>
      <NavLink to="/memories/albums">我们的相簿</NavLink>
      <NavLink to="/memories/archive">时间档案</NavLink>
    </nav>
  );
}
function MemoryTile({ memory }: { memory: Memory }) {
  return (
    <Link className="memoryTile" to={`/memories/${memory.id}`}>
      <div className="previewImage">
        {memory.photos[0] ? (
          <AssetImage src={memory.photos[0]} alt={memory.title} />
        ) : (
          <Camera size={40} />
        )}
        <span>
          <ArrowUpRight size={19} />
        </span>
      </div>
      <div className="previewCopy">
        <small>
          {dateText(memory.date, true)} · {memory.photos.length} 张照片
        </small>
        <h3>{memory.title}</h3>
        <p>{memory.body.split("\n")[0]}</p>
      </div>
    </Link>
  );
}
function AlbumEditor({
  album,
  onClose,
}: {
  album?: Album;
  onClose: () => void;
}) {
  const { data, change, saving, notify } = useUniverse();
  const [busy, setBusy] = useState(false);
  const [draft, setDraft, clear] = useDraft(
    `universe:album:${album?.id || "new"}`,
    {
      title: album?.title || "",
      description: album?.description || "",
      cover: album?.cover || "/assets/coast.png",
    },
  );
  const options = [
    ...new Set([
      "/assets/coast.png",
      "/assets/train.png",
      "/assets/morning.png",
      ...data.memories.flatMap((m) => m.photos),
    ]),
  ];
  return (
    <Dialog title={album ? "整理这本相簿" : "给回忆一个去处"} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await change((v) => ({
              ...v,
              albums: album
                ? v.albums.map((a) =>
                    a.id === album.id
                      ? { ...a, ...draft, title: draft.title.trim() }
                      : a,
                  )
                : [
                    ...v.albums,
                    {
                      id: uid(),
                      ...draft,
                      title: draft.title.trim(),
                      memoryIds: [],
                    },
                  ],
            }))
          ) {
            clear();
            onClose();
            notify("相簿已经收好。");
          }
        }}
      >
        <label className="field">
          相簿名字
          <input
            required
            maxLength={60}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="给这一段时光，起个名字"
          />
        </label>
        <label className="field">
          写在扉页
          <textarea
            maxLength={600}
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="为什么想收好这些瞬间……"
          />
        </label>
        <div className="field">
          <span>选择封面</span>
          <div className="coverChoices">
            {options.map((photo) => (
              <button
                key={photo}
                type="button"
                aria-label={`选择封面 ${options.indexOf(photo) + 1}`}
                aria-pressed={draft.cover === photo}
                className={draft.cover === photo ? "selected" : ""}
                onClick={() => setDraft({ ...draft, cover: photo })}
              >
                <AssetImage src={photo} alt="相簿封面候选" />
                {draft.cover === photo && <Check size={17} />}
              </button>
            ))}
          </div>
          <span className="subtle">也可以上传一张新的封面</span>
          <PhotoInput
            photos={draft.cover.startsWith("image:") ? [draft.cover] : []}
            max={1}
            onBusy={setBusy}
            onChange={(photos) =>
              setDraft((v) => ({
                ...v,
                cover: photos[0] || "/assets/coast.png",
              }))
            }
          />
        </div>
        <div className="formActions">
          <Button type="submit" disabled={saving || busy}>
            保存相簿
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
function Gallery({ view = "all" }: { view?: string }) {
  const { data } = useUniverse();
  const [adding, setAdding] = useState(false);
  const memories = [...data.memories].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  return (
    <div className="page">
      <PageTitle title="回忆星轨" description="有些瞬间，不想让时间带走。">
        <Link className="button" to="/memories/new">
          <Plus size={17} />
          记录这一刻
        </Link>
        {view === "albums" && (
          <Button secondary onClick={() => setAdding(true)}>
            <FolderPlus size={17} />
            新相簿
          </Button>
        )}
      </PageTitle>
      <MemoryTabs />
      {view === "albums" ? (
        <>
          <div className="albumGrid">
            {data.albums.map((a) => (
              <article key={a.id}>
                <Link className="albumCover" to={`/albums/${a.id}`}>
                  <AssetImage src={a.cover} alt={a.title} />
                  <span>
                    <strong>{a.title}</strong>
                    <small>
                      {data.memories.filter((m) => m.albumId === a.id).length}{" "}
                      段回忆
                    </small>
                  </span>
                </Link>
                <p className="albumDescription">{a.description}</p>
              </article>
            ))}
          </div>
          <section style={{ marginTop: 48 }}>
            <div className="sectionHeading">
              <h2>还没放进相簿的星光</h2>
            </div>
            {data.memories.some((m) => !m.albumId) ? (
              <div className="photoMasonry" style={{ marginTop: 25 }}>
                {memories
                  .filter((m) => !m.albumId)
                  .map((m) => (
                    <MemoryTile key={m.id} memory={m} />
                  ))}
              </div>
            ) : (
              <p className="subtle" style={{ marginTop: 20 }}>
                每一段回忆，都有自己的去处。
              </p>
            )}
          </section>
        </>
      ) : !memories.length ? (
        <Empty
          title="第一束星光，从这里开始"
          action={
            <Link className="button" to="/memories/new">
              <Plus size={16} />
              留下一段回忆
            </Link>
          }
        >
          一张照片，一句想记住的话，都可以。
        </Empty>
      ) : view === "archive" ? (
        <div className="timeline">
          {memories.map((m) => (
            <article className="timelineItem" key={m.id}>
              <time>{dateText(m.date, true)}</time>
              <Link to={`/memories/${m.id}`}>
                {m.photos[0] && <AssetImage src={m.photos[0]} alt={m.title} />}
                <h2>{m.title}</h2>
                <p>
                  {m.body.slice(0, 100)}
                  {m.body.length > 100 ? "…" : ""}
                </p>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="photoMasonry">
          {memories.map((m) => (
            <MemoryTile key={m.id} memory={m} />
          ))}
        </div>
      )}
      {adding && <AlbumEditor onClose={() => setAdding(false)} />}
    </div>
  );
}
function AlbumDetail() {
  const { id } = useParams();
  const { data, change, saving, notify } = useUniverse();
  const navigate = useNavigate();
  const album = data.albums.find((a) => a.id === id);
  const [editing, setEditing] = useState(false),
    [confirm, setConfirm] = useState(false);
  if (!album) return <Missing to="/memories/albums" />;
  const unordered = data.memories.filter((m) => m.albumId === id);
  const memories = [...unordered].sort((a, b) => {
    const ai = album.memoryIds.indexOf(a.id),
      bi = album.memoryIds.indexOf(b.id);
    return (ai < 0 ? 9999 : ai) - (bi < 0 ? 9999 : bi);
  });
  async function move(mid: string, offset: number) {
    const ids = memories.map((m) => m.id);
    const i = ids.indexOf(mid);
    [ids[i], ids[i + offset]] = [ids[i + offset], ids[i]];
    if (
      await change((v) => ({
        ...v,
        albums: v.albums.map((a) =>
          a.id === id ? { ...a, memoryIds: ids } : a,
        ),
      }))
    )
      notify("回忆的顺序已经调整。");
  }
  return (
    <div className="page">
      <Back to="/memories/albums">回到我们的相簿</Back>
      <div className="albumHero">
        <AssetImage src={album.cover} alt={album.title} />
        <div>
          <Chip>{memories.length} 段回忆 · 属于我们的一册</Chip>
          <h1 style={{ marginTop: 18 }}>{album.title}</h1>
          <p>{album.description}</p>
          <div className="row">
            <Link className="button" to={`/memories/new?album=${id}`}>
              <Plus size={16} />
              添一段回忆
            </Link>
            <Button secondary onClick={() => setEditing(true)}>
              <Settings size={16} />
              整理相簿
            </Button>
          </div>
        </div>
      </div>
      {memories.length ? (
        <div className="memoryPreviewGrid">
          {memories.map((m, i) => (
            <div key={m.id}>
              <MemoryTile memory={m} />
              <div className="reorderRow">
                <span className="subtle" style={{ marginRight: "auto" }}>
                  第 {i + 1} 段回忆
                </span>
                <button
                  className="iconButton"
                  disabled={saving || i === 0}
                  aria-label={`${m.title} 前移`}
                  onClick={() => void move(m.id, -1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  className="iconButton"
                  disabled={saving || i === memories.length - 1}
                  aria-label={`${m.title} 后移`}
                  onClick={() => void move(m.id, 1)}
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="这一册，等一个开始"
          action={
            <Link className="button secondary" to={`/memories/new?album=${id}`}>
              添加第一段回忆
            </Link>
          }
        >
          把属于它的瞬间，慢慢放进来。
        </Empty>
      )}
      <div className="dangerZone">
        <DeleteButton onClick={() => setConfirm(true)}>删除相簿</DeleteButton>
        <p>删除相簿时，其中的回忆会移到未分类，照片和文字都会保留。</p>
      </div>
      {editing && (
        <AlbumEditor album={album} onClose={() => setEditing(false)} />
      )}{" "}
      {confirm && (
        <Confirm
          title="取下这本相簿？"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (
              await change((v) => ({
                ...v,
                albums: v.albums.filter((a) => a.id !== id),
                memories: v.memories.map((m) =>
                  m.albumId === id ? { ...m, albumId: null } : m,
                ),
              }))
            ) {
              notify("相簿已移除，回忆已放入未分类。");
              navigate("/memories/albums");
            }
          }}
        >
          这本相簿里的 {memories.length} 段回忆会移到未分类，内容不会删除。
        </Confirm>
      )}
    </div>
  );
}
function MemoryEditor() {
  const { id } = useParams();
  const { data, change, saving, notify } = useUniverse();
  const current = data.memories.find((m) => m.id === id);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [draft, setDraft, clear] = useDraft(`universe:memory:${id || "new"}`, {
    title: current?.title || "",
    date: current?.date || today(),
    body: current?.body || "",
    photos: current?.photos || ([] as string[]),
    albumId:
      current?.albumId ||
      new URLSearchParams(location.hash.split("?")[1]).get("album") ||
      "",
  });
  if (id && !current) return <Missing to="/memories" />;
  return (
    <div className="page">
      <Back to={id ? "/memories/" + id : "/memories"}>
        {id ? "回到这段回忆" : "回到回忆星轨"}
      </Back>
      <PageTitle
        title={current ? "再补上一点，这一天的细节" : "点亮一个属于我们的瞬间"}
        description="照片和文字，会让这一刻停留得久一点。"
      />
      <form
        className="form wide panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const mid = id || uid();
          if (
            await change((v) => {
              const albumId = v.albums.some((a) => a.id === draft.albumId)
                ? draft.albumId
                : null;
              const memory = {
                ...draft,
                title: draft.title.trim(),
                albumId,
                id: mid,
                author: current?.author ?? v.role,
                eventId: current?.eventId,
              };
              return {
                ...v,
                memories: current
                  ? v.memories.map((m) => (m.id === id ? memory : m))
                  : [...v.memories, memory],
                albums: v.albums.map((a) => ({
                  ...a,
                  memoryIds:
                    albumId === a.id
                      ? a.memoryIds.includes(mid)
                        ? a.memoryIds
                        : [...a.memoryIds, mid]
                      : a.memoryIds.filter((x) => x !== mid),
                })),
              };
            })
          ) {
            clear();
            notify("这段回忆，已经亮起来了。");
            navigate("/memories/" + mid);
          }
        }}
      >
        <div className="field">
          <span>这一刻的照片</span>
          <PhotoInput
            photos={draft.photos}
            onChange={(photos) => setDraft((v) => ({ ...v, photos }))}
            onBusy={setBusy}
          />
          <small>支持调整照片顺序。第一张会成为这段回忆的首图。</small>
        </div>
        <label className="field">
          给这一刻起个名字
          <input
            required
            maxLength={90}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="比如，风停在你的肩上"
          />
        </label>
        <div className="formGrid">
          <label className="field">
            那一天
            <input
              required
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </label>
          <label className="field">
            收进相簿
            <select
              value={
                data.albums.some((a) => a.id === draft.albumId)
                  ? draft.albumId
                  : ""
              }
              onChange={(e) => setDraft({ ...draft, albumId: e.target.value })}
            >
              <option value="">暂时不分类</option>
              {data.albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          还记得……
          <textarea
            rows={8}
            maxLength={12000}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder="记得那天的光，记得你说的话，记得不想忘记的小事。"
          />
        </label>
        <div className="formActions">
          <Button type="submit" disabled={saving || busy}>
            <Sparkles size={17} />
            {busy ? "正在收好照片…" : "把这一刻收好"}
          </Button>
        </div>
        <p className="formHint">离开时保留草稿，照片仅保存在当前浏览器。</p>
      </form>
    </div>
  );
}
function MemoryDetail() {
  const { id } = useParams();
  const { data, change, notify } = useUniverse();
  const navigate = useNavigate();
  const memory = data.memories.find((m) => m.id === id);
  const [confirm, setConfirm] = useState(false),
    [photo, setPhoto] = useState<string | null>(null);
  if (!memory) return <Missing to="/memories" />;
  const album = data.albums.find((a) => a.id === memory.albumId);
  const sorted = [...data.memories].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const at = sorted.findIndex((m) => m.id === id);
  return (
    <div className="page">
      <Back to={album ? "/albums/" + album.id : "/memories"}>
        {album ? "回到" + album.title : "回到回忆星轨"}
      </Back>
      <article className="memoryArticle">
        <header className="memoryTitle">
          <small>
            {dateText(memory.date, true)}
            {album ? " · " + album.title : ""}
          </small>
          <h1>{memory.title}</h1>
          <div className="row between">
            <div className="memoryByline">
              <Avatar person={data.people[memory.author]} size="small" />
              {data.people[memory.author].name} 留下的星光
            </div>
            <Link className="textLink" to={`/memories/${id}/edit`}>
              编辑回忆 <ArrowUpRight size={15} />
            </Link>
          </div>
        </header>
        {memory.photos[0] && (
          <button
            className="photoZoom"
            aria-label="放大首张照片"
            onClick={() => setPhoto(memory.photos[0])}
          >
            <AssetImage
              className="memoryHeroPhoto"
              src={memory.photos[0]}
              alt={memory.title}
            />
          </button>
        )}
        <div className="memoryBody">
          <p className="bodyText">
            {memory.body || "有时候，一张照片就已经说了很多。"}
          </p>
          {memory.eventId &&
            data.events.some((e) => e.id === memory.eventId) && (
              <Link
                className="textLink"
                style={{ marginTop: 20 }}
                to={`/events/${memory.eventId}`}
              >
                来自一次共同约定 <ArrowRight size={16} />
              </Link>
            )}
        </div>
        {memory.photos.length > 1 && (
          <div className="memoryPhotos">
            {memory.photos.slice(1).map((src, i) => (
              <button
                key={src + i}
                onClick={() => setPhoto(src)}
                aria-label={`放大第 ${i + 2} 张照片`}
              >
                <AssetImage src={src} alt={`${memory.title} · ${i + 2}`} />
              </button>
            ))}
          </div>
        )}
        <nav className="memoryNav" aria-label="连续回看">
          {at > 0 ? (
            <Link className="textLink" to={"/memories/" + sorted[at - 1].id}>
              <ArrowLeft size={16} />
              更新的星光
            </Link>
          ) : (
            <span />
          )}
          {at < sorted.length - 1 ? (
            <Link className="textLink" to={"/memories/" + sorted[at + 1].id}>
              往前再翻一页 <ArrowRight size={16} />
            </Link>
          ) : (
            <Link className="textLink" to="/memories/archive">
              回到时间档案 <ArrowRight size={16} />
            </Link>
          )}
        </nav>
        <div className="dangerZone">
          <DeleteButton onClick={() => setConfirm(true)}>
            删除这段回忆
          </DeleteButton>
        </div>
      </article>
      {photo && (
        <Dialog
          title={memory.title}
          className="lightbox"
          onClose={() => setPhoto(null)}
        >
          <AssetImage src={photo} alt={memory.title} />
        </Dialog>
      )}
      {confirm && (
        <Confirm
          title="让这段回忆离开星轨？"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (
              await change((v) => ({
                ...v,
                memories: v.memories.filter((m) => m.id !== id),
                albums: v.albums.map((a) => ({
                  ...a,
                  memoryIds: a.memoryIds.filter((mid) => mid !== id),
                })),
                events: v.events.map((e) => ({
                  ...e,
                  memoryIds: e.memoryIds.filter((mid) => mid !== id),
                })),
              }))
            ) {
              localStorage.removeItem("draft:universe:memory:" + id);
              notify("回忆已删除，已收藏的票根快照仍保留。");
              navigate("/memories");
              void collectUnusedImages("universe");
            }
          }}
        >
          这段文字与照片会从回忆中移除。如果已经生成票根，票根上的完成记录仍然保留。
        </Confirm>
      )}
    </div>
  );
}
export default function Memories({ album = false }: { album?: boolean }) {
  return album ? (
    <AlbumDetail />
  ) : (
    <Routes>
      <Route index element={<Gallery />} />
      <Route path="albums" element={<Gallery view="albums" />} />
      <Route path="archive" element={<Gallery view="archive" />} />
      <Route path="new" element={<MemoryEditor key="new" />} />
      <Route path=":id/edit" element={<EditorWrapper />} />
      <Route path=":id" element={<DetailWrapper />} />
      <Route path="*" element={<Missing to="/memories" />} />
    </Routes>
  );
}
function EditorWrapper() {
  const { id } = useParams();
  return <MemoryEditor key={id} />;
}
function DetailWrapper() {
  const { id } = useParams();
  return <MemoryDetail key={id} />;
}
