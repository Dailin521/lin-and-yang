import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Save, Sparkles } from "lucide-react";
import { useUniverse } from "../data/context";
import { useDraft, today } from "../shared/store";
import {
  Avatar,
  Back,
  Button,
  Confirm,
  PageTitle,
  PhotoInput,
} from "../shared/components";
export default function Profile() {
  const { data, change, saving, reset, notify } = useUniverse();
  const navigate = useNavigate();
  const [draft, setDraft, clear] = useDraft("universe:profile", {
    people: data.people,
    since: data.since,
  });
  const [busy, setBusy] = useState<Record<number, boolean>>({}),
    [confirm, setConfirm] = useState(false);
  return (
    <div className="page">
      <Back />
      <PageTitle
        title="这个宇宙里的我们"
        description="名字、头像、开始的日期，都可以慢慢写成喜欢的样子。"
      />
      <form
        className="form panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await change((v) => ({
              ...v,
              people: draft.people.map((p) => ({ ...p, name: p.name.trim() })),
              since: draft.since,
            }))
          ) {
            clear();
            notify("我们的名字和故事，已经更新。");
          }
        }}
      >
        <div className="notice">
          当前是虚构示例人物。所有修改仅保存在本机当前浏览器，没有真实账号，也不会向任何人发送消息。
        </div>
        {draft.people.map((p, i) => (
          <section key={i} className="profilePerson">
            <div className="row" style={{ marginBottom: 25 }}>
              <Avatar person={p} size="large" />
              <div>
                <h2>{i === 0 ? "第一颗星星" : "另一颗星星"}</h2>
                <p className="subtle" style={{ marginTop: 6 }}>
                  {data.role === i
                    ? "此刻的身份"
                    : "切换身份后，体验另一人的操作"}
                </p>
              </div>
            </div>
            <label className="field">
              昵称
              <input
                required
                maxLength={20}
                value={p.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    people: draft.people.map((x, n) =>
                      n === i ? { ...x, name: e.target.value } : x,
                    ),
                  })
                }
              />
            </label>
            <span className="small">选一个星空头像</span>
            <div className="avatarChoices">
              {[
                ["sun", "太阳"],
                ["moon", "月亮"],
                ["star", "星星"],
                ["cloud", "云朵"],
              ].map(([avatar, label]) => (
                <button
                  key={avatar}
                  type="button"
                  aria-label={`第 ${i + 1} 位使用${label}头像`}
                  aria-pressed={p.avatar === avatar}
                  className={p.avatar === avatar ? "selected" : ""}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      people: draft.people.map((x, n) =>
                        n === i ? { ...x, avatar } : x,
                      ),
                    })
                  }
                >
                  <Avatar person={{ ...p, avatar }} />
                </button>
              ))}
            </div>
            <PhotoInput
              photos={p.avatar.startsWith("image:") ? [p.avatar] : []}
              max={1}
              onBusy={(value) => setBusy((v) => ({ ...v, [i]: value }))}
              onChange={(photos) =>
                setDraft((v) => ({
                  ...v,
                  people: v.people.map((x, n) =>
                    n === i
                      ? {
                          ...x,
                          avatar: photos[0] || (i === 0 ? "sun" : "moon"),
                        }
                      : x,
                  ),
                }))
              }
            />
          </section>
        ))}
        <label className="field">
          我们开始靠近的那一天
          <input
            required
            type="date"
            max={today()}
            value={draft.since}
            onChange={(e) => setDraft({ ...draft, since: e.target.value })}
          />
          <small>首页的日子计数，会从这一天开始。</small>
        </label>
        <div className="formActions">
          <Button
            type="submit"
            disabled={saving || Object.values(busy).some(Boolean)}
          >
            <Save size={16} />
            保存我们的资料
          </Button>
        </div>
        <div className="dangerZone">
          <h2>关于这片小宇宙</h2>
          <p>
            记录和照片保存在当前浏览器的本机存储中。刷新与关闭页面后仍可继续；清理网站数据会移除这些内容。不会联网同步到其他设备。
          </p>
          <p>
            下方会重新放入示例内容，并清除本版所有记录、照片与草稿。旧版页面的数据独立保留。
          </p>
          <Button secondary onClick={() => setConfirm(true)}>
            重置这片小宇宙
          </Button>
        </div>
      </form>
      {confirm && (
        <Confirm
          title="重新点亮一片示例星空？"
          label="确认重置本版"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (await reset()) {
              clear();
              setConfirm(false);
              navigate("/");
              notify("已恢复示例小宇宙，旧版数据未改动。");
            }
          }}
        >
          本版的回忆、照片、心愿、日程、书信、问答与票根会被清空，并恢复虚构示例。这个操作无法撤销。
        </Confirm>
      )}
    </div>
  );
}
