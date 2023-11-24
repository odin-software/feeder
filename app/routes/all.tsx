import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getToast, jsonWithError } from "remix-toast";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { getFeedSortedByDate } from "~/utils/parser.server";
import { PostsList } from "~/components/PostList";

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
      <PostsList posts={loaderData?.feed} />
    </div>
  );
}
