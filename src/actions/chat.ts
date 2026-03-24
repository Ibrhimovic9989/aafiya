'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { encryptFields, decryptFields } from '@/lib/privacy/encryption';

export async function addChatMessage(data: {
  timestamp: number;
  role: string;
  content: string;
}) {
  const user = await getAuthUser();
  const encrypted = encryptFields({ content: data.content }, ['content']);

  const message = await prisma.chatMessage.create({
    data: {
      userId: user.id,
      timestamp: BigInt(data.timestamp),
      role: data.role,
      content: encrypted.content,
    },
  });

  return { ...message, timestamp: Number(message.timestamp), content: data.content };
}

export async function getChatHistory() {
  const user = await getAuthUser();
  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { timestamp: 'asc' },
  });
  return messages.map((m: any) => ({
    ...decryptFields(m, ['content']),
    timestamp: Number(m.timestamp),
    role: m.role as 'user' | 'assistant',
  }));
}

export async function clearChatHistory() {
  const user = await getAuthUser();
  await prisma.chatMessage.deleteMany({ where: { userId: user.id } });
}
