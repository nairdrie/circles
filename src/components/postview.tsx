import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";
import Link from "next/link";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return <Link href={`/post/${post.id}`}>
    <div className="flex p-4 align-center border-b border-slate-400 gap-4">
      { author.profileImageUrl && 
        <Link href={`/@${author.username}`}>
          <Image 
            alt={`${author.username ? author.username : "Someone"}'s profile picture`} 
            src={author.profileImageUrl} 
            className="w-12 h-12 rounded-full" 
            width={48} 
            height={48}
            // placeholder="blur" 
          />
        </Link>
      }
      { !author.profileImageUrl &&
        <div className="w-8 h-8 rounded-full bg-gray-400"></div>
      }
      <div className="flex flex-col">
        <div className="flex items-center">
          <Link href={`/${author.username}`}><span className="font-bold">{`${author.displayName}`}</span></Link>
          <span className="p-2">·</span>
          <span className="font-thin">{`${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        {post.content}
      </div>
      
    </div>
  </Link>
}