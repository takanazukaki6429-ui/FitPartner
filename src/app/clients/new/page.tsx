"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

// Define Validation Schema
const clientSchema = z.object({
    name: z.string().min(1, "名前を入力してください"),
    currentWeight: z.coerce.number().min(0, "0以上の数値を入力してください"),
    targetWeight: z.coerce.number().min(0, "0以上の数値を入力してください"),
    ticketsRemaining: z.coerce.number().int().min(0, "0以上の整数を入力してください"),
    status: z.enum(['trial', 'member']),
    notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

// Wrap the main logic in a component that uses searchParams
function NewClientForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            currentWeight: 0,
            targetWeight: 0,
            ticketsRemaining: 0,
            status: 'trial' as const,
            notes: '',
        },
    });

    // Populate from URL params if available
    useEffect(() => {
        const current = searchParams.get('currentWeight');
        const target = searchParams.get('targetWeight');

        if (current) setValue('currentWeight', Number(current));
        if (target) setValue('targetWeight', Number(target));
    }, [searchParams, setValue]);

    const onSubmit = async (data: ClientFormValues) => {
        // ... (existing submit logic, no changes needed inside)
        setIsSubmitting(true);
        try {
            const { data: newClient, error } = await supabase.from('clients').insert({
                name: data.name,
                current_weight: data.currentWeight,
                target_weight: data.targetWeight,
                tickets_remaining: data.ticketsRemaining,
                notes: data.notes,
                status: data.status,
            }).select().single();

            if (error) throw error;

            // Check for pending plan and save if exists
            const pendingPlanJson = sessionStorage.getItem('pending_plan');
            if (pendingPlanJson && newClient) {
                try {
                    const planData = JSON.parse(pendingPlanJson);
                    const { error: planError } = await supabase.from('plans').insert({
                        client_id: newClient.id,
                        data: planData
                    });
                    if (planError) {
                        console.error('Failed to save plan:', planError.message, planError.details, planError);
                        toast.error(`プランの保存に失敗しました: ${planError.message}`);
                    }
                    else sessionStorage.removeItem('pending_plan');
                } catch (e) {
                    console.error('Error saving plan:', e);
                }
            }

            if (error) throw error;

            toast.success("生徒を登録しました");
            router.push('/clients');
        } catch (error: any) {
            console.error(error);
            toast.error(`登録に失敗しました: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header with Back Button */}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">新規生徒登録</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">基本情報</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">名前 <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="例: 田中 太郎"
                                {...register('name')}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Current Weight */}
                            <div className="space-y-2">
                                <Label htmlFor="currentWeight">現在体重 (kg) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="currentWeight"
                                    type="number"
                                    step="0.1"
                                    inputMode="decimal"
                                    placeholder="60.0"
                                    {...register('currentWeight')}
                                    className={errors.currentWeight ? "border-red-500" : ""}
                                />
                                {errors.currentWeight && <p className="text-xs text-red-500">{errors.currentWeight.message}</p>}
                            </div>

                            {/* Target Weight */}
                            <div className="space-y-2">
                                <Label htmlFor="targetWeight">目標体重 (kg) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="targetWeight"
                                    type="number"
                                    step="0.1"
                                    inputMode="decimal"
                                    placeholder="55.0"
                                    {...register('targetWeight')}
                                    className={errors.targetWeight ? "border-red-500" : ""}
                                />
                                {errors.targetWeight && <p className="text-xs text-red-500">{errors.targetWeight.message}</p>}
                            </div>
                        </div>

                        {/* Tickets */}
                        <div className="space-y-2">
                            <Label htmlFor="ticketsRemaining">チケット初期枚数</Label>
                            <Input
                                id="ticketsRemaining"
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                {...register('ticketsRemaining')}
                                className={errors.ticketsRemaining ? "border-red-500" : ""}
                            />
                            {errors.ticketsRemaining && <p className="text-xs text-red-500">{errors.ticketsRemaining.message}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">ステータス</Label>
                            <select
                                id="status"
                                {...register('status')}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="trial">体験</option>
                                <option value="member">会員</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">メモ</Label>
                            <Textarea
                                id="notes"
                                placeholder="特記事項があれば入力"
                                {...register('notes')}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                '保存する'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function NewClientPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <NewClientForm />
        </Suspense>
    );
}
