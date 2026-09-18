/**
 * Drift scoring system.
 *
 * Workshop score 0–1000, integer, higher is better.
 *
 * Two components:
 *   Time component (0–600):  floor((seconds_survived / 90) * 600)
 *     Surviving the full 90-second round yields 600 points.
 *
 *   Graze component (0–400): accumulated from close passes near obstacles.
 *     Each graze awards 8–20 points based on proximity (closer = more).
 *     Capped at 400. Need ~25–50 successful grazes for the cap.
 *
 *   Total = min(1000, time + graze), always an integer.
 *
 * A score of 1000 means surviving most or all of the round while
 * consistently threading close to obstacles — mastery of both patience
 * and boldness.
 */

const ROUND_DURATION_S = 90;
const MAX_TIME_SCORE = 600;
const MAX_GRAZE_SCORE = 400;
const MAX_TOTAL = 1000;

const GRAZE_MIN_POINTS = 8;
const GRAZE_MAX_POINTS = 20;

var DriftScoring = (function () {
  function computeTimeScore(secondsSurvived) {
    var clamped = Math.min(secondsSurvived, ROUND_DURATION_S);
    return Math.floor((clamped / ROUND_DURATION_S) * MAX_TIME_SCORE);
  }

  function computeGrazePoints(proximityRatio) {
    var ratio = Math.max(0, Math.min(1, proximityRatio));
    return Math.round(GRAZE_MIN_POINTS + ratio * (GRAZE_MAX_POINTS - GRAZE_MIN_POINTS));
  }

  function computeWorkshopScore(secondsSurvived, totalGrazePoints) {
    var timeScore = computeTimeScore(secondsSurvived);
    var grazeScore = Math.min(MAX_GRAZE_SCORE, Math.floor(totalGrazePoints));
    return Math.min(MAX_TOTAL, timeScore + grazeScore);
  }

  return {
    ROUND_DURATION_S: ROUND_DURATION_S,
    MAX_TIME_SCORE: MAX_TIME_SCORE,
    MAX_GRAZE_SCORE: MAX_GRAZE_SCORE,
    MAX_TOTAL: MAX_TOTAL,
    computeTimeScore: computeTimeScore,
    computeGrazePoints: computeGrazePoints,
    computeWorkshopScore: computeWorkshopScore,
  };
})();
