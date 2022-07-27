import './App.css'
import React, { Component, useState, useMemo } from 'react'
import Nav from './components/Nav/Nav.tsx'
import Dictionary from './components/Dictionary/Dictionary.tsx'
import Back from './components/Back/Back.tsx'
import {bindActionCreators} from 'redux'

function App() {
  return (
    <div className='App' id="APPJS">
      <header className='App-header'>
        {<Back/>}
        {<Dictionary />}
      </header>
    </div>

  )
}

export default App