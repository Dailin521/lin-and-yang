import { useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Cloud,
  Heart,
  ImagePlus,
  Moon,
  Plus,
  Sparkles,
  Star,
  Sun,
  Trash2,
  X,
  ArrowRight,
} from "lucide-react";
import { AssetImage, Dialog } from "./ui";
import { saveImage } from "./store";
import { useUniverse } from "../data/context";
import type { Person } from "../data/model";
export function Button({
  children,
  secondary = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`${secondary ? "button secondary" : "button"} ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
export function Back({
  to = "/",
  children = "回到小宇宙",
}: {
  to?: string;
  children?: ReactNode;
}) {
  return (
    <Link className="backLink" to={to}>
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
export function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="pageTitle">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="pageActions">{children}</div>}
    </header>
  );
}
export function Avatar({
  person,
  size = "normal",
}: {
  person: Person;
  size?: "small" | "normal" | "large";
}) {
  const Icon =
    person.avatar === "moon"
      ? Moon
      : person.avatar === "star"
        ? Star
        : person.avatar === "cloud"
          ? Cloud
          : Sun;
  return (
    <span className={`avatar ${person.accent} ${size}`}>
      {person.avatar.startsWith("image:") ? (
        <AssetImage src={person.avatar} alt={person.name} />
      ) : (
        <Icon
          aria-hidden
          size={size === "small" ? 17 : size === "large" ? 31 : 24}
        />
      )}
    </span>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="emptyStar">
        <Sparkles size={32} />
      </span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
export function Missing({ to = "/" }: { to?: string }) {
  return (
    <Empty
      title="这颗星星暂时找不到了。"
      action={
        <Link className="button secondary" to={to}>
          返回继续看看 <ArrowRight size={16} />
        </Link>
      }
    >
      记录可能已被删除，其他内容仍然保留。
    </Empty>
  );
}
export function Confirm({
  title,
  children,
  onClose,
  onConfirm,
  label = "确认删除",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  label?: string;
}) {
  const { saving } = useUniverse();
  return (
    <Dialog title={title} onClose={onClose}>
      <p className="dialogCopy">{children}</p>
      <div className="formActions">
        <Button secondary onClick={onClose}>
          先保留
        </Button>
        <Button disabled={saving} onClick={onConfirm}>
          {label}
        </Button>
      </div>
    </Dialog>
  );
}
export function PhotoInput({
  photos,
  onChange,
  max = 12,
  onBusy,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  onBusy?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    onBusy?.(true);
    setError("");
    const added: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, max - photos.length))
        added.push(await saveImage(file, "universe"));
    } catch (e) {
      setError(
        e instanceof DOMException
          ? "照片还没有保存成功。请检查浏览器存储空间，再试一次。"
          : e instanceof Error
            ? e.message
            : "图片暂时未能保存，请重试。",
      );
    } finally {
      if (added.length) onChange([...photos, ...added]);
      setBusy(false);
      onBusy?.(false);
    }
  }
  function move(i: number, offset: number) {
    const copy = [...photos];
    [copy[i], copy[i + offset]] = [copy[i + offset], copy[i]];
    onChange(copy);
  }
  return (
    <div>
      <div className="photoGrid">
        {photos.map((photo, i) => (
          <div className="photoThumb" key={photo + i}>
            <AssetImage src={photo} alt={`照片 ${i + 1}`} />
            <button
              type="button"
              className="photoRemove"
              disabled={busy}
              aria-label={`移除照片 ${i + 1}`}
              onClick={() => onChange(photos.filter((_, n) => n !== i))}
            >
              <X size={15} />
            </button>
            <div className="photoOrder">
              <button
                type="button"
                disabled={busy || i === 0}
                aria-label={`照片 ${i + 1} 前移`}
                onClick={() => move(i, -1)}
              >
                <ArrowLeft size={15} />
              </button>
              <small>{i === 0 ? "首图" : i + 1}</small>
              <button
                type="button"
                disabled={busy || i === photos.length - 1}
                aria-label={`照片 ${i + 1} 后移`}
                onClick={() => move(i, 1)}
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
        {photos.length < max && (
          <label className="photoUpload">
            <ImagePlus size={27} />
            <span>{busy ? "正在收好照片…" : "添加照片"}</span>
            <small>每张不超过 15 MB</small>
            <input
              aria-label="上传照片"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple={max > 1}
              disabled={busy}
              onChange={(e) => {
                void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {error && (
        <p className="storageError" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export const moodOptions = [
  { label: "晴朗", Icon: Sun },
  { label: "平静", Icon: Moon },
  { label: "有点累", Icon: Cloud },
  { label: "有点想你", Icon: Heart },
  { label: "好开心", Icon: Sparkles },
];
export function MoodIcon({ value }: { value: string }) {
  const Icon = moodOptions.find((m) => m.label === value)?.Icon || Star;
  return <Icon size={17} />;
}
export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}
export function IconLink({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link className="iconButton" aria-label={label} to={to}>
      {children}
    </Link>
  );
}
export function DeleteButton({
  onClick,
  children = "删除",
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button type="button" className="dangerLink" onClick={onClick}>
      <Trash2 size={16} />
      {children}
    </button>
  );
}
