import './App.css'
import React, { Component } from 'react'
import Nav from './components/Nav/Nav.tsx'
import Dictionary from './components/Dictionary/Dictionary.tsx'
import Filter from './components/Filter/Filter.tsx'
import Sidebar from './components/Sidebar/Sidebar.tsx'
import Menu from './components/Menu/Menu.tsx'

// import * as map from './services/dictionary.ts'
// import {read_file } from "./services/database.ts"


function App() {
  // let dictionary = map.get_dictionary();
  // map.load_dictionary_from_storage(read_file());
  
  return (
    <div className='App'>
      <header className='App-header'>
        {/* <Menu /> */}

        <Dictionary />
      </header>
    </div>

  )
}

export default App