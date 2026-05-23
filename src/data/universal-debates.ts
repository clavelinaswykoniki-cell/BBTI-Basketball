// ─────────────────────────────────────────────────────────────
// Universal Debate Templates — Works for ANY Two Players
// ─────────────────────────────────────────────────────────────
//
// NOTE: The DebateTopic interface uses `kobe` and `lebron` field names.
// In custom matchups, `kobe` slot holds playerA's content,
// `lebron` slot holds playerB's content.
// Same convention used by curry-vs-durant and all other matchups.
//
// All debate content in Chinese; code/comments in English.

import type { DebateSide, DebateTopic } from "./debates";
import type { Player } from "./player-database";

// ─────────────────────────────────────────────────────────────
// Helpers — stat formatting and comparison logic
// ─────────────────────────────────────────────────────────────

/** Pick a random item from an array (deterministic per pair for consistency). */
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/** Simple string hash for deterministic randomness per player pair. */
function pairSeed(a: string, b: string): number {
  let h = 0;
  const s = a + b;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}

function ringText(n: number): string {
  if (n === 0) return "0枚戒指";
  return `${n}枚总冠军戒指`;
}

function mvpText(n: number): string {
  if (n === 0) return "0个MVP";
  return `${n}个MVP`;
}

function fmvpText(n: number): string {
  if (n === 0) return "0个FMVP";
  return `${n}个FMVP`;
}

function statLine(p: Player): string {
  return `场均${p.stats.ppg}分${p.stats.rpg}板${p.stats.apg}助`;
}

/** Truncate a quote with ellipsis only if it exceeds max length. */
function shortQuote(q: string, max: number): string {
  return q.length > max ? q.slice(0, max) + "..." : q;
}

/** Format honors into a compact brag string. */
function honorsBrag(p: Player): string {
  const parts: string[] = [];
  if (p.stats.rings > 0) parts.push(`${p.stats.rings}冠`);
  if (p.stats.mvps > 0) parts.push(`${p.stats.mvps}MVP`);
  if (p.stats.fmvps > 0) parts.push(`${p.stats.fmvps}FMVP`);
  if (p.stats.allStar > 0) parts.push(`${p.stats.allStar}次全明星`);
  return parts.join("+") || "零荣誉";
}

/** Compare a numeric stat, returning who's ahead and the diff. */
function compareNum(a: number, b: number): "a" | "b" | "tie" {
  if (a > b) return "a";
  if (b > a) return "b";
  return "tie";
}

// ─────────────────────────────────────────────────────────────
// Template interface
// ─────────────────────────────────────────────────────────────

export interface UniversalDebateTemplate {
  id: string;
  title: string;
  emoji: string;
  generateDebate: (playerA: Player, playerB: Player) => DebateTopic;
}

// ─────────────────────────────────────────────────────────────
// 7 Main Templates + 1 Bonus Template
// ─────────────────────────────────────────────────────────────

