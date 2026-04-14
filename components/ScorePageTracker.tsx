'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

interface Props {
  scoreId: string;
  score: number;
}

export default function ScorePageTracker({ scoreId, score }: Props) {
  useEffect(() => {
    track.viewScore(scoreId);
    track.freeScoreEmailGate(score);
  }, [scoreId, score]);

  return null;
}
