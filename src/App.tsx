import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthRedirect } from './components/AuthRedirect'
import { UsersPage } from './pages/admin/UsersPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { QuestionsPage } from './pages/admin/questions/QuestionsPage'
import { QuestionFormPage } from './pages/admin/questions/QuestionFormPage'
import { MainLayout } from './layouts/MainLayout'
import { Home } from './pages/home/Home'
import { SimulationStartPage } from './pages/student/SimulationStartPage'
import { SimulationPage } from './pages/student/SimulationPage'
import { ForgotPasswordPage } from './pages/access/ForgotPasswordPage'
import { LoginPage } from './pages/access/LoginPage'
import { RegisterPage } from './pages/access/RegisterPage'
import { ResetPasswordPage } from './pages/access/ResetPasswordPage'
import { VerifyTwoFactorPage } from './pages/access/VerifyTwoFactorPage'
import { PrivacyPage, TermsPage } from './pages/legal/LegalPages'

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
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['ESTUDANTE']} />}>
                        <Route path="/simulados" element={<SimulationStartPage />} />
                        <Route path="/simulados/:simulationId" element={<SimulationPage />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin/users" element={<UsersPage />} />
                        <Route path="/admin/questions" element={<QuestionsPage />} />
                        <Route path="/admin/questions/new" element={<QuestionFormPage />} />
                        <Route path="/admin/questions/:id/edit" element={<QuestionFormPage />} />
                    </Route>
                </Routes>
            </MainLayout>
        </BrowserRouter>
    )
}
