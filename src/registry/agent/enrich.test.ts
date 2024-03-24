import assert from 'node:assert';
import { describe, it } from 'node:test';

import { enrichCell } from '@/registry/agent/enrich';

const content = [
  {
    reason:
      'The text between these markers discusses the Acer Swift 5, which is a top MacBook Air alternative for professionals in 2024.',
    title: 'Acer Swift 5',
    text: "Image 1 of 5\n(Image credit: Tom's Guide)\nThe best MacBook Air alternative\n### Specifications\nDisplay: 14-inch WQXGA (2,560 x 1,600) touchscreen\nCPU: Intel Core i7-1260P\nGPU: Intel Iris Xe Graphics\nRAM: 16GB\nStorage: 1TB SSD\nWeight: 2.65 pounds\n### Reasons to buy\n+\nDazzling design\n+\nGorgeous display\n+\nPlenty of power\n+\nSuper speedy SSD\n### Reasons to avoid\n\\-\nLots of bloatware\n\\-\nSpeakers just OK\nBuy it if\n**✅ You love 1600p resolution:** The Swift 5 is a great all-rounder, but one thing that sets it apart is its unique 2,560 x 1,600 display. That's effectively the 16:10 equivalent to 1440p, and if you love the idea of a taller, higher-res display on your Windows laptop this is one of the few to deliver it.\n**✅ You want a MacBook Air M2 competitor for less:** Acer gave the 2022 Swift 5 a smart redesign and a component upgrade that helps it rival premium ultraportables like Apple's MacBook Air or Dell's XPS 13, but the Swift 5 costs a bit less than either.\nDon't buy it if:\n**❌ You want to play a lot of games:** The beautiful 1600p display makes what you do on the Swift 5 look great, but you won't be doing a lot of high-intensity gaming with just an Intel CPU and no discrete GPU.\n**❌ You hate bloatware:** Almost every new PC comes with some software pre-installed, but Acer really takes it up a notch. You’ll find unnecessary apps like Booking. com, Simple Mahjong, Planet9 Link, Aura Privacy, ExpressVPN, Forge of Empires, and other programs that aren’t part of a vanilla Windows 11 install on a new Swift 5, which is a hassle to clear out.\nThe bottom line\n💻 **The Acer Swift 5**, with its great 1600p display, fast SSD, a great design — and a good price — represents a very strong value compared to similarly-specced competitors. Those looking for a productivity notebook will especially appreciate its 16:10 display, which makes it easier to view documents and spreadsheets. However, it's not an ideal gaming platform, and its battery life could be better.\n**What you need to know**\nThe Acer Swift 5 (2022) is a svelte Windows laptop sporting a slick design, a gorgeous 1600p display and a speedy enough 12th-gen Intel chip onboard to get you through a day of work. It’s also cheaper than its chief rivals when comparably equipped.\nWhile this laptop has some flaws, it's a great machine that delivers a lot of value for its sub-$2k price tag.\n**Design:** While older Swift 5 laptops looked pretty generic, the 2022 model has a beautiful design with eye-catching edges decked out in a double-anodized gold treatment.\nMeasuring 12.2 x 8.4 x 0.59 inches and weighing just 2.65 pounds, the Acer Swift 5 is thicker than Apple's MacBook Air but also a hair lighter. The Acer Swift 5 feels sturdy despite its light weight thanks to its resilient aluminum chassis, and our review unit had a beautiful diamond pattern traced on it in gold lines that are as thin as a human hair, according to Acer.\n**Display:** The Acer Swift 5’s 14-inch panel looks beautiful, and its WQXGA resolution (2560x1600, or 1600p) ensures it can deliver more pixels on-screen than more traditional 1080p or 1440p laptop displays.\nThe display offers a 16:10 aspect ratio, and in our testing the big, wide screen was easy to digest at a glance and made the games and movies we watched on it look great.\n**Performance:** The Acer Swift 5 is plenty speedy thanks to its Intel CPU and 16GB of RAM. While this machine can't achieve the same speeds as other, more expensive laptops on this list, like the M3 MacBook Pro, it's plenty powerful enough for getting work done.\nAnd while you shouldn't expect to play the latest and greatest games at max settings on this laptop, less demanding games like [Fortnite](https://www.tomsguide.com/tag/fortnite), Rocket League, and League of Legends can be enjoyed for hours with decent-looking graphics courtesy of the laptop's integrated Intel Iris Xe graphics chipset.\n**Battery life:** Sadly, we've hit the one disappointing point in this otherwise glowing overview. While the Acer Swift 5 is a stunning little Windows laptop that's plenty good enough for what it costs, the fact that it barely lasted over 11 hours in our battery test was a little disappointing.\nDon't get me wrong, it's still longer-lasting than most Windows laptops, including a few on this list. But our battery test is done under controlled conditions with the screen kept quite dim, and in the real world when you're perhaps using it in the bright sun or playing games on it, it will last a lot less time. In our review we noticed that using the laptop normally at max brightness caused it to conk out in about 5 hours, which is disappointing. Thankfully, it does charge quickly.\n**Read the full review:** [Acer Swift 5 (2022)](https://www.tomsguide.com/reviews/acer-swift-5-2022)",
    sources: [
      {
        title: 'Best laptops 2024 tested — find the best laptop for you',
        url: 'https://www.tomsguide.com/best-picks/best-laptops',
      },
    ],
  },
];

describe('aggregateContent', () => {
  it('Should find the correct answer in laptop based on content', async () => {
    const answer = await enrichCell({
      query: 'Acer Swift 5 - Price - The price of the laptop',
      content,
    });
    console.log('Answer', answer);
    assert(answer.confidence === 1);
  });

  it('Should research topic without content', async () => {
    const answer = await enrichCell({
      query: 'OpenAI - Market Cap',
      content: [],
    });
    console.log('Answer', answer);
    assert(answer.confidence === 1);
  });
});
