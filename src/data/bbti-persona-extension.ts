import { getBbtiType, type BbtiType, type PoleKey } from "./bbti";

export interface BbtiPersonaExtensionCard {
  label: string;
  title: string;
  body: string;
  tag: string;
}

export interface BbtiPersonaExtension {
  code: string;
  typeName: string;
  cards: {
    lockerRoomRole: BbtiPersonaExtensionCard;
    coachUsage: BbtiPersonaExtensionCard;
    groupChatTrigger: BbtiPersonaExtensionCard;
    clutchPossession: BbtiPersonaExtensionCard;
  };
  copyText: string;
}

type LetterSet = {
  style: PoleKey;
  evidence: PoleKey;
  role: PoleKey;
  ambition: PoleKey;
};

function parseLetters(code: string): LetterSet {
  const letters = code.split("") as PoleKey[];

  return {
    style: letters[0] ?? "O",
    evidence: letters[1] ?? "A",
    role: letters[2] ?? "I",
    ambition: letters[3] ?? "L",
  };
}

function lockerRoomRole(type: BbtiType, letters: LetterSet): BbtiPersonaExtensionCard {
  if (letters.style === "O" && letters.role === "I") {
    return {
      label: "更衣室角色",
      title: "末节点火的第一持球点",
      body: `${type.name}在群聊里适合先抛结论，把节奏拉快，再逼别人拿反证追上来。`,
      tag: "持球开局",
    };
  }

  if (letters.style === "O" && letters.role === "T") {
    return {
      label: "更衣室角色",
      title: "把每个人拉进进攻节奏的组织者",
      body: `${type.name}不一定每回合都自己终结，但会把话题导向空间、传导和全队爆发。`,
      tag: "提速组织",
    };
  }

  if (letters.style === "D" && letters.role === "I") {
    return {
      label: "更衣室角色",
      title: "专盯王牌论点的外线锁",
      body: `${type.name}最擅长把对方最顺手的说法按住，逼 TA 解释样本、对位和代价。`,
      tag: "单点压迫",
    };
  }

  return {
    label: "更衣室角色",
    title: "把防线和轮转站稳的指挥官",
    body: `${type.name}适合做秩序感最强的人：先定评价标准，再让每个观点回到体系里。`,
    tag: "体系控场",
  };
}

function coachUsage(type: BbtiType, letters: LetterSet): BbtiPersonaExtensionCard {
  if (letters.evidence === "A" && letters.ambition === "R") {
    return {
      label: "教练使用说明",
      title: "给 TA 样本和赛程背景",
      body: `${type.name}要的是可复核的赢球路径。让 TA 先看系列赛背景、阵容窗口和效率曲线，再进入情绪辩论。`,
      tag: "数据控追冠",
    };
  }

  if (letters.evidence === "A" && letters.ambition === "L") {
    return {
      label: "教练使用说明",
      title: "先给证据，再给队魂语境",
      body: `${type.name}不是只看表格。最好的使用方式是先把数据底座搭牢，再讨论这座城市为什么值得守。`,
      tag: "证据守城",
    };
  }

  if (letters.evidence === "E" && letters.ambition === "R") {
    return {
      label: "教练使用说明",
      title: "先让名场面升温，再问结果",
      body: `${type.name}会被大舞台镜头点燃，但最后仍要回到冠军窗口。别只丢冷表格，先让 TA 进入比赛。`,
      tag: "情绪冲冠",
    };
  }

  return {
    label: "教练使用说明",
    title: "给 TA 一段能代表身份的回合",
    body: `${type.name}吃的是记忆和归属感。最好从主队、现场、陪伴年限讲起，再慢慢推进到输赢成本。`,
    tag: "名场面守城",
  };
}

function groupChatTrigger(type: BbtiType, letters: LetterSet): BbtiPersonaExtensionCard {
  if (letters.evidence === "A" && letters.role === "I") {
    return {
      label: "群聊触发点",
      title: "有人只用一张集锦否定样本",
      body: `${type.name}最容易被“我看过所以我懂”点燃。触发后会要求对方把回合、对位和样本量讲清楚。`,
      tag: "样本警报",
    };
  }

  if (letters.evidence === "A" && letters.role === "T") {
    return {
      label: "群聊触发点",
      title: "有人把体系贡献全算成队友福利",
      body: `${type.name}会追问空间、轮转和职责分配，反感把复杂赢球逻辑压成一句抱大腿。`,
      tag: "体系被低估",
    };
  }

  if (letters.evidence === "E" && letters.role === "I") {
    return {
      label: "群聊触发点",
      title: "有人说名场面只是幸存者偏差",
      body: `${type.name}会立刻进入最后一攻模式：伟大球星就是要在镜头最亮时交答案。`,
      tag: "镜头开火",
    };
  }

  return {
    label: "群聊触发点",
    title: "有人把团队篮球说成没有巨星",
    body: `${type.name}会把话题拉回跑位、掩护、协防和选择题：不是没主角，是主角不只一个。`,
    tag: "团队被误读",
  };
}

function clutchPossession(type: BbtiType, letters: LetterSet): BbtiPersonaExtensionCard {
  if (letters.style === "O" && letters.ambition === "R") {
    return {
      label: "关键回合倾向",
      title: "最后两分钟先找最高产的答案",
      body: `${type.name}会优先相信能直接改写比分的人或方案。只要能赢，出手权和资源都可以重新分配。`,
      tag: "结果优先",
    };
  }

  if (letters.style === "O" && letters.ambition === "L") {
    return {
      label: "关键回合倾向",
      title: "最后一攻交给自己的旗帜",
      body: `${type.name}愿意接受更高风险，也想看代表这支队的人亲手完成终结。`,
      tag: "旗帜终结",
    };
  }

  if (letters.style === "D" && letters.ambition === "R") {
    return {
      label: "关键回合倾向",
      title: "先守住下限，再寻找冠军窗口",
      body: `${type.name}会先问这个选择会不会被对手点名。关键时刻，失误成本和防守弱点比热血更重。`,
      tag: "防守争冠",
    };
  }

  return {
    label: "关键回合倾向",
    title: "宁愿打丑，也要守住自己的体系",
    body: `${type.name}的关键回合不追求漂亮，追求不乱。该夹击就夹击，该降速就降速，身份感不能丢。`,
    tag: "守城回合",
  };
}

export function getBbtiPersonaExtension(code: string): BbtiPersonaExtension {
  const type = getBbtiType(code);
  const letters = parseLetters(code);
  const cards = {
    lockerRoomRole: lockerRoomRole(type, letters),
    coachUsage: coachUsage(type, letters),
    groupChatTrigger: groupChatTrigger(type, letters),
    clutchPossession: clutchPossession(type, letters),
  };

  const copyText = [
    `BBTI 二层球探报告：${code} ${type.name}`,
    `更衣室角色：${cards.lockerRoomRole.title}`,
    `教练使用说明：${cards.coachUsage.title}`,
    `群聊触发点：${cards.groupChatTrigger.title}`,
    `关键回合倾向：${cards.clutchPossession.title}`,
  ].join("\n");

  return {
    code,
    typeName: type.name,
    cards,
    copyText,
  };
}
