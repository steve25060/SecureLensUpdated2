import { motion } from "framer-motion";
import Button from "@/components/common/Button";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function HeroButtons() {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="mt-7 flex flex-wrap gap-3"
    >
      <motion.div variants={item}>
        <Button className="group min-w-48 shadow-violet-700/30">
          Start Security Analysis Free
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
      <motion.div variants={item}>
        <Button variant="secondary" className="min-w-36">
          <PlayCircle className="mr-2 h-4 w-4" />
          Watch Demo
        </Button>
      </motion.div>
    </motion.div>
  );
}
