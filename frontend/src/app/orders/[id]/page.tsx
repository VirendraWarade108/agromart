interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Order #{id}</h1>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <p className="text-gray-600">Order details for order ID: {id}</p>
          <p className="text-sm text-gray-500 mt-2">This is a mock order detail page.</p>
        </div>
      </div>
    </div>
  );
}
