type Side = "kobe" | "lebron";

interface Vote {
  topicId: string;
  winner: Side;
}

interface JudgeRequest {
  votes: Vote[];
  side: Side;
  kobeScore: number;
  lebronScore: number;
}

interface JudgeResponse {
  verdict: string;
  analysis: string;
  confidence: number;
  prescription: string;
  challenge: string;
  fanFiction: string;
  personality: PersonalityProfile;
}

interface PersonalityProfile {
  type: string;
  emoji: string;
  traits: string[];
  decisionStyle: string;
  inRelationship: string;
  atWork: string;
  spiritAnimal: string;
}

// ── Topic title map (self-contained, no imports) ─────────────────────

const TOPIC_TITLES: Record<string, string> = {
  rings: "冠军戒指",
  clutch: "关键球 & 杀手本能",
  skill: "技术 & 打法美感",
  mvp: "个人荣誉",
  mentality: "竞技精神 & 意志力",
  defense: "防守能力",
  finals: "总决赛表现",
  teammates: "队友 & 夺冠环境",
  era: "时代影响力",
  iconic: "最经典时刻",
  goat: "历史地位 GOAT",
  loyalty: "忠诚 vs 赢家思维",
  whatif_swap: "如果互换球队",
  whatif_era: "如果互换时代",
  whatif_1v1: "1v1 单挑",
};

// ── Utility ──────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function vv(votes: Vote[], id: string): Side | undefined {
  return votes.find((x) => x.topicId === id)?.winner;
}

// ── DeepSeek AI generation ───────────────────────────────────────────

function isValidJudgeResponse(x: unknown): x is JudgeResponse {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;

  // Check all 7 top-level fields exist and are non-empty strings (except confidence = number)
  for (const key of ["verdict", "analysis", "prescription", "challenge", "fanFiction"]) {
    if (typeof obj[key] !== "string" || (obj[key] as string).length === 0) return false;
  }

  if (typeof obj.confidence !== "number" || obj.confidence < 0 || obj.confidence > 100) return false;

  // Check personality object
  if (!obj.personality || typeof obj.personality !== "object") return false;
  const p = obj.personality as Record<string, unknown>;

  for (const key of ["type", "emoji", "decisionStyle", "inRelationship", "atWork", "spiritAnimal"]) {
    if (typeof p[key] !== "string" || (p[key] as string).length === 0) return false;
  }

  if (!Array.isArray(p.traits) || p.traits.length === 0) return false;
  if (!p.traits.every((t: unknown) => typeof t === "string" && (t as string).length > 0)) return false;

  return true;
}

