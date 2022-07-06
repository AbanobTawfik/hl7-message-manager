import './App.css'
import React, { Component } from 'react'
import Nav from './components/Nav/Nav.tsx'
import Dictionary from './components/Dictionary/Dictionary.tsx'
import Filter from './components/Filter/Filter.tsx'
import Sidebar from './components/Sidebar/Sidebar.tsx'
import Menu from './components/Menu/Menu.tsx'
function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <Menu />
        <Nav />
        <Dictionary/>
        <Filter/>
        <Sidebar/>
      </header>
    </div>

  )
}

export default App