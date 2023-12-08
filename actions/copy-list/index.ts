"use server";

import { auth } from "@clerk/nextjs";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CopyList } from "./schema";

const handler = async(data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();
    
    if (!userId || !orgId) {
        return {
            error: "Unauthorized"
        };
    }

    const { id, boardId } = data;
    let list;

    try {
        const listToCopy = await db.list.findUnique({
            where: {id, boardId, board: { orgId }},
            include: { cards: true}
        });
        if (!listToCopy) {
            return { error: "List not found"};
        }
        const lastList = await db.list.findFirst({
            where: { boardId },
            orderBy: { order: "desc" },
            select: { order: true }
        })
        const newOrder = lastList ? lastList.order + 1 : 1;
        let cardsQuery = {};
        if (listToCopy.cards.length === 1) {
            const c = listToCopy.cards[0];
            cardsQuery = {
                create: {
                    title: c.title,
                    description: c.description,
                    order: c.order,
                }
            }
        }
        if (listToCopy.cards.length > 1) {
            cardsQuery = {
                createMany: {
                    data: listToCopy.cards.map((card) => ({
                        title: card.title,
                        description: card.description,
                        order: card.order
                    })),
                },
            };
        }
        list = await db.list.create({
            data: {
                boardId: listToCopy.boardId,
                title: `${listToCopy.title} - Copy`,
                order: newOrder,
                cards: cardsQuery,
            },
            include: {
                cards: true
            }
        });
    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy. " + error
        }
    }

    revalidatePath(`/board/${boardId}`);
    return { data: list };
}

export const copyList = createSafeAction(CopyList, handler);