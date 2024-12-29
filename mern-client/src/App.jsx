import { useState } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './components/navbar'
import Footer from './components/footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar/>
      <div className="min-h-screen">
      <main>
        <Outlet />
      </main>
      </div>
      <div className='pt-10'>
        <Footer />
      </div>
    </>
  )
}

export default App