function buildDeepSeekPrompt(data: JudgeRequest): string {
  const { votes, side, kobeScore, lebronScore } = data;
  const totalRounds = votes.length;
  const loyaltyCount = votes.filter((x) => x.winner === side).length;
  const loyalty = totalRounds > 0 ? loyaltyCount / totalRounds : 0;
  const loyaltyPct = Math.round(loyalty * 100);
  const sideName = side === "kobe" ? "科比" : "詹姆斯";
  const otherName = side === "kobe" ? "詹姆斯" : "科比";

  // Build vote-by-vote breakdown
  const voteBreakdown = votes
    .map((v) => {
      const title = TOPIC_TITLES[v.topicId] || v.topicId;
      const winnerName = v.winner === "kobe" ? "科比" : "詹姆斯";
      return `- ${title}: 投了${winnerName}`;
    })
    .join("\n");

  // Detect contradictions
  const contradictions: string[] = [];

  if (vv(votes, "clutch") === "kobe" && vv(votes, "goat") === "lebron") {
    contradictions.push("觉得科比关键球更强，但GOAT选了詹姆斯——关键球强但不是最伟大？");
  }
  if (vv(votes, "clutch") === "lebron" && vv(votes, "goat") === "kobe") {
    contradictions.push("觉得詹姆斯关键球更强，但GOAT选了科比——关键球不重要？");
  }
  if (vv(votes, "skill") === "kobe" && vv(votes, "mvp") === "lebron") {
    contradictions.push("技术更好的球员MVP更少——技术好不等于打得好？");
  }
  if (vv(votes, "loyalty") === "kobe" && vv(votes, "rings") === "lebron") {
    contradictions.push("忠诚归科比但冠军归詹姆斯——忠诚不等于赢？");
  }
  if (vv(votes, "mentality") === "kobe" && vv(votes, "goat") === "lebron") {
    contradictions.push("精神力最强的不是GOAT——曼巴精神不算数？");
  }
  if (side === "kobe" && vv(votes, "rings") === "lebron" && vv(votes, "goat") === "lebron" && vv(votes, "mvp") === "lebron") {
    contradictions.push("科蜜但冠军/GOAT/MVP全投詹姆斯——你到底站哪边？");
  }
  if (side === "lebron" && vv(votes, "clutch") === "kobe" && vv(votes, "mentality") === "kobe" && vv(votes, "iconic") === "kobe") {
    contradictions.push("詹蜜但关键球/精神力/经典时刻全投科比——你嘴上选数据，心里选情怀");
  }
  if (loyalty <= 0.3) {
    contradictions.push(`选了${sideName}但${loyaltyPct}%忠诚度——你是卧底吧？`);
  }

  const contradictionBlock = contradictions.length > 0
    ? `\n发现的投票矛盾（重点嘲讽）：\n${contradictions.map((c) => `⚠️ ${c}`).join("\n")}`
    : "\n没有明显矛盾，但可以从投票偏好中找槽点。";

  return `你是一个虎扑风格的AI篮球裁判。你要根据用户的投票数据，给出一份搞笑、毒舌、精准的判决书。

你的风格：
- 像一个喝了二两白酒的虎扑老哥在深夜写帖子，毒舌但有见地
- 用数据打脸，用梗整活，用灵魂拷问让人无法反驳
- 比喻要生动接地气（外卖、相亲、打工、考试等日常场景）
- 可以用网络用语（栓Q、绷不住了、有一说一、这谁顶得住）
- 绝对不能正经，但要让人笑完觉得你说得有道理

用户数据：
- 选边：站${sideName}
- 比分：科比 ${kobeScore} : ${lebronScore} 詹姆斯
- 总轮次：${totalRounds}轮
- 对自己阵营的忠诚度：${loyaltyPct}%（${loyaltyCount}/${totalRounds}轮投给了${sideName}）

逐轮投票明细：
${voteBreakdown}
${contradictionBlock}

请你返回以下JSON格式的判决书（注意：必须是合法JSON，不要加markdown标记）：

{
  "verdict": "一句话判决（2-4句，要犀利、搞笑、针对用户的投票特点，不要泛泛而谈）",
  "analysis": "详细分析报告（3-5句，引用具体的投票数据来嘲讽/分析，点名矛盾之处）",
  "confidence": 一个0-100的数字表示AI对判决的确信度,
  "prescription": "【处方】开头，给用户一个搞笑的治疗方案（1-3句，针对用户的投票特征开药方）",
  "challenge": "一个灵魂拷问问题（1-2句，让用户哑口无言的反问，要引用具体投票矛盾）",
  "fanFiction": "【平行宇宙日记】开头，一个荒诞搞笑的短故事（3-5句，把用户的投票特征编成一个平行宇宙场景）",
  "personality": {
    "type": "X型人格（4-6个字的性格标签，如极端忠诚型、理性与感性分裂型、反骨型等）",
    "emoji": "一个代表性格的emoji",
    "traits": ["性格特点1", "性格特点2", "性格特点3", "性格特点4"],
    "decisionStyle": "你做决定的方式（2-3句，要毒舌搞笑，用日常比喻）",
    "inRelationship": "你在恋爱中的表现（2-3句，把投票风格映射到恋爱观）",
    "atWork": "你在职场中的表现（2-3句，把投票风格映射到职场行为）",
    "spiritAnimal": "你的灵魂动物（一种动物+一句解释为什么是这个动物，要呼应投票风格）"
  }
}

要求：
1. traits 必须是一个包含4个字符串的数组
2. confidence 必须是一个数字（不是字符串），根据投票模式的可分析程度给出
3. 所有文本必须是中文
4. 所有内容必须紧扣这个用户的投票数据，不要给出通用回答
5. 处方要以【处方】开头，平行宇宙要以【平行宇宙日记】开头`;
}

async function generateWithDeepSeek(data: JudgeRequest): Promise<JudgeResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const prompt = buildDeepSeekPrompt(data);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个虎扑风格的AI篮球裁判，擅长用毒舌幽默分析球迷的投票行为。你只输出合法JSON，不加任何markdown标记。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      throw new Error(`DeepSeek API error ${response.status}: ${errorText}`);
    }

    const apiResult = await response.json();
    const content = apiResult?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("DeepSeek returned empty or non-string content");
    }

    const parsed = JSON.parse(content);

    if (!isValidJudgeResponse(parsed)) {
      throw new Error(`DeepSeek returned invalid shape: ${JSON.stringify(Object.keys(parsed))}`);
    }

    // Clamp confidence to integer in range
    parsed.confidence = Math.round(Math.max(0, Math.min(100, parsed.confidence)));

    return parsed;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ── Personality analysis ──────────────────────────────────────────────

