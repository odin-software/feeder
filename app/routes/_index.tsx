import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "~/utils/supabase.server";

const loader = async ({ request }: LoaderFunctionArgs) => {
  const supabase = createSupabaseServerClient({ request });
  const { data, error } = await supabase
    .from("rss")
    .select("*")
    .order("created_at", { ascending: false });
  return json({ data, error });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  if (data.error) {
    return <div>{data.error.message}</div>;
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      {data.data?.map((rss) => {
        return <div>{rss.name}</div>;
      })}
    </main>
  );
}
