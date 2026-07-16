export default function HeroBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[#030614]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(111,45,255,0.18),transparent_30%),radial-gradient(circle_at_72%_96%,rgba(91,33,182,0.32),transparent_36%),radial-gradient(circle_at_12%_64%,rgba(79,70,229,0.12),transparent_32%)]" />
      <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:96px_96px]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.28))]" />

      <div className="absolute -bottom-28 left-0 h-72 w-[58%] opacity-60 [background-image:radial-gradient(circle,rgba(139,92,246,0.72)_1px,transparent_1.7px)] [background-size:13px_13px] [mask-image:radial-gradient(ellipse_at_bottom_left,black_18%,transparent_72%)]" />
      <div className="absolute -bottom-16 left-0 h-52 w-[42%] rounded-[50%] border-t border-violet-500/25 bg-violet-600/10 blur-sm" />
    </>
  );
}