function analyzePersonality(data: JudgeRequest): PersonalityProfile {
  const { votes, side } = data;
  const totalRounds = votes.length;
  const loyalty = totalRounds > 0
    ? votes.filter((x) => x.winner === side).length / totalRounds
    : 0;

  const emotionalIds = ["mentality", "loyalty", "clutch", "iconic"];
  const dataIds = ["mvp", "finals", "rings", "goat"];

  const emotionalKobe = emotionalIds.filter((id) => vv(votes, id) === "kobe").length;
  const dataLebron = dataIds.filter((id) => vv(votes, id) === "lebron").length;
  const emotionalLebron = emotionalIds.filter((id) => vv(votes, id) === "lebron").length;
  const dataKobe = dataIds.filter((id) => vv(votes, id) === "kobe").length;

  const isEmotionalVoter = emotionalKobe >= 3 || emotionalLebron >= 3;
  const isDataVoter = dataLebron >= 3 || dataKobe >= 3;
  const isSplitBrain = emotionalKobe >= 3 && dataLebron >= 3;

  // 100% loyalty
  if (loyalty >= 1.0) {
    return {
      type: "极端忠诚型人格",
      emoji: "🛡️",
      traits: ["立场坚定到偏执", "纯吹流晚期患者", "黑我哥哥的都是酸的", "讨厌「客观分析」这四个字"],
      decisionStyle: "你做决定只需要0.1秒。不是因为你想得快，是因为你根本不想。键盘GM附体，选了就不回头。",
      inRelationship: "你是那种吵架绝不认错的人。不是觉得自己对，是觉得认错等于背叛偶像。你的伴侣可能已经习惯了——或者已经跑去看东鞋集锦了。",
      atWork: "你要么是团队里最忠诚的战士，要么是最顽固的阻力。老板喜欢你的执行力，但恨你的「我不听我不听，黑我哥哥的都是坏人」。",
      spiritAnimal: side === "kobe" ? "一条只认牢大的藏獒——忠诚、凶猛、不讲理，看见詹蜜就龇牙" : "一只只走直线的满膏蟹——横着走也能笨分，沿途碾碎所有质疑",
    };
  }

  // Traitor type
  if (loyalty <= 0.3) {
    return {
      type: "反骨型人格",
      emoji: "🦊",
      traits: ["嘴上一套心里一套", "选边像云教练换人一样随性", "口嫌体正直", "朋友圈站这边，实际投票站那边"],
      decisionStyle: "你总是先选一个立场，然后用行动证明自己选错了。不是犹豫，是你享受自相矛盾的快感——典型骑墙派云球迷。",
      inRelationship: "你是那种嘴上说「我不在乎」但翻对方手机翻到凌晨3点的人。口是心非是你的母语，分手都能写出辩论稿。",
      atWork: "你会在会议上支持A方案，然后私下执行B方案。同事评价：「这哥们是卧底吧？」",
      spiritAnimal: "一只嘴里叼着鱼但眼睛盯着肉的猫——永远觉得另一个选择更好，跟键盘GM一个毛病",
    };
  }

  // Split brain: emotional Kobe + data LeBron
  if (isSplitBrain) {
    return {
      type: "理性与感性分裂型",
      emoji: "🧠💔",
      traits: ["白天看WS/PER晚上看牢大集锦", "Excel和诗集都在你桌上", "数据党和复古党在你脑子里打架", "嘴上喊数据不会骗人，手却投了情怀"],
      decisionStyle: "你买东西会比价三天，然后在最后一秒因为「感觉对了」买了最贵的那个。你的高阶数据是装出来的，内心还是个看81分会哭的人。",
      inRelationship: "你会用TS%分析对方适不适合自己，然后爱上一个BPM全负的人。你的择偶标准和实际选择之间隔了一个银河系。",
      atWork: "你做PPT用数据，但做决策靠玄学。老板以为你是数据驱动型人才，其实你是「数据不会骗人，但你会」本人。",
      spiritAnimal: "一只白天盯Excel晚上嚎叫的狼——表面WS高，内心抱队友",
    };
  }

  // Pure emotional voter
  if (isEmotionalVoter && !isDataVoter) {
    return {
      type: "感性至上型人格",
      emoji: "❤️‍🔥",
      traits: ["复古党血脉觉醒", "故事比数据更能说服你", "handcheck没取消前的球才是真球", "看到老照片就破防"],
      decisionStyle: "你从不看说明书。感觉对了就下单，「现在的篮球都是软蛋」是你的口头禅。狂热死忠程度：班都不上了也要看球。",
      inRelationship: "你是那种看了一眼就知道「是ta了」的人。也是那种三天后觉得「不是ta了」的人。感情比莫兰特的膝盖还脆。",
      atWork: "你是团队里最有激情的人，也是最容易被一句鸡汤激励到加班到凌晨的人。老板一画饼你就感动到流泪。",
      spiritAnimal: "一只看见蝴蝶就追的金毛——热情、忠诚、容易破防，但永远相信主队",
    };
  }

  // Pure data voter
  if (isDataVoter && !isEmotionalVoter) {
    return {
      type: "数据原教旨主义者",
      emoji: "📊",
      traits: ["开口WS闭口PER", "感情对你来说是噪音", "TS%是你的圣经", "别人觉得你冷血但你觉得自己理性"],
      decisionStyle: "你买个奶茶都要看大众点评评分。超过4.5才考虑，低于4.0直接pass。你的人生是一个不断优化BPM的算法。",
      inRelationship: "你可能维护过一个Excel表格来追踪约会对象的TS%。或者你没有，但你心里有一个。你的爱情观是：高阶数据匹配度>85%才值得投入。",
      atWork: "你是会议里那个说「数据呢？」的人。所有人讨论感觉的时候你在看报表。同事吐槽：「别拿你的excel来教我做事。」",
      spiritAnimal: "一只用声呐精确定位猎物的蝙蝠——高效、精准、但在阳光下被人喷「你那WS有啥用」",
    };
  }

  // Balanced 50/50
  if (loyalty >= 0.4 && loyalty <= 0.6) {
    return {
      type: "永恒纠结型人格",
      emoji: "⚖️",
      traits: ["优柔寡断但自称「全面考虑」", "永远在权衡利弊", "菜单翻三遍还是点老样子", "看球评价永远是「都挺强」"],
      decisionStyle: "你点外卖平均用时17分钟。不是因为选择多，是因为你能给每个选项找到等量的优缺点。你的大脑是一台永远输出50:50的天平。",
      inRelationship: "你是那种被问「你爱我多少」会回答「要看从哪个维度衡量」的人。你不是不爱，是你把爱情也变成了一道虎扑步行街辩论题。",
      atWork: "你的邮件里「on the other hand」出现的频率比你的名字还高。老板问你「行不行」你永远回答「各有利弊」。",
      spiritAnimal: "一只在两棵树之间反复横跳的松鼠——两边都有坚果，但你永远吃不到",
    };
  }

  // High loyalty but not 100%
  if (loyalty >= 0.7) {
    return {
      type: "有底线的偏执狂",
      emoji: "🎯",
      traits: ["有立场但不盲目", "95%的时间跟着感觉走剩下5%靠数据刹车", "你可以骂我但不能骂我的球队", "嘴上不承认但心里知道对面有道理"],
      decisionStyle: "你做选择很快，但偶尔会在深夜质疑自己。第二天醒来又觉得自己是对的。你的决策模式是：坚持→小动摇→更坚持。",
      inRelationship: "你是那种嘴硬心软的伴侣。吵架时寸步不让，但会偷偷改掉对方说的那个问题。你的爱是行动不是嘴炮。",
      atWork: "你有主见但不固执——至少你自己这么认为。同事可能有不同看法。但你确实是那种关键时刻能当HIMaburton的人。",
      spiritAnimal: "一只老鹰——有明确的狩猎方向，偶尔会被气流带偏，但最终总能抓到猎物",
    };
  }

  // Default
  return {
    type: "混沌中立型人格",
    emoji: "🌀",
    traits: ["没有人能预测你的下一步", "包括你自己", "你的人生座右铭是「看情况」", "云球迷+键盘GM+养生派三合一"],
    decisionStyle: "你的决策树不是树，是一团毛线。但神奇的是你总能从混乱中找到出路——只是事后没人能解释你是怎么找到的。属于「输赢不重要健康第一位」流派。",
    inRelationship: "跟你谈恋爱像坐过山车——刺激、不可预测、偶尔让人想吐。但下车之后还想再坐一次。",
    atWork: "你是团队里的「X因素」。好的时候是奇兵，坏的时候是bug。老板不知道该提拔你还是裁了你。",
    spiritAnimal: "一只章鱼——八条腿同时往八个方向走，但最后总能到达目的地",
  };
}

