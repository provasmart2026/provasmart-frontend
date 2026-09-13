import {useEffect, useRef, useState} from 'react'
import {examAreasApi} from '../../../api/examAreas'
import {disciplinesApi} from '../../../api/disciplines'
import {subjectsApi} from '../../../api/subjects'
import type {ExamArea} from '../../../types/examArea'
import type {Discipline} from '../../../types/discipline'
import type {Subject} from '../../../types/subject'
import type {QuestionSubjects} from '../../../types/questionForm'
import {SUBJECT_NAME_MAX_LENGTH} from '../../../constants/questions'

export function useQuestionSubjects(initialSubjectId: string | null, selectedSubjectId: string, onSubjectChange: (id: string) => void): QuestionSubjects {
    const [areas, setAreas] = useState<ExamArea[]>([])
    const [area, setArea] = useState<ExamArea | ''>('')
    const [disciplines, setDisciplines] = useState<Discipline[]>([])
    const [disciplineId, setDisciplineId] = useState('')
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [newSubjectName, setNewSubjectName] = useState('')
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [attempt, setAttempt] = useState(0)
    const request = useRef(0)
    const retry = useRef<() => void>(() => {
    })

    useEffect(() => {
        if (initialSubjectId === null) return
        const version = ++request.current
        setLoading(initialSubjectId ? 'Carregando área, disciplina e assunto...' : 'Carregando áreas...')
        setError(null)
        setArea('')
        setDisciplineId('')
        setDisciplines([])
        setSubjects([])
        setNewSubjectName('')
        setCreateError(null)
        retry.current = () => setAttempt((value) => value + 1)

        async function initialize() {
            const availableAreas = await examAreasApi.list()
            if (version !== request.current) return
            setAreas(availableAreas)
            if (!initialSubjectId) return
            // The question contains only subjectId. Resolve its parents without changing the API contract.
            for (const candidateArea of availableAreas) {
                let availableDisciplines: Discipline[]
                try {
                    availableDisciplines = await disciplinesApi.listByExamArea(candidateArea)
                } catch {
                    if (version !== request.current) return
                    continue
                }
                if (version !== request.current) return
                const catalogs = await Promise.allSettled(availableDisciplines.map(async (discipline) => ({
                    discipline, subjects: await subjectsApi.listByDiscipline(discipline.id),
                })))
                if (version !== request.current) return
                const match = catalogs.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
                    .find((catalog) => catalog.subjects.some((subject) => subject.id === initialSubjectId))
                if (match) {
                    setArea(candidateArea)
                    setDisciplines(availableDisciplines)
                    setDisciplineId(match.discipline.id)
                    setSubjects(match.subjects)
                    return
                }
            }
            throw new Error('Assunto não encontrado')
        }

        initialize().catch(() => {
            if (version === request.current) setError('Não foi possível carregar as opções de assunto. Tente novamente.')
        }).finally(() => {
            if (version === request.current) setLoading(null)
        })
        return () => {
            request.current++
        }
    }, [initialSubjectId, attempt])

    async function selectArea(nextArea: ExamArea | '') {
        if (creating || (nextArea && !areas.includes(nextArea))) return
        const version = ++request.current
        setArea(nextArea)
        setDisciplineId('')
        setDisciplines([])
        setSubjects([])
        onSubjectChange('')
        setNewSubjectName('')
        setCreateError(null)
        setError(null)
        setLoading(nextArea ? 'Carregando disciplinas...' : null)
        if (!nextArea) return
        retry.current = () => {
            void selectArea(nextArea)
        }
        try {
            const result = await disciplinesApi.listByExamArea(nextArea)
            if (version === request.current) setDisciplines(result)
        } catch {
            if (version === request.current) setError('Não foi possível carregar as disciplinas. Tente novamente.')
        } finally {
            if (version === request.current) setLoading(null)
        }
    }

    async function selectDiscipline(nextId: string) {
        if (creating || (nextId && !disciplines.some((discipline) => discipline.id === nextId))) return
        const version = ++request.current
        setDisciplineId(nextId)
        setSubjects([])
        onSubjectChange('')
        setNewSubjectName('')
        setCreateError(null)
        setError(null)
        setLoading(nextId ? 'Carregando assuntos...' : null)
        if (!nextId) return
        retry.current = () => {
            void selectDiscipline(nextId)
        }
        try {
            const result = await subjectsApi.listByDiscipline(nextId)
            if (version === request.current) setSubjects(result)
        } catch {
            if (version === request.current) setError('Não foi possível carregar os assuntos. Tente novamente.')
        } finally {
            if (version === request.current) setLoading(null)
        }
    }

    async function createSubject() {
        if (creating || selectedSubjectId || !disciplineId || loading || error) return
        const name = newSubjectName.trim()
        if (!name || name.length > SUBJECT_NAME_MAX_LENGTH) {
            setCreateError(`Informe um nome de assunto com até ${SUBJECT_NAME_MAX_LENGTH} caracteres.`)
            return
        }
        const version = request.current
        setCreating(true)
        setCreateError(null)
        try {
            const subject = await subjectsApi.create(disciplineId, {name})
            if (version !== request.current) return
            setSubjects((current) => [...current.filter((item) => item.id !== subject.id), subject])
            onSubjectChange(subject.id)
            setNewSubjectName('')
        } catch {
            if (version === request.current) setCreateError('Não foi possível criar o assunto. Tente novamente.')
        } finally {
            if (version === request.current) setCreating(false)
        }
    }

    return {
        areas, area, disciplines, disciplineId, subjects, loading, error, creating, createError,
        newSubjectName, setNewSubjectName, selectArea, selectDiscipline, createSubject, retry: () => retry.current()
    }
}
