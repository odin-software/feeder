import { SingleItem } from "../utils/parser.server";

type PostListProps = {
  posts?: SingleItem[] | null;
};

export function PostsList({ posts }: PostListProps) {
  return (
    <div>
      <ul
        role="list"
        className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
      >
        {posts?.map((post) => {
          return <Post post={post} key={post.link} />;
        })}
      </ul>
    </div>
  );
}

function getInitials(creator: string) {
  const [first, second] = creator.split(" ");
  if (second === undefined) return first[0].toUpperCase();
  return `${first[0].toUpperCase()}${second[0].toUpperCase()}`;
}

function Image({
  image,
  title,
  creator
}: {
  image?: string;
  title: string;
  creator: string;
}) {
  if (!image) {
    return (
      <div className="h-12 w-12 rounded-full font-mono flex justify-center items-center bg-slate-100">
        {getInitials(creator)}
        <span className="sr-only">{creator}</span>
      </div>
    );
  }

  return (
    <img
      className="h-12 w-12 flex-none rounded-full bg-gray-50"
      src={image}
      alt={title}
    />
  );
}

function Post({ post }: { post: SingleItem }) {
  const creator = post.creator?.length > 0 ? post.creator : post.fallBackTitle;
  const date = new Date(post.pubDate).toDateString();
  return (
    <li className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
      <div className="flex min-w-0 gap-x-4">
        <Image title={post.title} image={post.image} creator={creator} />
        <div className="min-w-0 flex-auto">
          <a href={post.link} rel="noopener noreferrer" target="_blank">
            <span className="absolute inset-x-0 -top-px bottom-0" />
            {post.title}
          </a>
          <p className="mt-1 truncate text-xs leading-5 text-gray-500">
            {creator}
          </p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end self-center">
        <div className="mt-1 flex items-center gap-x-1.5">
          <p className="text-md leading-5 text-slate-800">{date}</p>
        </div>
      </div>
    </li>
  );
}
