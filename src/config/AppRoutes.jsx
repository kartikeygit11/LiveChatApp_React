import React from 'react'
import { Route ,Routes} from 'react-router'
import App from '../App'
import ChatPage from '../components/ChatPage'


const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<App/>}></Route>
        <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}

export default AppRoutes