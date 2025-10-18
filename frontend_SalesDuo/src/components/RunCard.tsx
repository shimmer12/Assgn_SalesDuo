import { Link } from "react-router-dom";

type Props = {
  asin: string;
  createdAt?: string;
  optimizedTitle?: string | null;
  href?: string;
};

export default function RunCard({
  asin,
  createdAt,
  optimizedTitle,
  href,
}: Props) {
  const Wrapper: any = href ? Link : "div";
  const wrapperProps = href ? { to: href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="block border border-gray-100 rounded-xl p-4 hover:shadow-sm transition bg-white"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400">ASIN</div>
          <div className="font-semibold text-gray-800">{asin}</div>
        </div>
        <div className="text-xs text-gray-400">{createdAt ? new Date(createdAt).toLocaleString() : ""}</div>
      </div>

      {optimizedTitle ? (
        <div className="mt-3 text-sm text-gray-700 line-clamp-2">{optimizedTitle}</div>
      ) : (
        <div className="mt-3 text-sm text-gray-500">No optimized title yet</div>
      )}
    </Wrapper>
  );
}
