import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useStore } from "../shared/store";
import { seed, type Universe } from "./model";
type Store = ReturnType<typeof useStore<Universe>>;
const Context = createContext<
  (Store & { notify: (text: string) => void; toast: string }) | null
>(null);
export function UniverseProvider({ children }: { children: ReactNode }) {
  const store = useStore<Universe>("universe", seed);
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3600);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <Context.Provider value={{ ...store, toast, notify: setToast }}>
      {children}
    </Context.Provider>
  );
}
export const useUniverse = () => useContext(Context)!;
