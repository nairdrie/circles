import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import React from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = React.useState("");
  
  const ctx = api.useContext();

  const {mutate, isLoading: isPosting} = api.posts.create.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
      setInput("");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]) toast.error(errorMessage[0]);
      else toast.error("Something went wrong. Please try again later.");
      // toast.error("Something went wrong. Please try again later.");
    }
  });

  if(!user) return null;

  return <div className="flex gap-3 w-full">
    <Image 
      alt={`${user.username}'s profile picture`} 
      src={user.profileImageUrl} 
      className="w-12 h-12 rounded-full" 
      width={48} 
      height={48}
      // placeholder="blur"  
    />
    <input placeholder="Say something!" className="grow bg-transparent outline-none"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if(e.key === "Enter") {
          e.preventDefault();
          mutate({content: input});
        }
      }}
      disabled={isPosting}
    />
    {input !== "" && (
      <button 
        onClick={() => {
          mutate({content: input});
        }} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
        disabled={isPosting}
      >
        { isPosting && <LoadingSpinner/>}
        { !isPosting && "Post"}
      </button>
    )} 

  </div>
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return <div key={post.id} className="flex p-4 align-center border-b border-slate-400 gap-3">
    <Image 
      alt={`${author.username}'s profile picture`} 
      src={author.profileImageUrl} 
      className="w-8 h-8 rounded-full" 
      width={32} 
      height={32}
      // placeholder="blur" 
    />
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="">{`@${author.username}`}</span>
        <span className="p-2">·</span>
        <span className="font-thin">{`${dayjs(post.createdAt).fromNow()}`}</span>
      </div>
      {post.content}
    </div>
    
  </div>
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if(postsLoading) return <LoadingPage/>;
  
  if(!data) return <div>Something went wrong</div>;

  return (<div className="flex flex-col">
    {
      data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))
    }
  </div>);
}

const Home: NextPage = () => {

  const {isLoaded: userLoaded, isSignedIn} = useUser();

  // Start fetching asap, w react query you only have to fetch it once and it will be cached
  api.posts.getAll.useQuery();

  // dont render if both user and posts are not loaded. user loads faster.
  if(!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Circles</title> 
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full h-full md:max-w-2xl border-x border-slate-400">
          <div className="border-b border-slate-400 p-4 flex">
            { isSignedIn && 
              <CreatePostWizard/> 
            }
            { !isSignedIn &&
              <SignInButton/>
            }
          </div>

          <Feed />
          
        </div>
      </main>
    </>
  );
};

export default Home;
