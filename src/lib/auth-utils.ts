import { auth } from "@/auth";

export async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
}

export async function getAuthUserOptional() {
  const session = await auth();
  return session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null } | null;
}
