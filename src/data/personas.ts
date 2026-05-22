import type { DebateTopic } from "./debates";

type Side = "kobe" | "lebron";

interface Vote {
  topicId: string;
  winner: Side;
}

export interface Persona {
  title: string;
  emoji: string;
  description: string;
  color: string;
}

const KOBE_TOPIC_IDS = ["rings", "clutch", "skill", "mentality", "defense", "loyalty"];
const LEBRON_TOPIC_IDS = ["mvp", "finals", "teammates", "era", "iconic", "goat"];

export function getPersona(side: Side, votes: Vote[], totalRounds: number): Persona {
  const ownVotes = votes.filter((v) => v.winner === side).length;
  const loyalty = ownVotes / totalRounds;
  const otherSide: Side = side === "kobe" ? "lebron" : "kobe";

  const votedForClutch = votes.find((v) => v.topicId === "clutch")?.winner;
  const votedForSkill = votes.find((v) => v.topicId === "skill")?.winner;
  const votedForGoat = votes.find((v) => v.topicId === "goat")?.winner;
  const votedForLoyalty = votes.find((v) => v.topicId === "loyalty")?.winner;
  const votedForMvp = votes.find((v) => v.topicId === "mvp")?.winner;
  const votedForFinals = votes.find((v) => v.topicId === "finals")?.winner;

  if (loyalty >= 1.0) {
    return side === "kobe"
      ? { title: "曼巴原教旨主义者", emoji: "🐍", description: "12轮全投科比，你不是球迷你是信徒。跟你辩论等于跟墙说话。", color: "text-kobe-gold" }
      : { title: "詹皇绝对忠臣", emoji: "👑", description: "12轮全投詹姆斯，你眼里可能只有一个篮球运动员。建议去医院查一下视力。", color: "text-lebron-gold" };
  }

  if (loyalty <= 0.25) {
    return side === "kobe"
      ? { title: "卧底詹蜜", emoji: "🕵️", description: "嘴上说站科比，投票全给了詹姆斯。你是来搞情报的吧？", color: "text-red-400" }
      : { title: "卧底科蜜", emoji: "🕵️", description: "选了詹蜜的身份，票投给了科比。你跟詹姆斯换队一样不忠诚。", color: "text-red-400" };
  }

  if (votedForClutch === "kobe" && votedForSkill === "kobe" && votedForGoat === "lebron") {
    return { title: "数据党理中客", emoji: "📊", description: "承认科比更帅更有技术，但最后还是跪在了数据面前。你一定很喜欢Excel。", color: "text-blue-400" };
  }

  if (votedForClutch === "lebron" && votedForLoyalty === "kobe") {
    return { title: "精神分裂球迷", emoji: "🤯", description: "认为科比更忠诚但詹姆斯关键球更强？你的大脑在打架。", color: "text-purple-400" };
  }

  if (votedForFinals === "lebron" && votedForMvp === "lebron" && side === "kobe") {
    return { title: "嘴硬的科蜜", emoji: "😤", description: "MVP和总决赛表现都给了詹姆斯，但你还是不肯承认。这就叫曼巴精神吗——永不认输？", color: "text-kobe-gold" };
  }

  if (loyalty >= 0.75) {
    return side === "kobe"
      ? { title: "正统曼巴门徒", emoji: "🔥", description: "大部分轮次站科比，偶尔也承认对面有道理。你是科蜜里少有的正常人。", color: "text-kobe-gold" }
      : { title: "理性詹皇拥趸", emoji: "⚡", description: "大部分投了詹姆斯但不是无脑吹。可惜在评论区你还是会被骂。", color: "text-lebron-gold" };
  }

  return { title: "摇摆球迷", emoji: "⚖️", description: "两边都投了不少——你要么是真正的篮球理性人，要么是选择困难症。", color: "text-white" };
}

export function getRoast(side: Side, votes: Vote[]): string {
  const patterns: string[] = [];

  const v = (id: string) => votes.find((x) => x.topicId === id)?.winner;

  if (v("clutch") === "kobe" && v("finals") === "lebron") {
    patterns.push("你觉得科比关键球更强，但总决赛表现又投了詹姆斯——所以关键球强但大场面不行？这叫什么，精神胜利法？");
  }

  if (v("skill") === "kobe" && v("mvp") === "lebron") {
    patterns.push("科比技术更好但MVP给了詹姆斯——你在说一个技术更差的人拿了更多MVP？要不要听听自己在说什么？");
  }

  if (v("mentality") === "kobe" && v("goat") === "lebron") {
    patterns.push("曼巴精神投了科比，GOAT投了詹姆斯——所以最有精神力的球员不是最强的？那精神力有什么用？");
  }

  if (v("loyalty") === "kobe" && v("teammates") === "lebron") {
    patterns.push("忠诚给了科比，队友环境给了詹姆斯——你是在说詹姆斯更会交朋友吗？");
  }

  if (v("defense") === "kobe" && v("era") === "lebron") {
    patterns.push("防守给了科比但时代影响力给了詹姆斯——你在说一个防守更好的人影响力更小？那防守有什么用？");
  }

  if (side === "kobe" && v("rings") === "lebron") {
    patterns.push("科蜜连冠军戒指都没给科比投——你确定你站对边了？");
  }

  if (side === "lebron" && v("clutch") === "kobe") {
    patterns.push("詹蜜承认了科比关键球更强——你内心深处知道最后一投该给谁。");
  }

  if (patterns.length === 0) {
    if (side === "kobe") {
      return "你的投票没什么自相矛盾——但你站科比这件事本身就是最大的矛盾。";
    }
    return "你的投票逻辑自洽——跟詹姆斯选择队友的逻辑一样：永远选更容易赢的那个。";
  }

  return patterns[Math.floor(Math.random() * patterns.length)];
}

