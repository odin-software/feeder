import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from "@remix-run/react";
import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { z } from "zod";
import { parse } from "@conform-to/zod";
import { conform, useForm } from "@conform-to/react";
import { useId } from "react";

const submitSchema = z.object({
  name: z.string({ required_error: "Your feed needs a name!" }).min(1),
  rss: z
    .string({ required_error: "Don't forget the url for the rss!" })
    .url("That doesn't look like an url!")
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const supabase = createSupabaseServerClient({ request });
  const { data, error } = await supabase
    .from("rss")
    .select("*")
    .order("created_at", { ascending: false });
  if (!data) {
    return json({ data: null, error });
  }
  return json({ data, error: null });
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

  const { error } = await supabase.from("rss").insert([
    {
      name: name,
      url: rss,
      type: "rss"
    }
  ]);

  if (error) {
    return json(submission);
  }
  return json(submission);
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

  if (loaderData.error) {
    return <div>{loaderData.error.message}</div>;
  }

  return (
    <main style={{ fontFamily: "OpenSans, sans-serif", lineHeight: "1.4" }}>
      <h1 className="text-3xl font-bold">Welcome to Remix</h1>
      {loaderData.data.map((rss) => {
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
    </main>
  );
}
