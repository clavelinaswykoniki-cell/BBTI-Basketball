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

// Emotional / heart topics
const EMOTIONAL_IDS = ["mentality", "loyalty", "clutch", "iconic"];
// Stats / resume topics
const STATS_IDS = ["mvp", "finals", "rings", "goat"];

export function getPersona(side: Side, votes: Vote[], totalRounds: number, elapsedSeconds?: number): Persona {
  const ownVotes = votes.filter((v) => v.winner === side).length;
  const loyalty = ownVotes / totalRounds;
  const otherSide: Side = side === "kobe" ? "lebron" : "kobe";

  const v = (id: string) => votes.find((x) => x.topicId === id)?.winner;

  const votedForClutch = v("clutch");
  const votedForSkill = v("skill");
  const votedForGoat = v("goat");
  const votedForLoyalty = v("loyalty");
  const votedForMvp = v("mvp");
  const votedForFinals = v("finals");
  const votedForRings = v("rings");
  const votedForMentality = v("mentality");
  const votedForDefense = v("defense");
  const votedForIconic = v("iconic");
  const votedForEra = v("era");

  // --- Speed-runner: finished all rounds in under 90 seconds ---
  if (elapsedSeconds && elapsedSeconds < 90 && votes.length >= 12) {
    return {
      title: "急了急了",
      emoji: "⏩",
      description: `${votes.length}轮投票用了${elapsedSeconds}秒？你根本没看论点吧。这不是投票，这是抽奖。建议回去重读一遍，每个字。`,
      color: "text-orange-400",
    };
  }

  // --- 100% loyalty ---
  if (loyalty >= 1.0) {
    return side === "kobe"
      ? { title: "曼巴原教旨主义者", emoji: "🐍", description: "12轮全投科比。你不是球迷，你是邪教成员。跟你辩论等于跟砖墙对线。建议虎扑封号处理。", color: "text-kobe-gold" }
      : { title: "詹皇死忠舔狗", emoji: "👑", description: "12轮全投詹姆斯。你眼里只有一个篮球运动员，建议去医院做个脑部CT，看看是不是只剩一根筋了。", color: "text-lebron-gold" };
  }

  // --- Against own side on BOTH rings and goat (the two biggest topics) ---
  if (votedForRings === otherSide && votedForGoat === otherSide) {
    return side === "kobe"
      ? { title: "深柜詹蜜", emoji: "🚪", description: "冠军戒指和GOAT都投了詹姆斯——你为什么不直接换边？戒指和GOAT都给对面了你还自称科蜜？出柜吧兄弟。", color: "text-red-400" }
      : { title: "深柜科蜜", emoji: "🚪", description: "冠军戒指和GOAT全投了科比——你站詹姆斯站了个寂寞。最重要的两题都反水，你的忠诚度比詹姆斯换队还频繁。", color: "text-red-400" };
  }

  // --- All emotional topics for Kobe, all stats topics for LeBron ---
  const allEmotionalKobe = EMOTIONAL_IDS.every((id) => v(id) === "kobe");
  const allStatsLebron = STATS_IDS.every((id) => v(id) === "lebron");
  if (allEmotionalKobe && allStatsLebron) {
    return {
      title: "理性与感性分裂体",
      emoji: "🧠💔",
      description: "感情上全站科比，数据上全站詹姆斯——你活得也太累了。白天打开Excel看数据服詹姆斯，晚上关灯看集锦哭科比。精神状态堪忧。",
      color: "text-purple-400",
    };
  }

  // --- Kobe everything EXCEPT goat (can't commit) ---
  const mainTopicIds = ["rings", "clutch", "skill", "mvp", "mentality", "defense", "finals", "teammates", "era", "iconic", "loyalty"];
  const allMainKobeExceptGoat = mainTopicIds.every((id) => v(id) === "kobe") && votedForGoat === "lebron";
  if (allMainKobeExceptGoat) {
    return {
      title: "万年老二推崇者",
      emoji: "🥈",
      description: "11轮全投科比，就GOAT这一轮投了詹姆斯。你心里知道科比啥都好，就是历史地位差那么一丢丢。这比全投科比还扎心。",
      color: "text-kobe-gold",
    };
  }

  // --- Traitor: <25% loyalty ---
  if (loyalty <= 0.25) {
    return side === "kobe"
      ? { title: "卧底詹蜜", emoji: "🕵️", description: "嘴上说站科比，投票全给了詹姆斯。你比莱纳德离开马刺还无情。潜伏得挺深啊。", color: "text-red-400" }
      : { title: "卧底科蜜", emoji: "🕵️", description: "选了詹蜜的身份，票全投给了科比。你跟詹姆斯一样——选了一边但心在另一边。", color: "text-red-400" };
  }

  // --- Data nerd: admits Kobe is cooler but bows to stats ---
  if (votedForClutch === "kobe" && votedForSkill === "kobe" && votedForGoat === "lebron") {
    return { title: "Excel球迷", emoji: "📊", description: "承认科比更帅更有技术更能杀人，但最后还是跪在了数据面前。你是不是做什么决定都要先开个表格？", color: "text-blue-400" };
  }

  // --- Split personality: clutch=lebron but loyalty=kobe ---
  if (votedForClutch === "lebron" && votedForLoyalty === "kobe") {
    return { title: "精神分裂球迷", emoji: "🤯", description: "科比更忠诚但关键球更差？你的大脑左右半球在打架。建议挂个神经科。", color: "text-purple-400" };
  }

  // --- Stubborn Kobe fan: gave MVP + finals to LeBron but won't switch ---
  if (votedForFinals === "lebron" && votedForMvp === "lebron" && side === "kobe") {
    return { title: "嘴硬型科蜜", emoji: "😤", description: "MVP和总决赛都给了詹姆斯，但死不承认。这就是传说中的曼巴精神吗？永不认输？还是永不认错？", color: "text-kobe-gold" };
  }

  // --- Reverse stubborn: LeBron fan who gave clutch + mentality + loyalty to Kobe ---
  if (votedForClutch === "kobe" && votedForMentality === "kobe" && votedForLoyalty === "kobe" && side === "lebron") {
    return { title: "嘴硬型詹蜜", emoji: "😤", description: "关键球、精神力、忠诚全投了科比——你内心住着一个科蜜但嘴上不承认。这叫什么，傲娇？", color: "text-lebron-gold" };
  }

  // --- The contrarian: defense=kobe but era+iconic=lebron (or vice versa) ---
  if (votedForDefense === "lebron" && votedForEra === "kobe" && votedForIconic === "kobe") {
    return { title: "杠精附体", emoji: "🤡", description: "防守给了詹姆斯但影响力和经典时刻给了科比——你是不是就喜欢跟主流唱反调？虎扑十级杠精鉴定完毕。", color: "text-yellow-400" };
  }

  // --- The betrayer: Kobe fan who gave rings to LeBron ---
  if (side === "kobe" && votedForRings === "lebron" && votedForGoat === "kobe") {
    return { title: "精神胜利法大师", emoji: "🏅", description: "戒指给了詹姆斯但GOAT给了科比——所以冠军少的那个反而更伟大？你这逻辑能拿诺贝尔奖。", color: "text-kobe-gold" };
  }

  // --- High loyalty ---
  if (loyalty >= 0.75) {
    return side === "kobe"
      ? { title: "正统曼巴门徒", emoji: "🔥", description: "大部分轮次站科比，偶尔也承认对面有道理。你是科蜜里最接近正常人的——虽然正常人不会花时间做这个测试。", color: "text-kobe-gold" }
      : { title: "理性詹皇拥趸", emoji: "⚡", description: "大部分投了詹姆斯但不是无脑吹。可惜在虎扑评论区你还是会被两边骂。做人最苦莫过于此。", color: "text-lebron-gold" };
  }

  // --- Moderate loyalty ---
  if (loyalty >= 0.4 && loyalty <= 0.6) {
    return { title: "墙头草精", emoji: "🌾", description: "两边投得差不多——你不是理性，你是怂。选择困难症已经晚期了。下次做选择题建议直接扔硬币。", color: "text-white" };
  }

  return { title: "摇摆球迷", emoji: "⚖️", description: "两边都投了不少——你要么是真正的篮球哲学家，要么就是谁的论点最后一个看到就选谁。", color: "text-white" };
}

