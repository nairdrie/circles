import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import type { Post } from "@prisma/client";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const addUserDataToPosts = async (posts: Post[]) => {
    const users = (
        await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorId),
            limit: 100
        })
    ).map(filterUserForClient);

    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);
        if(!author) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author not found"
        });

        return {
            post,
            author
        };
    });
}

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"),
})

export const postsRouter = createTRPCRouter({
    
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
        take: 100,
        orderBy: {
            createdAt: "desc"
        }
    });

    return addUserDataToPosts(posts);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findUnique({
            where: {
                id: input.id
            }
        });

        if(!post) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found"
        });

        return (await addUserDataToPosts([post]))[0];
    }),


  getPostsByUserId: publicProcedure
    .input(
        z.object({
            userId: z.string()
        })
    )
    .query( ({ctx, input}) => 
        ctx.prisma.post.findMany({
            where: {
                authorId: input.userId
            },
            orderBy: {
                createdAt: "desc"
            }
        }).then(addUserDataToPosts)
    ),

  create: protectedProcedure.input(z.object({
    content: z.string().min(1, "Too short").max(280, "Too long")
  })).mutation(async ({ctx, input}) => {
    const authorId = ctx.userId;

    const { success } = await ratelimit.limit(authorId);

    if(!success) throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Slow down!"
    });
    
    
    const post = await ctx.prisma.post.create({
        data: {
            authorId,
            content: input.content,
        },
    });

    return post;

  })

});
