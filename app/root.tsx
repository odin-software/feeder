import type { MetaFunction, LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import { Flip, ToastContainer } from "react-toastify";

import tostifyStylesheet from "react-toastify/dist/ReactToastify.css";
import stylesheet from "~/tailwind.css";
import { Sidebar } from "./components/Sidebar";

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

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div>
          <Sidebar />
          <main className="py-10 lg:pl-72">
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