export function getRoast(side: Side, votes: Vote[]): string {
  const patterns: string[] = [];

  const v = (id: string) => votes.find((x) => x.topicId === id)?.winner;

  // --- Original patterns (rewritten spicier) ---

  if (v("clutch") === "kobe" && v("finals") === "lebron") {
    patterns.push("关键球投了科比，总决赛投了詹姆斯——所以科比关键球很强但大场面不行？这叫什么？关键球只在常规赛关键？绷不住了。");
  }

  if (v("skill") === "kobe" && v("mvp") === "lebron") {
    patterns.push("技术投了科比，MVP投了詹姆斯——你在说一个技术更差的人拿了更多MVP？所以MVP评的是什么？不技术大赛？你的逻辑已经去世了。");
  }

  if (v("mentality") === "kobe" && v("goat") === "lebron") {
    patterns.push("曼巴精神投了科比，GOAT投了詹姆斯——所以精神力最强的人不是最伟大的？那曼巴精神的含金量是不是被你亲手降级了？");
  }

  if (v("loyalty") === "kobe" && v("teammates") === "lebron") {
    patterns.push("忠诚给科比，队友给詹姆斯——你是在说不忠诚的人更会交朋友？那忠诚有什么用？社恐的美德？");
  }

  if (v("defense") === "kobe" && v("era") === "lebron") {
    patterns.push("防守给科比，时代影响力给詹姆斯——防守更好的人影响力更小？那防守的意义是什么？自娱自乐？");
  }

  if (side === "kobe" && v("rings") === "lebron") {
    patterns.push("科蜜连冠军戒指都没投给科比——5比4你都选4？你确定你数学是体育老师教的吗？还是你内心已经叛变了？");
  }

  if (side === "lebron" && v("clutch") === "kobe") {
    patterns.push("詹蜜承认科比关键球更强了——那最后一秒你把球给谁？你嘴上说詹姆斯，但你的手已经把球递给科比了。");
  }

  // --- New roast patterns ---

  if (v("rings") === "kobe" && v("goat") === "lebron") {
    patterns.push("戒指给了科比但GOAT给了詹姆斯——所以冠军更多的人反而不是GOAT？那GOAT的标准是什么？不是冠军？那你为什么要投冠军那一轮？");
  }

  if (v("iconic") === "kobe" && v("finals") === "lebron") {
    patterns.push("经典时刻给了科比，总决赛给了詹姆斯——你觉得科比的高光都不在总决赛？81分是打猛龙，退役60分是打爵士。确实不在总决赛。你这是在帮科比还是在黑科比？");
  }

  if (side === "lebron" && v("loyalty") === "kobe" && v("mentality") === "kobe") {
    patterns.push("詹蜜把忠诚和精神力都给了科比——你是不是觉得詹姆斯就是个打工的？上班干活、下班回家、换老板就跑？你这哪是球迷，你是詹姆斯的HR。");
  }

  if (side === "kobe" && v("mvp") === "lebron" && v("goat") === "lebron") {
    patterns.push("MVP和GOAT都给了詹姆斯你还说自己是科蜜？最有含金量的两个荣誉全给对面了。你不是科蜜，你是科比最大的黑粉。");
  }

  if (v("skill") === "lebron" && v("clutch") === "lebron" && v("defense") === "lebron") {
    patterns.push("技术、关键球、防守三项全投了詹姆斯——你觉得科比在球场上干什么的？卖帅？你把篮球最核心的三个能力全否了，科比听了会直接把你的球迷证撕了。");
  }

  if (v("era") === "kobe" && v("teammates") === "lebron" && v("goat") === "lebron") {
    patterns.push("时代影响力给科比，但队友和GOAT给詹姆斯——所以影响力最大的人不是GOAT？那影响力影响了个啥？影响大家哭了一场然后投票还是投詹姆斯？");
  }

  if (v("mentality") === "lebron" && v("loyalty") === "lebron" && side === "kobe") {
    patterns.push("精神力和忠诚都投了詹姆斯——你作为科蜜，把曼巴精神和一人一城两张王牌全交出去了。科比在天上看着你，估计在想：这人是不是走错片场了。");
  }

  // --- Fallback ---

  if (patterns.length === 0) {
    if (side === "kobe") {
      return "你的投票倒是没什么自相矛盾——但你站科比这件事本身就已经是这年头最大的矛盾了。历史得分王都不是科比你知道吧？";
    }
    return "你的投票逻辑自洽——跟詹姆斯选队友的逻辑一样：永远选更容易赢的那个。安全、聪明、但就是不够热血。跟你的人生一样。";
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
