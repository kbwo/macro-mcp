import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./schema";

export async function createUser(name: string, email: string) {
    return await db.transaction(async(tx) => {
    await tx.insert(users).values({
        name,
        email,
        age: 18,
    })
    // for testing
    return await tx.select().from(users).where(eq(users.name, name));
    })
}

export async function updateUserEmail(id: number, email: string) {
    return await db.transaction(async(tx) => {
    return await tx.update(users)
        .set({ email })
        .where(eq(users.id, id))
        .returning();
    })
}

export async function deleteUser(id: number) {
    return await db.transaction(async(tx) => {
    return await tx.delete(users)
        .where(eq(users.id, id));
    })
}
