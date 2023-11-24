import type {
  MetaFunction,
  LinksFunction,
  LoaderFunctionArgs
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import { Flip, ToastContainer } from "react-toastify";

import tostifyStylesheet from "react-toastify/dist/ReactToastify.css";
import stylesheet from "~/tailwind.css";
import { Sidebar } from "./components/Sidebar";
import { createSupabaseServerClient } from "./utils/supabase.server";
import { getToast, jsonWithError } from "remix-toast";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: tostifyStylesheet }
];

export const meta: MetaFunction = () => [
  {
    charset: "utf-8",
    title: "Feeder",
    viewport: "width=device-width,initial-scale=1"
  }
];

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

  return json({ data, toast }, { headers });
};

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  const feeds =
    loaderData?.data.map((feed) => {
      return { name: feed.name, href: feed.id };
    }) ?? [];

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div>
          <Sidebar feeds={feeds} />
          <main className="py-10 lg:pl-72 bg-gradient-to-r from-cyan-500 to-blue-500">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>

        <ToastContainer
          autoClose={3000}
          transition={Flip}
          hideProgressBar={true}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
