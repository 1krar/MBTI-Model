import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { RefreshCw, ArrowRight, Check, RotateCcw, Sparkles, Brain, Heart, Zap, Coffee, Globe, Quote } from 'lucide-react';

// --- Types & Localization ---

type Language = 'zh' | 'en';
type Dimension = 'EI' | 'SN' | 'TF' | 'JP';

interface LocalizedText {
  en: string;
  zh: string;
}

interface Question {
  id: string;
  dimension: Dimension;
  text: LocalizedText;
  optionA: { text: LocalizedText; value: string }; // e.g., value: 'E'
  optionB: { text: LocalizedText; value: string }; // e.g., value: 'I'
}

type QuestionBank = Record<Dimension, Question[]>;

interface ArchetypeDetail {
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  traits: LocalizedText[];
}

// --- UI Translations ---

const UI_TEXT = {
  intro: {
    badge: { en: "Personality Test", zh: "MBTI 人格测试" },
    title: { en: "Discover Your True Self", zh: "探索真实的自己" },
    desc: { 
      en: "Answer a few questions to unlock your MBTI personality type. No boring questions—refresh the ones you don't like!", 
      zh: "回答几个问题来解锁你的 MBTI 人格类型。拒绝枯燥——如果你不喜欢某个问题，随时刷新它！" 
    },
    startBtn: { en: "Start Assessment", zh: "开始测试" }
  },
  play: {
    refreshBtn: { en: "Refresh Question", zh: "换一题" },
    progress: { en: "Question", zh: "第" }, // "Question 1/5" vs "第 1/5 题" logic handled in component
    progressSuffix: { en: "", zh: "题" },
    instruction: { en: "Select the option that best describes you naturally.", zh: "选择最能自然描述你的选项。" }
  },
  result: {
    subtitle: { en: "Your Personality Type", zh: "你的人格类型" },
    retakeBtn: { en: "Retake Test", zh: "重新测试" },
    traitsTitle: { en: "Traits Breakdown", zh: "特质分析" },
    dimensions: {
      E: { en: "Extraversion", zh: "外向 (E)" },
      I: { en: "Introversion", zh: "内向 (I)" },
      S: { en: "Sensing", zh: "实感 (S)" },
      N: { en: "Intuition", zh: "直觉 (N)" },
      T: { en: "Thinking", zh: "思考 (T)" },
      F: { en: "Feeling", zh: "情感 (F)" },
      J: { en: "Judging", zh: "判断 (J)" },
      P: { en: "Perceiving", zh: "感知 (P)" }
    }
  },
  titles: {
    EI: { en: "Energy: Extraversion vs Introversion", zh: "能量：外向 vs 内向" },
    SN: { en: "Perception: Sensing vs Intuition", zh: "感知：实感 vs 直觉" },
    TF: { en: "Judgment: Thinking vs Feeling", zh: "判断：思考 vs 情感" },
    JP: { en: "Lifestyle: Judging vs Perceiving", zh: "生活方式：判断 vs 感知" }
  }
};

