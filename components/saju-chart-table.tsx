/**
 * 사주 원국 표.
 *
 * 오른쪽부터 연주·월주·일주·시주 순으로 읽는 전통 배치를 그대로 쓴다.
 * 위 칸이 천간, 아래 칸이 지지이고 칸 색은 그 글자의 오행을 따른다.
 */

import {
  ELEMENTS,
  ELEMENT_COLORS,
  ELEMENT_HANJA,
  type Element,
} from '@/lib/saju/constants';
import type { SajuChart } from '@/lib/saju/pillars';
import { RESULT_COPY } from '@/lib/wolyung-flow';

/** 표시 순서. 전통 배치대로 시주가 맨 왼쪽, 연주가 맨 오른쪽이다. */
const COLUMN_LABELS = ['시주', '일주', '월주', '연주'] as const;

export function SajuChartTable({ chart }: { chart: SajuChart }) {
  const columns = chart.pillars;
  const totalCharacters = chart.hourPillar ? 8 : 6;

  return (
    <div className="saju-chart">
      <table className="saju-table">
        <caption className="sr-only">{RESULT_COPY.chart.caption}</caption>
        <thead>
          <tr>
            {columns.map((pillar, index) => (
              <th key={COLUMN_LABELS[index]} scope="col">
                {COLUMN_LABELS[index]}
                {pillar?.position === 'day' && (
                  <>
                    {' '}
                    <span className="saju-self-mark">나</span>
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((pillar, index) => (
              <td key={`stem-${COLUMN_LABELS[index]}`}>
                {pillar ? (
                  <CharacterCell
                    hanja={pillar.stemHanja}
                    reading={pillar.stemReading}
                    element={pillar.stemElement}
                  />
                ) : (
                  <UnknownCell />
                )}
              </td>
            ))}
          </tr>
          <tr>
            {columns.map((pillar, index) => (
              <td key={`branch-${COLUMN_LABELS[index]}`}>
                {pillar ? (
                  <CharacterCell
                    hanja={pillar.branchHanja}
                    reading={pillar.branchReading}
                    element={pillar.branchElement}
                  />
                ) : (
                  <UnknownCell />
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {!chart.hourPillar && (
        <p className="saju-note">{RESULT_COPY.chart.unknownHourNote}</p>
      )}

      <ElementBalance chart={chart} total={totalCharacters} />
    </div>
  );
}

function CharacterCell({
  hanja,
  reading,
  element,
}: {
  hanja: string;
  reading: string;
  element: Element;
}) {
  const color = ELEMENT_COLORS[element];

  return (
    <span
      className="saju-cell"
      style={{
        background: color.fill,
        borderColor: color.border,
        color: color.text,
      }}
    >
      <span className="saju-hanja">{hanja}</span>
      <span className="saju-reading">{reading}</span>
    </span>
  );
}

function UnknownCell() {
  return (
    <span className="saju-cell saju-cell-unknown">
      <span className="saju-hanja">?</span>
      <span className="saju-reading">{RESULT_COPY.chart.unknownHour}</span>
    </span>
  );
}

/** 여덟 글자가 어느 오행에 몰려 있는지 한눈에 보여 주는 막대. */
function ElementBalance({ chart, total }: { chart: SajuChart; total: number }) {
  return (
    <ul className="element-balance">
      {ELEMENTS.map((element) => {
        const count = chart.elementCounts[element];
        const color = ELEMENT_COLORS[element];

        return (
          <li key={element} className="element-balance-item">
            <span
              className="element-chip"
              style={{
                background: color.fill,
                borderColor: color.border,
                color: color.text,
              }}
            >
              {ELEMENT_HANJA[element]}
            </span>
            <span className="element-bar-track">
              <span
                className="element-bar-fill"
                style={{
                  width: `${(count / total) * 100}%`,
                  background: color.border,
                }}
              />
            </span>
            <span className="element-count">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}
