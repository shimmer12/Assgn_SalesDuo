import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import RunCard from "../components/RunCard";
import Spinner from "../components/Spinner";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  RunsListResponseSchema,
  type RunListItem,
  type RunsListResponse,
} from "../schema/apiSchema";
import { validateResponse, ApiValidationError } from "../utils/validateApi";
import { url } from "../utils";

export default function RunsHistoryPage() {
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    axios
      .get(`${url}/api/runs`)
      .then((res) => {
        const validated = validateResponse<RunsListResponse>(res, RunsListResponseSchema);
        const items = validated.results ?? validated.runs ?? [];
        if (mounted) setRuns(items);
      })
      .catch((err) => {
        console.error("Failed to fetch runs:", err);
        if (err instanceof ApiValidationError) {
          setError("Server returned unexpected data. Check console.");
        } else {
          setError("Failed to fetch runs.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ErrorBoundary>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Optimization History</h1>
            <p className="text-sm text-gray-500 mt-1">Recent optimization runs</p>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-gray-600">
              <Spinner size={2} />
              <div>Loading runs…</div>
            </div>
          )}

          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && runs.length === 0 && (
            <div className="text-gray-500">No runs yet. Try optimizing an ASIN.</div>
          )}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {runs.map((r) => (
              <RunCard
                key={r.id}
                asin={r.asin}
                createdAt={r.created_at}
                optimizedTitle={r.optimized?.title}
                href={`/history/${r.asin}`}
              />
            ))}
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