const templateDominance: UniversalDebateTemplate = {
  id: "dominance",
  title: "统治力",
  emoji: "👑",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id);
    const aControversy = pick(b.controversies, seed);
    const bControversy = pick(a.controversies, seed + 1);

    const sideA: DebateSide = {
      claim: `${a.nameCN}在${a.era}就是联盟的绝对统治者——${statLine(a)}，${honorsBrag(a)}。${b.nameCN}？${aControversy}`,
      points: [
        `${a.stats.allStar}次全明星+${a.stats.allNBA}次最佳阵容——${a.era}的联盟就是${a.nicknameCN}的联盟，${b.nameCN}在同时代能抢到几个名额？`,
        `${pick(a.achievements, seed)}——这种级别的统治力，${b.nameCN}做到过吗？`,
        `${a.nameCN}代表的是「${a.philosophicalAngle.split("——")[0]}」，${b.nameCN}的篮球哲学是什么？${pick(b.controversies, seed + 2)}？`,
      ],
      punchline: `${a.era}属于${a.nicknameCN}。${b.nameCN}？他只是那个时代的配角。`,
    };

    const sideB: DebateSide = {
      claim: `${b.nameCN}的统治力才叫真统治——${statLine(b)}，${honorsBrag(b)}。别拿${a.nicknameCN}来碰瓷。${bControversy}`,
      points: [
        `${b.stats.allStar}次全明星+${b.stats.allNBA}次最佳阵容——论持续统治力，${a.nameCN}差了一个档次`,
        `${pick(b.achievements, seed)}——${a.nameCN}有什么能拿出来比的？`,
        `${b.style.split("。")[0]}——这才叫统治。${a.nameCN}的风格？${pick(a.controversies, seed + 3)}`,
      ],
      punchline: `统治力看的是让对手绝望。${b.nicknameCN}让全联盟绝望。${a.nicknameCN}让谁绝望了？`,
    };

    return {
      id: `custom-dominance-${a.id}-vs-${b.id}`,
      title: "统治力",
      emoji: "👑",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

const templateChampionships: UniversalDebateTemplate = {
  id: "championships",
  title: "冠军与荣誉",
  emoji: "💍",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id) + 100;

    // Dynamic claims based on ring count comparison
    const ringsCompare = compareNum(a.stats.rings, b.stats.rings);
    const mvpCompare = compareNum(a.stats.mvps, b.stats.mvps);

    const aRingClaim = a.stats.rings > 0
      ? `${ringText(a.stats.rings)}，每一枚都是真金白银打出来的`
      : `没有戒指不代表不伟大——${pick(a.achievements, seed)}`;

    const bRingClaim = b.stats.rings > 0
      ? `${ringText(b.stats.rings)}，这才是冠军底蕴`
      : `戒指论是最懒的评价方式——${pick(b.achievements, seed)}`;

    const sideA: DebateSide = {
      claim: `${a.nameCN}：${aRingClaim}。${mvpText(a.stats.mvps)}+${fmvpText(a.stats.fmvps)}——${b.nameCN}拿什么比？`,
      points: [
        ringsCompare === "a"
          ? `${a.stats.rings}冠 vs ${b.stats.rings}冠——戒指数量碾压，还有什么好争的？`
          : ringsCompare === "tie" && a.stats.rings > 0
            ? `同样${a.stats.rings}冠，但${a.nameCN}的冠军含金量更高——${pick(a.achievements, seed + 1)}`
            : ringsCompare === "tie" && a.stats.rings === 0
              ? `都是0冠？那就看谁离冠军更近——${pick(a.achievements, seed + 1)}`
              : `戒指少不代表差——${a.nameCN}的${mvpText(a.stats.mvps)}证明个人实力碾压。${b.nameCN}${b.stats.rings}冠有几个是自己扛的？`,
        mvpCompare === "tie" && a.stats.mvps === 0
          ? `都没MVP？那就比全明星——${a.stats.allStar}次全明星vs${b.stats.allStar}次，${a.nicknameCN}的存在感碾压`
          : mvpCompare === "a" || mvpCompare === "tie"
            ? `${mvpText(a.stats.mvps)}——联盟最有价值球员的认证，${b.nameCN}只有${b.stats.mvps}个`
            : `${a.stats.allStar}次全明星证明${a.nicknameCN}的持续统治力，MVP投票不代表一切`,
        `${pick(a.achievements, seed + 2)}——这种级别的荣誉，${b.nicknameCN}望尘莫及`,
      ],
      punchline: a.stats.rings >= b.stats.rings
        ? `荣誉簿摆在那里。${a.nicknameCN}的履历表比${b.nicknameCN}厚了一倍。`
        : `冠军靠的是团队。个人荣誉才是真本事。${a.nicknameCN}的含金量不是戒指能衡量的。`,
    };

    const sideB: DebateSide = {
      claim: `${b.nameCN}：${bRingClaim}。${mvpText(b.stats.mvps)}+${fmvpText(b.stats.fmvps)}——${a.nameCN}的荣誉柜只有灰尘。`,
      points: [
        ringsCompare === "b"
          ? `${b.stats.rings}冠 vs ${a.stats.rings}冠——这还用辩？戒指说话。`
          : ringsCompare === "tie" && b.stats.rings > 0
            ? `同样${b.stats.rings}冠，但${b.nameCN}的${fmvpText(b.stats.fmvps)}证明他才是核心`
            : ringsCompare === "tie" && b.stats.rings === 0
              ? `都没戒指？那就比个人荣誉——${pick(b.achievements, seed + 1)}，${a.nameCN}有吗？`
              : `${b.stats.rings}冠虽然${a.stats.rings > b.stats.rings ? "少" : "一样"}，但${pick(b.achievements, seed + 1)}——质量比数量重要`,
        mvpCompare === "tie" && b.stats.mvps === 0
          ? `都没MVP？那${b.stats.allNBA}次最佳阵容说话——${a.nameCN}几次？`
          : mvpCompare === "b" || mvpCompare === "tie"
            ? `${mvpText(b.stats.mvps)}碾压${a.nameCN}的${a.stats.mvps}个——谁是联盟老大，投票说了算`
            : `${b.stats.allNBA}次最佳阵容——不靠MVP也能证明统治力。${a.nameCN}呢？${pick(a.controversies, seed + 3)}`,
        `${pick(b.achievements, seed + 2)}——${a.nicknameCN}有这个级别的成就吗？`,
      ],
      punchline: b.stats.rings > a.stats.rings
        ? `戒指数量不会说谎。${b.nicknameCN}的手指戴不下了。${a.nicknameCN}的呢？`
        : b.stats.rings === 0 && a.stats.rings === 0
          ? `都没戒指就别比戒指了。比个人荣誉？${b.nicknameCN}完胜。`
          : `${b.nameCN}说「${shortQuote(b.quote, 20)}」——冠军不是唯一的荣誉。`,
    };

    return {
      id: `custom-championships-${a.id}-vs-${b.id}`,
      title: "冠军与荣誉",
      emoji: "💍",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

const templateSkill: UniversalDebateTemplate = {
  id: "skill",
  title: "技术水平",
  emoji: "🎨",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id) + 200;

    const sideA: DebateSide = {
      claim: `${a.nameCN}的技术水平？${a.style}——${b.nameCN}的技术能比？`,
      points: [
        `${statLine(a)}——这个全面的数据靠的是真功夫。${b.nameCN}的${statLine(b)}？${pick(b.controversies, seed)}`,
        `${pick(a.strengths, seed)}——这就是${a.nicknameCN}的核心武器，${b.nameCN}拿什么防？`,
        `${pick(a.achievements, seed + 1)}——技术的最高体现是成就。${b.nicknameCN}有对应级别的表现吗？`,
      ],
      punchline: `技术是什么？是把比赛变成你的个人秀。${a.nicknameCN}做到了。${b.nicknameCN}只是在参与。`,
    };

    const sideB: DebateSide = {
      claim: `${b.nameCN}的篮球技术才是真正的降维打击——${b.style.split("。")[0]}。${a.nameCN}？${pick(a.controversies, seed + 2)}`,
      points: [
        `${statLine(b)}——${b.nameCN}的数据是技术的最佳证明。${a.nameCN}${statLine(a)}？差距一目了然`,
        `${pick(b.strengths, seed + 1)}——这种级别的技术，${a.nicknameCN}这辈子练不出来`,
        `「${b.philosophicalAngle.split("——")[1] ?? b.philosophicalAngle}」——${b.nicknameCN}把这个哲学变成了场上的技术统治`,
      ],
      punchline: `技术花哨不等于技术好。把球放进篮筐才叫技术。${b.nicknameCN}的效率就是证据。`,
    };

    return {
      id: `custom-skill-${a.id}-vs-${b.id}`,
      title: "技术水平",
      emoji: "🎨",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

const templateClutch: UniversalDebateTemplate = {
  id: "clutch",
  title: "关键时刻",
  emoji: "🗡️",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id) + 300;

    // Find the most "clutch" achievement for each player
    const aClutchAchievement = pick(a.achievements, seed);
    const bClutchAchievement = pick(b.achievements, seed + 1);

    const sideA: DebateSide = {
      claim: `最后一投你给谁？${a.nicknameCN}。${a.stats.rings > 0 ? `${a.stats.rings}枚戒指` : `${pick(a.achievements, seed + 2)}`}不是靠关键时刻躲猫猫赢的。`,
      points: [
        `${aClutchAchievement}——关键时刻${a.nicknameCN}永远站出来。${b.nameCN}呢？${pick(b.controversies, seed)}`,
        `${pick(a.strengths, seed + 1)}——这种能力在比赛最后1分钟放大10倍。${b.nicknameCN}关键时刻靠什么？`,
        `${a.nameCN}说过「${shortQuote(a.quote, 30)}」——这就是杀手本能的来源。${b.nameCN}最关键时刻在想什么？在找空位队友？`,
      ],
      punchline: `比赛最后5秒，球在${a.nicknameCN}手里你踏实。给${b.nicknameCN}？你得先确认他想不想投。`,
    };

    const sideB: DebateSide = {
      claim: `关键球不是英雄球。${b.nameCN}在最关键的时刻做最正确的选择——${bClutchAchievement}。${a.nicknameCN}呢？关键时刻铁了叫杀手？`,
      points: [
        `${bClutchAchievement}——这才叫改变比赛走向的关键表现。${a.nameCN}有这级别的？`,
        `${pick(b.strengths, seed + 2)}——关键时刻能力不只是投篮，更是综合统治。${a.nicknameCN}的关键时刻？${pick(a.controversies, seed + 3)}`,
        `赢球才是关键球的定义。${b.nameCN}的${b.stats.rings > 0 ? `${b.stats.rings}冠` : `${pick(b.achievements, seed + 3)}`}就是最好的证明`,
      ],
      punchline: `关键球不看你投没投。看你赢没赢。${b.nicknameCN}赢了。${a.nicknameCN}呢？`,
    };

    return {
      id: `custom-clutch-${a.id}-vs-${b.id}`,
      title: "关键时刻",
      emoji: "🗡️",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

const templateLegacy: UniversalDebateTemplate = {
  id: "legacy",
  title: "历史地位",
  emoji: "🏛️",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id) + 400;

    const aHonors = honorsBrag(a);
    const bHonors = honorsBrag(b);

    const sideA: DebateSide = {
      claim: `历史地位？${a.nameCN}——${aHonors}。NBA百年之后还会被记住的名字。${b.nameCN}？${pick(b.controversies, seed)}`,
      points: [
        `${pick(a.achievements, seed)}——这种成就写进了篮球历史的教科书。${b.nameCN}有什么能进教科书的？`,
        `${a.nameCN}代表的是「${a.philosophicalAngle.split("——")[0]}」——一种篮球哲学的化身。${b.nameCN}代表什么？`,
        `${a.stats.allStar}次全明星、${a.stats.allNBA}次最佳阵容${a.stats.dpoy > 0 ? `、${a.stats.dpoy}次DPOY` : ""}——${b.nicknameCN}的履历放旁边简直是白纸`,
      ],
      punchline: `历史只记得赢家和传奇。${a.nicknameCN}两样都是。${b.nicknameCN}呢？`,
    };

    const sideB: DebateSide = {
      claim: `论历史地位，${b.nameCN}——${bHonors}——比${a.nicknameCN}高了不止一个档次。${pick(a.controversies, seed + 1)}是${a.nameCN}永远洗不掉的污点。`,
      points: [
        `${pick(b.achievements, seed + 1)}——这才是定义一个时代的级别。${a.nameCN}定义过什么时代？`,
        `${b.style.split("。")[0]}——后人讨论篮球历史的时候，${b.nicknameCN}是绕不过去的名字`,
        `${b.nameCN}说「${shortQuote(b.quote, 25)}」——这句话本身就是他历史地位的最好注脚`,
      ],
      punchline: `50年后翻篮球史书，${b.nicknameCN}是一整章。${a.nicknameCN}是一个脚注。`,
    };

    return {
      id: `custom-legacy-${a.id}-vs-${b.id}`,
      title: "历史地位",
      emoji: "🏛️",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

const templateEntertainment: UniversalDebateTemplate = {
  id: "entertainment",
  title: "观赏性",
  emoji: "🎬",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id) + 500;

    const sideA: DebateSide = {
      claim: `看${a.nicknameCN}打球就是享受——${a.style.split("。")[0]}。${b.nameCN}打球？${pick(b.controversies, seed)}，看了打瞌睡。`,
      points: [
        `${pick(a.strengths, seed)}——这种技能在球场上就是视觉盛宴。${b.nameCN}最好看的镜头是什么？`,
        `${pick(a.achievements, seed + 1)}——这种时刻被无数次回放，每次看都起鸡皮疙瘩。${b.nicknameCN}有这种名场面吗？`,
        `${a.nameCN}的球迷遍布全球——为什么？因为他打球好看到让人上瘾。${b.nameCN}的球迷？可能更多是在看数据表格`,
      ],
      punchline: `篮球是娱乐。让人买票进场的是${a.nicknameCN}。让人提前退场的是${b.nicknameCN}。`,
    };

    const sideB: DebateSide = {
      claim: `${b.nameCN}打球的观赏性是另一个维度——${b.style.split("。")[0]}。这才叫篮球艺术。${a.nicknameCN}？${pick(a.controversies, seed + 2)}`,
      points: [
        `${pick(b.strengths, seed + 1)}——看${b.nicknameCN}打球就像看大师级表演，${a.nameCN}能给你这种感觉？`,
        `${pick(b.achievements, seed + 2)}——这种历史性时刻本身就是最好的观赏。${a.nicknameCN}的高光在哪？`,
        `「${b.philosophicalAngle.split("——")[1] ?? b.philosophicalAngle}」——${b.nicknameCN}把篮球变成了艺术品。${a.nicknameCN}打球只是在完成任务`,
      ],
      punchline: `观赏性不只是扣篮和花式运球。让你看完说"原来篮球还能这么打"——这才是${b.nicknameCN}。`,
    };

    return {
      id: `custom-entertainment-${a.id}-vs-${b.id}`,
      title: "观赏性",
      emoji: "🎬",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

const templateImpact: UniversalDebateTemplate = {
  id: "impact",
  title: "影响力",
  emoji: "🌍",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id) + 600;

    const sideA: DebateSide = {
      claim: `${a.nameCN}对篮球的影响是划时代的——${pick(a.achievements, seed)}。${b.nameCN}影响了什么？${pick(b.controversies, seed + 1)}`,
      points: [
        `${a.style.split("。")[0]}——${a.nicknameCN}改变了人们理解篮球的方式。${b.nameCN}改变了什么？`,
        `全世界有多少人因为${a.nicknameCN}开始打篮球？${b.nameCN}能激励谁？`,
        `${a.nameCN}代表「${a.philosophicalAngle.split("——")[0]}」——这种精神超越了篮球本身，影响了一代人的态度。${b.nicknameCN}代表什么精神？`,
      ],
      punchline: `影响力是让后来者说"我想成为他"。全世界模仿${a.nicknameCN}的人排到月球。模仿${b.nicknameCN}的？可能凑不齐一支球队。`,
    };

    const sideB: DebateSide = {
      claim: `${b.nameCN}的影响力不止在球场——${pick(b.achievements, seed)}。${a.nameCN}呢？离开球场还剩什么？${pick(a.controversies, seed + 2)}`,
      points: [
        `${pick(b.achievements, seed + 1)}——${b.nicknameCN}对篮球运动本身的影响是革命性的`,
        `${b.nameCN}说「${shortQuote(b.quote, 25)}」——这句话激励了多少人？${a.nameCN}的名言是什么？`,
        `${b.style.split("。")[0]}——${b.nicknameCN}让全世界看到篮球可以是这样的。${a.nicknameCN}只是让人看到他自己`,
      ],
      punchline: `真正的影响力是改变游戏规则。${b.nicknameCN}改变了规则。${a.nicknameCN}只是按规则打球。`,
    };

    return {
      id: `custom-impact-${a.id}-vs-${b.id}`,
      title: "影响力",
      emoji: "🌍",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

// ── Bonus Template: Peak vs Peak ──
const templatePeakVsPeak: UniversalDebateTemplate = {
  id: "peak-vs-peak",
  title: "假如巅峰对决",
  emoji: "⚡",
  generateDebate(a: Player, b: Player): DebateTopic {
    const seed = pairSeed(a.id, b.id) + 700;

    const aEraNote = a.era.includes("-") ? a.era.split("-")[0] + "年代" : a.era;
    const bEraNote = b.era.includes("-") ? b.era.split("-")[0] + "年代" : b.era;

    const sideA: DebateSide = {
      claim: `巅峰${a.nicknameCN}——${statLine(a)}的${aEraNote}杀器。巅峰${b.nicknameCN}？来一个打一个。`,
      points: [
        `巅峰${a.nameCN}的武器：${pick(a.strengths, seed)}+${pick(a.strengths, seed + 1)}——${b.nameCN}拿什么招架？`,
        `${pick(a.achievements, seed + 2)}——这就是${a.nicknameCN}巅峰的证据。${b.nameCN}巅峰最好表现是什么？不够看`,
        `${a.nameCN}是「${a.philosophicalAngle.split("——")[0]}」的化身——巅峰对决中，${b.nicknameCN}的「${b.philosophicalAngle.split("——")[0]}」完全被克制`,
      ],
      punchline: `巅峰1v1？${a.nicknameCN}打完回家洗澡。${b.nicknameCN}打完需要去做心理辅导。`,
    };

    const sideB: DebateSide = {
      claim: `巅峰${b.nicknameCN}——${statLine(b)}的${bEraNote}统治者。${a.nicknameCN}巅峰再强也只是一道菜。`,
      points: [
        `巅峰${b.nameCN}的组合拳：${pick(b.strengths, seed + 2)}+${pick(b.strengths, seed + 3)}——${a.nameCN}见都没见过这种打法`,
        `${pick(b.achievements, seed + 3)}——${b.nicknameCN}巅峰创造的奇迹，${a.nameCN}做梦都做不出来`,
        `${b.nameCN}说「${shortQuote(b.quote, 25)}」——这种自信不是吹出来的，是巅峰期打出来的`,
      ],
      punchline: `如果时间机器存在，安排巅峰对决。${b.nicknameCN}赢完比赛还能给${a.nicknameCN}上一堂篮球课。`,
    };

    return {
      id: `custom-peak-vs-peak-${a.id}-vs-${b.id}`,
      title: "🔮 假如巅峰对决",
      emoji: "⚡",
      kobe: sideA,
      lebron: sideB,
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Exported collections
// ─────────────────────────────────────────────────────────────

/** All 8 universal debate templates. */
export const universalDebates: UniversalDebateTemplate[] = [
  templateDominance,
  templateChampionships,
  templateSkill,
  templateClutch,
  templateLegacy,
  templateEntertainment,
  templateImpact,
  templatePeakVsPeak,
];

/**
 * Generate a full set of debates for any two players.
 * Returns 7 main debates + 1 bonus (Peak vs Peak), matching the
 * existing MatchupDebates shape used by debate-loader.ts.
 *
 * playerA → `kobe` slot, playerB → `lebron` slot.
 */
export function generateMatchupDebates(
  playerA: Player,
  playerB: Player,
): { main: DebateTopic[]; bonus: DebateTopic[] } {
  const mainTemplates = universalDebates.slice(0, 7);
  const bonusTemplates = universalDebates.slice(7);

  return {
    main: mainTemplates.map((t) => t.generateDebate(playerA, playerB)),
    bonus: bonusTemplates.map((t) => t.generateDebate(playerA, playerB)),
  };
}