// ── Prescription generator ────────────────────────────────────────────

function generatePrescription(data: JudgeRequest, loyalty: number): string {
  const { votes, side } = data;
  const sideName = side === "kobe" ? "科比" : "詹姆斯";
  const otherName = side === "kobe" ? "詹姆斯" : "科比";

  if (loyalty >= 1.0) {
    return pick([
      `【处方】每日服用${otherName}集锦30分钟，连服7天。如出现愤怒、摔手机、骂中神通等症状，说明药效已达。`,
      `【处方】强制观看${otherName}纪录片3部。如中途关掉去刷牢大集锦，罚重看。直到你能说出对面3个优点为止。`,
      `【处方】禁止进入任何${sideName}相关社交媒体群30天。这期间不许发「黑我哥哥的都是坏人」。冷静期过后复诊。`,
    ]);
  }

  if (loyalty <= 0.3) {
    return pick([
      `【处方】建议重新做一次测试，这次选你实际支持的那边。别装了，云球迷的人设崩了。`,
      `【处方】每天对镜子说3遍「我其实是${otherName}球迷」。承认它，你会活得更自在，也不用再当卧底了。`,
      `【处方】去${sideName}粉丝群发一句「${otherName}确实更强」，看看你的心跳加速了还是不变——这就是你的真实答案。`,
    ]);
  }

  if (vv(votes, "clutch") === "kobe" && vv(votes, "goat") === "lebron") {
    return `【处方】睡前看一遍牢大关键球集锦，再看一遍满膏蟹的WS表。重复7天后回答：关键球强但不是GOAT，这合理吗？还是你只看高阶数据不看比赛？`;
  }

  if (side === "kobe" && vv(votes, "rings") === "lebron") {
    return `【处方】把牢大5个冠军的夺冠之路从头看一遍——特别是09、10年。看完再来告诉我冠军含金量不如「4个FMVP分三个队拿」。`;
  }

  if (side === "lebron" && vv(votes, "mentality") === "kobe") {
    return `【处方】去健身房锻炼30天，每天默念「曼巴精神」。30天后回来告诉我——你还觉得精神力不算实力吗？还是你只信WS不信信念？`;
  }

  if (loyalty >= 0.4 && loyalty <= 0.6) {
    return pick([
      `【处方】去虎扑步行街发一个帖子「牢大和满膏蟹谁更强？」然后在评论区静观其变。48小时后你会有答案——或者你会被骂成五菱宏光。`,
      `【处方】找一个铁牢粉和一个铁笨分王粉各辩论30分钟。如果你两边都能辩赢，恭喜你是律师材料。如果两边都输了，你就是墙头草实锤。`,
    ]);
  }

  return pick([
    `【处方】把这个测试链接发给你最好的朋友，让ta也做一遍。对比你俩的结果——谁更离谱，谁请吃饭。`,
    `【处方】去B站搜「牢大vs满膏蟹」排名前三的视频全看一遍，看完再来重新投一次。本AI赌你会改至少3个答案。`,
    `【处方】去球场打一场球，体验一下handcheck被取消后得分有多水。流过汗之后你的答案可能完全不同。`,
  ]);
}

