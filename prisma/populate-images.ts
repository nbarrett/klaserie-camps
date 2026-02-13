import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function fetchWikipediaThumbnail(name: string): Promise<string | null> {
  const encoded = encodeURIComponent(name.replace(/ /g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as { thumbnail?: { source?: string } };
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const allSpecies = await prisma.species.findMany({
    orderBy: { commonName: "asc" },
  });
  const species = allSpecies.filter((s) => !s.imageUrl);

  console.log(`Found ${species.length} species without images`);

  let success = 0;
  let failed = 0;

  for (const s of species) {
    const imageUrl = await fetchWikipediaThumbnail(s.commonName);

    if (imageUrl) {
      await prisma.species.update({
        where: { id: s.id },
        data: { imageUrl },
      });
      success++;
      console.log(`[${success + failed}/${species.length}] ${s.commonName} -> found`);
    } else {
      failed++;
      console.log(`[${success + failed}/${species.length}] ${s.commonName} -> not found`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\nDone: ${success} images found, ${failed} not found`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
