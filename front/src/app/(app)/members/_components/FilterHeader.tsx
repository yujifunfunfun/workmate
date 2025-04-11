"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface FilterHeaderProps {
  initialSearch?: string;
  initialDepartment?: string;
}

const departments = [
  "すべて",
  "営業部",
  "マーケティング部",
  "経理部",
  "開発部",
  "人事部",
  "カスタマーサポート部"
];

export function FilterHeader({
  initialSearch = "",
  initialDepartment = ""
}: FilterHeaderProps) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeDepartment, setActiveDepartment] = useState(
    initialDepartment ? initialDepartment : "すべて"
  );

  // 初期値が変更された場合に状態を更新
  useEffect(() => {
    setSearchTerm(initialSearch);
    setActiveDepartment(initialDepartment ? initialDepartment : "すべて");
  }, [initialSearch, initialDepartment]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // 検索用のURLを生成する関数
  const getSearchUrl = () => {
    const newParams = new URLSearchParams(searchParams.toString());

    // 検索ワードの設定
    if (searchTerm) {
      newParams.set("search", searchTerm);
    } else {
      newParams.delete("search");
    }

    // 部署の維持（検索時に部署フィルタをリセットしない）
    const dept = searchParams.get("department");
    if (dept) {
      newParams.set("department", dept);
    }

    // ページは1に戻す
    newParams.delete("page");

    return `/members?${newParams.toString()}`;
  };

  // 部署フィルター用のURLを生成する関数
  const getDepartmentUrl = (department: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // 部署の設定
    if (department && department !== "すべて") {
      newParams.set("department", department);
    } else {
      newParams.delete("department");
    }

    // 検索ワードの維持
    const search = searchParams.get("search");
    if (search) {
      newParams.set("search", search);
    }

    // ページは1に戻す
    newParams.delete("page");

    return `/members?${newParams.toString()}`;
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="relative flex">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="名前、スキル、部署などで検索..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <Link
          href={getSearchUrl()}
          className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center justify-center"
        >
          検索
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {departments.map((department) => {
          const isActive = activeDepartment === department;
          const url = getDepartmentUrl(department);

          return (
            <Link
              key={department}
              href={url}
              className={`px-3 py-1 text-sm rounded-full transition-colors inline-flex items-center justify-center ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setActiveDepartment(department)}
            >
              {department}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
