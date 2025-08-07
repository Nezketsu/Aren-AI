export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    // Supprime l'événement et ses participants
    await prisma.participant.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}
