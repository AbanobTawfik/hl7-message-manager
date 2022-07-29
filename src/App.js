import './App.css'
import React, { Component, useState, useMemo } from 'react'
import Dictionary from './components/Dictionary/Dictionary'
import Back from './components/Back/Back'
import { bindActionCreators } from 'redux'

function App () {
  return (
    <div className='App' id='APPJS'>
      <header className='App-header'>
        {<Back />}
        {<Dictionary />}
      </header>
    </div>
  )
}

export default App
