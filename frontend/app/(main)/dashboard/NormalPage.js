'use client';

/**
 * NormalPage.js
 * 프레젠테이션 계층 — 일반 탭 UI.
 *
 * 변경사항:
 *  - [Critical Fix] useState, useCallback을 컴포넌트 최상단으로 이동 (Hook 순서 위반 해소)
 *  - statMapper 적용으로 인라인 데이터 매핑 로직 제거
 */

import { useState, useCallback } from 'react';
import styles from './pageComp.module.css';

import StatTable from '../components/StatTable';
import AIAnalysis from '../components/AIAnalysis';
import MostPlayed from '../components/MostPlayed';
import { getCharacterInfo } from '@/lib/characterData';
import {
  mapStatToViewModel,
  mapComparisonStatToViewModel,
  buildBaseStatsMap,
} from '@/lib/mappers/statMapper';

export default function NormalPage({ normalStat, diaNormalCharStats, ai, loading }) {
  // ✅ Hook은 조건부 return 이전, 컴포넌트 최상단에 위치해야 합니다.
  const [isDetailedVisible, setIsDetailedVisible] = useState(false);
  const toggleDetailedVisibility = useCallback(() => {
    setIsDetailedVisible((prev) => !prev);
  }, []);

  if (!normalStat) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  if (normalStat['no_record']) {
    return <div className={styles.noRecord}>일반 게임 플레이 데이터가 없습니다.</div>;
  }

  // ── 도메인 계층 위임: statMapper가 백엔드 필드명을 ViewModel로 변환합니다. ──
  const myNormalData = mapStatToViewModel(normalStat);
  const baseStatsMap = buildBaseStatsMap(myNormalData);
  const diaNormalStatsData = diaNormalCharStats
    ? mapComparisonStatToViewModel(diaNormalCharStats, baseStatsMap)
    : null;

  const mostPlayedChars = normalStat.recent_most_3_characters;
  const mostCharInfo = getCharacterInfo(normalStat.most_used_character_code);

  return (
    <>
      <div className={styles['table-section']}>
        <StatTable
          title="내 평균 지표"
          data={myNormalData}
          tooltipText="최근 일반 게임 20판의 데이터로 평균 지표를 나타냅니다."
          isDetailedVisible={isDetailedVisible}
          onToggleDetailed={toggleDetailedVisibility}
          btnVisible={true}
        />

        {diaNormalStatsData ? (
          <StatTable
            title={`다이아+ ${mostCharInfo.name} 평균 지표`}
            data={diaNormalStatsData}
            tooltipText="최근 일반 게임에서 가장 많이 사용한 실험체의 다이아 이상 구간에서의 평균 지표를 나타냅니다."
            isDetailedVisible={isDetailedVisible}
            onToggleDetailed={toggleDetailedVisibility}
          />
        ) : (
          <StatTable
            title="모스트 다이아+ 평균 지표"
            data={[{ label: '최근 일반 게임 기록이 부족합니다.', value: '' }]}
            tooltipText="최근 일반 게임에서 가장 많이 사용한 실험체의 다이아 이상 구간에서의 평균 지표를 나타냅니다."
            isDetailedVisible={isDetailedVisible}
            onToggleDetailed={toggleDetailedVisibility}
          />
        )}
      </div>

      <div className={styles['bottom-section']}>
        <div className={styles['bottom-section-left']}>
          {mostPlayedChars && mostPlayedChars.length > 0 ? (
            <MostPlayed characters={mostPlayedChars} />
          ) : (
            <div className={styles.noDataModule}>
              <p>최근 플레이한 캐릭터 정보가 없습니다.</p>
              <p>일반 게임을 플레이하면 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
        <div className={styles['bottom-section-right']}>
          <AIAnalysis
            title="아디나의 수정구슬"
            analysis={ai}
            loading={loading}
            ver="adina"
          />
        </div>
      </div>
    </>
  );
}