import './App.css'
import React, { Component, useState, useMemo } from 'react'
import Nav from './components/Nav/Nav.tsx'
import Dictionary from './components/Dictionary/Dictionary.tsx'
import Window from './components/Window/Window.tsx'

import Filter from './components/Filter/Filter.tsx'
import Sidebar from './components/Sidebar/Sidebar.tsx'
import Menu from './components/Menu/Menu.tsx'

import * as map from './services/dictionary.ts'
import * as dba from "./services/database.ts"


function App() {

  console.log("NOT RERENDERING AGAIN")
  return (
    <div className='App'>
      <header className='App-header'>
        {/* <Menu /> */}
        {<Dictionary />}
        
        {/* <Window current_directory={current_directory} /> */}
      </header>
    </div>

  )
}

export default App