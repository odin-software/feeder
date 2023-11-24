import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getToast, jsonWithError } from "remix-toast";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { getFeedSortedByDate, getMultipleFeeds } from "~/utils/parser.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const supabase = createSupabaseServerClient({ request });
  const { toast, headers } = await getToast(request);

  const { data, error } = await supabase
    .from("rss")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return jsonWithError(null, "Something went wrong!", { headers });
  }

  try {
    const urls = data.map((feed) => feed.url);
    const feed = await getFeedSortedByDate(urls);

    return json({ feed, toast }, { headers });
  } catch (err) {
    console.log(err);
  }

  return json({ feed: null, toast }, { headers });
};

export default function All() {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData?.feed?.length === 0) {
    return <div>No feeds found!</div>;
  }

  return (
    <div>
      <ul
        role="list"
        className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
      >
        {loaderData?.feed?.map((feed) => {
          return (
            <li
              key={feed.title}
              className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
            >
              <div className="flex min-w-0 gap-x-4">
                <img
                  className="h-12 w-12 flex-none rounded-full bg-gray-50"
                  src={""}
                  alt={feed.title}
                />
                <div className="min-w-0 flex-auto">
                  <a href={feed.link} rel="noopener noreferrer" target="_blank">
                    <span className="absolute inset-x-0 -top-px bottom-0" />
                    {feed.title}
                  </a>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                    {feed.creator?.length > 0
                      ? feed.creator
                      : feed.fallBackTitle}
                  </p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                {/* <p className="text-sm leading-6 text-gray-900">{person.role}</p> */}

                <div className="mt-1 flex items-center gap-x-1.5">
                  <p className="text-xs leading-5 text-gray-500">
                    {new Date(feed.pubDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