const ARCHETYPES: Record<string, ArchetypeDetail> = {
  'INTJ': {
    name: { en: 'The Architect', zh: '建筑师' },
    tagline: { en: "Imaginative and strategic thinkers, with a plan for everything.", zh: "富有想象力和战略性的思想家，一切皆在计划之中。" },
    description: {
      en: "INTJs are analytical problem-solvers who want to improve systems and processes with their innovative ideas. They have a talent for seeing possibilities for improvement, whether at work, at home, or in themselves.",
      zh: "INTJ 是善于分析的问题解决者，渴望用创新理念改进系统和流程。无论是在工作、生活还是自我提升方面，他们都极具发现改进空间的天赋。"
    },
    traits: [
      { en: "Strategic", zh: "战略性" }, { en: "Independent", zh: "独立" }, { en: "Logical", zh: "逻辑强" }
    ]
  },
  'INTP': {
    name: { en: 'The Logician', zh: '逻辑学家' },
    tagline: { en: "Innovative inventors with an unquenchable thirst for knowledge.", zh: "具有创造力的发明家，对知识有着止不住的渴望。" },
    description: {
      en: "INTPs are philosophical innovators, fascinated by logical analysis, systems, and design. They are preoccupied with theory, and search for the universal law behind everything they see. They want to understand the unifying themes of life.",
      zh: "INTP 是哲学式的创新者，沉迷于逻辑分析、系统和设计。他们专注于理论，试图寻找万物背后的普遍规律，渴望理解生命的统一主题。"
    },
    traits: [
      { en: "Curious", zh: "好奇" }, { en: "Abstract", zh: "抽象" }, { en: "Objective", zh: "客观" }
    ]
  },
  'ENTJ': {
    name: { en: 'The Commander', zh: '指挥官' },
    tagline: { en: "Bold, imaginative and strong-willed leaders.", zh: "大胆、富有想象力且意志强大的领导者。" },
    description: {
      en: "ENTJs are strategic leaders, motivated to organize change. They are quick to see inefficiency and conceptualize new solutions, and enjoy developing long-range plans to accomplish their vision.",
      zh: "ENTJ 是战略型的领导者，热衷于组织变革。他们能迅速发现低效之处并构思新的解决方案，享受制定长期计划以实现愿景。"
    },
    traits: [
      { en: "Efficient", zh: "高效" }, { en: "Energetic", zh: "精力充沛" }, { en: "Confident", zh: "自信" }
    ]
  },
  'ENTP': {
    name: { en: 'The Debater', zh: '辩论家' },
    tagline: { en: "Smart and curious thinkers who cannot resist an intellectual challenge.", zh: "聪明好奇的思想者，无法拒绝智力挑战。" },
    description: {
      en: "ENTPs are inspired innovators, motivated to find new solutions to intellectually challenging problems. They are curious and clever, and seek to comprehend the people, systems, and principles that surround them.",
      zh: "ENTP 是受启发的创新者，致力于为智力挑战寻找新方案。他们聪明好奇，试图理解周围的人、系统和原则，辩论对他们来说是一种探索方式。"
    },
    traits: [
      { en: "Knowledgeable", zh: "博学" }, { en: "Quick-witted", zh: "机智" }, { en: "Original", zh: "原创" }
    ]
  },
  'INFJ': {
    name: { en: 'The Advocate', zh: '提倡者' },
    tagline: { en: "Quiet and mystical, yet very inspiring and tireless idealists.", zh: "安静而神秘，同时又是鼓舞人心且不知疲倦的理想主义者。" },
    description: {
      en: "INFJs are creative nurturers with a strong sense of personal integrity and a drive to help others realize their potential. Creative and dedicated, they have a talent for helping others with original solutions to their personal challenges.",
      zh: "INFJ 是富有创造力的培育者，拥有强烈的个人正直感，致力于帮助他人发挥潜能。他们既有创意又专注，擅长用独特的方案帮助他人克服个人挑战。"
    },
    traits: [
      { en: "Insightful", zh: "有洞察力" }, { en: "Altruistic", zh: "利他" }, { en: "Creative", zh: "有创意" }
    ]
  },
  'INFP': {
    name: { en: 'The Mediator', zh: '调停者' },
    tagline: { en: "Poetic, kind and altruistic people, always eager to help a good cause.", zh: "诗意、善良的利他主义者，总是热情地为正义事业提供帮助。" },
    description: {
      en: "INFPs are imaginative idealists, guided by their own core values and beliefs. To a Healer, possibilities are paramount; the realism of the moment is only of passing concern. They see potential for a better future, and pursue truth and meaning with their own individual flair.",
      zh: "INFP 是充满想象力的理想主义者，由核心价值观指引。对他们而言，未来的可能性至高无上，当下的现实只是暂时的。他们追求真理和意义，渴望构建更美好的未来。"
    },
    traits: [
      { en: "Empathetic", zh: "共情" }, { en: "Open-minded", zh: "开放" }, { en: "Passionate", zh: "热情" }
    ]
  },
  'ENFJ': {
    name: { en: 'The Protagonist', zh: '主人公' },
    tagline: { en: "Charismatic and inspiring leaders, able to mesmerize their listeners.", zh: "富有魅力且鼓舞人心的领导者，有能力迷住听众。" },
    description: {
      en: "ENFJs are idealist organizers, driven to implement their vision of what is best for humanity. They often act as catalysts for human growth because of their ability to see potential in other people and their charisma in persuading others to their ideas.",
      zh: "ENFJ 是理想主义的组织者，致力于实现对他人类最好的愿景。他们能看到他人的潜能，并用人格魅力说服他人，常被视为人类成长的催化剂。"
    },
    traits: [
      { en: "Charismatic", zh: "有魅力" }, { en: "Reliable", zh: "可靠" }, { en: "Leader", zh: "领袖" }
    ]
  },
  'ENFP': {
    name: { en: 'The Campaigner', zh: '竞选者' },
    tagline: { en: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.", zh: "热情、有创造力且善于交际的自由灵魂，总能找到微笑的理由。" },
    description: {
      en: "ENFPs are people-centered creators with a focus on possibilities and a contagious enthusiasm for new ideas, people and activities. Energetic, warm, and passionate, ENFPs love to help other people explore their creative potential.",
      zh: "ENFP 是以人为本的创造者，专注于可能性，对新理念、新朋友和新活动充满感染力。他们精力充沛、温暖热情，热爱帮助他人探索创造潜力。"
    },
    traits: [
      { en: "Curious", zh: "好奇" }, { en: "Observant", zh: "善观察" }, { en: "Energetic", zh: "活力" }
    ]
  },
  'ISTJ': {
    name: { en: 'The Logistician', zh: '物流师' },
    tagline: { en: "Practical and fact-minded individuals, whose reliability cannot be doubted.", zh: "务实且讲求事实的人，其可靠性不容置疑。" },
    description: {
      en: "ISTJs are responsible organizers, driven to create and enforce order within systems and institutions. They are neat and orderly, inside and out, and tend to have a procedure for everything they do.",
      zh: "ISTJ 是负责任的组织者，致力于在系统和机构中建立秩序。他们内外整洁有序，做任何事情通常都有一套固定的程序。"
    },
    traits: [
      { en: "Honest", zh: "诚实" }, { en: "Dutiful", zh: "尽责" }, { en: "Responsible", zh: "负责" }
    ]
  },
  'ISFJ': {
    name: { en: 'The Defender', zh: '守卫者' },
    tagline: { en: "Very dedicated and warm protectors, always ready to defend their loved ones.", zh: "非常专注而温暖的守护者，时刻准备着保护他们爱的人。" },
    description: {
      en: "ISFJs are industrious caretakers, loyal to traditions and organizations. They are practical, compassionate, and caring, and are motivated to provide for others and protect them from the perils of life.",
      zh: "ISFJ 是勤勉的守护者，忠于传统和组织。他们务实、富有同情心和关怀心，致力于照顾他人，保护大家免受生活中的风雨。"
    },
    traits: [
      { en: "Supportive", zh: "支持性" }, { en: "Patient", zh: "耐心" }, { en: "Reliable", zh: "可靠" }
    ]
  },
  'ESTJ': {
    name: { en: 'The Executive', zh: '总经理' },
    tagline: { en: "Excellent administrators, unsurpassed at managing things - or people.", zh: "出色的管理者，在管理事务或人员方面无与伦比。" },
    description: {
      en: "ESTJs are hardworking traditionalists, eager to take charge in organizing projects and people. Orderly, rule-abiding, and conscientious, ESTJs like to get things done, and tend to go about projects in a systematic, methodical way.",
      zh: "ESTJ 是勤奋的传统主义者，渴望负责组织项目和人员。他们有序、守规矩且认真尽责，喜欢把事情做完，并倾向于用系统化、有条理的方式开展工作。"
    },
    traits: [
      { en: "Dedicated", zh: "专注" }, { en: "Direct", zh: "直接" }, { en: "Organized", zh: "有序" }
    ]
  },
  'ESFJ': {
    name: { en: 'The Consul', zh: '执政官' },
    tagline: { en: "Extraordinarily caring, social and popular people, always eager to help.", zh: "极有同情心、善于交际且受欢迎的人，总是热心助人。" },
    description: {
      en: "ESFJs are conscientious helpers, sensitive to the needs of others and energetically dedicated to their responsibilities. They are highly attuned to their emotional environment and attentive to both the feelings of others and the perception others have of them.",
      zh: "ESFJ 是认真的帮助者，对他人的需求敏感，并精力充沛地致力于履行责任。他们对情绪环境高度敏感，既关注他人的感受，也关注自己在他人眼中的形象。"
    },
    traits: [
      { en: "Loyal", zh: "忠诚" }, { en: "Warm", zh: "温暖" }, { en: "Social", zh: "社交" }
    ]
  },
  'ISTP': {
    name: { en: 'The Virtuoso', zh: '鉴赏家' },
    tagline: { en: "Bold and practical experimenters, masters of all kinds of tools.", zh: "大胆而务实的实验家，擅长使用各种工具。" },
    description: {
      en: "ISTPs are observant artisans with an understanding of mechanics and an interest in troubleshooting. They approach their environments with a flexible logic, looking for practical solutions to the problems at hand.",
      zh: "ISTP 是善于观察的工匠，了解机械原理并对故障排除感兴趣。他们用灵活的逻辑应对环境，寻找手头问题的实际解决方案。"
    },
    traits: [
      { en: "Relaxed", zh: "松弛" }, { en: "Practical", zh: "务实" }, { en: "Rational", zh: "理性" }
    ]
  },
  'ISFP': {
    name: { en: 'The Adventurer', zh: '探险家' },
    tagline: { en: "Flexible and charming artists, always ready to explore and experience something new.", zh: "灵活有魅力的艺术家，时刻准备探索和体验新鲜事物。" },
    description: {
      en: "ISFPs are gentle caretakers who live in the present moment and enjoy their surroundings with cheerful, low-key enthusiasm. They are flexible and spontaneous, and like to go with the flow to enjoy what life has to offer.",
      zh: "ISFP 是温柔的守护者，活在当下，用愉快、低调的热情享受周围环境。他们灵活随性，喜欢顺其自然，享受生活给予的一切。"
    },
    traits: [
      { en: "Charming", zh: "迷人" }, { en: "Sensitive", zh: "敏感" }, { en: "Artistic", zh: "艺术" }
    ]
  },
  'ESTP': {
    name: { en: 'The Entrepreneur', zh: '企业家' },
    tagline: { en: "Smart, energetic and very perceptive people, who truly enjoy living on the edge.", zh: "聪明、精力充沛且感知力敏锐的人，真心享受边缘生活。" },
    description: {
      en: "ESTPs are energetic thrill-seekers who are at their best when putting out fires, whether literal or metaphorical. They bring a sense of dynamic energy to their interactions with others and the world around them.",
      zh: "ESTP 是精力充沛的寻求刺激者，无论是字面意义还是比喻意义上的“救火”，都是他们的拿手好戏。他们为与世界的互动带来了充满活力的动态能量。"
    },
    traits: [
      { en: "Bold", zh: "大胆" }, { en: "Perceptive", zh: "敏锐" }, { en: "Sociable", zh: "善交际" }
    ]
  },
  'ESFP': {
    name: { en: 'The Entertainer', zh: '表演者' },
    tagline: { en: "Spontaneous, energetic and enthusiastic people - life is never boring around them.", zh: "自发、精力充沛且热情的人——有他们在，生活绝不无聊。" },
    description: {
      en: "ESFPs are vivacious entertainers who charm and engage those around them. They are spontaneous, energetic, and fun-loving, and take pleasure in the things around them: food, clothes, nature, animals, and especially people.",
      zh: "ESFP 是活泼的艺人，能吸引并迷住周围的人。他们随性、精力充沛、热爱乐趣，享受生活中的一切：美食、衣服、自然、动物，尤其是人。"
    },
    traits: [
      { en: "Original", zh: "原创" }, { en: "Aesthetics", zh: "审美" }, { en: "Showman", zh: "表现力" }
    ]
  }
};

// --- Data Generation ---

const generateQuestions = (): QuestionBank => {
  // 30 Questions for EI (Extraversion vs Introversion)
  const eiData = [
    { t: { en: "At a large social gathering, you tend to...", zh: "在大型社交聚会上，你倾向于..." }, a: { en: "Interact with many, including strangers", zh: "与很多人互动，包括陌生人" }, b: { en: "Stick to a few people you know", zh: "只与少数熟人待在一起" } },
    { t: { en: "After a stressful week, you recharge by...", zh: "在一周充满压力的工作后，你通过什么充电？" }, a: { en: "Going out with friends", zh: "和朋友出去聚会" }, b: { en: "Spending time alone at home", zh: "独自在家休息" } },
    { t: { en: "When solving a problem, you prefer to...", zh: "解决问题时，你倾向于..." }, a: { en: "Talk it out with others", zh: "与他人讨论" }, b: { en: "Think it through privately", zh: "独自深思熟虑" } },
    { t: { en: "You are usually described as...", zh: "人们通常形容你为..." }, a: { en: "Energetic and open", zh: "充满活力且开放" }, b: { en: "Calm and reserved", zh: "冷静且矜持" } },
    { t: { en: "In conversations, you often...", zh: "在交谈中，你经常..." }, a: { en: "Speak as you think", zh: "边想边说" }, b: { en: "Think before you speak", zh: "想好再说" } },
    { t: { en: "Your ideal workspace is...", zh: "你理想的工作环境是..." }, a: { en: "An open, bustling area", zh: "开放、热闹的区域" }, b: { en: "A quiet, private room", zh: "安静、私密的房间" } },
    { t: { en: "Meeting new people makes you feel...", zh: "结识新朋友让你感到..." }, a: { en: "Excited and energized", zh: "兴奋且充满能量" }, b: { en: "Drained or anxious", zh: "疲惫或焦虑" } },
    { t: { en: "When the phone rings, you...", zh: "电话响时，你..." }, a: { en: "Answer it quickly", zh: "迅速接听" }, b: { en: "Prefer to text back later", zh: "更愿意稍后发短信" } },
    { t: { en: "You prefer to have...", zh: "你更喜欢拥有..." }, a: { en: "A wide circle of acquaintances", zh: "广泛的熟人圈子" }, b: { en: "A few deep friendships", zh: "几个深交的好友" } },
    { t: { en: "In a team, you prefer to...", zh: "在团队中，你倾向于..." }, a: { en: "Lead the brainstorming", zh: "主导头脑风暴" }, b: { en: "Listen and reflect first", zh: "先倾听和反思" } },
    { t: { en: "When working on a project, you like to...", zh: "做项目时，你喜欢..." }, a: { en: "Collaborate constantly", zh: "持续协作" }, b: { en: "Focus uninterrupted", zh: "不被打扰地专注" } },
    { t: { en: "If you have good news, you...", zh: "如果你有好消息，你会..." }, a: { en: "Tell everyone immediately", zh: "立刻告诉所有人" }, b: { en: "Tell only your closest confidants", zh: "只告诉最亲密的人" } },
    { t: { en: "You tend to focus on...", zh: "你倾向于关注..." }, a: { en: "The outer world of people/things", zh: "外部的人和事" }, b: { en: "The inner world of ideas", zh: "内心的想法" } },
    { t: { en: "Unexpected guests make you feel...", zh: "不速之客让你感到..." }, a: { en: "Delighted", zh: "惊喜" }, b: { en: "Intruded upon", zh: "被打扰" } },
    { t: { en: "You speak...", zh: "你说话通常..." }, a: { en: "Rapidly and loudly", zh: "语速快且声音大" }, b: { en: "Slowly and quietly", zh: "语速慢且声音轻" } },
    { t: { en: "At a networking event, you...", zh: "在社交酒会上，你..." }, a: { en: "Work the room", zh: "穿梭于人群中" }, b: { en: "Stand near the wall", zh: "站在墙边观察" } },
    { t: { en: "Being the center of attention is...", zh: "成为注意力的焦点是..." }, a: { en: "Comfortable", zh: "舒适的" }, b: { en: "Uncomfortable", zh: "不自在的" } },
    { t: { en: "You prefer activities that are...", zh: "你更喜欢的活动是..." }, a: { en: "Action-packed and group-based", zh: "充满行动和团体的" }, b: { en: "Calm and solitary", zh: "平静和独处的" } },
    { t: { en: "When interrupted, you...", zh: "当被打断时，你..." }, a: { en: "Don't mind much", zh: "不太介意" }, b: { en: "Feel annoyed", zh: "感到恼火" } },
    { t: { en: "Your energy tends to be...", zh: "你的精力通常..." }, a: { en: "Directed outward", zh: "向外发散" }, b: { en: "Contained inward", zh: "向内收敛" } },
    { t: { en: "In a conflict, you...", zh: "发生冲突时，你..." }, a: { en: "Debate it out immediately", zh: "立即争论解决" }, b: { en: "Withdraw to process feelings", zh: "撤退以整理情绪" } },
    { t: { en: "You know you're tired when...", zh: "当你累的时候，你会..." }, a: { en: "You become quiet", zh: "变得安静" }, b: { en: "You become irritable", zh: "变得易怒" } },
    { t: { en: "Learning a new skill, you prefer...", zh: "学习新技能时，你更喜欢..." }, a: { en: "Group workshops", zh: "小组研讨会" }, b: { en: "Self-study", zh: "自学" } },
    { t: { en: "On a free weekend, you'd pick...", zh: "在空闲的周末，你会选择..." }, a: { en: "A concert or festival", zh: "音乐会或节日庆典" }, b: { en: "A book or a hike alone", zh: "看书或独自徒步" } },
    { t: { en: "You make decisions...", zh: "你做决定时..." }, a: { en: "Quickly after talking", zh: "讨论后迅速决定" }, b: { en: "Slowly after thinking", zh: "思考后缓慢决定" } },
    { t: { en: "People consider you...", zh: "人们认为你..." }, a: { en: "Easy to get to know", zh: "容易了解" }, b: { en: "Hard to get to know", zh: "难以捉摸" } },
    { t: { en: "Background noise while working is...", zh: "工作时的背景噪音..." }, a: { en: "Stimulating", zh: "令人兴奋" }, b: { en: "Distracting", zh: "令人分心" } },
    { t: { en: "Your facial expressions are...", zh: "你的面部表情..." }, a: { en: "Lively and readable", zh: "生动且易读" }, b: { en: "Subtle and guarded", zh: "微妙且克制" } },
    { t: { en: "When volunteering, you...", zh: "做志愿者时，你..." }, a: { en: "Raise your hand first", zh: "第一个举手" }, b: { en: "Wait to be assigned", zh: "等待分配" } },
    { t: { en: "You feel most alive when...", zh: "你感觉最有活力的时候是..." }, a: { en: "Surrounded by activity", zh: "被人和活动包围" }, b: { en: "Lost in your own thoughts", zh: "沉浸在自己的思绪中" } }
  ];

  // 30 Questions for SN (Sensing vs Intuition)
  const snData = [
    { t: { en: "You focus more on...", zh: "你更关注..." }, a: { en: "Current realities", zh: "当前的现实" }, b: { en: "Future possibilities", zh: "未来的可能性" } },
    { t: { en: "You trust information that is...", zh: "你更信任的信息是..." }, a: { en: "Tangible and concrete", zh: "有形和具体的" }, b: { en: "Theoretical and abstract", zh: "理论和抽象的" } },
    { t: { en: "You prefer instructions that are...", zh: "你更喜欢的说明是..." }, a: { en: "Step-by-step details", zh: "按部就班的细节" }, b: { en: "Big picture concepts", zh: "宏观的概念" } },
    { t: { en: "When describing something, you use...", zh: "描述事物时，你倾向于..." }, a: { en: "Literal facts", zh: "字面事实" }, b: { en: "Metaphors and analogies", zh: "隐喻和类比" } },
    { t: { en: "You are more interested in...", zh: "你更感兴趣的是..." }, a: { en: "What actually happened", zh: "实际发生了什么" }, b: { en: "The meaning behind it", zh: "这背后的意义" } },
    { t: { en: "You value...", zh: "你更看重..." }, a: { en: "Common sense", zh: "常识" }, b: { en: "Imagination", zh: "想象力" } },
    { t: { en: "In a movie, you notice...", zh: "看电影时，你注意到..." }, a: { en: "Costumes and set design", zh: "服装和场景设计" }, b: { en: "Themes and symbolism", zh: "主题和象征意义" } },
    { t: { en: "You prefer to work with...", zh: "你更喜欢处理..." }, a: { en: "Hard data", zh: "硬数据" }, b: { en: "Creative ideas", zh: "创意想法" } },
    { t: { en: "Routine work makes you feel...", zh: "例行公事让你感到..." }, a: { en: "Secure and steady", zh: "安稳和踏实" }, b: { en: "Bored and trapped", zh: "无聊和被束缚" } },
    { t: { en: "You tend to live...", zh: "你倾向于活在..." }, a: { en: "In the present moment", zh: "当下时刻" }, b: { en: "In your head/future", zh: "脑海中或未来" } },
    { t: { en: "When cooking, you...", zh: "做饭时，你..." }, a: { en: "Follow the recipe exactly", zh: "严格遵循食谱" }, b: { en: "Experiment with ingredients", zh: "尝试混合配料" } },
    { t: { en: "You prefer people who are...", zh: "你更喜欢的人是..." }, a: { en: "Realistic and practical", zh: "现实且务实" }, b: { en: "Visionary and original", zh: "有远见且原创" } },
    { t: { en: "Detailed planning is...", zh: "详细的计划..." }, a: { en: "Essential", zh: "必不可少的" }, b: { en: "Tedious", zh: "乏味的" } },
    { t: { en: "You solve problems by...", zh: "你解决问题是通过..." }, a: { en: "Using proven methods", zh: "使用被验证的方法" }, b: { en: "Inventing new ways", zh: "发明新方法" } },
    { t: { en: "Descriptions you write are usually...", zh: "你写的描述通常..." }, a: { en: "Precise", zh: "精确的" }, b: { en: "Poetic", zh: "诗意的" } },
    { t: { en: "You pay more attention to...", zh: "你更关注..." }, a: { en: "Sensory details (sights, sounds)", zh: "感官细节（视觉、听觉）" }, b: { en: "Patterns and connections", zh: "模式和联系" } },
    { t: { en: "Change is...", zh: "变化是..." }, a: { en: "Often unnecessary", zh: "通常没必要的" }, b: { en: "Exciting opportunity", zh: "令人兴奋的机会" } },
    { t: { en: "You learn best by...", zh: "你最好的学习方式是..." }, a: { en: "Doing and practicing", zh: "动手实践" }, b: { en: "Reading and thinking", zh: "阅读思考" } },
    { t: { en: "Facts are...", zh: "事实..." }, a: { en: "Important in themselves", zh: "本身就很重要" }, b: { en: "Useful for proving theories", zh: "用于证明理论" } },
    { t: { en: "When planning a trip...", zh: "计划旅行时..." }, a: { en: "You look at logistics", zh: "你关注后勤细节" }, b: { en: "You imagine the experience", zh: "你想象体验" } },
    { t: { en: "Art should be...", zh: "艺术应该是..." }, a: { en: "Realistic and representational", zh: "写实和具象的" }, b: { en: "Abstract and interpretive", zh: "抽象和需解读的" } },
    { t: { en: "You are more...", zh: "你更..." }, a: { en: "Observant", zh: "善于观察" }, b: { en: "Introspective", zh: "善于内省" } },
    { t: { en: "Your memory focuses on...", zh: "你的记忆侧重于..." }, a: { en: "Visuals and events", zh: "画面和事件" }, b: { en: "Impressions and feelings", zh: "印象和感觉" } },
    { t: { en: "In a meeting, you want...", zh: "开会时，你想要..." }, a: { en: "Actionable items", zh: "可执行的项目" }, b: { en: "Strategic vision", zh: "战略愿景" } },
    { t: { en: "You prefer furniture that is...", zh: "你更喜欢的家具是..." }, a: { en: "Comfortable and sturdy", zh: "舒适且坚固的" }, b: { en: "Stylish and unique", zh: "时尚且独特的" } },
    { t: { en: "Hearing about philosophy is...", zh: "听哲学讨论..." }, a: { en: "Tiring", zh: "累人的" }, b: { en: "Fascinating", zh: "迷人的" } },
    { t: { en: "When buying a gadget, you check...", zh: "买电子产品时，你看重..." }, a: { en: "Specs and features", zh: "规格和功能" }, b: { en: "Concept and design", zh: "概念和设计" } },
    { t: { en: "You trust...", zh: "你相信..." }, a: { en: "History and tradition", zh: "历史和传统" }, b: { en: "Progress and innovation", zh: "进步和创新" } },
    { t: { en: "Your feet are...", zh: "你的双脚..." }, a: { en: "Firmly on the ground", zh: "脚踏实地" }, b: { en: "A bit off the ground", zh: "有些离地（飘）" } },
    { t: { en: "You see a forest as...", zh: "你看到森林时想到..." }, a: { en: "Trees and plants", zh: "树木和植物" }, b: { en: "Life and mystery", zh: "生命和奥秘" } }
  ];

  // 30 Questions for TF (Thinking vs Feeling)
  const tfData = [
    { t: { en: "You make decisions based on...", zh: "你做决定基于..." }, a: { en: "Logic and facts", zh: "逻辑和事实" }, b: { en: "Values and feelings", zh: "价值观和感受" } },
    { t: { en: "It is worse to be...", zh: "更糟糕的是..." }, a: { en: "Unjust", zh: "不公正" }, b: { en: "Merciless", zh: "无情" } },
    { t: { en: "In an argument, you aim for...", zh: "争论中，你的目标是..." }, a: { en: "Finding the truth", zh: "寻找真相" }, b: { en: "Finding agreement", zh: "寻求共识" } },
    { t: { en: "You are more impressed by...", zh: "让你印象更深的是..." }, a: { en: "Strength of mind", zh: "思维的力度" }, b: { en: "Strength of heart", zh: "内心的力量" } },
    { t: { en: "When a friend is sad, you...", zh: "朋友难过时，你..." }, a: { en: "Offer practical advice", zh: "提供实用建议" }, b: { en: "Listen and empathize", zh: "倾听并共情" } },
    { t: { en: "You prefer to be...", zh: "你更愿意成为..." }, a: { en: "Respected", zh: "受人尊敬" }, b: { en: "Liked", zh: "被人喜欢" } },
    { t: { en: "Fairness means...", zh: "公平意味着..." }, a: { en: "Treating everyone equally", zh: "一视同仁" }, b: { en: "Accounting for circumstances", zh: "考虑具体情况" } },
    { t: { en: "You value...", zh: "你更看重..." }, a: { en: "Objectivity", zh: "客观性" }, b: { en: "Harmony", zh: "和谐" } },
    { t: { en: "At work, you are...", zh: "在工作中，你是..." }, a: { en: "Task-oriented", zh: "任务导向" }, b: { en: "People-oriented", zh: "人际导向" } },
    { t: { en: "Critique should be...", zh: "批评应该是..." }, a: { en: "Honest and direct", zh: "诚实直接的" }, b: { en: "Gentle and encouraging", zh: "温和鼓励的" } },
    { t: { en: "You are more likely to...", zh: "你更可能..." }, a: { en: "Hurt feelings by accident", zh: "无意中伤害别人感情" }, b: { en: "Get your feelings hurt", zh: "自己的感情受到伤害" } },
    { t: { en: "A good leader is...", zh: "好的领导是..." }, a: { en: "Firm and just", zh: "坚定公正的" }, b: { en: "Warm and supportive", zh: "温暖支持的" } },
    { t: { en: "You follow your...", zh: "你听从..." }, a: { en: "Head", zh: "大脑" }, b: { en: "Heart", zh: "内心" } },
    { t: { en: "In a debate, you focus on...", zh: "辩论中，你关注..." }, a: { en: "Inconsistencies", zh: "不一致之处" }, b: { en: "Human impact", zh: "对他人的影响" } },
    { t: { en: "Rules are...", zh: "规则是..." }, a: { en: "Meant to be enforced", zh: "用来执行的" }, b: { en: "Guidelines to consider", zh: "仅供参考的指导" } },
    { t: { en: "You analyze things by...", zh: "你分析事物通过..." }, a: { en: "Taking them apart", zh: "拆解它们" }, b: { en: "Seeing who is involved", zh: "看谁参与其中" } },
    { t: { en: "Truth is more important than...", zh: "真理比...更重要" }, a: { en: "Politeness", zh: "礼貌" }, b: { en: "Peace", zh: "和平" } },
    { t: { en: "When firing someone, you'd feel...", zh: "解雇某人时，你会觉得..." }, a: { en: "It's necessary for business", zh: "这对生意是必要的" }, b: { en: "Personally guilty", zh: "个人感到内疚" } },
    { t: { en: "You prioritize...", zh: "你优先考虑..." }, a: { en: "Efficiency", zh: "效率" }, b: { en: "Atmosphere", zh: "氛围" } },
    { t: { en: "Compliments you give are...", zh: "你给出的赞美是关于..." }, a: { en: "Competence", zh: "能力" }, b: { en: "Character", zh: "性格" } },
    { t: { en: "Your tone is usually...", zh: "你的语气通常..." }, a: { en: "Analytical", zh: "分析性的" }, b: { en: "Sympathetic", zh: "同情性的" } },
    { t: { en: "You are persuaded by...", zh: "你被...说服" }, a: { en: "Evidence", zh: "证据" }, b: { en: "Emotional appeal", zh: "情感诉求" } },
    { t: { en: "Seeing someone cry makes you...", zh: "看到别人哭让你..." }, a: { en: "Want to fix their problem", zh: "想解决他们的问题" }, b: { en: "Want to comfort them", zh: "想安慰他们" } },
    { t: { en: "You prefer feedback that is...", zh: "你更喜欢的反馈是..." }, a: { en: "Brutally honest", zh: "直言不讳的" }, b: { en: "Constructive but kind", zh: "建设性但友善的" } },
    { t: { en: "Standardization is...", zh: "标准化是..." }, a: { en: "Good", zh: "好事" }, b: { en: "Dehumanizing", zh: "不人性化的" } },
    { t: { en: "Winning is about...", zh: "赢意味着..." }, a: { en: "Being right", zh: "证明自己是对的" }, b: { en: "Everyone feeling good", zh: "大家都感觉良好" } },
    { t: { en: "You naturally spot...", zh: "你天生能发现..." }, a: { en: "Flaws in logic", zh: "逻辑漏洞" }, b: { en: "Needs of people", zh: "人们的需求" } },
    { t: { en: "When shopping, you buy what is...", zh: "购物时，你买..." }, a: { en: "Best value/rated", zh: "性价比最高/评分最好的" }, b: { en: "Feels right to you", zh: "感觉最对的" } },
    { t: { en: "Justice implies...", zh: "正义意味着..." }, a: { en: "Consequences", zh: "后果" }, b: { en: "Restoration", zh: "恢复" } },
    { t: { en: "Your questions often ask...", zh: "你的问题经常问..." }, a: { en: "\"Why?\" (Mechanism)", zh: "“为什么？”（机制）" }, b: { en: "\"Who?\" (Impact)", zh: "“谁？”（影响）" } }
  ];

  // 30 Questions for JP (Judging vs Perceiving)
  const jpData = [
    { t: { en: "You prefer your life to be...", zh: "你更喜欢你的生活..." }, a: { en: "Scheduled", zh: "有时间表的" }, b: { en: "Spontaneous", zh: "随兴的" } },
    { t: { en: "Deadlines are...", zh: "截止日期是..." }, a: { en: "Targets to meet early", zh: "要提前完成的目标" }, b: { en: "Suggestions to aim for", zh: "努力争取的建议" } },
    { t: { en: "A messy desk makes you...", zh: "杂乱的桌子让你..." }, a: { en: "Anxious", zh: "焦虑" }, b: { en: "Creative", zh: "有创意" } },
    { t: { en: "You work best...", zh: "你工作状态最好是在..." }, a: { en: "Steady progress", zh: "稳步推进时" }, b: { en: "Bursts of energy", zh: "爆发冲刺时" } },
    { t: { en: "You prefer to...", zh: "你更喜欢..." }, a: { en: "Finish projects", zh: "完成项目" }, b: { en: "Start projects", zh: "开启项目" } },
    { t: { en: "When traveling, you want...", zh: "旅行时，你想要..." }, a: { en: "A detailed itinerary", zh: "详细的行程单" }, b: { en: "Freedom to explore", zh: "自由探索的空间" } },
    { t: { en: "Uncertainty is...", zh: "不确定性是..." }, a: { en: "Stressful", zh: "有压力的" }, b: { en: "Exciting", zh: "令人兴奋的" } },
    { t: { en: "You make lists...", zh: "你列清单..." }, a: { en: "And stick to them", zh: "并坚持执行" }, b: { en: "But often lose them", zh: "但经常弄丢" } },
    { t: { en: "You prefer decisions to be...", zh: "你喜欢决定是..." }, a: { en: "Settled and final", zh: "尘埃落定的" }, b: { en: "Open to change", zh: "开放可变的" } },
    { t: { en: "Before a task, you...", zh: "任务开始前，你..." }, a: { en: "Prepare thoroughly", zh: "彻底准备" }, b: { en: "Jump right in", zh: "直接投入" } },
    { t: { en: "Rules should be...", zh: "规则应该..." }, a: { en: "Followed strictly", zh: "严格遵守" }, b: { en: "Seen as flexible", zh: "视为灵活的" } },
    { t: { en: "Your weekends are...", zh: "你的周末通常..." }, a: { en: "Planned out", zh: "计划好的" }, b: { en: "Open-ended", zh: "未安排的" } },
    { t: { en: "Structure makes you feel...", zh: "结构化让你感到..." }, a: { en: "Focused", zh: "专注" }, b: { en: "Constrained", zh: "受限" } },
    { t: { en: "You are usually...", zh: "你通常..." }, a: { en: "Early or on time", zh: "早到或准时" }, b: { en: "Running a bit late", zh: "稍晚一点" } },
    { t: { en: "You prefer to...", zh: "你更喜欢..." }, a: { en: "Work first, play later", zh: "先工作后玩" }, b: { en: "Play now, pay later", zh: "先玩再说" } },
    { t: { en: "Surprises are...", zh: "惊喜是..." }, a: { en: "Disruptive", zh: "破坏性的" }, b: { en: "Fun", zh: "有趣的" } },
    { t: { en: "Packing for a trip, you...", zh: "旅行打包时，你..." }, a: { en: "Pack days in advance", zh: "提前几天打包" }, b: { en: "Throw things in last minute", zh: "最后一刻随便塞" } },
    { t: { en: "You like to have things...", zh: "你喜欢事情..." }, a: { en: "Under control", zh: "在掌控中" }, b: { en: "Unfolding naturally", zh: "自然发生" } },
    { t: { en: "Changing plans is...", zh: "改变计划..." }, a: { en: "Annoying", zh: "恼人的" }, b: { en: "No big deal", zh: "没什么大不了" } },
    { t: { en: "Closure is...", zh: "完结（Closure）是..." }, a: { en: "Important to you", zh: "对你很重要的" }, b: { en: "Less important than options", zh: "不如保留选择重要" } },
    { t: { en: "You follow a...", zh: "你遵循..." }, a: { en: "Routine", zh: "常规" }, b: { en: "Whim", zh: "心血来潮" } },
    { t: { en: "Instructions manual: you...", zh: "说明书：你..." }, a: { en: "Read it first", zh: "先读一遍" }, b: { en: "Figure it out as you go", zh: "边做边摸索" } },
    { t: { en: "Commitment feels...", zh: "承诺让你感觉..." }, a: { en: "Grounding", zh: "踏实" }, b: { en: "Limiting", zh: "受限" } },
    { t: { en: "Your closet is...", zh: "你的衣柜..." }, a: { en: "Organized by color/type", zh: "按颜色/类型整理" }, b: { en: "A mix of everything", zh: "混在一起" } },
    { t: { en: "You prioritize...", zh: "你优先考虑..." }, a: { en: "Goal achievement", zh: "目标达成" }, b: { en: "New experiences", zh: "新体验" } },
    { t: { en: "When watching a series...", zh: "看剧时..." }, a: { en: "You finish it systematically", zh: "系统地看完" }, b: { en: "You watch whatever is on", zh: "播什么看什么" } },
    { t: { en: "Waiting is...", zh: "等待是..." }, a: { en: "Frustrating", zh: "令人沮丧的" }, b: { en: "Time to dream", zh: "发呆的时间" } },
    { t: { en: "You trust...", zh: "你信任..." }, a: { en: "Established order", zh: "既定秩序" }, b: { en: "Adaptability", zh: "适应能力" } },
    { t: { en: "A blank calendar is...", zh: "空白的日历是..." }, a: { en: "A problem to solve", zh: "需要填满的问题" }, b: { en: "Freedom", zh: "自由" } },
    { t: { en: "You are a...", zh: "你是一个..." }, a: { en: "Planner", zh: "计划者" }, b: { en: "Improviser", zh: "即兴者" } }
  ];

  const mapToQuestions = (data: any[], dim: Dimension): Question[] => {
    return data.map((item, i) => ({
      id: `${dim}-${i}`,
      dimension: dim,
      text: item.t,
      optionA: { text: item.a, value: dim[0] }, // E, S, T, J
      optionB: { text: item.b, value: dim[1] }  // I, N, F, P
    }));
  };

  return { 
    EI: mapToQuestions(eiData, 'EI'), 
    SN: mapToQuestions(snData, 'SN'), 
    TF: mapToQuestions(tfData, 'TF'), 
    JP: mapToQuestions(jpData, 'JP') 
  };
};

const QUESTIONS_PER_DIMENSION = 5;
const TOTAL_DIMENSIONS = 4;

// --- Components ---

const Illustration = ({ type }: { type: 'intro' | 'result' | Dimension }) => {
  if (type === 'intro') {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xl">
          <circle cx="100" cy="100" r="80" fill="#E0E7FF" />
          <circle cx="70" cy="80" r="15" fill="#6366F1" />
          <circle cx="130" cy="80" r="15" fill="#6366F1" />
          <path d="M 60 120 Q 100 160 140 120" stroke="#6366F1" strokeWidth="8" fill="none" strokeLinecap="round" />
          <circle cx="170" cy="30" r="10" fill="#F472B6" className="animate-bounce" />
          <circle cx="30" cy="170" r="12" fill="#34D399" className="animate-pulse" />
        </svg>
      </div>
    );
  }

  const icons: Record<Dimension, React.ReactNode> = {
    EI: <Zap size={48} className="text-amber-500" />,
    SN: <Coffee size={48} className="text-emerald-500" />,
    TF: <Brain size={48} className="text-blue-500" />,
    JP: <RefreshCw size={48} className="text-purple-500" />,
  };
  
  if (['EI', 'SN', 'TF', 'JP'].includes(type)) {
     return <div className="mb-6 p-4 bg-white rounded-full shadow-sm inline-block">{icons[type as Dimension]}</div>;
  }

  return (
    <div className="w-full h-48 flex items-center justify-center">
        <Sparkles size={80} className="text-indigo-500 animate-spin-slow" />
    </div>
  );
};

