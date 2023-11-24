import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getToast, jsonWithError } from "remix-toast";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { getMultipleFeeds } from "~/utils/parser.server";

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
    const feeds = await getMultipleFeeds(urls);
    


    return json({ feeds, toast }, { headers });
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
      {loaderData?.feed?.map((feed) => {
        return feed.items.map((feed) => {
          return (
            <div key={feed.guid}>
              <span>{feed.creator}</span>
              <span>{feed.title}</span>
              <span>{feed.pubDate}</span>
            </div>
          );
        });
      })}
    </div>
  );
}
