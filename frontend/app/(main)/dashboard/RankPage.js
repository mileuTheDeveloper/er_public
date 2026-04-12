'use client';

/**
 * RankPage.js
 * 프레젠테이션 계층 — 랭크 / 앙평 탭 UI.
 *
 * 변경사항:
 *  - [Critical Fix] useState, useCallback을 컴포넌트 최상단으로 이동 (Hook 순서 위반 해소)
 *  - statMapper 적용으로 인라인 데이터 매핑 로직 (~100줄) 제거
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

export default function RankPage({
  gameType,
  rankStat,
  diaRankCharStats,
  tierStats,
  rankAi,
  angpyeongAi,
  loading,
}) {
  // ✅ Hook은 조건부 return 이전, 컴포넌트 최상단에 위치해야 합니다.
  const [isDetailedVisible, setIsDetailedVisible] = useState(false);
  const toggleDetailedVisibility = useCallback(() => {
    setIsDetailedVisible((prev) => !prev);
  }, []);

  if (!rankStat) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  if (rankStat['no_record']) {
    return <div className={styles.noRecord}>랭크 게임 플레이 데이터가 없습니다.</div>;
  }

  // ── 도메인 계층 위임: statMapper가 백엔드 필드명을 ViewModel로 변환합니다. ──
  const myRankData = mapStatToViewModel(rankStat);
  const baseStatsMap = buildBaseStatsMap(myRankData);
  const diaRankStatsData = diaRankCharStats
    ? mapComparisonStatToViewModel(diaRankCharStats, baseStatsMap)
    : null;
  const tierStatsData = tierStats
    ? mapComparisonStatToViewModel(tierStats, baseStatsMap)
    : null;

  const mostPlayedChars = rankStat.recent_most_3_characters;
  const mostCharInfo = getCharacterInfo(rankStat.most_used_character_code);

  const getAnalysisText = () => {
    switch (gameType) {
      case 'rank':     return rankAi;
      case 'angpyeong': return angpyeongAi;
      default:          return '';
    }
  };

  return (
    <>
      <div className={styles['table-section']}>
        <StatTable
          title="내 평균 지표"
          data={myRankData}
          tooltipText="최근 랭크 게임 20판의 데이터로 평균 지표를 나타냅니다."
          isDetailedVisible={isDetailedVisible}
          onToggleDetailed={toggleDetailedVisibility}
          btnVisible={true}
        />

        {diaRankStatsData ? (
          <StatTable
            title={`다이아+ ${mostCharInfo.name} 평균 지표`}
            data={diaRankStatsData}
            tooltipText="최근 랭크 게임에서 가장 많이 사용한 실험체의 다이아 이상 구간에서의 평균 지표를 나타냅니다."
            isDetailedVisible={isDetailedVisible}
            onToggleDetailed={toggleDetailedVisibility}
          />
        ) : (
          <StatTable
            title="모스트 다이아+ 평균 지표"
            data={[{ label: '최근 랭크 게임 기록이 부족합니다.', value: '' }]}
            tooltipText="최근 랭크 게임에서 가장 많이 사용한 실험체의 다이아 이상 구간에서의 평균 지표를 나타냅니다."
            isDetailedVisible={isDetailedVisible}
            onToggleDetailed={toggleDetailedVisibility}
          />
        )}

        {tierStatsData ? (
          <StatTable
            title="티어 평균 지표"
            data={tierStatsData}
            tooltipText="나와 동일한 티어의 평균 지표를 나타냅니다. 미스릴 이상은 통합하여 나타냅니다."
            isDetailedVisible={isDetailedVisible}
            onToggleDetailed={toggleDetailedVisibility}
          />
        ) : (
          <StatTable
            title="티어 평균 지표"
            data={[{ label: '랭크 플레이 기록이나 티어 데이터가 부족합니다.', value: '' }]}
            tooltipText="나와 동일한 티어의 평균 지표를 나타냅니다. 미스릴 이상은 통합하여 나타냅니다."
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
              <p>랭크 게임을 플레이하면 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
        <div className={styles['bottom-section-right']}>
          <AIAnalysis
            title={gameType === 'angpyeong' ? '비앙카의 혈액샘플' : '아디나의 수정구슬'}
            analysis={getAnalysisText()}
            loading={loading}
            ver={gameType === 'angpyeong' ? 'bianca' : 'adina'}
          />
        </div>
      </div>
    </>
  );
}