import { clerkClient, type User } from "@clerk/nextjs/dist/api";
import { prisma } from "../db";

export const getUserCondensed = (user: User) => {
    return {
        id: user.id,
        username: user.username || "Anonymous",
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        displayName: getDisplayName(user)
    }
}

export const getUserDetailed = async (user: User) => {
    const FOLLOW_PREVIEW_LENGTH = 5;

    // GET FOLLOWER INFO
    const followerIds = (await prisma.follower.findMany({
        where: {
            followingId: user.id
        }
    })).map((follower) => follower.followerId);
    
    const isFollowing = followerIds.includes(user.id);

    const followersPreview = (
        await clerkClient.users.getUserList({
            userId: followerIds,
            limit: FOLLOW_PREVIEW_LENGTH
        })
    ).map(getUserCondensed);

    // GET FOLLOWING INFO
    const followingIds = (await prisma.follower.findMany({
        where: {
            followerId: user.id
        }
    })).map((following) => following.followingId);

    const isFollowedBy = followingIds.includes(user.id);

    const followingPreview = (
        await clerkClient.users.getUserList({
            userId: followingIds,
            limit: FOLLOW_PREVIEW_LENGTH
        })
    ).map(getUserCondensed);


    return {
        id: user.id,
        username: user.username || "Anonymous",
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        displayName: getDisplayName(user),
        followingPreview,
        followersPreview,
        isFollowing,
        isFollowedBy,
        numFollowers: followerIds.length,
        numFollowing: followingIds.length
    }
}

const getDisplayName = (user: User) => {
    if(user.firstName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
}
