import {
  getPostResultById,
  getPublication,
} from "../../constants/lensConstants";
import { useQuery } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import PostContent from "../../components/PostContent";

// Get some  possible paths
export async function getStaticPaths() {
  const paths = [{ params: { posts: "posts", publicationId: "0x869c-0x11" } }];
  return {
    paths,
    fallback: true,
  };
}

// get the props from the paths
export async function getStaticProps({ params }) {
  const { publicationId } = params;

  return {
    props: {
      publicationId,
    },
  };
}

export default function ReadPost(props) {
  const { publicationId } = props;

  const {
    loading,
    data: publication,
    error,
  } = useQuery(getPublication, {
    variables: { request: { publicationId: publicationId } },
  });

  return (
    <div>
      {publication && publicationId && !loading ? (
        <PostContent post={publication.publication} />
      ) : loading ? (
        <div>Loading...</div>
      ) : (
        <div className="p10">Post not found</div>
      )}
    </div>
  );
}
