export default function Logo({ size = 36 }) {
  return (
    <div
      className="grid place-items-center rounded-2xl bg-gradient-to-br from-blush-500 to-blush-300 shadow"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="text-sm font-black text-white">N</span>
    </div>
  );
}

