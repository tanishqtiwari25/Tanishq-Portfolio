"use client";
import { useEffect, useState } from "react";
export default function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="local-time">
      <span className="status-dot" /> KANPUR, INDIA{" "}
      <time>
        {time || "IST"} {time && "IST"}
      </time>
    </span>
  );
}
