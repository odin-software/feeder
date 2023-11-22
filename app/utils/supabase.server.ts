import { createServerClient } from "@supabase/auth-helpers-remix";
import { environment } from "./environment.server";
import { Database } from "~/types/supabase";

export const createSupabaseServerClient = ({
  request,
  response
}: {
  request: Request;
  response?: Response;
}) => {
  const res = response ?? new Response();
  return createServerClient<Database>(
    environment.SUPABASE_URL,
    environment.SUPABASE_SERVICE_KEY,
    {
      request,
      response: res
    }
  );
};
