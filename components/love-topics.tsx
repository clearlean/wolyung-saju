'use client';

/**
 * 연애운 화두 목록.
 *
 * 제목을 누르면 그 화두의 본문이 펼쳐진다. 여러 개를 동시에 열어 둘 수 있고,
 * 처음에는 첫 화두만 열려 있다.
 */

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import type { LoveTopic } from '@/lib/love-reading';

export function LoveTopics({ topics }: { topics: readonly LoveTopic[] }) {
  const [openIds, setOpenIds] = useState<readonly string[]>(() =>
    topics.length > 0 ? [topics[0].id] : [],
  );

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((openId) => openId !== id)
        : [...current, id],
    );
  };

  return (
    <ul className="topic-list">
      {topics.map((topic, index) => {
        const isOpen = openIds.includes(topic.id);
        const panelId = `topic-panel-${topic.id}`;

        return (
          <li key={topic.id} className="topic-item" data-open={isOpen}>
            <button
              type="button"
              className="topic-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(topic.id)}
            >
              <span className="topic-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="topic-heading">
                <span className="topic-title">{topic.title}</span>
                <span className="topic-teaser">{topic.teaser}</span>
              </span>
              <ChevronDown className="topic-chevron" aria-hidden="true" />
            </button>

            <div className="topic-panel" id={panelId} hidden={!isOpen}>
              <div className="topic-panel-inner">
                <p className="topic-basis">{topic.basis}</p>
                {topic.body.map((paragraph) => (
                  <p key={paragraph} className="topic-body">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
