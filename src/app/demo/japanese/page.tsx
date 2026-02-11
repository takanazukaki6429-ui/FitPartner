"use client"

import { useState, useMemo, useRef } from 'react';
import { domToBlob } from 'modern-screenshot';
import {
    Share2, Loader2, BookOpen, Clock, Target, TrendingUp, CheckCircle2,
    BookText, MessageCircle, Headphones, PenLine, GraduationCap,
    Gamepad2, Heart, Plane, Landmark, Home, Briefcase, Sparkles, Brain, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';

// ===== 定数定義 =====

// JLPT レベル定義
const JLPT_LEVELS = [
    { name: 'N5', minLevel: 0, maxLevel: 20, hours: 150, color: '#22c55e' },
    { name: 'N4', minLevel: 20, maxLevel: 40, hours: 300, color: '#84cc16' },
    { name: 'N3', minLevel: 40, maxLevel: 60, hours: 450, color: '#eab308' },
    { name: 'N2', minLevel: 60, maxLevel: 80, hours: 600, color: '#f97316' },
    { name: 'N1', minLevel: 80, maxLevel: 100, hours: 900, color: '#ef4444' },
];

// レッスンタイプ定義
const LESSON_TYPES = [
    { id: 'grammar', name: '文法', icon: BookText, color: '#3b82f6', description: '基礎文法・文型パターン' },
    { id: 'vocabulary', name: '語彙', icon: PenLine, color: '#8b5cf6', description: '漢字・単語・表現' },
    { id: 'conversation', name: '会話', icon: MessageCircle, color: '#10b981', description: 'スピーキング練習' },
    { id: 'reading', name: '読解', icon: BookOpen, color: '#f59e0b', description: '読み取り・理解力' },
    { id: 'listening', name: '聴解', icon: Headphones, color: '#ec4899', description: 'リスニング練習' },
];

// 目的定義
const PURPOSE_OPTIONS = [
    {
        id: 'anime',
        label: 'アニメ・漫画・ゲーム',
        icon: Gamepad2,
        color: '#e11d48',
        description: '字幕なしで楽しみたい',
    },
    {
        id: 'friends',
        label: '友達・恋人を作りたい',
        icon: Heart,
        color: '#ec4899',
        description: '日本人と深い関係を築きたい',
    },
    {
        id: 'travel',
        label: '旅行を楽しみたい',
        icon: Plane,
        color: '#0ea5e9',
        description: '地方も自由に回りたい',
    },
    {
        id: 'culture',
        label: '日本文化が好き',
        icon: Landmark,
        color: '#f59e0b',
        description: '礼儀・四季・食文化に憧れ',
    },
    {
        id: 'live',
        label: '日本に住みたい',
        icon: Home,
        color: '#22c55e',
        description: '安全で快適な暮らし',
    },
    {
        id: 'work',
        label: '日本で働きたい',
        icon: Briefcase,
        color: '#6366f1',
        description: 'ビジネスで日本語を使いたい',
    },
    {
        id: 'beauty',
        label: '日本語が美しい',
        icon: Sparkles,
        color: '#a855f7',
        description: '音やひらがな・漢字の魅力',
    },
    {
        id: 'challenge',
        label: '自分への挑戦',
        icon: Brain,
        color: '#f97316',
        description: '知的好奇心・自己成長',
    },
    {
        id: 'other',
        label: 'その他',
        icon: MoreHorizontal,
        color: '#64748b',
        description: '上記以外の目的',
    },
];

type PurposeId = typeof PURPOSE_OPTIONS[number]['id'];
type Distribution = { grammar: number; vocabulary: number; conversation: number; reading: number; listening: number };

// ===== ロジック関数 =====

// 目的 × レベルに基づくレッスン配分
function getLessonDistribution(currentLevel: number, purposeId: PurposeId): Distribution {
    // 目的別の基本配分（レベル帯で微調整）
    const purposeDistributions: Record<string, Distribution[]> = {
        anime: [
            // 初心者 / N5-N4 / N3-N2 / N1+
            { grammar: 25, vocabulary: 25, conversation: 10, reading: 15, listening: 25 },
            { grammar: 20, vocabulary: 20, conversation: 15, reading: 15, listening: 30 },
            { grammar: 15, vocabulary: 20, conversation: 15, reading: 20, listening: 30 },
            { grammar: 10, vocabulary: 15, conversation: 20, reading: 25, listening: 30 },
        ],
        friends: [
            { grammar: 25, vocabulary: 20, conversation: 30, reading: 10, listening: 15 },
            { grammar: 20, vocabulary: 15, conversation: 35, reading: 10, listening: 20 },
            { grammar: 15, vocabulary: 15, conversation: 40, reading: 10, listening: 20 },
            { grammar: 10, vocabulary: 10, conversation: 45, reading: 10, listening: 25 },
        ],
        travel: [
            { grammar: 20, vocabulary: 30, conversation: 30, reading: 10, listening: 10 },
            { grammar: 15, vocabulary: 25, conversation: 35, reading: 10, listening: 15 },
            { grammar: 15, vocabulary: 20, conversation: 35, reading: 15, listening: 15 },
            { grammar: 10, vocabulary: 20, conversation: 35, reading: 15, listening: 20 },
        ],
        culture: [
            { grammar: 25, vocabulary: 25, conversation: 15, reading: 25, listening: 10 },
            { grammar: 20, vocabulary: 20, conversation: 15, reading: 30, listening: 15 },
            { grammar: 20, vocabulary: 20, conversation: 15, reading: 30, listening: 15 },
            { grammar: 15, vocabulary: 15, conversation: 20, reading: 30, listening: 20 },
        ],
        live: [
            { grammar: 25, vocabulary: 25, conversation: 25, reading: 15, listening: 10 },
            { grammar: 20, vocabulary: 25, conversation: 25, reading: 15, listening: 15 },
            { grammar: 20, vocabulary: 20, conversation: 25, reading: 20, listening: 15 },
            { grammar: 15, vocabulary: 20, conversation: 25, reading: 20, listening: 20 },
        ],
        work: [
            { grammar: 30, vocabulary: 25, conversation: 20, reading: 15, listening: 10 },
            { grammar: 25, vocabulary: 20, conversation: 25, reading: 15, listening: 15 },
            { grammar: 20, vocabulary: 20, conversation: 25, reading: 20, listening: 15 },
            { grammar: 20, vocabulary: 15, conversation: 25, reading: 20, listening: 20 },
        ],
        beauty: [
            { grammar: 25, vocabulary: 30, conversation: 10, reading: 25, listening: 10 },
            { grammar: 20, vocabulary: 30, conversation: 10, reading: 25, listening: 15 },
            { grammar: 20, vocabulary: 25, conversation: 15, reading: 25, listening: 15 },
            { grammar: 15, vocabulary: 25, conversation: 15, reading: 25, listening: 20 },
        ],
        challenge: [
            { grammar: 25, vocabulary: 25, conversation: 20, reading: 15, listening: 15 },
            { grammar: 25, vocabulary: 25, conversation: 20, reading: 15, listening: 15 },
            { grammar: 20, vocabulary: 20, conversation: 20, reading: 20, listening: 20 },
            { grammar: 20, vocabulary: 20, conversation: 20, reading: 20, listening: 20 },
        ],
        other: [
            { grammar: 25, vocabulary: 25, conversation: 20, reading: 15, listening: 15 },
            { grammar: 20, vocabulary: 20, conversation: 25, reading: 17, listening: 18 },
            { grammar: 20, vocabulary: 20, conversation: 25, reading: 17, listening: 18 },
            { grammar: 15, vocabulary: 15, conversation: 30, reading: 20, listening: 20 },
        ],
    };

    const distributions = purposeDistributions[purposeId] || purposeDistributions.other;

    if (currentLevel < 20) return distributions[0];
    if (currentLevel < 40) return distributions[1];
    if (currentLevel < 60) return distributions[2];
    return distributions[3];
}

// 目的別「なぜこの配分？」説明
function getDistributionReason(purposeId: PurposeId, currentLevel: number): string {
    const reasons: Record<string, string> = {
        anime: currentLevel < 40
            ? 'アニメの日本語を理解するには、まずリスニング力が鍵です。キャラクターのセリフに使われる口語表現や独特な言い回しを聞き取る耳を育てながら、基礎文法と語彙を同時に固めていきます。'
            : 'セリフの聞き取りに加え、漫画のセリフやゲームのテキストを読む力も重要になります。口語・スラング・オノマトペなど、教科書には載らない生きた日本語を重点的に学びます。',
        friends: currentLevel < 40
            ? '人と繋がるには、まず「話す力」が最優先。簡単な文法でも会話のキャッチボールができれば、関係は深まります。自分の気持ちを伝える表現から始めましょう。'
            : '深い関係を築くには、ニュアンスや感情を正確に伝える力が必要です。敬語とカジュアル表現の使い分け、日本人の「空気を読む」文化を理解する練習を増やします。',
        travel: currentLevel < 40
            ? '旅行で一番使うのは「今すぐ使える実践フレーズ」。駅・レストラン・ホテルで困らない語彙と、現地の人に質問できる会話力を最優先で身につけます。'
            : '地方の方言や、英語が通じないエリアでのコミュニケーション力を鍛えます。看板や案内を読む読解力、地元の人と雑談する会話力を重点的に磨きます。',
        culture: currentLevel < 40
            ? '日本文化を深く理解するには、読む力が重要です。礼儀作法、年中行事、食文化に関する語彙を優先的に覚え、文化的な文章を読む基礎を作ります。'
            : '古典的な表現、ことわざ、手紙の書き方など、日本文化の奥深さを味わえるレベルを目指します。茶道や華道の用語など、専門的な語彙も取り入れていきます。',
        live: currentLevel < 40
            ? '日本での生活に必要な「サバイバル日本語」を優先。役所の手続き、病院、銀行、不動産など、生活インフラに関する語彙と会話を網羅的に学びます。'
            : '近所付き合い、PTA、自治会など日本社会に溶け込むためのコミュニケーション力を強化。敬語の正しい使い分けと、日本特有の社会ルールの理解を深めます。',
        work: currentLevel < 40
            ? 'ビジネス日本語の基礎は「正しい敬語」です。メールの書き方、電話対応、自己紹介など、仕事で即使えるスキルを最優先で習得します。'
            : '会議での発言、プレゼン、交渉、レポート作成など、プロフェッショナルとして信頼される日本語力を磨きます。業界特有の専門用語も取り入れます。',
        beauty: currentLevel < 40
            ? '美しい日本語を味わうには、まず文字の世界から。ひらがな・カタカナの書き順、漢字の成り立ち、日本語の音のリズムを丁寧に学びます。'
            : '俳句、短歌、詩的な表現、四季折々の言葉など、日本語の美しさの真髄に触れます。書道の基礎や手紙の美しい言い回しも学んでいきます。',
        challenge: currentLevel < 40
            ? 'バランスよく全スキルを伸ばすのが最も効率的。言語学的な視点も交えながら、日本語の構造を論理的に理解していきます。'
            : 'JLPT試験対策を軸に、読解・聴解のスコアアップを狙います。難関レベルの文法パターンや抽象的な語彙に挑戦し、知的好奇心を満たしていきます。',
        other: currentLevel < 40
            ? '5つのスキルをバランスよく伸ばす総合プランです。無料レッスンであなたの具体的な目標を聞かせてください。一緒にカスタマイズしましょう！'
            : '全スキルを均等に強化する総合力アッププランです。あなたの目的に合わせたカスタマイズも可能なので、ぜひ無料レッスンでご相談ください！',
    };
    return reasons[purposeId] || reasons.other;
}

// 目的固有のマイルストーン（月別の「あなたの目標に近づくステップ」）
function getPurposeMilestone(purposeId: PurposeId, monthLevel: number): string {
    const milestones: Record<string, { max: number; text: string }[]> = {
        anime: [
            { max: 15, text: 'アニメのオープニング曲の歌詞が読めるようになる 🎵' },
            { max: 25, text: '日常系アニメの簡単な挨拶・セリフが聞き取れる 👂' },
            { max: 40, text: '字幕付きアニメの内容が8割理解できる 📺' },
            { max: 55, text: '字幕なしで日常アニメ1話の大筋が分かる 🎉' },
            { max: 70, text: 'ゲームの日本語版を辞書なしでプレイできる 🎮' },
            { max: 85, text: '漫画の原作をそのまま読んで楽しめる 📖' },
            { max: 100, text: 'アニメの複雑なセリフやニュアンスまで理解できる ✨' },
        ],
        friends: [
            { max: 15, text: '自己紹介と趣味の話ができるようになる 👋' },
            { max: 25, text: 'LINEで簡単なメッセージのやり取りができる 📱' },
            { max: 40, text: 'カフェでの雑談が30分続けられる ☕' },
            { max: 55, text: '自分の気持ちや意見を日本語で伝えられる 💬' },
            { max: 70, text: '冗談が分かり、日本人と一緒に笑える 😄' },
            { max: 85, text: '悩み相談や深い話題について語り合える 🤝' },
            { max: 100, text: '日本語でケンカして仲直りもできる（本当の友達！）💪' },
        ],
        travel: [
            { max: 15, text: '駅の案内や看板が読めるようになる 🚃' },
            { max: 25, text: 'レストランで注文・会計ができる 🍣' },
            { max: 40, text: '道を尋ねて、答えを理解できる 🗺️' },
            { max: 55, text: '温泉旅館で従業員と会話を楽しめる ♨️' },
            { max: 70, text: '地方で方言を聞いても大体分かる 🏔️' },
            { max: 85, text: '日本人の友達にガイドしてもらわず一人旅ができる 🎒' },
            { max: 100, text: '地元の人とすっかり打ち解けて、穴場を教えてもらえる 🌸' },
        ],
        culture: [
            { max: 15, text: '基本的なマナーと挨拶を正しく使える 🙇' },
            { max: 25, text: '日本の祝日と伝統行事の名前が分かる 🎎' },
            { max: 40, text: '和食の名前と食べ方のマナーを説明できる 🍱' },
            { max: 55, text: '茶道・華道の基本用語が理解できる 🍵' },
            { max: 70, text: '日本の歴史や価値観について議論できる 🏯' },
            { max: 85, text: '俳句や短歌の基本を理解し鑑賞できる 📝' },
            { max: 100, text: '日本文化を母語話者と同じ深さで味わえる 🌊' },
        ],
        live: [
            { max: 15, text: 'コンビニ・スーパーでの買い物に困らない 🏪' },
            { max: 25, text: '役所の簡単な手続きが一人でできる 📋' },
            { max: 40, text: '病院で症状を伝えられる 🏥' },
            { max: 55, text: '大家さんや近所の人と世間話ができる 🏘️' },
            { max: 70, text: '銀行・保険・携帯の契約書が理解できる 📄' },
            { max: 85, text: 'PTAや自治会の話し合いに参加できる 🤝' },
            { max: 100, text: '日本社会に完全に溶け込み、不自由なく生活できる 🏠' },
        ],
        work: [
            { max: 15, text: 'ビジネスの基本挨拶と名刺交換ができる 💼' },
            { max: 25, text: '簡単なビジネスメールが書ける ✉️' },
            { max: 40, text: '電話対応の基本ができる 📞' },
            { max: 55, text: '会議で自分の意見を発表できる 🎤' },
            { max: 70, text: '日本の取引先と通訳なしで商談ができる 🤝' },
            { max: 85, text: 'プレゼンテーションを日本語で行える 📊' },
            { max: 100, text: '日本語でリーダーシップを発揮し、チームを率いられる 🏆' },
        ],
        beauty: [
            { max: 15, text: 'ひらがな・カタカナを美しく書ける ✍️' },
            { max: 25, text: '基本漢字50字の書き順をマスター 📝' },
            { max: 40, text: '日本語の敬語の美しさを理解できる 🌸' },
            { max: 55, text: '手紙を美しい日本語で書ける ✉️' },
            { max: 70, text: '俳句や短歌を作ってみる 🖊️' },
            { max: 85, text: '日本語の微妙なニュアンスの違いが分かる ✨' },
            { max: 100, text: '日本語の音の美しさを完全に堪能できる 🎵' },
        ],
        challenge: [
            { max: 15, text: 'ひらがな・カタカナ・基本漢字を制覇 🏅' },
            { max: 25, text: 'N5レベルの問題集を解けるようになる 📚' },
            { max: 40, text: 'N4試験に合格できるレベルに到達 🎯' },
            { max: 55, text: 'N3試験の合格圏内に入る 💪' },
            { max: 70, text: 'N2試験に挑戦できるレベル 🔥' },
            { max: 85, text: 'N1試験の合格を目指せるレベル 🏆' },
            { max: 100, text: '日本語マスター！次は何語に挑戦？ 🌍' },
        ],
        other: [
            { max: 15, text: '日本語の基礎がしっかり身につく 📖' },
            { max: 25, text: '簡単な日常会話ができるようになる 💬' },
            { max: 40, text: '自分の考えを日本語で表現できる ✍️' },
            { max: 55, text: '日本語で情報収集ができるようになる 🔍' },
            { max: 70, text: '幅広い話題について会話できる 🗣️' },
            { max: 85, text: '専門的な内容も日本語で理解できる 📊' },
            { max: 100, text: '日本語を自在に使いこなせるレベル ✨' },
        ],
    };

    const list = milestones[purposeId] || milestones.other;
    // 現在のレベルに一番近いマイルストーンを返す
    for (const m of list) {
        if (monthLevel <= m.max) return m.text;
    }
    return list[list.length - 1].text;
}

// 月別マイルストーン生成
function generateMilestones(currentLevel: number, targetLevel: number, months: number, purposeId: PurposeId) {
    const milestones = [];
    const levelPerMonth = (targetLevel - currentLevel) / months;

    for (let i = 1; i <= months; i++) {
        const monthLevel = currentLevel + (levelPerMonth * i);
        const jlptLevel = JLPT_LEVELS.find(l => monthLevel >= l.minLevel && monthLevel < l.maxLevel) || JLPT_LEVELS[4];

        let focus: string[] = [];
        let skills: string[] = [];
        let reason = '';

        if (monthLevel < 15) {
            focus = ['ひらがな・カタカナ', '基本挨拶', '数字・時間'];
            skills = ['自己紹介ができる', '簡単な質問に答えられる'];
            reason = '日本語の基礎となる文字システムと、最初のコミュニケーションに必要な表現を習得します。';
        } else if (monthLevel < 25) {
            focus = ['N5基礎文法', '日常語彙200語', '簡単な文の作成'];
            skills = ['買い物で基本的な会話', '道を尋ねられる'];
            reason = '実生活で使える最低限の日本語力を身につけ、簡単な日常会話ができるようになります。';
        } else if (monthLevel < 40) {
            focus = ['N4文法パターン', '語彙500語到達', '敬語の基礎'];
            skills = ['レストランで注文', '日常的なメールが書ける'];
            reason = '日常生活に必要な日本語力を固め、より自然な会話ができるようになります。';
        } else if (monthLevel < 55) {
            focus = ['N3文法', '語彙1000語', '中級読解'];
            skills = ['新聞の見出しが読める', '意見を述べられる'];
            reason = 'ビジネスや学術の入門レベルとして、複雑な表現を理解し使えるようになります。';
        } else if (monthLevel < 70) {
            focus = ['N3完成〜N2導入', '抽象的な語彙', '長文読解'];
            skills = ['ニュースが理解できる', 'ディスカッションに参加'];
            reason = '実践的な日本語力を磨き、仕事や学業で日本語を活用できるレベルを目指します。';
        } else if (monthLevel < 85) {
            focus = ['N2文法・語彙', 'ビジネス日本語', '専門分野の読解'];
            skills = ['会議で発言できる', 'レポートが書ける'];
            reason = 'プロフェッショナルとして日本語を使いこなすための高度なスキルを習得します。';
        } else {
            focus = ['N1レベル表現', 'ニュアンスの理解', 'アカデミック日本語'];
            skills = ['論文が読める', 'プレゼンテーションができる'];
            reason = 'ネイティブに近い運用力を目指し、あらゆる場面で自信を持って日本語を使えるようにします。';
        }

        milestones.push({
            month: i,
            level: Math.round(monthLevel),
            jlpt: jlptLevel.name,
            jlptColor: jlptLevel.color,
            focus,
            skills,
            reason,
            purposeMilestone: getPurposeMilestone(purposeId, monthLevel),
            lessonsNeeded: Math.ceil(levelPerMonth * 2),
        });
    }

    return milestones;
}

// 必要学習時間の計算
function calculateTotalHours(currentLevel: number, targetLevel: number) {
    let totalHours = 0;
    for (const level of JLPT_LEVELS) {
        const overlapStart = Math.max(currentLevel, level.minLevel);
        const overlapEnd = Math.min(targetLevel, level.maxLevel);
        if (overlapStart < overlapEnd) {
            const portion = (overlapEnd - overlapStart) / (level.maxLevel - level.minLevel);
            totalHours += level.hours * portion;
        }
    }
    return Math.round(totalHours);
}

// レベルの説明を取得
function getLevelDescription(level: number) {
    if (level < 20) return "N5レベル";
    if (level < 40) return "N4レベル";
    if (level < 60) return "N3レベル";
    if (level < 80) return "N2レベル";
    if (level < 95) return "N1レベル";
    return "ネイティブ";
}

// ===== コンポーネント =====

export default function JapaneseRoadmapPage() {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(false);

    const [currentLevel, setCurrentLevel] = useState(20);
    const [selectedPurpose, setSelectedPurpose] = useState<PurposeId | null>(null);
    const [targetLevel, setTargetLevel] = useState(70);
    const [periodMonths, setPeriodMonths] = useState(6);

    const purposeData = PURPOSE_OPTIONS.find(p => p.id === selectedPurpose);

    const handleShare = async () => {
        if (!contentRef.current) return;
        setIsSharing(true);
        try {
            const blob = await domToBlob(contentRef.current, { scale: 2, backgroundColor: '#ffffff' });
            if (!blob) { toast.error("画像の生成に失敗しました"); setIsSharing(false); return; }
            const file = new File([blob], "japanese_roadmap.png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: '日本語学習ロードマップ',
                        text: `${periodMonths}ヶ月で+${(targetLevel - currentLevel)}Lvアップを目指します！ #日本語学習`,
                    });
                    toast.success("シェアメニューを開きました");
                } catch (err) { console.error("Share failed", err); }
            } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'japanese_roadmap.png';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                toast.success("画像をダウンロードしました");
            }
        } catch (error) {
            console.error("Capture failed", error);
            toast.error("エラーが発生しました: " + (error instanceof Error ? error.message : ""));
        } finally { setIsSharing(false); }
    };

    // 計算データ
    const totalHours = useMemo(() => calculateTotalHours(currentLevel, targetLevel), [currentLevel, targetLevel]);
    const hoursPerWeek = useMemo(() => (totalHours / (periodMonths * 4)).toFixed(1), [totalHours, periodMonths]);
    const hoursPerDay = useMemo(() => (totalHours / (periodMonths * 30)).toFixed(1), [totalHours, periodMonths]);
    const lessonDistribution = useMemo(
        () => getLessonDistribution(currentLevel, selectedPurpose || 'other'),
        [currentLevel, selectedPurpose]
    );
    const milestones = useMemo(
        () => generateMilestones(currentLevel, targetLevel, periodMonths, selectedPurpose || 'other'),
        [currentLevel, targetLevel, periodMonths, selectedPurpose]
    );

    const chartData = useMemo(() => {
        const points = [];
        for (let i = 0; i <= periodMonths; i++) {
            const progress = i / periodMonths;
            const projectedLevel = currentLevel + ((targetLevel - currentLevel) * progress);
            points.push({
                month: i === 0 ? '現在' : `${i}ヶ月後`,
                level: parseFloat(projectedLevel.toFixed(1)),
            });
        }
        return points;
    }, [currentLevel, targetLevel, periodMonths]);

    const pieData = useMemo(() => {
        return LESSON_TYPES.map(type => ({
            name: type.name,
            value: lessonDistribution[type.id as keyof typeof lessonDistribution],
            color: type.color,
        }));
    }, [lessonDistribution]);

    const totalGain = targetLevel - currentLevel;
    const canGenerate = selectedPurpose !== null && totalGain > 0;

    return (
        <div ref={contentRef} className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
            <div className="max-w-md mx-auto space-y-6 pb-20">
                {/* ヘッダー */}
                <div className="text-center space-y-2 pt-2">
                    <div className="flex items-center justify-center gap-2">
                        <GraduationCap className="w-8 h-8 text-[#2563eb]" />
                        <h1 className="text-2xl font-bold text-[#020817]">日本語学習ロードマップ</h1>
                    </div>
                    <p className="text-sm text-[#64748b]">あなた専用の合格プランを作成します</p>
                </div>

                {/* 入力フォーム */}
                <Card className="bg-white shadow-lg">
                    <CardContent className="p-6 space-y-6">
                        {/* 現在のレベル */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <label className="text-sm font-semibold text-[#4b5563]">現在のレベル</label>
                                    <p className="text-xs text-[#9ca3af]">{getLevelDescription(currentLevel)}</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <Input
                                        type="number"
                                        value={currentLevel}
                                        onChange={(e) => setCurrentLevel(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="w-20 text-right font-bold text-lg h-9"
                                    />
                                    <span className="text-sm text-[#9ca3af] mb-1">Lv</span>
                                </div>
                            </div>
                            <Slider
                                value={[currentLevel]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(val) => setCurrentLevel(val[0])}
                            />
                            <div className="flex justify-between text-xs text-[#9ca3af]">
                                <span>0 (初心者)</span>
                                <span>50 (N3)</span>
                                <span>100 (ネイティブ)</span>
                            </div>
                        </div>

                        {/* 日本語を学ぶ目的 */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-[#4b5563]">日本語を学ぶ目的</label>
                            <div className="grid grid-cols-3 gap-2">
                                {PURPOSE_OPTIONS.map((purpose) => {
                                    const Icon = purpose.icon;
                                    const isSelected = selectedPurpose === purpose.id;
                                    return (
                                        <button
                                            key={purpose.id}
                                            onClick={() => setSelectedPurpose(purpose.id)}
                                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center"
                                            style={{
                                                borderColor: isSelected ? purpose.color : '#e5e7eb',
                                                backgroundColor: isSelected ? `${purpose.color}10` : 'white',
                                                boxShadow: isSelected ? `0 0 0 1px ${purpose.color}` : 'none',
                                            }}
                                        >
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: isSelected ? `${purpose.color}20` : '#f3f4f6' }}
                                            >
                                                <Icon
                                                    className="w-4.5 h-4.5"
                                                    style={{ color: isSelected ? purpose.color : '#9ca3af' }}
                                                />
                                            </div>
                                            <span
                                                className="text-xs font-medium leading-tight"
                                                style={{ color: isSelected ? purpose.color : '#4b5563' }}
                                            >
                                                {purpose.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedPurpose && purposeData && (
                                <div
                                    className="flex items-center gap-2 p-2 rounded-lg text-sm"
                                    style={{ backgroundColor: `${purposeData.color}10`, color: purposeData.color }}
                                >
                                    <purposeData.icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{purposeData.description}</span>
                                </div>
                            )}
                        </div>

                        {/* 目標レベル */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <label className="text-sm font-semibold text-[#4b5563]">目標レベル</label>
                                    <p className="text-xs text-[#9ca3af]">{getLevelDescription(targetLevel)}</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <Input
                                        type="number"
                                        value={targetLevel}
                                        onChange={(e) => setTargetLevel(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="w-20 text-right font-bold text-lg h-9 text-[#2563eb] border-[#2563eb]"
                                    />
                                    <span className="text-sm text-[#9ca3af] mb-1">Lv</span>
                                </div>
                            </div>
                            <Slider
                                value={[targetLevel]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(val) => setTargetLevel(val[0])}
                            />
                            <div className="flex justify-between text-xs text-[#9ca3af]">
                                <span>0 (初心者)</span>
                                <span>50 (N3)</span>
                                <span>100 (ネイティブ)</span>
                            </div>
                        </div>

                        {/* 学習期間 */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-[#4b5563]">学習期間</label>
                                <span className="font-bold text-lg">{periodMonths}ヶ月</span>
                            </div>
                            <Slider
                                value={[periodMonths]}
                                min={1}
                                max={12}
                                step={1}
                                onValueChange={(val) => setPeriodMonths(val[0])}
                            />
                            <div className="flex justify-between text-xs text-[#9ca3af]">
                                <span>1ヶ月</span>
                                <span>6ヶ月</span>
                                <span>12ヶ月</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full font-bold bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white"
                            disabled={!canGenerate}
                            onClick={() => setShowRoadmap(true)}
                        >
                            📚 ロードマップを作成
                        </Button>
                        {!canGenerate && selectedPurpose === null && (
                            <p className="text-xs text-center text-[#ef4444]">目的を選択してください</p>
                        )}
                    </CardContent>
                </Card>

                {showRoadmap && (
                    <>
                        {/* サマリーカード */}
                        <Card className="bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white shadow-xl">
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-lg font-bold text-center">📊 あなたの学習プラン概要</h2>

                                {purposeData && (
                                    <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mx-auto w-fit">
                                        <purposeData.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{purposeData.label}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-white/20 rounded-xl p-3">
                                        <Clock className="w-5 h-5 mx-auto mb-1 opacity-90" />
                                        <p className="text-2xl font-bold">{totalHours}</p>
                                        <p className="text-xs opacity-80">総学習時間</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-3">
                                        <Target className="w-5 h-5 mx-auto mb-1 opacity-90" />
                                        <p className="text-2xl font-bold">{hoursPerWeek}</p>
                                        <p className="text-xs opacity-80">時間/週</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-3">
                                        <TrendingUp className="w-5 h-5 mx-auto mb-1 opacity-90" />
                                        <p className="text-2xl font-bold">+{totalGain}</p>
                                        <p className="text-xs opacity-80">レベルアップ</p>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center gap-4 pt-2">
                                    <div className="text-center">
                                        <p className="text-sm opacity-80">現在</p>
                                        <p className="font-bold text-lg">{getLevelDescription(currentLevel)}</p>
                                    </div>
                                    <div className="text-2xl">→</div>
                                    <div className="text-center">
                                        <p className="text-sm opacity-80">目標</p>
                                        <p className="font-bold text-lg">{getLevelDescription(targetLevel)}</p>
                                    </div>
                                </div>

                                <p className="text-center text-sm opacity-90">
                                    1日あたり約 <span className="font-bold">{hoursPerDay}時間</span> の学習で達成可能です！
                                </p>
                            </CardContent>
                        </Card>

                        {/* 成長グラフ */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[#2563eb]" />
                                    成長予測グラフ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`Lv.${value}`, 'レベル']}
                                        />
                                        <ReferenceLine y={targetLevel} stroke="#10B981" strokeDasharray="3 3" />
                                        <Line
                                            type="monotone"
                                            dataKey="level"
                                            stroke="url(#colorGradient)"
                                            strokeWidth={3}
                                            dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        />
                                        <defs>
                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#2563eb" />
                                                <stop offset="100%" stopColor="#7c3aed" />
                                            </linearGradient>
                                        </defs>
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* レッスン配分 */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-[#2563eb]" />
                                    推奨レッスン配分
                                </CardTitle>
                                <p className="text-sm text-[#64748b]">あなたの目的に最適化された学習バランス</p>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-32 flex-shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={25}
                                                    outerRadius={50}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {LESSON_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            const percentage = lessonDistribution[type.id as keyof typeof lessonDistribution];
                                            return (
                                                <div key={type.id} className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ backgroundColor: `${type.color}20` }}
                                                    >
                                                        <Icon className="w-4 h-4" style={{ color: type.color }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium">{type.name}</span>
                                                            <span className="text-[#64748b]">{percentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                                            <div
                                                                className="h-1.5 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentage}%`, backgroundColor: type.color }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-[#2563eb]">
                                        💡 <strong>なぜこの配分？</strong><br />
                                        {getDistributionReason(selectedPurpose || 'other', currentLevel)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 月別ロードマップ */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 px-1">
                                <Target className="w-5 h-5 text-[#2563eb]" />
                                月別マイルストーン
                            </h2>

                            {milestones.map((milestone) => (
                                <Card key={milestone.month} className="bg-white shadow-lg overflow-hidden">
                                    <div
                                        className="h-1"
                                        style={{ backgroundColor: milestone.jlptColor }}
                                    />
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                                    style={{ backgroundColor: milestone.jlptColor }}
                                                >
                                                    {milestone.month}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#020817]">{milestone.month}ヶ月目</p>
                                                    <p className="text-xs text-[#64748b]">目標: Lv.{milestone.level}</p>
                                                </div>
                                            </div>
                                            <Badge
                                                className="text-white"
                                                style={{ backgroundColor: milestone.jlptColor }}
                                            >
                                                {milestone.jlpt}
                                            </Badge>
                                        </div>

                                        {/* 目的固有マイルストーン */}
                                        {purposeData && (
                                            <div
                                                className="p-3 rounded-lg flex items-start gap-2"
                                                style={{ backgroundColor: `${purposeData.color}10` }}
                                            >
                                                <purposeData.icon
                                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                                    style={{ color: purposeData.color }}
                                                />
                                                <div>
                                                    <p className="text-xs font-semibold mb-0.5" style={{ color: purposeData.color }}>
                                                        あなたの目標に近づくステップ
                                                    </p>
                                                    <p className="text-sm font-medium text-[#020817]">
                                                        {milestone.purposeMilestone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-[#4b5563]">🎯 この月の学習内容</p>
                                            <div className="flex flex-wrap gap-2">
                                                {milestone.focus.map((item, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {item}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-[#4b5563]">✅ 達成スキル</p>
                                            <ul className="space-y-1">
                                                {milestone.skills.map((skill, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-[#64748b]">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        {skill}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-[#64748b]">
                                                <strong className="text-[#4b5563]">📌 なぜこの順番？</strong><br />
                                                {milestone.reason}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <span className="text-sm text-[#64748b]">推奨レッスン回数</span>
                                            <span className="font-bold text-[#2563eb]">{milestone.lessonsNeeded}回/月</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* CTA */}
                        <Card
                            className="text-white border-none"
                            style={{ backgroundColor: '#2563eb', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}
                        >
                            <CardContent className="p-6 text-center space-y-4">
                                <h3 className="text-xl font-bold">🎉 あなた専用のロードマップ完成！</h3>
                                <p className="text-sm opacity-90">
                                    {periodMonths}ヶ月で{getLevelDescription(currentLevel)}から{getLevelDescription(targetLevel)}へ。<br />
                                    このプランなら、確実に目標に到達できます。
                                </p>

                                <Button
                                    size="lg"
                                    className="w-full font-bold bg-white text-[#2563eb] hover:bg-gray-100"
                                    onClick={() => toast.success("無料トライアルを予約しました！")}
                                >
                                    ✨ 無料トライアルで始める
                                </Button>

                                <Button
                                    onClick={handleShare}
                                    disabled={isSharing}
                                    className="w-full text-white font-bold"
                                    style={{ backgroundColor: '#06C755' }}
                                    size="lg"
                                >
                                    {isSharing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            生成中...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Share2 className="w-5 h-5" />
                                            このプランをシェア
                                        </span>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
