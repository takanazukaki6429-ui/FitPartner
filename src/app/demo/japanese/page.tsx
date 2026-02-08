"use client"

import { useState, useMemo, useRef } from 'react';
import { domToBlob } from 'modern-screenshot';
import { Share2, Loader2, BookOpen, Clock, Target, TrendingUp, CheckCircle2, BookText, MessageCircle, Headphones, PenLine, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';

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

// レベルに基づくレッスン配分を計算
function getLessonDistribution(currentLevel: number, targetLevel: number) {
    if (currentLevel < 20) {
        // 初心者: 文法と語彙重視
        return { grammar: 35, vocabulary: 30, conversation: 15, reading: 10, listening: 10 };
    } else if (currentLevel < 40) {
        // N5-N4: バランス型、会話を増やす
        return { grammar: 25, vocabulary: 25, conversation: 25, reading: 12, listening: 13 };
    } else if (currentLevel < 60) {
        // N4-N3: 読解とリスニングを強化
        return { grammar: 20, vocabulary: 20, conversation: 25, reading: 17, listening: 18 };
    } else {
        // N2以上: 実践重視
        return { grammar: 15, vocabulary: 15, conversation: 30, reading: 20, listening: 20 };
    }
}

// 月別マイルストーン生成
function generateMilestones(currentLevel: number, targetLevel: number, months: number) {
    const milestones = [];
    const levelPerMonth = (targetLevel - currentLevel) / months;

    for (let i = 1; i <= months; i++) {
        const monthLevel = currentLevel + (levelPerMonth * i);
        const jlptLevel = JLPT_LEVELS.find(l => monthLevel >= l.minLevel && monthLevel < l.maxLevel) || JLPT_LEVELS[4];

        let focus: string[] = [];
        let skills: string[] = [];
        let reason = '';

        // レベルに応じた学習内容
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
            lessonsNeeded: Math.ceil(levelPerMonth * 2), // 1レベルあたり約2レッスン
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

export default function JapaneseRoadmapPage() {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(false);

    const [currentLevel, setCurrentLevel] = useState(20);
    const [targetLevel, setTargetLevel] = useState(70);
    const [periodMonths, setPeriodMonths] = useState(6);

    const handleShare = async () => {
        if (!contentRef.current) return;

        setIsSharing(true);
        try {
            const blob = await domToBlob(contentRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
            });

            if (!blob) {
                toast.error("画像の生成に失敗しました");
                setIsSharing(false);
                return;
            }

            const file = new File([blob], "japanese_roadmap.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: '日本語学習ロードマップ',
                        text: `${periodMonths}ヶ月で+${(targetLevel - currentLevel)}Lvアップを目指します！ #日本語学習`,
                    });
                    toast.success("シェアメニューを開きました");
                } catch (err) {
                    console.error("Share failed", err);
                }
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
        } finally {
            setIsSharing(false);
        }
    };

    // 計算データ
    const totalHours = useMemo(() => calculateTotalHours(currentLevel, targetLevel), [currentLevel, targetLevel]);
    const hoursPerWeek = useMemo(() => (totalHours / (periodMonths * 4)).toFixed(1), [totalHours, periodMonths]);
    const hoursPerDay = useMemo(() => (totalHours / (periodMonths * 30)).toFixed(1), [totalHours, periodMonths]);
    const lessonDistribution = useMemo(() => getLessonDistribution(currentLevel, targetLevel), [currentLevel, targetLevel]);
    const milestones = useMemo(() => generateMilestones(currentLevel, targetLevel, periodMonths), [currentLevel, targetLevel, periodMonths]);

    // グラフデータ
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

    // 円グラフデータ
    const pieData = useMemo(() => {
        return LESSON_TYPES.map(type => ({
            name: type.name,
            value: lessonDistribution[type.id as keyof typeof lessonDistribution],
            color: type.color,
        }));
    }, [lessonDistribution]);

    // レベルの説明を取得
    const getLevelDescription = (level: number) => {
        if (level < 20) return "N5レベル";
        if (level < 40) return "N4レベル";
        if (level < 60) return "N3レベル";
        if (level < 80) return "N2レベル";
        if (level < 95) return "N1レベル";
        return "ネイティブ";
    };

    const totalGain = targetLevel - currentLevel;

    return (
        <div ref={contentRef} className="space-y-6 pb-20 bg-gradient-to-b from-blue-50 to-white p-4">
            {/* ヘッダー */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <GraduationCap className="w-8 h-8 text-[#2563eb]" />
                    <h1 className="text-2xl font-bold text-[#020817]">日本語学習ロードマップ</h1>
                </div>
                <p className="text-sm text-[#64748b]">あなた専用の合格プランを作成します</p>
            </div>

            {/* 入力フォーム */}
            <Card className="bg-white shadow-lg">
                <CardContent className="p-6 space-y-6">
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
                        onClick={() => setShowRoadmap(true)}
                    >
                        📚 ロードマップを作成
                    </Button>
                </CardContent>
            </Card>

            {showRoadmap && (
                <>
                    {/* サマリーカード */}
                    <Card className="bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white shadow-xl">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-center">📊 あなたの学習プラン概要</h2>

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
                            <p className="text-sm text-[#64748b]">あなたのレベルに最適化された学習バランス</p>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-32">
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
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${type.color}20` }}
                                                >
                                                    <Icon className="w-4 h-4" style={{ color: type.color }} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">{type.name}</span>
                                                        <span className="text-[#64748b]">{percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                                        <div
                                                            className="h-1.5 rounded-full"
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
                                    {currentLevel < 20 ? (
                                        "初心者の方は文法と語彙の基礎固めが最も重要です。土台がしっかりすれば、後の学習効率が大きく上がります。"
                                    ) : currentLevel < 40 ? (
                                        "基礎ができている今、会話練習を増やすことで実践力がつきます。インプットとアウトプットのバランスが鍵です。"
                                    ) : currentLevel < 60 ? (
                                        "中級レベルでは読解とリスニングの強化が必須。試験対策としても、実力向上としても効果的です。"
                                    ) : (
                                        "上級者は実践的な会話力と専門分野の読解力が求められます。アウトプット中心の学習にシフトします。"
                                    )}
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

                        {milestones.map((milestone, index) => (
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
    );
}
