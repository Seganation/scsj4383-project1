import prisma from "@/lib/db";
import { UsersClient } from "./UsersClient";

async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient users={users} />;
}
