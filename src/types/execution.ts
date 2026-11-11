/**
 * 서버가 조회 시 파생해 준다 (ADR-0038 희소 저장).
 * 완료만 저장되고, PENDING · MISSED는 루틴 정의로 그날그날 계산한 값이다
 */
export type ExecutionStatus = 'PENDING' | 'COMPLETED' | 'MISSED'

/** GET /api/v1/routine-executions 항목 */
export interface Execution {
  /** 파생 행(PENDING · MISSED)은 저장된 행이 없어 null */
  executionId: number | null
  routineId: number
  title: string
  /** YYYY-MM-DD */
  scheduledDate: string
  status: ExecutionStatus
  /** YYYY-MM-DDTHH:mm:ss(서버 시간대) · 완료만 */
  completedAt: string | null
  photoUrl: string | null
  memo: string | null
  feedCardId: number | null
  /**
   * 지금 이 날짜를 인증할 수 있는가 — 서버가 계산한다(#58).
   * 미래 · 중단한 루틴 · 챌린지 백필 창 밖이면 false. 클라이언트가 날짜로 다시 재지 않는다
   */
  backfillable: boolean
}
