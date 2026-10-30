import React, { Suspense, lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Infinity,
  Flower2,
  Sparkles,
  Home,
  CalendarDays,
  MessageCircle,
  Camera,
  Play,
} from "lucide-react";
import "./fonts.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "./global.css";
import s from "./Selector.module.css";
import { AssetImage } from "./shared/ui";

const Together = lazy(() => import("./together/Together"));
const Afterglow = lazy(() => import("./afterglow/Afterglow"));
const House = lazy(() => import("./house/House"));
const Arcade = lazy(() => import("./arcade/Arcade"));

function LocationEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    const product = pathname.split("/")[1];
    document.title =
      (
        {
          together: "同频 · 把日子过在一起",
          afterglow: "余温 · 两个人的私人影像档案",
          house: "小屋 · 慢慢回家",
          arcade: "心动游乐场 · 今天一起玩什么",
        } as Record<string, string>
      )[product] || "两个人的空间 · 四种独立设计";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
function Selector() {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <Link to="/" className={s.logo}>
          <span className={s.logoCircles} />
          <span>两个人的空间</span>
        </Link>
        <span className={s.edition}>{import.meta.env.BASE_URL !== "/" ? <a href="../">返回版本首页 ↗</a> : "四种生活提案 / 2026"}</span>
      </header>
      <main className={s.main}>
        <div className={s.intro}>
          <div>
            <p className={s.smallIntro}>给亲密关系，留一个地方。</p>
            <h1>
              想和你，
              <br className={s.mobileBreak} />
              待在这里。
            </h1>
          </div>
          <p className={s.introText}>
            从一起过日子，到一起创造回忆。
            <br />
            四个完整的小世界，选一个进去走走。
          </p>
        </div>
        <div className={s.spaces}>
          <Link className={`${s.space} ${s.together}`} to="/together">
            <div className={s.preview}>
              <div className={s.togetherMini}>
                <div className={s.miniBrand}>
                  <Infinity size={18} />
                  同频
                </div>
                <p>今天，也在一起</p>
                <div className={s.miniPeople}>
                  <span>
                    <SunAvatar />
                    阿澄
                  </span>
                  <Heart size={18} />
                  <span>
                    <Flower2 />
                    小满
                  </span>
                </div>
                <div className={s.miniNote}>
                  下班绕一点路吧，
                  <br />
                  去买刚出炉的栗子蛋糕。
                </div>
                <div className={s.miniEvent}>
                  <CalendarDays size={19} />
                  <span>
                    19:00
                    <br />
                    <strong>一起做一顿晚饭</strong>
                  </span>
                </div>
                <div className={s.miniNav}>
                  <Heart />
                  <CalendarDays />
                  <MessageCircle />
                </div>
              </div>
              <span className={s.previewCorner}>日常，有你</span>
            </div>
            <div className={s.cardTitle}>
              <h2>同频</h2>
              <ArrowUpRight />
            </div>
            <p className={s.description}>把两个人的日常，轻轻放在一起。</p>
            <div className={s.tags}>
              <span>日历</span>
              <span>心情</span>
              <span>共同愿望</span>
            </div>
          </Link>
          <Link className={`${s.space} ${s.afterglow}`} to="/afterglow">
            <div className={s.preview}>
              <AssetImage src="/assets/coast.png" alt="两个人走在海边的虚构摄影" />
              <div className={s.photoShade} />
              <span className={s.photoTitle}>
                余温<small>那些不想忘记的。</small>
              </span>
              <div className={s.filmLabel}>
                <Camera size={13} />
                我们的夏天
              </div>
            </div>
            <div className={s.cardTitle}>
              <h2>余温</h2>
              <ArrowUpRight />
            </div>
            <p className={s.description}>为散落的照片和心事，留一个位置。</p>
            <div className={s.tags}>
              <span>相簿</span>
              <span>书信</span>
              <span>时间档案</span>
            </div>
          </Link>
          <Link className={`${s.space} ${s.house}`} to="/house">
            <div className={s.preview}>
              <span className={s.houseCaption}>
                有你在的地方
                <br />
                就是家。
              </span>
              <AssetImage src="/assets/room.png" alt="温暖绘本风格的双人小屋" />
              <span className={s.houseKey}>
                <Home size={15} />
                欢迎回家
              </span>
            </div>
            <div className={s.cardTitle}>
              <h2>小屋</h2>
              <ArrowUpRight />
            </div>
            <p className={s.description}>留句话、浇点水，把小家慢慢养大。</p>
            <div className={s.tags}>
              <span>共同布置</span>
              <span>植物</span>
              <span>冰箱留言</span>
            </div>
          </Link>
          <Link className={`${s.space} ${s.arcade}`} to="/arcade">
            <div className={s.preview}>
              <span className={s.arcadeStar}>
                <Sparkles size={36} />
              </span>
              <div className={s.miniMachine}>
                <span className={s.machineHeader}>
                  今天一起
                  <br />
                  玩什么？
                </span>
                <div className={s.machineScreen}>
                  <Heart fill="currentColor" />
                  <span>你 + 我</span>
                </div>
                <span className={s.machineButton}>
                  <Play size={15} fill="currentColor" />
                  开始心动
                </span>
                <i />
                <i />
              </div>
              <span className={s.arcadeStamp}>双人限定</span>
            </div>
            <div className={s.cardTitle}>
              <h2>心动游乐场</h2>
              <ArrowUpRight />
            </div>
            <p className={s.description}>答案可以不同，好玩的事一起做。</p>
            <div className={s.tags}>
              <span>默契问答</span>
              <span>约会抽签</span>
              <span>收藏票根</span>
            </div>
          </Link>
        </div>
        <div className={s.demoNote}>
          <span className={s.noteDot} />
          <p>
            这是四套独立的交互原型。人物与故事为虚构示例，图片由 AI 创作。
            <br />
            新增内容保存在当前浏览器，可以切换角色体验两个人的流程。
          </p>
          <span className={s.local}>
            无需登录
            <br />
            随时回来
          </span>
        </div>
      </main>
      <footer className={s.footer}>
        <span>不同的模样，同样是我们。</span>
        <span>Made for two.</span>
      </footer>
    </div>
  );
}
function SunAvatar() {
  return <span className={s.sunAvatar}>澄</span>;
}
function App() {
  return (
    <HashRouter>
      <LocationEffects />
      <Suspense
        fallback={
          <div className="appLoading">
            <span className="loadingDot" />
            正在打开这个小世界…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Selector />} />
          <Route path="/together/*" element={<Together />} />
          <Route path="/afterglow/*" element={<Afterglow />} />
          <Route path="/house/*" element={<House />} />
          <Route path="/arcade/*" element={<Arcade />} />
          <Route path="*" element={<Selector />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
