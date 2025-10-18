import { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import AsinInputForm from "../components/AsinInputForm";
import ComparisonView from "../components/ComparisonView";
import Spinner from "../components/Spinner";
import ErrorBoundary from "../components/ErrorBoundary";
import { PostRunResponseSchema, type PostRunResponse } from "../schema/apiSchema";
import { validateResponse, ApiValidationError } from "../utils/validateApi";
import { url } from "../utils";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PostRunResponse | null>(null);
  const [asin, setAsin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const optimize = async (asin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${url}/api/runs`, { asin });
      const validated = validateResponse<PostRunResponse>(res, PostRunResponseSchema);
      setResult(validated);
    } catch (err: any) {
      if (err instanceof ApiValidationError) {
        console.error("Validation failed:", err.details);
        setError("Server returned unexpected data. Check console.");
      } else {
        const status = err.response?.status;
        if (status === 404) {
          setError("ASIN was not found on Amazon.in. Please check and try again.");
        } else if (status === 400) {
          setError("Invalid ASIN format. Please enter a valid ASIN.");
        } else {
          setError(err.response?.data?.error ?? "Something went wrong.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (asin: string) => {
    await optimize(asin);
  };

  return (
    <ErrorBoundary>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 relative">
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
            <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
              <Spinner size={3} />
              <div className="text-sm font-medium text-gray-800">Optimizing — please wait…</div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Amazon Listing Optimizer</h1>
            <p className="text-sm text-gray-500 mt-2">Enter an ASIN to fetch and optimize listing content</p>
          </div>

          <div className="mt-6 flex justify-center">
            <AsinInputForm onSubmit={handleSubmit} loading={loading} asin={asin} setAsin={setAsin} />
          </div>

          {error && <div className="max-w-xl mx-auto mt-4 text-sm text-red-600 text-center">{error}</div>}

          <div className="mt-8 flex justify-center gap-3">
            {result?.run && (
              <button
                onClick={() => handleSubmit(asin)}
                disabled={loading}
                className="px-4 py-2 bg-white border rounded-md hover:shadow-sm text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M20 12a8 8 0 10-2.52 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Regenerate for same ASIN
              </button>
            )}
          </div>

          {result?.run && (
            <div className="mt-10">
              <ComparisonView
                result={{
                  original: result.original ?? undefined,
                  optimized: result.optimized ?? undefined,
                }}
              />
            </div>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}
