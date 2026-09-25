import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {RequireAuth} from './RequireAuth'
import {AuthRedirect} from './AuthRedirect'
import {UsersPage} from '../pages/admin/users/UsersPage'
import {ProfilePage} from '../pages/profile/ProfilePage'
import {QuestionsPage} from '../pages/admin/questions/QuestionsPage'
import {QuestionFormPage} from '../pages/admin/questions/QuestionFormPage'
import {Header} from '../components/layout/Header'
import {Footer} from '../components/layout/Footer'
import {Home} from '../pages/Home'
import {SimulationStartPage} from '../pages/student/simulations/SimulationStartPage'
import {SimulationPage} from '../pages/student/simulations/SimulationPage'
import {ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, VerifyTwoFactorPage} from '../pages/access/AccessPages'
import {PrivacyPage, TermsPage} from '../pages/access/LegalPages'

export function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthRedirect/>
            <div className="app-shell">
                <Header/>
                <main>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage/>}/>
                        <Route path="/redefinir-senha" element={<ResetPasswordPage/>}/>
                        <Route path="/verificar-codigo" element={<VerifyTwoFactorPage/>}/>
                        <Route path="/cadastro" element={<RegisterPage/>}/>
                        <Route path="/termos-de-uso" element={<TermsPage/>}/>
                        <Route path="/politica-de-privacidade" element={<PrivacyPage/>}/>
                        <Route element={<RequireAuth/>}>
                            <Route path="/profile" element={<ProfilePage/>}/>
                        </Route>
                        <Route element={<RequireAuth allowedRoles={['ESTUDANTE']}/>}>
                            <Route path="/simulados" element={<SimulationStartPage/>}/>
                            <Route path="/simulados/:simulationId" element={<SimulationPage/>}/>
                        </Route>
                        <Route element={<RequireAuth allowedRoles={['ADMIN']}/>}>
                            <Route path="/admin/users" element={<UsersPage/>}/>
                            <Route path="/admin/questions" element={<QuestionsPage/>}/>
                            <Route path="/admin/questions/new" element={<QuestionFormPage/>}/>
                            <Route path="/admin/questions/:id/edit" element={<QuestionFormPage/>}/>
                        </Route>
                    </Routes>
                </main>
                <Footer/>
            </div>
        </BrowserRouter>
    )
}