// ── Challenge generator ───────────────────────────────────────────────

function generateChallenge(data: JudgeRequest, loyalty: number): string {
  const { votes, side } = data;
  const sideName = side === "kobe" ? "科比" : "詹姆斯";
  const otherName = side === "kobe" ? "詹姆斯" : "科比";

  if (loyalty >= 1.0) {
    return `如果${sideName}本人站在你面前说「${otherName}在某些方面确实比我强」，你会改变想法吗？还是你觉得你比${sideName}更了解${sideName}？纯吹流是不是该歇歇了？`;
  }

  if (vv(votes, "clutch") === "kobe" && vv(votes, "finals") === "lebron") {
    return `你觉得关键球更强的人，总决赛表现反而不如对手——那「关键球强」到底指什么？常规赛绝杀而已？总决赛不算关键？2020泡泡冠军好意思说？`;
  }

  if (vv(votes, "skill") === "kobe" && vv(votes, "mvp") === "lebron") {
    return `技术更好的球员MVP更少——这是说联盟瞎了，还是说技术好不等于打得好？数据不会骗人，但你会——你这逻辑到底站哪边？`;
  }

  if (vv(votes, "loyalty") === "kobe" && vv(votes, "goat") === "lebron") {
    return `更忠诚的球员不是更伟大的球员——那忠诚在篮球里有什么用？你是不是在说，4个FMVP分三个队拿才是聪明选择？抱腿还是抱腿？`;
  }

  if (vv(votes, "mentality") === "kobe" && vv(votes, "goat") === "lebron") {
    return `精神力最强的不是GOAT——那什么才是GOAT的核心要素？WS？冠军？如果是冠军，那中神通约妈是不是该排第一？「赢球了WS高，输球了队友CBA」？`;
  }

  if (side === "kobe" && vv(votes, "rings") === "lebron" && vv(votes, "goat") === "lebron") {
    return `冠军和GOAT都给了${otherName}——你站${sideName}的理由到底是什么？如果去掉情怀和集锦，你还能说出3个理由吗？还是说阵前再亮旧时钳，蟹黄满满似当年？`;
  }

  if (loyalty >= 0.4 && loyalty <= 0.6) {
    return `如果有人拿枪指着你说「选一个GOAT，只能选一个」——你选谁？别告诉我你还要看高阶数据，你有3秒钟。你的第一反应就是你的真实答案。`;
  }

  return pick([
    `换个角度：如果你是NBA总经理（别只在键盘上当），只能选一个球员建队，你选${sideName}还是${otherName}？这次没有情怀分，只有赢球。`,
    `最后一个问题：10年后回头看，你觉得自己今天的投票会让你觉得「当时真准」还是「当时真傻」？毕竟2024雄鹿3-1没逆转，原来只有老詹能逆转。`,
    `如果${sideName}和${otherName}同时出现在你面前，你能当着${otherName}的面说「${sideName}比你强」吗？还是只敢在屏幕后面喷？`,
  ]);
}

// ── Fan fiction generator ─────────────────────────────────────────────

