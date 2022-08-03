import './App.css'
import React, { Component, useState, useMemo } from 'react'
import Dictionary from './components/Dictionary/Dictionary'
import Navigation from './components/Navigation/Navigation'
import { bindActionCreators } from 'redux'

function App() {
  return (
    <div className='App' id='APPJS'>
      {<Navigation />}
      <div>{<Dictionary />}</div>
    </div>
  )
}

export default App
