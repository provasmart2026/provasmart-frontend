import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthRedirect } from './components/AuthRedirect'
import { UsersPage } from './pages/admin/users/UsersPage'
import { AuditLogsPage } from './pages/admin/audit/AuditLogsPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { QuestionsPage } from './pages/admin/questions/QuestionsPage'
import { QuestionReportsPage } from './pages/admin/reports/QuestionReportsPage'
import { QuestionReportDetailPage } from './pages/admin/reports/QuestionReportDetailPage'
import { QuestionFormPage } from './pages/admin/questions/QuestionFormPage'
import { MainLayout } from './layouts/MainLayout'
import { Home } from './pages/home/Home'
import { SimulationStartPage } from './pages/student/simulations/SimulationStartPage'
import { SimulationPage } from './pages/student/simulations/SimulationPage'
import { DirectedPracticeStartPage } from './pages/student/directed-practice/DirectedPracticeStartPage'
import { DirectedPracticePage } from './pages/student/directed-practice/DirectedPracticePage'
import { DirectedPracticeAnalysisPage } from './pages/student/directed-practice/DirectedPracticeAnalysisPage'
import { SimulationPerformancePage } from './pages/student/simulations/SimulationPerformancePage'
import { StudyPlanPage } from './pages/student/study-plan/StudyPlanPage'
import { StudentDashboardPage } from './pages/student/dashboard/StudentDashboardPage'
import { StudentHistoryPage } from './pages/student/history/StudentHistoryPage'
import { StudyPlanDetailsPage } from './pages/student/study-plan/StudyPlanDetailsPage'
import { ForgotPasswordPage } from './pages/access/ForgotPasswordPage'
import { LoginPage } from './pages/access/LoginPage'
import { RegisterPage } from './pages/access/RegisterPage'
import { ResetPasswordPage } from './pages/access/ResetPasswordPage'
import { VerifyTwoFactorPage } from './pages/access/VerifyTwoFactorPage'
import { PrivacyPage, TermsPage } from './pages/legal/LegalPages'
import { LegalAcceptancePage } from './pages/legal/LegalAcceptancePage'

export function App() {
    return (
        <BrowserRouter>
            <AuthRedirect />
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
                    <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
                    <Route path="/verificar-codigo" element={<VerifyTwoFactorPage />} />
                    <Route path="/cadastro" element={<RegisterPage />} />
                    <Route path="/termos-de-uso" element={<TermsPage />} />
                    <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/aceite-documentos" element={<LegalAcceptancePage />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['ESTUDANTE']} />}>
                        <Route path="/dashboard" element={<StudentDashboardPage />} />
                        <Route path="/plano-de-estudos" element={<StudyPlanPage />} />
                        <Route path="/historico" element={<StudentHistoryPage />} />
                        <Route
                            path="/plano-de-estudos/historico"
                            element={<Navigate to="/historico?aba=planos" replace />}
                        />
                        <Route path="/plano-de-estudos/historico/:planId" element={<StudyPlanDetailsPage />} />
                        <Route path="/simulados" element={<SimulationStartPage />} />
                        <Route path="/simulados/:simulationId" element={<SimulationPage />} />
                        <Route path="/praticas" element={<DirectedPracticeStartPage />} />
                        <Route path="/praticas/:practiceId" element={<DirectedPracticePage />} />
                        <Route path="/praticas/:practiceId/analise" element={<DirectedPracticeAnalysisPage />} />
                        <Route path="/simulados/:simulationId/desempenho" element={<SimulationPerformancePage />} />
                        <Route path="/student/simulations/start" element={<SimulationStartPage />} />
                        <Route path="/student/simulations/:simulationId" element={<SimulationPage />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                        <Route path="/admin/users" element={<UsersPage />} />
                        <Route path="/admin/questions" element={<QuestionsPage />} />
                        <Route path="/admin/question-reports" element={<QuestionReportsPage />} />
                        <Route path="/admin/question-reports/:id" element={<QuestionReportDetailPage />} />
                        <Route path="/admin/questions/new" element={<QuestionFormPage />} />
                        <Route path="/admin/questions/:id/edit" element={<QuestionFormPage />} />
                    </Route>
                </Routes>
            </MainLayout>
        </BrowserRouter>
    )
}
