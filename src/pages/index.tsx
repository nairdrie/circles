import { type NextPage } from "next";
import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import React from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

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
      else if (e.shape?.message) toast.error(e.shape.message);
      else toast.error("Something went wrong. Please try again later.");
      // toast.error("Something went wrong. Please try again later.");
    }
  });

  if(!user) return null;

  return <div className="flex gap-3 w-full">
    <Image 
      alt={`${user.username ? user.username : "Someone"}'s profile picture`} 
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
      <PageLayout>
        <div className="border-b border-slate-400 p-4 flex">
        { isSignedIn && 
              <CreatePostWizard/> 
            }
            { !isSignedIn &&
              <SignInButton/>
            }
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
