import { useState } from 'react'
import { examAreaLabels } from '../../types/examArea'
import type { StudyPlan, StudyPlanActivity } from '../../types/studyPlan'
import './StudyPlanPage.css'

type StudyPlanScheduleProps = {
    plan: StudyPlan
    onToggleActivity?: (activity: StudyPlanActivity) => void | Promise<void>
    savingActivityId?: string | null
    disabled?: boolean
}

function dayDate(startDate: string, day: number) {
    const date = new Date(`${startDate}T12:00:00`)
    date.setDate(date.getDate() + day - 1)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function StudyPlanSchedule({ plan, onToggleActivity, savingActivityId = null, disabled = false }: StudyPlanScheduleProps) {
    const [selectedDay, setSelectedDay] = useState(1)
    const days = Array.from({ length: 7 }, (_, index) => index + 1)
    const activities = plan.activities.filter(activity => activity.dayNumber === selectedDay)
        .sort((first, second) => first.position - second.position)
    const completed = activities.filter(activity => activity.completed).length

    return (
        <div className="study-plan-agenda">
            <nav className="study-plan-week" aria-label="Dias do plano de estudos">
                {days.map(day => {
                    const items = plan.activities.filter(activity => activity.dayNumber === day)
                    const done = items.filter(activity => activity.completed).length
                    return (
                        <button key={day} type="button" aria-pressed={selectedDay === day}
                            aria-label={`Dia ${day} ${dayDate(plan.startDate, day)}, ${done} de ${items.length} atividades concluídas`}
                            aria-controls="study-plan-selected-day" onClick={() => setSelectedDay(day)}>
                            <strong>Dia {day}</strong>
                            <span>{dayDate(plan.startDate, day)}</span>
                            <small>{done}/{items.length} concluídas</small>
                        </button>
                    )
                })}
            </nav>
            <section className="study-plan-day" id="study-plan-selected-day" aria-labelledby="study-plan-selected-title">
                <div className="study-plan-day-heading">
                    <div>
                        <span className="study-plan-activity-type">SUA AGENDA · {dayDate(plan.startDate, selectedDay)}</span>
                        <h2 id="study-plan-selected-title">Dia {selectedDay}</h2>
                    </div>
                    <span>{completed} de {activities.length} atividades concluídas</span>
                </div>
                <ol className="study-plan-activities">
                    {activities.map(activity => (
                        <li className={`study-plan-activity${activity.completed ? ' is-completed' : ''}`} key={activity.id}>
                            <div className="study-plan-activity-heading">
                                <span className="study-plan-activity-type">{activity.type === 'REVISAO' ? 'Revisão' : 'Estudo'} · 1 hora</span>
                                <span className="study-plan-area">{examAreaLabels[activity.examArea]}</span>
                            </div>
                            <h3>{activity.subjectName}</h3>
                            <p>{activity.disciplineName}</p>
                            {onToggleActivity && plan.status === 'ATIVO' ? (
                                <label className="study-plan-completion">
                                    <input type="checkbox" checked={activity.completed}
                                        disabled={savingActivityId !== null || disabled}
                                        onChange={() => void onToggleActivity(activity)}
                                        aria-label={`Concluir ${activity.subjectName}, dia ${selectedDay}, atividade ${activity.position}`} />
                                    {activity.completed ? 'Concluída' : 'Marcar como concluída'}
                                </label>
                            ) : <span className={activity.completed ? 'study-plan-completed' : 'study-plan-pending'}>{activity.completed ? 'Concluída' : 'Pendente'}</span>}
                            {savingActivityId === activity.id && <p role="status">Salvando atividade...</p>}
                        </li>
                    ))}
                </ol>
                {activities.length === 0 && <p>Nenhuma atividade prevista para este dia.</p>}
                <div className="study-plan-day-navigation">
                    <button type="button" disabled={selectedDay === 1} onClick={() => setSelectedDay(day => day - 1)}>Dia anterior</button>
                    <button type="button" disabled={selectedDay === 7} onClick={() => setSelectedDay(day => day + 1)}>Próximo dia</button>
                </div>
            </section>
        </div>
    )
}
