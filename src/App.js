import './App.css'
import React, { Component, useState, useMemo } from 'react'
import Nav from './components/Nav/Nav.tsx'
import Dictionary from './components/Dictionary/Dictionary.tsx'
import {bindActionCreators} from 'redux'

function App() {
  console.log("NOT RERENDERING AGAIN")
  return (
    <div className='App' id="APPJS">
      <header className='App-header'>
        {<Dictionary />}
      </header>
    </div>

  )
}

export default App