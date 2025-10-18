type Props = {
  onSubmit: (asin: string) => Promise<void>;
  asin: string;
  setAsin: (asin: string) => void;
  loading: boolean;
};

export default function AsinInputForm({ onSubmit, loading, asin, setAsin }: Props) {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin.trim()) return;
    await onSubmit(asin.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-3"
      aria-label="ASIN input form"
    >
      <label htmlFor="asin" className="sr-only">ASIN</label>
      <input
        id="asin"
        type="text"
        value={asin}
        onChange={(e) => setAsin(e.target.value)}
        placeholder="Enter ASIN (e.g. B07H65KP63)"
        className="flex-1 border border-gray-200 rounded-lg px-4 py-3 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto bg-gray-800 text-white px-5 py-3 rounded-lg hover:bg-gray-500 transition cursor-pointer font-medium"
      >
        {loading ? "Optimizing..." : "Optimize"}
      </button>
    </form>
  );
}
