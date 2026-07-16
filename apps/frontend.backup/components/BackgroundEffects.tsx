"use client";

const blobPositions = Array.from({ length: 5 }, (_, i) => ({
  key: i,
  top: `${(i * 23) % 100}%`,
  left: `${(i * 41) % 100}%`,
  animationDelay: `${i * 2}s`,
}));

export default function BackgroundEffects() {
  // The component relies on CSS keyframes defined globally via Tailwind utilities or custom CSS.
  // It renders a gradient background and moving purple blobs.
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient transition */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-violet-900 to-indigo-900 animate-gradient-x" />
      {/* Purple blobs */}
      {blobPositions.map((blob) => (
        <div
          key={blob.key}
          className="absolute rounded-full bg-purple-600 opacity-30 w-72 h-72 animate-blob"
          style={{
            top: blob.top,
            left: blob.left,
            animationDelay: blob.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
