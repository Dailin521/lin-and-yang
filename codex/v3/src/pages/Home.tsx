import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Dices,
  Heart,
  Mail,
  Orbit,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { useUniverse } from "../data/context";
import { dateText, sortedEvents } from "../data/model";
import { today } from "../shared/store";
import { Avatar, MoodIcon } from "../shared/components";
import { AssetImage } from "../shared/ui";
function Count({ value }: { value: number }) {
  const [v, setV] = useState(value);
  useEffect(() => {
    if (document.documentElement.dataset.motion === "off") return;
    let frame = 0,
      start = performance.now();
    function tick(t: number) {
      const p = Math.min(1, (t - start) / 950);
      setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{v}</>;
}
const planets = [
  {
    to: "/memories",
    title: "回忆星轨",
    text: "把珍贵的瞬间，收成一片星空",
    Icon: Camera,
    tone: "cyan",
  },
  {
    to: "/wishes",
    title: "心愿星球",
    text: "下一次，想和你一起做的事",
    Icon: Star,
    tone: "pink",
  },
  {
    to: "/today",
    title: "日常电台",
    text: "今天的心情，说给你听",
    Icon: CalendarDays,
    tone: "purple",
  },
  {
    to: "/letters",
    title: "时光邮局",
    text: "有些话，想慢慢写给你",
    Icon: Mail,
    tone: "gold",
  },
  {
    to: "/play",
    title: "双人游乐场",
    text: "一起玩，认识另一个你",
    Icon: Dices,
    tone: "blue",
  },
];
export default function Home() {
  const { data } = useUniverse();
  const heroScene = useRef<HTMLDivElement>(null);
  const planetSection = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.inView = String(
            entry.isIntersecting,
          );
        });
      },
      { rootMargin: "80px" },
    );
    [heroScene.current, planetSection.current].forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, []);
  const recent = [...data.memories]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const featured =
    recent.find((m) => m.photos.length && m.id !== "morning-one") ||
    recent.find((m) => m.photos.length);
  const mainPhoto = featured?.photos[0] || "/assets/coast.png";
  const satellites = recent
    .filter((m) => m.id !== featured?.id && m.photos.length)
    .slice(0, 2);
  const next = sortedEvents(
    data.events.filter((e) => !e.done && e.date >= today()),
  )[0];
  const days = Math.max(
    1,
    Math.floor(
      (new Date(today() + "T12:00:00").getTime() -
        new Date(data.since + "T12:00:00").getTime()) /
        86400000,
    ) + 1,
  );
  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <h1>
            我们的
            <br />
            <span>小宇宙</span>
          </h1>
          <p className="heroDescription">
            每一次遇见，每一句想说的话，
            <br />
            都值得在这里，亮成一颗星。
          </p>
          <div className="heroPeople">
            <span className="avatarPair">
              <Avatar person={data.people[0]} size="small" />
              <Avatar person={data.people[1]} size="small" />
            </span>
            <span>
              {data.people[0].name} <Heart size={12} /> {data.people[1].name}
            </span>
            <i />
            两个人的秘密星系
          </div>
          <div className="heroButtons">
            <Link to="/memories/new" className="button">
              <Plus size={18} />
              记录这一刻
            </Link>
            <a
              href="#planets"
              className="button secondary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("planets")?.scrollIntoView({
                  behavior:
                    document.documentElement.dataset.motion === "on"
                      ? "smooth"
                      : "instant",
                });
              }}
            >
              <Orbit size={18} />
              探索小宇宙
            </a>
          </div>
          <div className="heroStats">
            <span>
              <strong>
                <Count value={days} />
              </strong>
              <small>个日子，慢慢靠近</small>
            </span>
            <span>
              <strong>
                <Count value={data.memories.length} />
              </strong>
              <small>段回忆，闪闪发光</small>
            </span>
            <span>
              <strong>
                <Count value={data.wishes.filter((w) => !w.done).length} />
              </strong>
              <small>个心愿，等我们出发</small>
            </span>
          </div>
        </div>
        <div
          className="orbitalScene"
          ref={heroScene}
          onPointerMove={(e) => {
            if (
              document.documentElement.dataset.motion !== "on" ||
              e.pointerType !== "mouse"
            )
              return;
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty(
              "--mx",
              ((e.clientX - r.left) / r.width - 0.5) * 12 + "px",
            );
            e.currentTarget.style.setProperty(
              "--my",
              ((e.clientY - r.top) / r.height - 0.5) * 12 + "px",
            );
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.setProperty("--mx", "0px");
            e.currentTarget.style.setProperty("--my", "0px");
          }}
        >
          <div className="sceneInner">
            <div className="heroAura" aria-hidden="true" />
            <div className="orbitRing ringOne" aria-hidden="true">
              <i />
            </div>
            <div className="orbitRing ringTwo" aria-hidden="true">
              <i />
            </div>
            <div className="orbitRing ringThree" aria-hidden="true" />
            <Link
              to={featured ? `/memories/${featured.id}` : "/memories/new"}
              className="mainPlanet"
              aria-label="打开星球里的回忆"
            >
              <span className="planetAtmosphere" aria-hidden="true" />
              <span className="planetBand" aria-hidden="true" />
              <div className="planetPhoto">
                <AssetImage src={mainPhoto} alt="被星光环绕的回忆照片" />
                <div className="planetShadow" />
              </div>
              <span className="planetBand planetBandFront" aria-hidden="true" />
              <span className="planetCaption">
                <Sparkles size={14} />
                这里，藏着我们的故事
              </span>
            </Link>
            {satellites.map((m, i) => (
              <Link
                key={m.id}
                to={"/memories/" + m.id}
                className={
                  "satellite " + (i === 0 ? "satelliteOne" : "satelliteTwo")
                }
                aria-label={"打开" + m.title}
              >
                <AssetImage src={m.photos[0]} alt={m.title} />
              </Link>
            ))}
            <span className="tinyPlanet tinyOne" aria-hidden="true" />
            <span className="tinyPlanet tinyTwo" aria-hidden="true" />
            <span className="orbitSpark sparkOne" aria-hidden="true">
              <Sparkles />
            </span>
            <span className="orbitSpark sparkTwo" aria-hidden="true">
              <Star size={14} fill="currentColor" />
            </span>
            <div className="sceneNote">
              <i />
              你和我，刚好在同一片星空
            </div>
          </div>
        </div>
      </section>
      <section id="planets" className="planetSection" ref={planetSection}>
        <div className="sectionHeading">
          <div>
            <h2>去一颗星球，待一会儿</h2>
            <p>想记录，想倾诉，或者只是想和你一起玩。</p>
          </div>
          <span className="sectionConstellation">
            <Star />
            <span />
            <Sparkles />
          </span>
        </div>
        <div className="planetNavigation">
          {planets.map(({ to, title, text, Icon, tone }, i) => (
            <Link
              className={`planetDestination ${tone}`}
              to={to}
              key={to}
              style={{ "--delay": `${i * -0.9}s` } as React.CSSProperties}
            >
              <div className="destinationOrb" aria-hidden="true">
                <span className="destinationGlow" />
                <span className="destinationHalo" />
                <span className="destinationCore">
                  <Icon size={35} strokeWidth={1.45} />
                </span>
                <i />
              </div>
              <h3>
                {title}
                <ArrowUpRight size={15} />
              </h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="homeMoments">
        <div className="sectionHeading">
          <div>
            <h2>最近亮起的星光</h2>
            <p>再普通的日子，也有舍不得忘记的瞬间。</p>
          </div>
          <Link className="textLink" to="/memories">
            所有回忆 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="memoryPreviewGrid">
          {recent.map((m) => (
            <Link key={m.id} to={`/memories/${m.id}`} className="memoryPreview">
              <div className="previewImage">
                {m.photos[0] ? (
                  <AssetImage src={m.photos[0]} alt={m.title} />
                ) : (
                  <Camera size={40} />
                )}
                <span>
                  <ArrowUpRight size={19} />
                </span>
              </div>
              <div className="previewCopy">
                <small>{dateText(m.date)}</small>
                <h3>{m.title}</h3>
                <p>{m.body.split("\n")[0]}</p>
              </div>
            </Link>
          ))}
          {!recent.length && (
            <Link className="firstMemory" to="/memories/new">
              <Plus />
              点亮第一段回忆
            </Link>
          )}
        </div>
      </section>
      <section className="homeBottom">
        <div className="todaySignal">
          <div className="signalHeader">
            <Heart size={22} />
            <h2>此刻的我们</h2>
            <Link to="/today" aria-label="看看今天">
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="signalPeople">
            {data.people.map((p, i) => (
              <div key={i}>
                <Avatar person={p} />
                <span>
                  <strong>{p.name}</strong>
                  <small>
                    <MoodIcon value={data.moods[today()]?.[i] || ""} />
                    {data.moods[today()]?.[i] || "还没有留下心情"}
                  </small>
                </span>
              </div>
            ))}
          </div>
          <p>
            {data.notes[today()]?.body || "给今天留一句话，让对方知道你来过。"}
          </p>
        </div>
        <div className="nextWish">
          <span className="wishOrbit" aria-hidden>
            <Star size={30} />
          </span>
          <h2>
            {next
              ? "下一次，把星光带到现实里"
              : "还有好多明天，等我们一起"}{" "}
          </h2>
          {next ? (
            <>
              <p>{next.title}</p>
              <small>
                {dateText(next.date)}
                {next.time ? " · " + next.time : ""}
              </small>
              <Link className="textLink" to={`/events/${next.id}`}>
                看看这次约定 <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <p>去抽一个约会，或者写下新的心愿。</p>
              <Link className="textLink" to="/play/draw">
                今天，去哪里 <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </section>
    </>
  );
}
