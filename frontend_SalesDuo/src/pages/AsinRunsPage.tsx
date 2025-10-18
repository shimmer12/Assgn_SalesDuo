import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import ComparisonView from "../components/ComparisonView";
import Spinner from "../components/Spinner";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  RunsForAsinResponseSchema,
  type RunsForAsinResponse,
  type RunDetail,
} from "../schema/apiSchema";
import { validateResponse, ApiValidationError } from "../utils/validateApi";
import { url } from "../utils";

export default function AsinRunsPage() {
  const { asin } = useParams<{ asin: string }>();
  const [runs, setRuns] = useState<RunDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!asin) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    axios
      .get(`${url}/api/runs/${encodeURIComponent(asin)}`)
      .then((res) => {
        const validated = validateResponse<RunsForAsinResponse>(res, RunsForAsinResponseSchema);
        if (mounted) setRuns(validated.runs ?? []);
      })
      .catch((err) => {
        console.error("Failed to fetch runs for ASIN:", err);
        if (err.response?.status === 404) {
          setError("No runs found for this ASIN.");
        } else if (err instanceof ApiValidationError) {
          setError("Server returned unexpected data. See console.");
        } else {
          setError("Failed to fetch runs for this ASIN.");
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [asin]);

  return (
    <ErrorBoundary>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Runs for ASIN: {asin}</h1>
            <p className="text-sm text-gray-500 mt-1">All completed optimization runs for this ASIN</p>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-gray-600">
              <Spinner size={2} />
              <div>Loading runs…</div>
            </div>
          )}

          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && runs.length === 0 && (
            <div className="text-gray-500">No completed runs yet for this ASIN.</div>
          )}

          <div className="space-y-10 mt-4">
            {runs.map((r) => (
              <div key={r.id} className="bg-white border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Run ID</div>
                    <div className="font-semibold text-gray-800">{r.id}</div>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                </div>

                <ComparisonView
                  result={{
                    original: r.original ? {
                      title: r.original.title ?? undefined,
                      bullets: r.original.bullets ?? undefined,
                      description: r.original.description ?? undefined,
                    } : undefined,
                    optimized: r.optimized ? {
                      title: r.optimized.title ?? undefined,
                      bullets: r.optimized.bullets ?? undefined,
                      description: r.optimized.description ?? undefined,
                      keywords: r.optimized.keywords ?? undefined,
                    } : undefined,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
