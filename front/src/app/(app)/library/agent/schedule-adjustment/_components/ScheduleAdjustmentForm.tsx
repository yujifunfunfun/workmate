"use client";

import { useCompletion } from "@ai-sdk/react";
import { AdjustmentResult, EmptyResult } from "@/app/(app)/library/agent/schedule-adjustment/_components/AdjustmentResult";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMemberAgents } from "@/hooks/useMemberAgents";
import Select, { MultiValue, ActionMeta } from 'react-select';
import { useState, FormEvent, useEffect } from "react";
import ReactMarkdown from 'react-markdown';


// メンバーオプションの型定義
interface MemberOption {
  value: string;
  label: string;
  username: string;
  userId: string;
}

export function ScheduleAdjustmentForm() {
  const [token, setToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
  }, []);

  const { members } = useMemberAgents({
    search: "",
    limit: 100,
    offset: 0
  });

  const [selectedMembers, setSelectedMembers] = useState<MemberOption[]>([]);

  const memberOptions: MemberOption[] = members?.map(member => ({
    value: member.id,
    label: `${member.lastName} ${member.firstName} (@${member.username})`,
    username: member.username,
    userId: member.id
  })) || [];

  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: '/api/networks/schedule-adjustment',
    onFinish: (prompt, completion) => {
      console.log('検索が完了しました', completion);
    },
    onError: (error) => {
      console.error('検索エラー:', error);
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: {
      members: selectedMembers
    }
  });

  // 選択変更時のハンドラー
  const handleSelectChange = (
    newValue: MultiValue<MemberOption>,
    actionMeta: ActionMeta<MemberOption>
  ) => {
    setSelectedMembers(newValue as MemberOption[]);
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/5">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>スケジュール調整エージェント</CardTitle>
              <CardDescription>
                社員とのスケジュール調整を行います
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    対象メンバー
                  </label>
                  <div className="mt-2">
                    {isMounted ? (
                      <Select<MemberOption, true>
                        isMulti
                        options={memberOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="メンバーを選択してください"
                        onChange={handleSelectChange}
                        value={selectedMembers}
                      />
                    ) : (
                      <div className="h-[38px] border rounded-md bg-white"></div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    スケジュール調整内容
                  </label>
                  <div className="mt-2">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      placeholder="スケジュール調整内容を具体的に記述してください"
                      className="min-h-32"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      調整中...
                    </>
                  ) : (
                    "調整する"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-3/5">
          {completion ? <AdjustmentResult result={completion} /> : <EmptyResult />}
        </div>
      </div>
    </div>
  );
}
