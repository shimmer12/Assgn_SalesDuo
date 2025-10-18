import type { OriginalSnapshot, OptimizedSnapshot } from "../schema/apiSchema";

type Props = {
  result: {
    original?: OriginalSnapshot;
    optimized?: OptimizedSnapshot;
  };
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-600 mb-2">{children}</h2>;
}

export default function ComparisonView({ result }: Props) {
  const { original, optimized } = result;

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
      {/* Original */}
      <div className="border rounded-2xl p-5 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Original</h3>
            <div className="text-xs text-gray-400">Scraped from Amazon</div>
          </div>
        </div>

        <div className="mt-2">
          <SectionTitle>Title</SectionTitle>
          <div className="text-md font-medium text-gray-800">{original?.title ?? <span className="text-gray-400">— no title —</span>}</div>
        </div>

        <div className="mt-4">
          <SectionTitle>Bullets</SectionTitle>
          {original?.bullets && original.bullets.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              {original.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400">No bullet points available</div>
          )}
        </div>

        <div className="mt-4">
          <SectionTitle>Description</SectionTitle>
          {original?.description ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{original.description}</p>
          ) : (
            <div className="text-sm text-gray-400">No description available</div>
          )}
        </div>
      </div>

      {/* Optimized */}
      <div className="border rounded-2xl p-5 bg-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-brand-600">Optimized</h3>
            <div className="text-xs text-gray-400">AI-generated suggestions</div>
          </div>
        </div>

        <div className="mt-2">
          <SectionTitle>Title</SectionTitle>
          <div className="text-md font-medium text-gray-800">{optimized?.title ?? <span className="text-gray-400">— no optimized title —</span>}</div>
        </div>

        <div className="mt-4">
          <SectionTitle>Bullets</SectionTitle>
          {optimized?.bullets && optimized.bullets.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
              {optimized.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400">No optimized bullets</div>
          )}
        </div>

        <div className="mt-4">
          <SectionTitle>Description</SectionTitle>
          {optimized?.description ? (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{optimized.description}</p>
          ) : (
            <div className="text-sm text-gray-400">No optimized description</div>
          )}
        </div>

        <div className="mt-4">
          <SectionTitle>Keywords</SectionTitle>
          {optimized?.keywords && optimized.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {optimized.keywords.map((k, i) => (
                <span key={i} className="inline-flex items-center text-xs bg-brand-500/10 text-brand-600 px-2 py-1 rounded-full">
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No keywords suggested</div>
          )}
        </div>
      </div>
    </div>
  );
}
