import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import invariant from "tiny-invariant";
import { getToast, jsonWithError } from "remix-toast";
import { getFeed } from "~/utils/parser.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.feedId, "Feed id is required!");
  const { toast, headers } = await getToast(request);
  const { feedId } = params;
  const supabase = createSupabaseServerClient({ request });

  const { data, error } = await supabase
    .from("rss")
    .select("*")
    .eq("id", feedId)
    .single();

  if (error || !data) {
    return jsonWithError(null, "Something went wrong!", { headers });
  }

  const feed = await getFeed(data.url);

  return json({ feed, toast }, { headers });
};

export default function Feed() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div>
      {loaderData?.feed?.items.map((feed) => {
        return (
          <div key={feed.guid}>
            <span>{feed.creator}</span>
            <span>{feed.title}</span>
            <span>{feed.pubDate}</span>
          </div>
        );
      })}
    </div>
  );
}
