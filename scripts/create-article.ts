import { PrismaClient, ArticleType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const article = await prisma.article.create({
    data: {
      title: "Hull City 3-1 Sheffield Wednesday: Key moments punish Owls at MKM",
      content: "Hull City 3–1 Sheffield Wednesday\\n\\nChampionship | Saturday 21 March | MKM Stadium | 15:00 GMT\\n\\nSheffield Wednesday were beaten 3–1 by Hull City at the MKM Stadium, despite taking a deserved first-half lead in a game that ultimately turned on key moments.\\n\\nWednesday’s positive start was rewarded on 23 minutes. An initially harmless ball into the Hull penalty area caused confusion, and Jamal Lowe capitalised, wriggling through before poking past Ivor Pandur to give the Owls the lead.\\n\\nIt reflected a confident opening spell, with Wednesday composed in possession and carrying a genuine attacking threat.\\n\\nHowever, the lead lasted just 94 seconds. Hull responded immediately as Kyle Joseph found space on the right and delivered a low cross into the box, where Matt Crooks arrived perfectly to tap home from close range.\\n\\nThat quickfire equaliser shifted momentum and lifted the home side.\\n\\nWednesday regained composure after the equaliser and were arguably the stronger side for large parts of the half, but the game turned just before the break.\\n\\nDeep into first-half stoppage time, Paddy McNair’s free-kick caused problems in the box, and Dominic Iorfa could only divert the ball into his own net under pressure, handing Hull the lead.\\n\\nInstead of going in level, Wednesday went into the interval trailing.\\n\\nHull took full control in the second half and effectively ended the contest on 57 minutes. After winning possession, Kyle Joseph combined with Oli McBurnie before side-footing into the bottom corner to make it 3–1.\\n\\nFrom that point, the game was largely settled, with Hull able to manage proceedings and see out the result comfortably.\\n\\nWednesday showed they could compete, particularly in the first half, but conceding immediately after scoring and again just before the break proved costly.\\n\\nAt this level, those moments define outcomes. Hull were clinical when it mattered, while Wednesday were left to reflect on a game that slipped away despite a strong start.\\n\\nVerdict: A frustrating afternoon for Wednesday, who showed promise but were undone by key moments and Hull’s clinical edge.",
      excerpt:
        "Wednesday started brightly and took the lead, but Hull punished key moments to claim a 3-1 win at the MKM Stadium.",
      slug: "hull-city-3-1-sheffield-wednesday-key-moments-punish-owls",
      published: true,
      authorId: 1,
      articleType: ArticleType.match_report,
      matchId: "hull-v-wednesday-2026-03-21",
      matchDate: "2026-03-21",
      opponent: "Hull City",
      competition: "Championship",
      isHero: true,
    },
  });

  console.log("Article created:", article);
}

main()
  .catch((e) => {
    console.error("Failed to create article:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });