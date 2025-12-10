// Loading skeleton pro stránku produktů
export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        {/* Filter buttons skeleton */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
