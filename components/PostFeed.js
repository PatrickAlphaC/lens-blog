import Link from "next/link";

export default function PostFeed({ posts }) {
  return (
    <div className="p-2">
      {posts
        ? posts.map((post) => <PostItem post={post} key={post.id} />)
        : null}
    </div>
  );
}

function PostItem({ post }) {
  let imageURL;

  // Use the gateway for IPFS
  if (post.metadata.image) {
    imageURL = post.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  return (
    <div className="flex justify-center p-2">
      <Link href={`/posts/${post.id}`}>
        <div className="rounded-lg shadow-lg bg-white max-w-sm">
          <img className="rounded-t-lg" src={imageURL} alt="" />
          <div className="p-6">
            <h5 className="text-gray-900 text-xl font-medium mb-2">
              {post.metadata.name}
            </h5>
          </div>
        </div>
      </Link>
    </div>
  );
}
