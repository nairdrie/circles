import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import React from "react";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postview";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { toast } from "react-hot-toast";

const ProfileFeed = (props: {userId: string}) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId
  });

  if(isLoading) return <LoadingPage />;

  if(!data || data.length == 0) return <div>Nothing to show</div>;

  return <div className="flex flex-col">
    {data.map((fullPost) => <PostView key={fullPost.post.id} {...fullPost} />)}
  </div>
}
  

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({
    username
  });

  const {mutate: mutateFollow, isLoading: isFollowing} = api.profile.followUser.useMutation({
    onSuccess: () => {
      // TODO: WHAT DO ON SUCCESS? HOW DO WE GET THE NEW USER DATA TO UPDATE THE PAGE (NEW FOLLOW STATUS)?
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]) toast.error(errorMessage[0]);
      else if (e.shape?.message) toast.error(e.shape.message);
      else toast.error("Something went wrong. Please try again later.");
    }
  });
  // TODO: Use this in the page, show the different button based on the new isFollowing from user.
  const {mutate: mutateUnfollow, isLoading: isUnfollowing} = api.profile.unfollowUser.useMutation({
    onSuccess: () => {
      // TODO: WHAT DO ON SUCCESS? HOW DO WE GET THE NEW USER DATA TO UPDATE THE PAGE (NEW FOLLOW STATUS)?
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]) toast.error(errorMessage[0]);
      else if (e.shape?.message) toast.error(e.shape.message);
      else toast.error("Something went wrong. Please try again later.");
    }
  });

  if(!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{ data.username }</title> 
      </Head>
      <PageLayout>
        <div>
          <Image
            src={data.profileImageUrl} 
            alt={`${data.username ?? ""}'s profile picture`} 
            width={128} 
            height={128} 
            className="m-4 rounded-full w-32 h-32 "
          />
        </div>
        <div>
          <div>
            <div className="p-4 text-2xl font-bold pb-0">
            {`${data.displayName}`}
            </div>
            <div className="p-4 text-2xl text-slate-600 pt-0">
              {`@${data.username}`}
            </div>
          </div>
          <div>
          <button 
            onClick={() => {
              mutateFollow({ username: data.username});
            }} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
            disabled={isFollowing}
          >
            { isFollowing && <LoadingSpinner/>}
            { !isFollowing && "Follow"}
          </button>
          </div>
        </div>
        <div className="border-b border-slate-400 w-full">
          <ProfileFeed userId={data.id}/>
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const username = context.params?.username;

  if(typeof username !== "string") throw new Error("no username");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  }
};

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"}
}

export default ProfilePage;
