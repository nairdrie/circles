import { type NextPage } from "next";
import Head from "next/head";
import React from "react";

const SinglePostPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Post</title> 
      </Head>
      <main className="flex justify-center h-screen">
        <div>
          Post
        </div>
      </main>
    </>
  );
};

export default SinglePostPage;