export interface StatBomb {
  stat: string;
  source: string;
  side: Side;
}

export const statBombs: Record<string, StatBomb[]> = {
  rings: [
    { stat: "科比5冠里只有2个FMVP——另外3个冠军的FMVP是奥尼尔。", source: "NBA官方记录", side: "lebron" },
    { stat: "詹姆斯4冠需要3个不同城市+抱团——科比5冠只需要一个洛杉矶。", source: "NBA历史", side: "kobe" },
  ],
  clutch: [
    { stat: "科比职业生涯关键球（最后5秒扳平/绝杀）命中率仅32.9%。", source: "Basketball Reference", side: "lebron" },
    { stat: "詹姆斯2011总决赛第四节合计只拿了11分——在最大舞台上消失了。", source: "ESPN Stats", side: "kobe" },
  ],
  skill: [
    { stat: "科比生涯真实命中率54.1%，詹姆斯58.6%——效率差了一个档次。", source: "Basketball Reference", side: "lebron" },
    { stat: "科比有12种以上的低位进攻方式——詹姆斯的终结手段80%依赖突破。", source: "Film Study", side: "kobe" },
  ],
  mvp: [
    { stat: "科比20年生涯只拿了1个MVP——同期纳什拿了2个。", source: "NBA官方", side: "lebron" },
    { stat: "詹姆斯的MVP赛季得分从没超过科比06年的35.4分。", source: "Basketball Reference", side: "kobe" },
  ],
  mentality: [
    { stat: "科比全明星赛都要全力防守——连Show Game都不放过的竞争精神。", source: "球员采访合集", side: "kobe" },
    { stat: "詹姆斯22个赛季每年都打60场以上——科比7次因伤缺席大量比赛。", source: "ESPN", side: "lebron" },
  ],
  defense: [
    { stat: "科比6次防守一阵被证实是「名声投票」——实际防守指标不如同时期阿泰斯特。", source: "Cleaning the Glass", side: "lebron" },
    { stat: "詹姆斯从2015年开始，常规赛防守强度排名联盟后30%。", source: "NBA Advanced Stats", side: "kobe" },
  ],
  finals: [
    { stat: "科比2004总决赛场均22.6分38.7%命中率——被活塞打懵了。", source: "Basketball Reference", side: "lebron" },
    { stat: "詹姆斯10进总决赛只赢了4次——胜率40%，勉强及格。", source: "NBA历史", side: "kobe" },
  ],
  teammates: [
    { stat: "科比有奥尼尔、加索尔、阿泰——也是有帮手的。区别是他没有主动去找人。", source: "NBA交易记录", side: "lebron" },
    { stat: "詹姆斯2010年全国直播说「I'm taking my talents to South Beach」——这是NBA史上最大的背叛。", source: "ESPN The Decision", side: "kobe" },
  ],
  era: [
    { stat: "科比去世后社交媒体提及量是詹姆斯的3.7倍——这才是真正的文化影响力。", source: "Brandwatch 2020", side: "kobe" },
    { stat: "詹姆斯的SpringHill公司估值已超7.5亿美元——科比的商业版图远不及此。", source: "Forbes 2024", side: "lebron" },
  ],
  iconic: [
    { stat: "81分比赛至今是YouTube上播放量最高的NBA个人表演——没有之一。", source: "YouTube", side: "kobe" },
    { stat: "2016 G7 the block是NBA官方投票评选的「历史最伟大季后赛时刻」第一名。", source: "NBA 75周年投票", side: "lebron" },
  ],
  goat: [
    { stat: "在ESPN 2023年发起的球员匿名投票中，只有11.9%的现役球员认为科比是GOAT。", source: "ESPN匿名调查", side: "lebron" },
    { stat: "乔丹亲口说「科比唯一能在1v1里打败我的人」——GOAT本人的认证。", source: "MJ采访", side: "kobe" },
  ],
  loyalty: [
    { stat: "科比2007年也要求过交易——差点去了公牛。「一人一城」的叙事有裂缝。", source: "ESPN 2007报道", side: "lebron" },
    { stat: "詹姆斯4支球队，每离开一次球迷就烧一次球衣——忠诚这个词跟他无关。", source: "NBA历史", side: "kobe" },
  ],
  whatif_swap: [
    { stat: "科比2007年逼宫要走时，湖人差点把他换到公牛——所谓忠诚不过是管理层没同意。", source: "ESPN Trade Machine", side: "lebron" },
    { stat: "詹姆斯去热火前骑士连续3年东部前二——他走后直接联盟垫底。说明队伍本来不差。", source: "NBA战绩", side: "kobe" },
  ],
  whatif_era: [
    { stat: "00年代的pace（回合数）比现在低15%——科比在快节奏时代得分会更夸张。", source: "Basketball Reference Pace", side: "kobe" },
    { stat: "手检时代外线球员效率普遍低5%——科比的很多效率数据有时代折扣。", source: "Thinking Basketball", side: "lebron" },
  ],
  whatif_1v1: [
    { stat: "科比生涯单打每回合0.93分——联盟平均是0.86。强，但没有碾压。", source: "NBA Tracking", side: "lebron" },
    { stat: "詹姆斯生涯被单防时命中率比科比低4%——去掉挡拆和空切，他没那么无解。", source: "Synergy Sports", side: "kobe" },
  ],
};
