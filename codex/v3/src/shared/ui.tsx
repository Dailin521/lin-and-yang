import {
  useEffect,
  useRef,
  type ReactNode,
  type ImgHTMLAttributes,
} from "react";
import { X } from "lucide-react";
import { useImageUrl } from "./store";
import { useUniverse } from "../data/context";

export function AssetImage({
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const url = useImageUrl(src);
  return url ? (
    <img src={url} {...props} />
  ) : (
    <span
      className={props.className}
      role="img"
      aria-label={props.alt || "图片加载中"}
    />
  );
}
export function Dialog({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const { error } = useUniverse();
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(document.activeElement as HTMLElement | null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const old = returnFocus.current;
    const dialog = ref.current;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (old?.isConnected) old.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`baseDialog ${className}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close.current();
      }}
    >
      <div className="dialogInner">
        <div className="dialogHeading">
          <h2>{title}</h2>
          <button
            className="dialogClose"
            type="button"
            aria-label="关闭"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        <StorageMessage error={error} />
        {children}
      </div>
    </dialog>
  );
}
export function StorageMessage({
  error,
  saving,
}: {
  error: string;
  saving?: boolean;
}) {
  return error ? (
    <p className="storageError" role="alert">
      {error}
    </p>
  ) : saving ? (
    <span className="storageSaving" role="status">
      正在保存到本机…
    </span>
  ) : null;
}
