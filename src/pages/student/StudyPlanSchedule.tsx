import { examAreaLabels } from '../../types/examArea'
import type { StudyPlan, StudyPlanActivity } from '../../types/studyPlan'
import './StudyPlanPage.css'

type StudyPlanScheduleProps = {
    plan: StudyPlan
    onToggleActivity?: (activity: StudyPlanActivity) => void | Promise<void>
    savingActivityId?: string | null
    disabled?: boolean
}

export function StudyPlanSchedule({ plan, onToggleActivity, savingActivityId = null, disabled = false }: StudyPlanScheduleProps) {
    return (
        <div className="study-plan-days">
            {Array.from({ length: 7 }, (_, index) => {
                const day = index + 1
                const activities = plan.activities
                    .filter(activity => activity.dayNumber === day)
                    .sort((first, second) => first.position - second.position)

                return (
                    <section className="study-plan-day" key={day} aria-labelledby={`study-plan-day-${day}`}>
                        <h2 id={`study-plan-day-${day}`}>Dia {day}</h2>
                        <ol className="study-plan-activities">
                            {activities.map(activity => (
                                <li className="study-plan-activity" key={activity.id}>
                                    <span className="study-plan-activity-type">
                                        {activity.type === 'REVISAO' ? 'Revisão' : 'Estudo'} · 1 hora
                                    </span>
                                    <h3>{activity.subjectName}</h3>
                                    <p>{activity.disciplineName} · {examAreaLabels[activity.examArea]}</p>
                                    <span className={activity.completed ? 'study-plan-completed' : 'study-plan-pending'}>
                                        {activity.completed ? 'Concluída' : 'Pendente'}
                                    </span>
                                    {onToggleActivity && plan.status === 'ATIVO' && (
                                        <label className="study-plan-completion">
                                            <input type="checkbox" checked={activity.completed}
                                                disabled={savingActivityId !== null || disabled}
                                                onChange={() => void onToggleActivity(activity)}
                                                aria-label={`Concluir ${activity.subjectName}, dia ${day}, atividade ${activity.position}`} />
                                            Concluída
                                        </label>
                                    )}
                                    {savingActivityId === activity.id && <p role="status">Salvando atividade...</p>}
                                </li>
                            ))}
                        </ol>
                    </section>
                )
            })}
        </div>
    )
}
