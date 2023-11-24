import { PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";

export function FloatingBtn() {
  return (
    <div className="fixed bottom-4 right-4">
      <Link to="/add">
        <button className="p-4 rounded-full bg-rss hover:bg-orange-500 hover:scale-105 text-white shadow-lg">
          <span className="sr-only">Add new feed</span>
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </Link>
    </div>
  );
}
