import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getUserDetailed } from "~/server/helpers/filterUserForClient";




export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure.input(z.object({username: z.string()})).query(async ({ input }) => {
        const [user] = await clerkClient.users.getUserList({
            username: [input.username]
        });

        if(!user) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found"
        })

        return getUserDetailed(user);
    }),
    followUser: protectedProcedure.input(z.object({
        username: z.string()
      })).mutation(async ({ctx, input}) => {
        const followerId = ctx.userId;

        const [followee] = await clerkClient.users.getUserList({
            username: [input.username]
        });
    
        if(!followee) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found"
        }) 

        // TODO: Do something with followerId and followee to do the follow action

        return getUserDetailed(followee);
    }),
    unfollowUser: protectedProcedure.input(z.object({
        username: z.string()
      })).mutation(async ({ctx, input}) => {
        const unfollowerId = ctx.userId;

        const [unFollowee] = await clerkClient.users.getUserList({
            username: [input.username]
        });
    
        if(!unFollowee) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found"
        }) 

        // TODO: Do something with followerId and followee to do the follow action

        return getUserDetailed(unFollowee);
    }),

});
