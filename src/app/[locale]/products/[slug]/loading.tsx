// Loading skeleton pro detail produktu
export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery skeleton */}
        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />

        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse mt-6" />
        </div>
      </div>
    </div>
  );
}