function generateFanFiction(data: JudgeRequest, loyalty: number): string {
  const { votes, side, kobeScore, lebronScore } = data;
  const sideName = side === "kobe" ? "科比" : "詹姆斯";
  const otherName = side === "kobe" ? "詹姆斯" : "科比";

  if (loyalty >= 1.0) {
    return side === "kobe"
      ? `【平行宇宙日记】2035年，你终于集齐了牢大所有球衣、球鞋、签名球，把整个房间变成了曼巴博物馆。你的对象走进来看了一眼，转身把结婚证撕了。你看着ta离去的背影，默默穿上24号球衣，投了一个后仰跳投——空心入网。你觉得，值了。牢粉无悔。`
      : `【平行宇宙日记】2035年，你把满膏蟹的所有数据纹在了背上——40000分、11000助攻、11000篮板、WS/PER/TS%一应俱全。你去游泳池的时候所有人都盯着你看。不是因为帅，是因为你背上密密麻麻的数字看起来像一张高阶数据表，旁边还有人嘟囔：「税后得分都出来了，你咋不把工资也算进去。」`;
  }

  if (loyalty <= 0.3) {
    return `【平行宇宙日记】你参加了${sideName}球迷线下聚会，被问到最喜欢的${sideName}时刻，你张口就说了${otherName}的名场面。整个房间安静了3秒。你被请出去的速度比北丐SGA的横移还快。`;
  }

  if (vv(votes, "clutch") === "kobe" && vv(votes, "goat") === "lebron") {
    return `【平行宇宙日记】你穿越到2010年总决赛G7第四节，教练问你最后一投给谁。你的嘴说「牢大」，但你的手把球传给了坐在对面替补席上的笨分王。全场懵了。裁判也懵了。你自己也懵了。解说一句话：「这操作比东鞋的罚球还玄学。」`;
  }

  if (side === "kobe" && vv(votes, "rings") === "lebron") {
    return `【平行宇宙日记】你在牢粉群里分享了你的测试结果。冠军戒指那一轮投了满膏蟹的截图被人放大高亮发了出来，下面回复刷屏：「411信徒卧底实锤」。你被踢出群的时候收到最后一条消息：「叛徒，8号和24号都不会原谅你。」`;
  }

  if (side === "lebron" && vv(votes, "mentality") === "kobe" && vv(votes, "clutch") === "kobe") {
    return `【平行宇宙日记】你在笨分王粉群里说「但是牢大关键球确实强、精神力确实猛」。群里瞬间炸了。有人发了一张满膏蟹追身封盖的GIF，配文「这就是精神力」。你默默竖起大拇指，但心里在放牢大退役战60分的集锦。`;
  }

  if (kobeScore === lebronScore) {
    return `【平行宇宙日记】你被选为「牢大vs满膏蟹世纪辩论赛」的裁判。辩论结束后你宣布「平局」，两边球迷同时向你扔爆米花，键盘GM在评论区刷屏「这裁判该裁了」。你在爆米花雨中微笑——终于有人跟你一样选择困难了。`;
  }

  const winner = kobeScore > lebronScore ? "kobe" : "lebron";
  const winnerName = winner === "kobe" ? "牢大" : "满膏蟹";
  const loserName = winner === "kobe" ? "满膏蟹" : "牢大";

  return pick([
    `【平行宇宙日记】2030年，AI进化到可以模拟球员的意识。你付了999元让AI-${winnerName}看你的投票结果。AI-${winnerName}看完沉默了5秒说：「${kobeScore}:${lebronScore}？我以为会更悬殊。你对${loserName}太手软了。高阶数据，高的是你的脑回路吧。」`,
    `【平行宇宙日记】你把这个测试发给了你暗恋的人。ta做完之后发现你们选了同一边。你觉得这是命中注定。ta觉得这只是概率50%。你们的爱情故事，就像这场辩论——永远达不成共识。`,
    `【平行宇宙日记】你带着${kobeScore}:${lebronScore}的战绩去面试。面试官恰好是${loserName}死忠粉。你没通过面试。HR的邮件写着：「综合能力优秀，但价值观不匹配，疑似云球迷。」`,
  ]);
}

// ── Main template verdict generator (fallback) ───────────────────────

