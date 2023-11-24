import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import invariant from "tiny-invariant";
import { getToast } from "remix-toast";
import { turnFeedItemsIntoSingleItems } from "~/utils/parser.server";
import { PostsList } from "~/components/PostList";

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
    throw new Response("This feed does not exist!", {
      status: 404
    });
  }

  const feed = await turnFeedItemsIntoSingleItems(data.url);

  return json({ feed, toast }, { headers });
};

export default function Feed() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div>
      <PostsList posts={loaderData?.feed} />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="h-full">
        <h1 className="text-5xl">Oops!</h1>
        <p className="mt-4 text-2xl">
          {error.status === 404
            ? "This feed does not exist!"
            : "Something went wrong!"}
        </p>
      </div>
    );
  }
}
