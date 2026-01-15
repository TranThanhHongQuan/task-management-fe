import { useEffect, useState } from "react";
import { unreadCount } from "../api/notificationApi";

export function useUnreadNotifications() {
  const [count, setCount] = useState<number>(0);

  async function load() {
    try {
      setCount(await unreadCount());
    } catch {
      // ignore (có thể token hết hạn, interceptor sẽ xử lý)
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // 15s enterprise-friendly
    return () => clearInterval(t);
  }, []);

  return { count, refresh: load, setCount };
}