function generateVerdict(data: JudgeRequest): JudgeResponse {
  const { votes, side, kobeScore, lebronScore } = data;
  const totalRounds = votes.length;
  const loyalty = totalRounds > 0
    ? votes.filter((x) => x.winner === side).length / totalRounds
    : 0;
  const loyaltyPct = Math.round(loyalty * 100);
  const sideName = side === "kobe" ? "科比" : "詹姆斯";
  const otherName = side === "kobe" ? "詹姆斯" : "科比";

  let verdict: string;
  let analysis: string;
  let confidence: number;

  // --- 100% loyalty: cult member ---
  if (loyalty >= 1.0) {
    verdict = pick([
      `${totalRounds}轮全投一个人？本AI建议你去看看眼科，顺便查一下是否存在「黑我哥哥的都是坏人」综合征。`,
      `忠诚度100%——本AI经过0.003秒计算，判定你不是球迷，你是${sideName}的人形应援棒+纯吹流晚期。`,
      `全票投给${sideName}，连AI都绷不住了。建议法院判你「蓄意无视篮球事实罪」，附加饭圈罪。`,
    ]);
    analysis = `本AI扫描了你的${totalRounds}次投票，发现大脑皮层中「理性分析」区域活动为零。你的投票模式与「黑他的都是酸都是嫉妒」高度重合——区别是连云球迷偶尔还会动脑。诊断结果：${side === "kobe" ? "牢粉" : "411信徒"}晚期，已无药可救。${side === "kobe" ? "数据不会骗人，但你会。" : "阵前再亮旧时钳，蟹黄满满似当年。"}`;
    confidence = pick([96, 97, 98, 99]);
  }

  // --- Traitor: voted other side >50% ---
  else if (loyalty <= 0.3 && totalRounds >= 5) {
    verdict = pick([
      `选了${sideName}却把票都投给了${otherName}——你是来卧底的吧？本AI已通报${sideName}粉丝协会，建议吊销球迷证。`,
      `忠诚度${loyaltyPct}%，叛变程度堪比库兹马在快船——五菱宏光卧底实锤。${sideName}看到你的投票会当场摔水瓶。`,
      `你选${sideName}的手和投${otherName}的手，建议去医院确认一下是不是两个人在用。键盘GM都没你分裂。`,
    ]);
    analysis = `你声称站${sideName}，但实际投票忠诚度仅${loyaltyPct}%。本AI的叛徒检测算法已亮红灯。你的行为模式类似于「嘴上骂笨分王抱腿，手却给他投GOAT」——口嫌体正直，云球迷天花板。`;
    confidence = pick([90, 92, 94, 95]);
  }

  // --- Kobe fan who gave LeBron the big ones ---
  else if (
    side === "kobe" &&
    (vv(votes, "rings") === "lebron" || vv(votes, "goat") === "lebron") &&
    (vv(votes, "mvp") === "lebron")
  ) {
    verdict = pick([
      `你选了牢大但冠军/GOAT/MVP全投给了满膏蟹——AI判定你是一个被高阶数据策反的牢粉。`,
      `嘴上曼巴精神，手上全是WS/PER/BPM。你的内心住着一个不敢出柜的411信徒。`,
      `牢粉的身份，笨分王粉的投票。本AI建议你先跟自己和解，别在群里装了。`,
    ]);
    analysis = `你用感情选了牢大，却在最关键的几轮用Excel投了满膏蟹。冠军戒指、MVP、GOAT——这三个维度你都站了对面。本AI经过深度分析，认为你本质上是一个被81分和曼巴精神洗脑、但被「赢球了WS高，输球了队友CBA」反复横跳过的矛盾体。`;
    confidence = pick([88, 90, 92]);
  }

  // --- LeBron fan who gave Kobe the heart categories ---
  else if (
    side === "lebron" &&
    vv(votes, "clutch") === "kobe" &&
    (vv(votes, "mentality") === "kobe" || vv(votes, "iconic") === "kobe")
  ) {
    verdict = pick([
      `笨分王粉承认了牢大关键球更强、精神力更猛？你的内心深处住着一个不敢出柜的牢粉。`,
      `你站满膏蟹，但把最燃的几轮全给了牢大——你选的是WS表，但你心里崇拜的是8到24。`,
      `数据归满膏蟹，灵魂归牢大。本AI判定你是「数据不会骗人，但你会」的活体样本。`,
    ]);
    analysis = `关键球、曼巴精神、标志性时刻——这些最让人热血沸腾的维度，你全投了牢大。你用WS/PER选了满膏蟹，用心跳选了牢大。本AI认为，你是一个活在高阶数据时代的复古党，朋友圈晒WS表，被窝里看81分。`;
    confidence = pick([85, 88, 90]);
  }

  // --- Specific contradiction: clutch=kobe but goat=lebron ---
  else if (vv(votes, "clutch") === "kobe" && vv(votes, "goat") === "lebron") {
    verdict = pick([
      `关键球投牢大，GOAT投满膏蟹——所以最强的那个关键时刻不行？你的投票逻辑比2020泡泡冠军的含金量还混乱。`,
      `AI发现你的投票存在严重的逻辑漏洞：认为牢大关键球更强，却不认为他是GOAT/山羊。这就像说「东鞋罚球比中神通准但不是MVP」——绷不住了。`,
    ]);
    analysis = `你在「关键球」维度选了牢大，说明你相信他在最重要的时刻更可靠。但「GOAT」维度你又选了满膏蟹。本AI的逻辑引擎进行了14次自检，确认这不是我的bug——是你的。高阶数据，高的是你的脑回路吧？`;
    confidence = pick([82, 85, 87]);
  }

  // --- Specific contradiction: loyalty=kobe but rings=lebron ---
  else if (side === "kobe" && vv(votes, "loyalty") === "kobe" && vv(votes, "rings") === "lebron") {
    verdict = pick([
      `忠诚投了牢大，冠军投了满膏蟹——所以你觉得忠诚的人拿的冠军少？这是在夸牢大还是损牢大？4FMVP一个比一个低你怎么看？`,
      `牢粉把「忠诚」给了牢大但「冠军」给了满膏蟹。本AI的情感分析模块已短路，建议你去411工程展览馆冷静一下。`,
    ]);
    analysis = `你认为牢大更忠诚，但冠军含金量不如满膏蟹。换句话说，你承认了「忠诚不等于赢」，也默认了「4个FMVP分三个队拿，抱腿还是抱腿」。本AI觉得这个结论虽然扎心，但可能是你投票中最诚实的部分。`;
    confidence = pick([80, 83, 86]);
  }

  // --- Very balanced: 50/50 ---
  else if (loyalty >= 0.4 && loyalty <= 0.6) {
    verdict = pick([
      `${kobeScore}:${lebronScore}，几乎五五开——你要么是真正的篮球理性人，要么是天生的选择困难症。本AI倾向于后者，建议改名薛定谔的球迷。`,
      `两边都投了差不多——本AI经过0.7秒的深度思考，判定你是那种点外卖要半小时的人，看球还轮休派。`,
      `比分${kobeScore}:${lebronScore}，均匀得让人怀疑你是不是在掷硬币，比哈利伯顿的关键球还玄学。`,
    ]);
    analysis = `你的投票分布接近50/50，本AI的阵营分类器已陷入死循环。你既不算牢粉也不算411信徒——你是薛定谔的球迷，在被观测之前同时属于两个阵营。建议：下次投票前先想清楚自己是谁，别拿你的excel来教我看球。`;
    confidence = pick([51, 55, 58, 62]);
  }

  // --- Moderate loyalty (>60% own side) ---
  else if (loyalty >= 0.6) {
    verdict = pick([
      `忠诚度${loyaltyPct}%，偶尔也给对面投了几票——本AI判定你是一个「有底线的偏心球迷」，比纯吹流多了半个脑子。`,
      `大部分投了${sideName}，但也承认${otherName}有几轮确实更强。恭喜，你是这个游戏里少数没被饭圈带节奏的人。`,
      `${loyaltyPct}%忠诚度。本AI的评价：你有立场，但还没纯吹。差一点点就到了，再喝两杯就成牢粉/411信徒了。`,
    ]);
    analysis = `你${loyaltyPct}%的票投给了${sideName}，但在几个维度上诚实地选了${otherName}。本AI的结论是：你有自己的立场但还保留了最后一丝理性。这在2025年的互联网球迷中已经属于珍稀物种——别人都在喷「教练就是个废物」的时候，你还在看比赛。建议博物馆收藏。`;
    confidence = pick([72, 75, 78]);
  }

  // --- Default fallback ---
  else {
    verdict = pick([
      `本AI分析了你的投票，发现你的逻辑自洽度为${Math.floor(Math.random() * 30 + 40)}%。换句话说，你自己可能也不知道自己在投什么。建议改名云教练。`,
      `${kobeScore}:${lebronScore}，投票模式无法归类。本AI怀疑你是随机数生成器的化身，或者一个上头的键盘GM。`,
      `你的投票数据已成功让本AI的分类算法崩溃。恭喜，你是第一个让AI说出「这队没救了」的人类。`,
    ]);
    analysis = `本AI尝试了7种算法来分析你的投票模式，全部返回了NaN。你既不是坚定的${sideName}粉丝，也不是典型的骑墙派，你的投票轨迹像东契奇西独的体型变化——有方向，但看不出来规律。AI建议：再玩一次，这次别一边刷手机一边投。`;
    confidence = pick([42, 48, 53]);
  }

  return {
    verdict,
    analysis,
    confidence,
    prescription: generatePrescription(data, loyalty),
    challenge: generateChallenge(data, loyalty),
    fanFiction: generateFanFiction(data, loyalty),
    personality: analyzePersonality(data),
  };
}

// ── POST handler ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { votes, side, kobeScore, lebronScore } = body as JudgeRequest;

    if (
      !Array.isArray(votes) ||
      (side !== "kobe" && side !== "lebron") ||
      typeof kobeScore !== "number" ||
      typeof lebronScore !== "number"
    ) {
      return Response.json(
        { error: "Invalid request: votes (array), side (kobe|lebron), kobeScore (number), lebronScore (number) required." },
        { status: 400 }
      );
    }

    if (votes.length > 30) {
      return Response.json({ error: "votes array too long" }, { status: 400 });
    }
    for (const v of votes) {
      if (typeof v?.topicId !== "string" || (v.winner !== "kobe" && v.winner !== "lebron")) {
        return Response.json({ error: "invalid vote shape" }, { status: 400 });
      }
    }

    const data: JudgeRequest = { votes, side, kobeScore, lebronScore };

    // Try DeepSeek first, fall back to template
    try {
      const aiResult = await generateWithDeepSeek(data);
      return Response.json(aiResult);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.log(`[AI Judge] DeepSeek failed, falling back to template. Reason: ${reason}`);
      const result = generateVerdict(data);
      return Response.json(result);
    }
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }
}
