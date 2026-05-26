import { DAILY_SESSION_GOAL } from '../../../types/adherence';
import { formatNumber } from '../../../utils/format';

type DailyAdherenceGoalCardProps = {
  sessionsCount: number;
};

type AdherenceStatus = 'empty' | 'below' | 'met' | 'exceeded';

function resolveStatus(sessionsCount: number): AdherenceStatus {
  if (sessionsCount === 0) return 'empty';
  if (sessionsCount > DAILY_SESSION_GOAL) return 'exceeded';
  if (sessionsCount === DAILY_SESSION_GOAL) return 'met';
  return 'below';
}

const STATUS_LABEL: Record<AdherenceStatus, string> = {
  empty: 'Sin sesiones clínicas registradas',
  below: 'Entrenamiento incompleto',
  met: 'Meta cumplida',
  exceeded: 'Meta superada',
};

const INTERPRETATION: Record<AdherenceStatus, string> = {
  empty: 'No se registraron sesiones clínicas con sensor este día.',
  below: 'El paciente no completó el entrenamiento diario.',
  met: 'El paciente cumplió la meta diaria.',
  exceeded: 'El paciente superó la meta diaria de sesiones.',
};

export function DailyAdherenceGoalCard({ sessionsCount }: DailyAdherenceGoalCardProps) {
  const status = resolveStatus(sessionsCount);
  const extraSessions = Math.max(0, sessionsCount - DAILY_SESSION_GOAL);
  const missingSessions = Math.max(0, DAILY_SESSION_GOAL - sessionsCount);
  const pctOfGoal =
    DAILY_SESSION_GOAL > 0
      ? Math.round((sessionsCount / DAILY_SESSION_GOAL) * 100)
      : 0;
  const barPercent = sessionsCount === 0 ? 0 : Math.min(100, pctOfGoal);

  return (
    <div className="daily-adherence-card" role="group" aria-label="Resumen de adherencia diaria">
      <dl className="daily-adherence-card__stats">
        <div className="daily-adherence-card__stat">
          <dt>Sesiones realizadas</dt>
          <dd>{formatNumber(sessionsCount)}</dd>
        </div>
        <div className="daily-adherence-card__stat">
          <dt>Meta diaria</dt>
          <dd>{DAILY_SESSION_GOAL}</dd>
        </div>
        <div className="daily-adherence-card__stat">
          <dt>Estado</dt>
          <dd>
            <span className={`daily-adherence-card__status daily-adherence-card__status--${status}`}>
              {STATUS_LABEL[status]}
            </span>
          </dd>
        </div>
        <div className="daily-adherence-card__stat">
          <dt>Cumplimiento de meta</dt>
          <dd>{pctOfGoal}%</dd>
        </div>
      </dl>

      <div className="daily-adherence-card__progress-block">
        <div className="daily-adherence-card__progress-head">
          <span className="daily-adherence-card__progress-label">Meta diaria</span>
          <span className="daily-adherence-card__progress-ratio">
            {formatNumber(sessionsCount)} / {DAILY_SESSION_GOAL} sesiones
          </span>
          <span className="daily-adherence-card__progress-pct">{barPercent}%</span>
        </div>
        <div
          className="daily-adherence-card__progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={barPercent}
          aria-label={`Progreso hacia la meta diaria: ${barPercent}%`}
        >
          <div
            className={`daily-adherence-card__progress-fill daily-adherence-card__progress-fill--${status}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
        {status === 'exceeded' ? (
          <p className="daily-adherence-card__note daily-adherence-card__note--extra">
            +{formatNumber(extraSessions)} sesión{extraSessions === 1 ? '' : 'es'} extra
          </p>
        ) : status === 'below' ? (
          <p className="daily-adherence-card__note">
            Faltan {formatNumber(missingSessions)} sesión{missingSessions === 1 ? '' : 'es'}
          </p>
        ) : null}
      </div>

      <p className="daily-adherence-card__interpretation">{INTERPRETATION[status]}</p>
    </div>
  );
}
