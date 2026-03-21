import { PrismaClient, ArticleType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const author = await prisma.user.upsert({
    where: { email: "editor@wawawnews.com" },
    update: {},
    create: {
      email: "editor@wawawnews.com",
      name: "WAWAW News",
    },
  });

  const articles = [
    {
      title: "Match Preview: Hull City v Sheffield Wednesday",
      slug: "match-preview-hull-city-v-sheffield-wednesday",
      excerpt:
        "Sheffield Wednesday travel to the MKM Stadium this weekend to face a Hull City side firmly in the hunt for a Championship play-off place.",
      content: `Match Preview: Hull City v Sheffield Wednesday\n\nChampionship | Saturday 21 March | MKM Stadium | 15:00 GMT\n\nSheffield Wednesday travel to the MKM Stadium this weekend to face a Hull City side firmly in the hunt for a Championship play-off place.\n\nFor the Owls, the equation is different. With the season drawing to a close, the focus is on performances, pride, and building momentum for what comes next. But that doesn’t mean Wednesday will roll over—far from it. There’s an opportunity here to frustrate a side under real pressure.\n\nHull come into this fixture needing a response after a 3-0 defeat to West Bromwich Albion, a game that was effectively over after an early red card. That result has tightened the play-off race and increased the stakes heading into this one. The Tigers know they cannot afford any slip-ups, especially at home.\n\nThat urgency could play into Wednesday’s hands.\n\nHull are expected to set up in an attacking shape, with Joe Gelhardt and Lewis Koumas supporting Oliver McBurnie in forward areas. In midfield, Matt Crooks and Regan Slater provide physicality and presence, while the defence is likely to include experienced operators such as John Egan and Patrick McNair.\n\nThere is clear quality throughout the Hull side, but recent inconsistency and lapses in discipline suggest they can be got at.\n\nWednesday, meanwhile, are expected to field a side that blends youth and experience. Pierce Charles is likely to start in goal, with Dominic Iorfa and Liam Palmer forming part of the defensive unit. There could also be opportunities for younger players to step in and impress.\n\nIn midfield, energy and work rate will be key, with players like Svante Ingelsson and Jarvis Thornton expected to play important roles. Going forward, Jamal Lowe and Jerry Yates offer attacking threat, particularly on the counter.\n\nThe key battle will likely be in midfield. Hull will try to impose themselves physically and control possession, but if Wednesday can stay compact and disciplined, there may be chances to break and exploit space.\n\nAnother important factor will be how Wednesday handle Hull’s wide threats. With wing-backs likely to be used, defensive awareness and positioning will be crucial to avoid being stretched.\n\nUltimately, this game may come down to efficiency in front of goal. Wednesday may not create a high volume of chances, so taking one when it comes could be decisive.\n\nOn paper, Hull are favourites. They have more to play for, greater depth, and home advantage. But football rarely sticks to the script, and pressure can shift momentum quickly.\n\nFor Wednesday, this is about showing fight, continuing to develop, and reminding everyone that they are still capable of competing at this level.\n\nPrediction: Hull City 2–1 Sheffield Wednesday\n\nA tough test, but one where a disciplined and committed performance could make things far more uncomfortable for the hosts than they might expect.`,
      published: true,
      articleType: ArticleType.match_preview,
      matchDate: "2026-03-21",
      opponent: "Hull City",
      competition: "Championship",
      isHero: true,
    },
    {
      title: "David Storch: The Man Set to Reshape Sheffield Wednesday?",
      slug: "david-storch-the-man-set-to-reshape-sheffield-wednesday",
      excerpt:
        "Sheffield Wednesday’s long-running takeover saga may finally be nearing its conclusion — and at the centre of it all is American businessman David Storch.",
      content: `David Storch: The Man Set to Reshape Sheffield Wednesday?\n\nSheffield Wednesday’s long-running takeover saga may finally be nearing its conclusion — and at the centre of it all is American businessman David Storch, a figure who is quickly becoming one of the most talked-about names in the club’s modern history.\n\nAfter months of uncertainty, failed bids, and financial turmoil, Storch and his consortium — Arise Capital Partners — have emerged as the preferred bidders to take control at Hillsborough.\n\nAnd for a fanbase that has endured one of the darkest periods in the club’s history, there are genuine signs of cautious optimism.\n\nWho is David Storch?\n\nStorch is a seasoned American businessman, best known as the former CEO of aviation giant AAR Corp and founder of investment firm Arise Capital Partners.\n\nHe is part of a consortium that includes:\n\n- His son, Michael Storch\n- Investor Tom Costin (with experience in multi-club ownership models)\n\nThis isn’t his first look at English football either — Storch has previously explored opportunities at clubs like Reading and Blackpool, suggesting a long-standing interest in the game.\n\nBut it’s Sheffield Wednesday that appears to have truly captured his attention.\n\nWhy Sheffield Wednesday?\n\nIn his early interviews, Storch has been clear: this isn’t just a financial play.\n\nHe has spoken openly about being struck by the atmosphere, energy, and loyalty of the fanbase, even during a season where relegation and points deductions were all but confirmed.\n\nThat matters.\n\nBecause for a club like Wednesday, identity isn’t a marketing slogan — it’s the foundation. And by all accounts, Storch seems to understand that.\n\nWhere the Deal Stands\n\nRight now, things are moving in the right direction.\n\n- Storch’s group have already held positive talks with the EFL, with no major red flags raised in initial discussions\n- He has visited Sheffield, meeting players and staff\n- The consortium is undergoing the standard Owners’ and Directors’ Test\n\nThere are still hurdles to clear — and this is Sheffield Wednesday, so nothing is ever straightforward — but momentum is clearly building.\n\nA completion timeline around early May has been suggested, though that could shift depending on approvals.\n\nThe Reality: A Club in Need of Rebuild\n\nLet’s not sugarcoat it — whoever takes over inherits a mess.\n\n- Administration and severe financial issues\n- A likely 15-point deduction next season\n- Transfer restrictions and wage limits\n- A depleted squad and outdated infrastructure\n\nThis isn’t a quick fix. It’s a full rebuild.\n\nReports suggest the club may require significant long-term investment — potentially upwards of £100 million — to return to stability and competitiveness.\n\nStorch’s Vision: Why Fans Are Encouraged\n\nThis is where things get interesting.\n\nFrom what’s been shared so far, Storch’s approach appears to centre around:\n\n1. Protecting the club’s heritage\nThere’s been a clear emphasis on respecting Wednesday’s identity, history, and fan culture — something supporters have been desperate to hear.\n\n2. Building sustainably\nNot a short-term gamble, but a structured, long-term rebuild focused on financial stability.\n\n3. Investment in infrastructure\nTraining facilities, the stadium, and operational foundations are all expected to be key priorities.\n\n4. Youth development\nA shift toward developing talent rather than relying purely on transfers — a model that successful modern clubs are built on.\n\nIt’s early days, but the tone is right — and after recent years, that alone is a step forward.\n\nWhy This Feels Different\n\nWednesday fans have heard promises before. That’s the reality.\n\nBut there are a few reasons this situation feels different:\n\n- The EFL engagement has been smoother than previous failed bids\n- Storch’s messaging has been measured, not flashy\n- There’s a clear acknowledgment of the scale of the challenge\n\nMost importantly — he doesn’t appear to be underestimating what Sheffield Wednesday is.\n\nThe Bottom Line\n\nNothing is done yet. And until the ink is dry, caution is justified.\n\nBut for the first time in a long time, there’s a sense that Sheffield Wednesday might finally be moving toward stability, structure, and a genuine rebuild.\n\nIf the deal goes through, David Storch won’t just be buying a football club.\n\nHe’ll be taking on one of the biggest restoration projects in English football.\n\nAnd if he gets it right — properly right — he won’t just own Wednesday.\n\nHe’ll be remembered for bringing it back to life.`,
      published: true,
      articleType: ArticleType.feature,
      competition: "Championship",
      isHero: false,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        published: article.published,
        articleType: article.articleType,
        matchDate: article.matchDate ?? null,
        opponent: article.opponent ?? null,
        competition: article.competition ?? null,
        isHero: article.isHero,
        authorId: author.id,
      },
      create: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        slug: article.slug,
        published: article.published,
        articleType: article.articleType,
        matchDate: article.matchDate ?? null,
        opponent: article.opponent ?? null,
        competition: article.competition ?? null,
        isHero: article.isHero,
        authorId: author.id,
      },
    });
  }

  console.log(`Seeded ${articles.length} manual articles`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });