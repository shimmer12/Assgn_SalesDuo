import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-brand-500 flex items-center justify-center text-white font-bold">
              SD
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">SalesDuo</div>
              <div className="text-xs text-gray-500">Listing optimizer</div>
            </div>
          </Link>

          <nav className="flex gap-4 items-center text-sm">
            <Link
              to="/"
              className="text-gray-600 hover:text-brand-600 px-2 py-1 rounded-md"
            >
              Home
            </Link>
            <Link
              to="/history"
              className="text-gray-600 hover:text-brand-600 px-2 py-1 rounded-md"
            >
              History
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}