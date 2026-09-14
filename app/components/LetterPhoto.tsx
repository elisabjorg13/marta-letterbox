export function LetterPhoto({
  src,
  alt,
  onRemove,
}: {
  src: string;
  alt: string;
  onRemove?: () => void;
}) {
  return (
    <div className="relative my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block w-1/2 h-auto mx-auto" />
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 text-blue-700"
        >
          Retirer
        </button>
      ) : null}
    </div>
  );
}
