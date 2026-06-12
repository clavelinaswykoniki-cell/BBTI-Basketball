import type { BbtiAnswer, BbtiQuestion } from "./bbti";
import type { BbtiAnswerPoll } from "./bbti-answer-polls";

type PresetKey = "A" | "B" | `M${number}`;

type BbtiAnswerPollPreset = Omit<BbtiAnswerPoll, "source" | "dissentPercent" | "detail"> & {
  source: "local-simulation";
};

const PRESETS: Partial<Record<number, Partial<Record<PresetKey, BbtiAnswerPollPreset>>>> = {
  1: {
    A: {
      source: "local-simulation",
      selectedPercent: 58,
      selectedLabel: "火力高光席",
      dissentLabel: "防守看台",
      callout: "这题像开场第一记后仰，模拟看台略偏名场面，但防守派不会轻易认输。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 42,
      selectedLabel: "防守看台",
      dissentLabel: "火力高光席",
      callout: "少数派但很硬，这票是在告诉大家：真正的窒息感也可以来自最后一防。",
    },
  },
  2: {
    M0: {
      source: "local-simulation",
      selectedPercent: 55,
      selectedLabel: "单打火力席",
      dissentLabel: "其他超能力席",
      callout: "模拟球馆略爱硬解技能，但下一句要解释这招在季后赛怎么持续奏效。",
    },
    M1: {
      source: "local-simulation",
      selectedPercent: 39,
      selectedLabel: "防守纪律席",
      dissentLabel: "其他超能力席",
      callout: "这选择偏硬核，像主动领防对方王牌：不一定最响，但懂的人会点头。",
    },
    M2: {
      source: "local-simulation",
      selectedPercent: 50,
      selectedLabel: "关键球席",
      dissentLabel: "其他超能力席",
      callout: "五五开回合。有人要最后一球的心脏，也有人要四节都能复用的答案。",
    },
    M3: {
      source: "local-simulation",
      selectedPercent: 46,
      selectedLabel: "护框席",
      dissentLabel: "其他超能力席",
      callout: "模拟看台略逆风，但这票有战术含金量：改变禁区就等于改变对手出手表。",
    },
  },
  5: {
    A: {
      source: "local-simulation",
      selectedPercent: 60,
      selectedLabel: "个人爆分席",
      dissentLabel: "铁血防守席",
      callout: "顺风回合。爆分赛季最容易点燃群聊，但要解释它为什么能压过防守冠军样本。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 40,
      selectedLabel: "铁血防守席",
      dissentLabel: "个人爆分席",
      callout: "小众但很硬。你奖励的是把对手拖进泥地的赛季，不是只看得分烟花。",
    },
  },
  13: {
    A: {
      source: "local-simulation",
      selectedPercent: 61,
      selectedLabel: "数据席",
      dissentLabel: "高光席",
      callout: "顺风但别只甩表格，真正能赢群聊的是数据加比赛语境。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 39,
      selectedLabel: "高光席",
      dissentLabel: "数据席",
      callout: "你站在少数派镜头边，这票的任务是证明记忆点不只是滤镜。",
    },
  },
  15: {
    A: {
      source: "local-simulation",
      selectedPercent: 54,
      selectedLabel: "长期样本席",
      dissentLabel: "绝杀记忆席",
      callout: "略占上风。你在奖励稳定产出，但要准备回答：伟大是不是只看账面。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 46,
      selectedLabel: "绝杀记忆席",
      dissentLabel: "长期样本席",
      callout: "这题很接近。你押的是关键镜头的重量，不是简单否定长期样本。",
    },
  },
  14: {
    M0: {
      source: "local-simulation",
      selectedPercent: 56,
      selectedLabel: "高阶数据席",
      dissentLabel: "其余证据席",
      callout: "略占上风。你先看效率和样本，但别忘了把数据放回比赛任务里解释。",
    },
    M1: {
      source: "local-simulation",
      selectedPercent: 44,
      selectedLabel: "名场面席",
      dissentLabel: "其余证据席",
      callout: "拉锯逆风。你押的是最高舞台的记忆点，下一句要说明它为什么不是滤镜。",
    },
    M2: {
      source: "local-simulation",
      selectedPercent: 49,
      selectedLabel: "同代口碑席",
      dissentLabel: "其余证据席",
      callout: "几乎五五开。你相信亲历者视角，但群聊会追问：评价和硬证据怎么互相校准？",
    },
    M3: {
      source: "local-simulation",
      selectedPercent: 58,
      selectedLabel: "荣誉账本席",
      dissentLabel: "其余证据席",
      callout: "略占上风。荣誉清单很能打，但要防止每个奖项都被当成同一把尺。",
    },
  },
  25: {
    A: {
      source: "local-simulation",
      selectedPercent: 53,
      selectedLabel: "个人封神席",
      dissentLabel: "团队冠军席",
      callout: "轻微领先。你在奖励一个人把上限打穿，但要回答：输球样本能不能压过冠军样本。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 47,
      selectedLabel: "团队冠军席",
      dissentLabel: "个人封神席",
      callout: "接近五五开。你这票是在说：伟大赛季不只看个人峰值，也看团队兑现。",
    },
  },
  16: {
    A: {
      source: "local-simulation",
      selectedPercent: 57,
      selectedLabel: "时代校准派",
      dissentLabel: "冠军硬账派",
      callout: "略占上风。你这边先看联盟规模、赛制和对手强度，但对面一句“11就是11”还是很有杀伤力。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 43,
      selectedLabel: "冠军硬账派",
      dissentLabel: "时代校准派",
      callout: "拉锯逆风。你把奖杯当最终证据，但下一句必须解释为什么时代差异不该打折。",
    },
  },
  22: {
    A: {
      source: "local-simulation",
      selectedPercent: 32,
      selectedLabel: "冷证据派",
      dissentLabel: "精神信仰派",
      callout: "小众但锋利。你把叙事先按暂停键，群聊里最容易被追问：数据解释不了的影响力怎么算？",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 68,
      selectedLabel: "精神信仰派",
      dissentLabel: "冷证据派",
      callout: "模拟顺风侧愿意相信那股劲，但别只喊口号，最好拿训练、比赛选择和影响力说话。",
    },
  },
  26: {
    A: {
      source: "local-simulation",
      selectedPercent: 29,
      selectedLabel: "砍分爽感派",
      dissentLabel: "赢球秩序派",
      callout: "强逆风。你这选择很真实，也很容易被队友截图追问：到底是热血，还是只想自己爽？",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 71,
      selectedLabel: "赢球秩序派",
      dissentLabel: "砍分爽感派",
      callout: "模拟看台多数侧。赢球很正确，但群里总会有人问：如果没人能硬解，最后一球谁来？",
    },
  },
  29: {
    M0: {
      source: "local-simulation",
      selectedPercent: 52,
      selectedLabel: "最后一攻派",
      dissentLabel: "带动队友派",
      callout: "几乎五五开。你要的是最后两分钟有人接锅，但对面会追问前三节是谁把局面打到这一步。",
    },
    M1: {
      source: "local-simulation",
      selectedPercent: 48,
      selectedLabel: "带动队友派",
      dissentLabel: "最后一攻派",
      callout: "拉锯局。你奖励组织和牵制，但群聊会逼你回答：关键回合能不能自己终结。",
    },
    M2: {
      source: "local-simulation",
      selectedPercent: 51,
      selectedLabel: "士气点火派",
      dissentLabel: "其他责任答案",
      callout: "几乎五五开。你相信超巨先点燃全队，但对面会追问：情绪之后谁负责终结。",
    },
    M3: {
      source: "local-simulation",
      selectedPercent: 55,
      selectedLabel: "赢球文化派",
      dissentLabel: "其他责任答案",
      callout: "略占上风。你奖励长期体系和文化，但要解释关键回合怎么不变成空话。",
    },
  },
  38: {
    A: {
      source: "local-simulation",
      selectedPercent: 64,
      selectedLabel: "竞争洁癖派",
      dissentLabel: "路径最优派",
      callout: "明显顺风。这边情绪浓度很高，但要把“观感扣分”和“实力扣分”分开讲。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 36,
      selectedLabel: "路径最优派",
      dissentLabel: "竞争洁癖派",
      callout: "小众但能打。你在替球员选择权辩护，最好准备好回答：赢得太顺会不会降低叙事重量。",
    },
  },
  39: {
    A: {
      source: "local-simulation",
      selectedPercent: 45,
      selectedLabel: "城市守望派",
      dissentLabel: "冠军窗口派",
      callout: "拉锯逆风。你守的是身份和陪伴，但下一句要回答：巅峰被浪费谁负责？",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 55,
      selectedLabel: "冠军窗口派",
      dissentLabel: "城市守望派",
      callout: "略占上风。你把夺冠概率放前面，但别把球迷的陪伴成本一笔带过。",
    },
  },
  42: {
    M0: {
      source: "local-simulation",
      selectedPercent: 57,
      selectedLabel: "管理层反击派",
      dissentLabel: "其他忠诚答案",
      callout: "略占上风。你把忠诚问题先丢回球队办公室，但也要说明球星自己的责任边界。",
    },
    M1: {
      source: "local-simulation",
      selectedPercent: 54,
      selectedLabel: "巅峰窗口派",
      dissentLabel: "其他忠诚答案",
      callout: "轻微领先。时间确实最残酷，但这票要避免把所有离开都包装成争冠理性。",
    },
    M2: {
      source: "local-simulation",
      selectedPercent: 41,
      selectedLabel: "忠诚信仰派",
      dissentLabel: "其他忠诚答案",
      callout: "小众但很亮。你把坚守当成价值本身，群聊会逼你回答：失败成本谁承担？",
    },
    M3: {
      source: "local-simulation",
      selectedPercent: 48,
      selectedLabel: "适配现实派",
      dissentLabel: "其他忠诚答案",
      callout: "拉锯局。你承认忠诚要看双方匹配，这票最怕被追问：标准会不会太方便。",
    },
  },
  44: {
    A: {
      source: "local-simulation",
      selectedPercent: 46,
      selectedLabel: "队徽归属派",
      dissentLabel: "球星迁徙派",
      callout: "接近五五开。你认的是城市、队史和颜色，但对面会说：真正让你入坑的明明是那个人。",
    },
    B: {
      source: "local-simulation",
      selectedPercent: 54,
      selectedLabel: "球星迁徙派",
      dissentLabel: "队徽归属派",
      callout: "轻微领先。你跟着人走很合理，但别躲那个问题：当他去了死敌，你还跟吗？",
    },
  },
};

function presetKey(answer: BbtiAnswer): PresetKey | null {
  if (answer.selected) return answer.selected;
  const index = answer.selectedIndices?.[0];
  return typeof index === "number" ? `M${index}` : null;
}

export function getBbtiAnswerPollPreset(question: BbtiQuestion, answer: BbtiAnswer): BbtiAnswerPoll | null {
  const key = presetKey(answer);
  if (!key) return null;
  const preset = PRESETS[question.id]?.[key];
  if (!preset) return null;

  return {
    ...preset,
    dissentPercent: 100 - preset.selectedPercent,
    detail: "本地模拟，不代表真实用户投票。",
  };
}
