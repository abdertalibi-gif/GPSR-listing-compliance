"use server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function registerAction(data: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input", issues: parsed.error.flatten() };
  const { firstName, lastName, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password: hashed,
    },
  });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "USER_REGISTERED", entity: "User", entityId: user.id },
  });
  await prisma.notification.create({
    data: { userId: user.id, title: "Welcome to GPSR Listing Compliance", message: "Your account was created. Start by adding your first product and running a GPSR Listing Check.", type: "SYSTEM" },
  });
  return { success: true };
}
