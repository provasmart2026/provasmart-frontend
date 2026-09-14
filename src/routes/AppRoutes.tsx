import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {QuestionsPage} from '../pages/admin/questions/QuestionsPage'
import {QuestionFormPage} from '../pages/admin/questions/QuestionFormPage'
import {Header} from '../components/layout/Header'
import {Footer} from '../components/layout/Footer'
import {Home} from '../pages/Home'
import {SimulationStartPage} from '../pages/student/simulations/SimulationStartPage'
import {SimulationPage} from '../pages/student/simulations/SimulationPage'

export function AppRoutes() {
    return (
        <BrowserRouter>
            <div className="app-shell">
                <Header/>
                <main>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/simulados" element={<SimulationStartPage/>}/>
                        <Route path="/simulados/:simulationId" element={<SimulationPage/>}/>
                        <Route path="/admin/questions" element={<QuestionsPage/>}/>
                        <Route path="/admin/questions/new" element={<QuestionFormPage/>}/>
                        <Route path="/admin/questions/:id/edit" element={<QuestionFormPage/>}/>
                    </Routes>
                </main>
                <Footer/>
            </div>
        </BrowserRouter>
    )
}
