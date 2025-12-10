// Globální loading spinner pro všechny stránky v [locale]
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-primary" />
      </div>
    </div>
  );
}
