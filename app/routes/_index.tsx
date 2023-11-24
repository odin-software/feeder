import { redirect, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // PLACEHOLDER
  // This will redirect to the home page if the user is not logged in
  // In case I decide yo actually add authentication
  return redirect("/all");
};
