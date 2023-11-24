import { useEffect, useId } from "react";
import { z } from "zod";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from "@remix-run/react";
import { jsonWithSuccess, jsonWithError, getToast } from "remix-toast";
import { toast as notify } from "react-toastify";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { createSupabaseServerClient } from "~/utils/supabase.server";
import { getFeed } from "~/utils/parser.server";

const submitSchema = z.object({
  name: z.string({ required_error: "Your feed needs a name!" }).min(2),
  rss: z
    .string({ required_error: "Don't forget the url for the rss!" })
    .url("That doesn't look like an url!")
});

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

export const action = async ({ request }: ActionFunctionArgs) => {
  const supabase = createSupabaseServerClient({ request });
  const formData = await request.formData();

  const submission = await parse(formData, {
    async: true,
    schema: submitSchema.superRefine(async (val, ctx) => {
      const { data } = await supabase
        .from("rss")
        .select("*")
        .eq("url", val.rss);
      if (data?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This feed already exists!",
          path: ["rss"]
        });
        return z.NEVER;
      }
    })
  });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }
  const { name, rss } = submission.value;
  const feed = await getFeed(rss);

  const { error } = await supabase.from("rss").insert([
    {
      name: name,
      url: rss,
      type: "rss",
      image: feed.image?.url ?? null
    }
  ]);

  if (error) {
    return jsonWithError(submission, "There was an error saving this feed.");
  }
  return jsonWithSuccess(submission, "Your feed was saved!");
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const lastSubmission = useActionData<typeof action>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema: submitSchema });
    }
  });

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (loaderData?.toast) {
      notify(loaderData.toast.message, {
        type: loaderData.toast.type
      });
    }
  }, [loaderData?.toast]);

  if (loaderData?.data?.length === 0) {
    return <div>No feed</div>;
  }

  return (
    <section style={{ fontFamily: "OpenSans, sans-serif", lineHeight: "1.4" }}>
      <h1 className="text-3xl font-bold">Welcome to Remix</h1>
      {loaderData?.data.map((rss) => {
        return <div key={rss.id}>{rss.name}</div>;
      })}
      <Form method="post" {...form.props}>
        <div>
          <label
            htmlFor={fields.name.id}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Name
          </label>
          <div className="mt-2">
            <input
              {...conform.input(fields.name, { type: "text" })}
              className="text-input"
              placeholder="My favorite blog"
            />
          </div>
          <p className="mt-2 text-sm text-red-600" id="name-error">
            {fields.name.error}
          </p>
        </div>
        <div>
          <label
            htmlFor={fields.rss.id}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            rss
          </label>
          <div className="mt-2">
            <input
              {...conform.input(fields.rss, { type: "text" })}
              className="text-input"
              placeholder="https://your.favorite.blog.com/rss/"
            />
          </div>
          <p className="mt-2 text-sm text-red-600" id="rss-error">
            {fields.rss.error}
          </p>
        </div>
        <button disabled={isSubmitting} type="submit" className="submit-btn">
          Save
        </button>
      </Form>
    </section>
  );
}
