'use client';

/**
 * DashboardContent.js
 * 프레젠테이션 계층 — 유저 통계 대시보드의 최상위 컨테이너.
 *
 * 변경사항:
 *  - useUserStat 훅으로 모든 API 호출 및 상태 관리 위임 (11개 useState 제거)
 *  - 렌더링 로직만 담당
 */

import Image from 'next/image';
import styles from './page.module.css';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { rankImgs } from '@/public/rank/rankImgs';
import { useUserStat } from '@/hooks/useUserStat';

import RankPage from './RankPage';
import NormalPage from './NormalPage';
import CobaltPage from './CobaltPage';
import LoadingWastingTime from '../components/LoadingWastingTime';

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname');

  const [gameType, setGameType] = useState('rank');
  const [nameVisible, setNameVisible] = useState(true);

  const { data, loading, error } = useUserStat(nickname);

  if (loading) {
    return <LoadingWastingTime message="데이터를 불러오는 중 입니다..." />;
  }

  if (error || !data?.rank) {
    const errorMessage = error || '데이터를 불러올 수 없습니다. 닉네임을 다시 확인해주세요.';
    return (
      <div style={{ color: 'var(--text-color)', textAlign: 'center', marginTop: '50px' }}>
        {errorMessage}
      </div>
    );
  }

  // 백엔드 응답 구조분해
  const {
    rank_stat: rankStat,
    normal_stat: normalStat,
    cobalt_stat: cobaltStat,
    badges,
    rank: rankData,
    rank_ai_analysis: rankAiAnalysis,
    normal_ai_analysis: normalAiAnalysis,
    angpyeong_ai_analysis: angpyeongAiAnalysis,
    cobalt_ai_analysis: cobaltAiAnalysis,
    tier_stats: tierStats,
    rank_most_char_dia_stats: diaRankCharStats,
    normal_most_char_dia_stats: diaNormalCharStats,
    tier,
  } = data;

  const renderStatContent = () => {
    switch (gameType) {
      case 'rank':
      case 'angpyeong':
        return (
          <RankPage
            gameType={gameType}
            rankStat={rankStat}
            diaRankCharStats={diaRankCharStats}
            tierStats={tierStats}
            rankAi={rankAiAnalysis}
            angpyeongAi={angpyeongAiAnalysis}
            loading={loading}
          />
        );
      case 'normal':
        return (
          <NormalPage
            normalStat={normalStat}
            diaNormalCharStats={diaNormalCharStats}
            ai={normalAiAnalysis}
            loading={loading}
          />
        );
      case 'cobalt':
        return (
          <CobaltPage
            cobaltStat={cobaltStat}
            ai={cobaltAiAnalysis}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const guide = () => {
    switch (gameType) {
      case 'rank':
        return '최근 랭크 게임 20판의 지표를 분석합니다. 분석되는 게임 판 수에는 차이가 있을 수 있습니다.';
      case 'angpyeong':
        return '표독한 비앙카가 최근 랭크 게임 20판의 지표를 분석합니다. 하지만 가끔은...';
      case 'normal':
        return '최근 일반 게임 20판의 지표를 분석합니다. 분석되는 게임 판 수에는 차이가 있을 수 있습니다.';
      case 'cobalt':
        return '최근 코발트 게임 20판의 지표를 분석합니다. 분석되는 게임 판 수에는 차이가 있을 수 있습니다.';
      default:
        return '';
    }
  };

  return (
    <div className={styles['contents']}>
      <div className={styles['user-info']}>
        <div className={styles['rank-area']}>
          {tier && <Image src={rankImgs[tier]} alt="User Tier" width={80} height={80} />}
        </div>
        <div className={styles['name-level-area']}>
          <div className={styles['nickname-area']}>
            <span className={styles['nickname-text']}>{nameVisible ? nickname : '_____'}</span>
            <input
              type="checkbox"
              onChange={(e) => setNameVisible(e.target.checked)}
              checked={nameVisible}
            />
          </div>
          <div className={styles['score-area']}>
            <span className={styles['level-text']}>
              Score : {nameVisible ? (rankData?.mmr || 'Unranked') : '_____'}
            </span>
          </div>
          <div className={styles['score-area']}>
            <span className={styles['level-text']}>
              {nameVisible
                ? rankStat?.account_level || normalStat?.account_level || cobaltStat?.account_level || '-'
                : '_'}{' '}
              Lvl
            </span>
          </div>
          <div className={styles['rank-text-area']}>
            <span className={styles['level-text']}>
              Rank : {nameVisible ? (rankData?.rank || '-') : '_____'}
            </span>
          </div>
        </div>
        <div className={styles['badge-area']}>
          {badges?.slice(0, 10).map((badge, index) => (
            <div key={index} className={styles['badge-item']}>
              {badge.img ? (
                <Image src={badge.img} alt={badge.alt} width={70} height={70} />
              ) : (
                badge.name
              )}
              <span className={styles['badge-tooltip']}>{badge.alt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['middle-container']}>
        <div className={styles['toggle']}>
          {[
            { key: 'rank',     label: '랭크' },
            { key: 'normal',   label: '일반' },
            { key: 'angpyeong', label: '앙평' },
            { key: 'cobalt',   label: '코발트' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`${styles['toggle-button']} ${gameType === key ? styles.active : ''}`}
              onClick={() => setGameType(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles['guide']}>{guide()}</div>
      </div>

      <div className={styles['detail']}>{renderStatContent()}</div>
    </div>
  );
}
