import { lazy, Suspense, useEffect, useState } from "react";
import {
  HashRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Check,
  ChevronDown,
  Heart,
  Mail,
  Moon,
  Orbit,
  Pause,
  Play,
  Plus,
  Sparkles,
  Star,
  Telescope,
  CalendarDays,
  Camera,
  Dices,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { UniverseProvider, useUniverse } from "./data/context";
import Starfield from "./Starfield";
import { Avatar, Button } from "./shared/components";
import { Dialog, StorageMessage } from "./shared/ui";
const Home = lazy(() => import("./pages/Home"));
const Daily = lazy(() => import("./pages/Daily"));
const Memories = lazy(() => import("./pages/Memories"));
const Letters = lazy(() => import("./pages/Letters"));
const Games = lazy(() => import("./pages/Games"));
const Profile = lazy(() => import("./pages/Profile"));
const links = [
  { to: "/", name: "小宇宙", Icon: Orbit, end: true },
  { to: "/today", name: "日常", Icon: CalendarDays },
  { to: "/memories", name: "回忆", Icon: Camera },
  { to: "/wishes", name: "心愿", Icon: Star },
  { to: "/play", name: "一起玩", Icon: Dices },
];
function Shell() {
  const { data, ready, saving, error, change, toast } = useUniverse();
  const location = useLocation(),
    navigate = useNavigate();
  const [roles, setRoles] = useState(false);
  const [motion, setMotion] = useState(() => {
    try {
      return localStorage.getItem("universe-motion") !== "off";
    } catch {
      return true;
    }
  });
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const activeMotion = motion && !reduced;
  const focused = location.pathname === "/play/quiz" && !!data.round;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = activeMotion ? "on" : "off";
  }, [activeMotion]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title =
      location.pathname === "/"
        ? "我们的小宇宙"
        : location.pathname.startsWith("/play")
          ? "一起玩 · 小宇宙"
          : location.pathname.startsWith("/letters")
            ? "时光邮局 · 小宇宙"
            : location.pathname.startsWith("/memories") ||
                location.pathname.startsWith("/albums")
              ? "回忆星轨 · 小宇宙"
              : "我们的日常 · 小宇宙";
    const frame = requestAnimationFrame(() =>
      document.getElementById("main")?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);
  function nav(activePath: string) {
    return links.map(({ to, name, Icon, end }) => (
      <NavLink
        key={to}
        end={end}
        to={to}
        className={({ isActive }) =>
          isActive ||
          (to === "/today" && /calendar|events/.test(activePath)) ||
          (to === "/memories" && activePath.startsWith("/albums"))
            ? "active"
            : ""
        }
      >
        <Icon size={18} />
        <span>{name}</span>
      </NavLink>
    ));
  }
  const unread = data.letters.filter(
    (l) => l.to === data.role && l.status === "sent" && !l.read,
  ).length;
  return (
    <div className={`app ${focused ? "focused" : ""}`}>
      <a
        className="skipLink"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        跳到主要内容
      </a>
      <Starfield enabled={activeMotion} />
      <header className="siteHeader">
        <Link to="/" className="brand">
          <span className="brandMark">
            <Sparkles size={25} />
          </span>
          <span>
            我们的小宇宙<small>让每个瞬间，成为星光</small>
          </span>
        </Link>
        <nav className="desktopNav" aria-label="主要导航">
          {nav(location.pathname)}
        </nav>
        <div className="headerActions">
          <button
            className="iconButton motionButton"
            disabled={reduced}
            aria-label={
              reduced
                ? "已遵循系统减少动态效果"
                : activeMotion
                  ? "暂停动态效果"
                  : "开启动起来的星空"
            }
            aria-pressed={activeMotion}
            onClick={() => {
              setMotion((v) => {
                try {
                  localStorage.setItem("universe-motion", v ? "off" : "on");
                } catch {}
                return !v;
              });
            }}
          >
            {activeMotion ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <Link
            className="iconButton mailIcon"
            to="/letters"
            aria-label={`时光邮局，${unread} 封未读来信`}
          >
            <Mail size={20} />
            {unread > 0 && <i />}
          </Link>
          <button
            className="identityButton"
            aria-label="切换身份或查看资料"
            onClick={() => setRoles(true)}
          >
            <Avatar person={data.people[data.role]} size="small" />
            <span>{data.people[data.role].name}</span>
            <ChevronDown size={13} />
          </button>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className={`siteMain ${location.pathname === "/" ? "homeMain" : ""}`}
      >
        <StorageMessage error={error} />
        {ready ? (
          <Suspense
            fallback={
              <div className="loading">
                <Orbit />
                正在点亮这片星空…
              </div>
            }
          >
            <Routes>
              <Route index element={<Home />} />
              <Route path="today" element={<Daily page="today" />} />
              <Route path="calendar" element={<Daily page="calendar" />} />
              <Route path="events/new" element={<Daily page="event" />} />
              <Route path="events/:id" element={<Daily page="event" />} />
              <Route
                path="events/:id/complete"
                element={<Daily page="complete" />}
              />
              <Route path="wishes" element={<Daily page="wishes" />} />
              <Route path="wishes/new" element={<Daily page="wish" />} />
              <Route path="wishes/:id" element={<Daily page="wish" />} />
              <Route path="memories/*" element={<Memories />} />
              <Route path="albums/:id" element={<Memories album />} />
              <Route path="letters/*" element={<Letters />} />
              <Route path="play/*" element={<Games />} />
              <Route path="us" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        ) : (
          <div className="loading">
            <Orbit />
            正在点亮这片星空…
          </div>
        )}
      </main>
      <footer className="siteFooter">
        <Link to="/" className="footerSignature">
          <Sparkles size={17} />
          每颗星星，都有我们的故事。
        </Link>
        <p>虚构人物与故事 · 内容保存在当前浏览器</p>
        {import.meta.env.BASE_URL !== "/" && <a href="../">返回版本首页</a>}
        <Link to="/us">
          这个宇宙里的我们 <ArrowUpRight size={14} />
        </Link>
      </footer>
      <nav className="mobileNav" aria-label="手机导航">
        {nav(location.pathname)}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {roles && (
        <Dialog title="此刻，是谁在看星星？" onClose={() => setRoles(false)}>
          <div className="roleChoices">
            {data.people.map((p, i) => (
              <button
                key={i}
                className={i === data.role ? "selected" : ""}
                disabled={saving}
                onClick={async () => {
                  if (await change((v) => ({ ...v, role: i }))) setRoles(false);
                }}
              >
                <Avatar person={p} />
                <strong>{p.name}</strong>
                {i === data.role ? (
                  <Check size={18} />
                ) : (
                  <ArrowUpRight size={18} />
                )}
              </button>
            ))}
          </div>
          <p className="hint">
            切换本机身份，可以为自己留下心情、打开来信，轮流完成双人游戏。
          </p>
          <Link className="textLink" to="/us" onClick={() => setRoles(false)}>
            <Settings size={16} />
            名字、头像与纪念日期
          </Link>
          {import.meta.env.BASE_URL !== "/" && <a className="textLink" href="../">返回版本首页 <ArrowUpRight size={14}/></a>}
        </Dialog>
      )}
    </div>
  );
}
export default function App() {
  return (
    <HashRouter>
      <UniverseProvider>
        <Shell />
      </UniverseProvider>
    </HashRouter>
  );
}
