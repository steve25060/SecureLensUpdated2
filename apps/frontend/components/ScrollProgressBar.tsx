"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScrollProgressBar() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const scrolled = (scrollTop / scrollHeight) * 100;
      setScroll(scrolled);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 h-0.5 bg-violet-600 z-50"
      style={{ width: `${scroll}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${scroll}%` }}
      transition={{ ease: "linear" }}
    />
  );
}
