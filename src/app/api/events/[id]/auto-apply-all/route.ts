import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST /api/events/[id]/auto-apply-all
export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Support Next.js dynamic API params extraction (async)
  const { id: eventId } = await params;
  try {
    // Récupère tous les utilisateurs
    const users = await prisma.user.findMany();
    const added: string[] = [];
    for (const user of users) {
      const participant = await prisma.participant.upsert({
        where: { eventId_userId: { eventId, userId: user.id } },
        update: {},
        create: { eventId, userId: user.id },
      });
      // Log le nom de l'utilisateur ajouté
      if (participant && user.name) {
        // eslint-disable-next-line no-console
        console.log(`Ajouté: ${user.name}`);
        added.push(user.name);
      }
    }
    return NextResponse.json({ success: true, added });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur serveur" }, { status: 500 });
  }
}
