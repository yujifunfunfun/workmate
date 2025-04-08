"use client";

// マークダウンレンダリング用のユーティリティコンポーネント
export function MarkdownRenderer({ markdown }: { markdown: string }) {
  if (!markdown) return null;

  // マークダウン記法を解釈してJSX要素の配列に変換
  const lines = markdown.split('\n');

  return (
    <>
      {lines.map((line, index) => {
        // 見出し (# で始まる行)
        if (line.match(/^# /)) {
          return <h1 key={index} className="text-2xl font-bold">{line.replace(/^# /, '')}</h1>;
        }
        // 中見出し (## で始まる行)
        else if (line.match(/^## /)) {
          return <h2 key={index} className="text-xl font-bold mt-5">{line.replace(/^## /, '')}</h2>;
        }
        // 小見出し (### で始まる行)
        else if (line.match(/^### /)) {
          return <h3 key={index} className="text-lg font-semibold mb-2 mt-4">{line.replace(/^### /, '')}</h3>;
        }
        // リスト項目 (* または - で始まる行)
        else if (line.match(/^[*-] /)) {
          return <li key={index} className="ml-6 mb-1">{line.replace(/^[*-] /, '')}</li>;
        }
        // 罫線
        else if (line.match(/^---+$/)) {
          return <hr key={index} className="my-4 border-t border-gray-300" />;
        }
        // 強調表示（**で囲まれた部分を太字に）
        else if (line.includes('**')) {
          // 太字の部分を分離して処理
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={index} className="mb-2">
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          );
        }
        // 空行
        else if (line.trim() === '') {
          return <div key={index} className="h-4"></div>;
        }
        // その他の行はそのままパラグラフとして表示
        else {
          return <p key={index} className="mb-2">{line}</p>;
        }
      })}
    </>
  );
}
