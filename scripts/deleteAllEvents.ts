// scripts/deleteAllEvents.ts
// Usage: npx tsx scripts/deleteAllEvents.ts

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

function confirm(prompt: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'yes');
        });
    });
}

async function main() {
    const ok = await confirm('Are you sure you want to delete ALL events? Type "yes" to confirm: ');
    if (!ok) {
        console.log('Aborted.');
        return;
    }
    const deletedParticipants = await prisma.participant.deleteMany({});
    console.log(`Deleted ${deletedParticipants.count} participants.`);
    const deletedEvents = await prisma.event.deleteMany({});
    console.log(`Deleted ${deletedEvents.count} events.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
