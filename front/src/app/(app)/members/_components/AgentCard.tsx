"use client";

import Image from "next/image";
import Link from "next/link";
import { MemberAgent } from "@/types/agent";

interface AgentCardProps {
  agent: MemberAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { id, name, owner, department, description, skills, avatarUrl } = agent;

  return (
    <Link href={`/members/${id}`} className="h-fit">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`${name}のアバター`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-xl font-semibold">
                  {name[0]}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-sm text-gray-500">{owner}さんのエージェント</p>
              <p className="text-sm text-gray-500">{department}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-700 line-clamp-3">{description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
