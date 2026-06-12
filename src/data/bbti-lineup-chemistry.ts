import type { BbtiCompareReport } from "./bbti-rivalries";

export const BBTI_LINEUP_CHEMISTRY_VERSION = "bbti-lineup-chemistry-v1" as const;

export type BbtiLineupChemistryCardId = "compatibility" | "nemesis";
export type BbtiLineupChemistryBriefId = "role-split" | "friction-plan" | "fit-action";

export interface BbtiLineupChemistryBrief {
  id: BbtiLineupChemistryCardId;
  qaKey: string;
  roleTitle: string;
  roleSplit: string;
  frictionTitle: string;
  frictionPlan: string;
  actionTitle: string;
  fitAction: string;
  copyCue: string;
  version: typeof BBTI_LINEUP_CHEMISTRY_VERSION;
}

interface ResolveBbtiLineupChemistryBriefInput {
  id: BbtiLineupChemistryCardId;
  report: BbtiCompareReport;
}

export function resolveBbtiLineupChemistryBrief({
  id,
  report,
}: ResolveBbtiLineupChemistryBriefInput): BbtiLineupChemistryBrief {
  const firstShared = report.sharedAxes[0];
  const firstClash = report.clashAxes[0];
  const sharedLabel = firstShared?.label ?? "关键回合";
  const clashLabel = firstClash?.label ?? "篮球标准";

  if (id === "compatibility") {
    return {
      id,
      qaKey: `${id}-${report.codeA}-${report.codeB}`,
      roleTitle: "更衣室分工",
      roleSplit: `${report.typeA.name}先定比赛标准，${report.typeB.name}负责把「${sharedLabel}」滚成优势。`,
      frictionTitle: "冲突预案",
      frictionPlan: firstClash
        ? `先约定「${clashLabel}」怎么判：${firstClash.left} vs ${firstClash.right}，再进双人报告。`
        : "你们太同频，先指定一个反方标准，避免只抱团取暖。",
      actionTitle: "互补动作",
      fitAction: firstClash
        ? "复制邀请后，让朋友先回答这条分歧，再打开完整报告。"
        : "复制邀请后，让朋友带一个反方观点进场，避免报告只剩同意。",
      copyCue: "先分工，再开完整双人报告。",
      version: BBTI_LINEUP_CHEMISTRY_VERSION,
    };
  }

  return {
    id,
    qaKey: `${id}-${report.codeA}-${report.codeB}`,
    roleTitle: "对线分工",
    roleSplit: `${report.typeA.name}当主辩，${report.typeB.name}专门拆「${clashLabel}」这条线。`,
    frictionTitle: "控场提醒",
    frictionPlan: firstClash
      ? `把「${clashLabel}」当第一回合，不要还没看球就先吵谁更懂。`
      : "你们太像，死敌感来自立场强度；请先互换一条最硬论据。",
    actionTitle: "补救动作",
    fitAction: firstClash
      ? "先复制约战邀请，把第一回合限定在一个维度，别把群聊拖成散架局。"
      : "先互换立场各打 30 秒，再打开完整报告看谁破防。",
    copyCue: "先约法三章，再开完整双人报告。",
    version: BBTI_LINEUP_CHEMISTRY_VERSION,
  };
}

export function buildBbtiLineupChemistryCopy({
  brief,
  report,
  url,
}: {
  brief: BbtiLineupChemistryBrief;
  report: BbtiCompareReport;
  url: string;
}): string {
  return [
    `BBTI ${brief.id === "compatibility" ? "最佳搭档" : "死对头"}：${report.codeA} ${report.typeA.name} x ${report.codeB} ${report.typeB.name}`,
    report.oneLiner,
    report.courtChemistry,
    `${brief.roleTitle}：${brief.roleSplit}`,
    `${brief.frictionTitle}：${brief.frictionPlan}`,
    `${brief.actionTitle}：${brief.fitAction}`,
    report.challenge,
    url,
  ].join("\n");
}
