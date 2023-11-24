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
  useLoaderData,
  useOutlet,
  useLocation
} from "@remix-run/react";
import { Flip, ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

import tostifyStylesheet from "react-toastify/dist/ReactToastify.css";
import stylesheet from "~/tailwind.css";
import { Sidebar } from "./components/Sidebar";
import { createSupabaseServerClient } from "./utils/supabase.server";
import { getToast, jsonWithError } from "remix-toast";
import { FloatingBtn } from "./components/FloatingBtn";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: tostifyStylesheet }
];

export const meta: MetaFunction = () => [
  {
    property: "og:title",
    content: "Feeder"
  },
  {
    name: "description",
    content: "A simple RSS reader built with Remix and Supabase."
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
  const outlet = useOutlet();
  const feeds =
    loaderData?.data.map((feed) => {
      return { name: feed.name, href: feed.id };
    }) ?? [];

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Feeder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div>
          <Sidebar feeds={feeds} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={useLocation().pathname}
              initial={{ x: "10%", opacity: 0 }}
              animate={{ x: "0", opacity: 1 }}
              exit={{ x: "-40%", opacity: 0 }}
              className="py-10 lg:pl-72 bg-slate-100 min-h-screen"
            >
              <div className="px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </motion.main>
          </AnimatePresence>
        </div>

        <FloatingBtn />
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