// --- Language Toggle Component ---
const LanguageToggle = ({ lang, setLang, className = "" }: { lang: Language, setLang: (l: Language) => void, className?: string }) => (
  <button 
    onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
    className={`flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-700 hover:bg-white hover:text-indigo-600 transition-all font-bold text-sm ${className}`}
  >
    <Globe size={16} />
    <span>{lang === 'zh' ? '中文' : 'English'}</span>
  </button>
);

// --- Main App Component ---

const App = () => {
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentDimIndex, setCurrentDimIndex] = useState(0);
  const [dimProgress, setDimProgress] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  // Initialize Data
  useEffect(() => {
    setQuestionBank(generateQuestions());
  }, []);

  const dimensions: Dimension[] = ['EI', 'SN', 'TF', 'JP'];
  const currentDimension = dimensions[currentDimIndex];

  const pickRandomQuestion = (dim: Dimension, excludeIds: Set<string>, bank: QuestionBank) => {
    const pool = bank[dim];
    const available = pool.filter(q => !excludeIds.has(q.id));
    if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)]; 
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  const startGame = () => {
    if (!questionBank) return;
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setCurrentDimIndex(0);
    setDimProgress(0);
    setUsedQuestionIds(new Set());
    
    const q = pickRandomQuestion('EI', new Set(), questionBank);
    setActiveQuestion(q);
    setUsedQuestionIds(new Set([q.id]));
    
    setGameState('playing');
  };

  const handleRefreshQuestion = () => {
    if (!questionBank || !activeQuestion) return;
    const newQ = pickRandomQuestion(currentDimension, usedQuestionIds, questionBank);
    const newUsed = new Set(usedQuestionIds);
    newUsed.add(newQ.id);
    setUsedQuestionIds(newUsed);
    setActiveQuestion(newQ);
  };

  const handleAnswer = (value: string) => {
    setScores(prev => ({ ...prev, [value]: prev[value] + 1 }));
    const nextProgress = dimProgress + 1;
    
    if (nextProgress >= QUESTIONS_PER_DIMENSION) {
      if (currentDimIndex >= TOTAL_DIMENSIONS - 1) {
        setGameState('result');
      } else {
        const nextDim = dimensions[currentDimIndex + 1];
        setCurrentDimIndex(prev => prev + 1);
        setDimProgress(0);
        
        if (questionBank) {
            const nextQ = pickRandomQuestion(nextDim, usedQuestionIds, questionBank);
            setUsedQuestionIds(prev => new Set([...prev, nextQ.id]));
            setActiveQuestion(nextQ);
        }
      }
    } else {
      setDimProgress(nextProgress);
      if (questionBank) {
          const nextQ = pickRandomQuestion(currentDimension, usedQuestionIds, questionBank);
          setUsedQuestionIds(prev => new Set([...prev, nextQ.id]));
          setActiveQuestion(nextQ);
      }
    }
  };

  const calculateResult = () => {
    return [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('');
  };

  // --- Theme Colors ---
  const getThemeColors = () => {
    switch(currentDimension) {
        case 'EI': return 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100';
        case 'SN': return 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100';
        case 'TF': return 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100';
        case 'JP': return 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100';
        default: return 'bg-gray-50';
    }
  };
  
  const getAccentColor = () => {
     switch(currentDimension) {
        case 'EI': return 'text-orange-600';
        case 'SN': return 'text-emerald-600';
        case 'TF': return 'text-blue-600';
        case 'JP': return 'text-purple-600';
        default: return 'text-gray-900';
    }
  };

  // --- Views ---

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-pink-50 relative">
        <div className="absolute top-6 right-6">
            <LanguageToggle lang={lang} setLang={setLang} />
        </div>
        
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-2xl text-center fade-enter-active">
          <div className="mb-6">
            <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              {UI_TEXT.intro.badge[lang]}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
             {UI_TEXT.intro.title[lang]}
          </h1>
          <p className="text-slate-500 mb-8 text-lg leading-relaxed">
             {UI_TEXT.intro.desc[lang]}
          </p>
          
          <Illustration type="intro" />

          <button 
            onClick={startGame}
            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-indigo-200 transform transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {UI_TEXT.intro.startBtn[lang]} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const resultType = calculateResult();
    const archetype = ARCHETYPES[resultType];
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 relative">
        <div className="absolute top-6 right-6">
             <LanguageToggle lang={lang} setLang={setLang} />
        </div>

        <div className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-2xl text-center fade-enter-active overflow-y-auto max-h-[90vh]">
           <Illustration type="result" />
           <h2 className="text-slate-500 font-medium uppercase tracking-widest text-sm mb-2">{UI_TEXT.result.subtitle[lang]}</h2>
           <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">{resultType}</h1>
           <p className="text-2xl font-bold text-slate-800 mb-3">{archetype.name[lang]}</p>
           
           {/* Tags */}
           <div className="flex flex-wrap justify-center gap-2 mb-6">
              {archetype.traits.map((trait, i) => (
                  <span key={i} className="bg-white/60 border border-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {trait[lang]}
                  </span>
              ))}
           </div>

           {/* Description Card */}
           <div className="bg-white/60 p-5 rounded-2xl mb-8 border border-white text-left shadow-sm">
               <div className="flex gap-2 mb-2">
                   <Quote size={20} className="text-violet-400 rotate-180" />
               </div>
               <p className="text-slate-700 leading-relaxed text-sm mb-3 italic font-medium">
                   {archetype.tagline[lang]}
               </p>
               <p className="text-slate-600 leading-relaxed text-sm">
                   {archetype.description[lang]}
               </p>
           </div>
           
           <div className="space-y-4 mb-8 text-left">
              <div className="bg-white/50 p-4 rounded-xl border border-white">
                  <h3 className="font-bold text-slate-700 mb-1">{UI_TEXT.result.traitsTitle[lang]}</h3>
                  <div className="flex justify-between text-sm text-slate-500 mt-2">
                      <span>{UI_TEXT.result.dimensions.E[lang]}</span>
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mx-2"><div className="h-full bg-indigo-500" style={{width: `${(scores.E / (scores.E+scores.I || 1))*100}%`}}></div></div>
                      <span>{UI_TEXT.result.dimensions.I[lang]}</span>
                  </div>
                   <div className="flex justify-between text-sm text-slate-500 mt-2">
                      <span>{UI_TEXT.result.dimensions.S[lang]}</span>
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mx-2"><div className="h-full bg-emerald-500" style={{width: `${(scores.S / (scores.S+scores.N || 1))*100}%`}}></div></div>
                      <span>{UI_TEXT.result.dimensions.N[lang]}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 mt-2">
                      <span>{UI_TEXT.result.dimensions.T[lang]}</span>
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mx-2"><div className="h-full bg-blue-500" style={{width: `${(scores.T / (scores.T+scores.F || 1))*100}%`}}></div></div>
                      <span>{UI_TEXT.result.dimensions.F[lang]}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 mt-2">
                      <span>{UI_TEXT.result.dimensions.J[lang]}</span>
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mx-2"><div className="h-full bg-purple-500" style={{width: `${(scores.J / (scores.J+scores.P || 1))*100}%`}}></div></div>
                      <span>{UI_TEXT.result.dimensions.P[lang]}</span>
                  </div>
              </div>
           </div>

           <button 
             onClick={() => setGameState('intro')}
             className="w-full bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
           >
             <RotateCcw size={18} /> {UI_TEXT.result.retakeBtn[lang]}
           </button>
        </div>
      </div>
    );
  }

  // --- Active Game View ---

  if (!activeQuestion) return null;

  const totalProgress = (currentDimIndex * QUESTIONS_PER_DIMENSION) + dimProgress;
  const totalQuestions = TOTAL_DIMENSIONS * QUESTIONS_PER_DIMENSION;
  const progressPercent = (totalProgress / totalQuestions) * 100;
  const themeClasses = getThemeColors();
  const accentText = getAccentColor();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Top Bar */}
      <div className="p-6 pb-2 pt-12 flex items-center justify-between">
         <div className="flex flex-col">
             <span className={`text-xs font-bold uppercase tracking-wider ${accentText} mb-1 opacity-80`}>
                 {UI_TEXT.play.progress[lang]} {dimProgress + 1} / {QUESTIONS_PER_DIMENSION} {UI_TEXT.play.progressSuffix[lang]}
             </span>
             <h2 className="font-bold text-slate-800 text-lg">{UI_TEXT.titles[currentDimension][lang]}</h2>
         </div>
         <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
             <span className="font-bold text-slate-400 text-sm">{Math.round(progressPercent)}%</span>
         </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-slate-200 mt-2">
          <div 
            className="h-full bg-slate-800 transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col justify-center relative">
        
        <div className="absolute top-4 right-6 z-10 flex gap-2">
            <LanguageToggle lang={lang} setLang={setLang} className="!px-2 !py-1 text-xs" />
             <button 
                onClick={handleRefreshQuestion}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100"
                title={lang === 'en' ? "Swap this question for another one" : "换一个问题"}
             >
                <RefreshCw size={14} /> {UI_TEXT.play.refreshBtn[lang]}
             </button>
        </div>

        <div className="mb-8 text-center mt-4">
             <Illustration type={currentDimension} />
             <h3 className="text-2xl font-bold text-slate-800 leading-tight min-h-[5rem] flex items-center justify-center">
                 {activeQuestion.text[lang]}
             </h3>
        </div>

        <div className="space-y-4">
            <button 
                onClick={() => handleAnswer(activeQuestion.optionA.value)}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden ${themeClasses} border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-1`}
            >
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{activeQuestion.optionA.text[lang]}</span>
                    <div className={`w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-current group-hover:bg-current transition-colors shrink-0 ml-4`}>
                        <Check size={16} className="text-white opacity-0 group-hover:opacity-100" />
                    </div>
                </div>
            </button>

            <button 
                onClick={() => handleAnswer(activeQuestion.optionB.value)}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden ${themeClasses} border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-1`}
            >
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{activeQuestion.optionB.text[lang]}</span>
                    <div className={`w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-current group-hover:bg-current transition-colors shrink-0 ml-4`}>
                        <Check size={16} className="text-white opacity-0 group-hover:opacity-100" />
                    </div>
                </div>
            </button>
        </div>

        <p className="text-center text-slate-300 text-xs mt-8">
            {UI_TEXT.play.instruction[lang]}
        </p>

      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);