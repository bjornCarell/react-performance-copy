// Fix "perf death by a thousand cuts"
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils'

const AppStateContext = React.createContext()
const AppDispatchContext = React.createContext()
const DogNameInputContext = React.createContext()

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
)

function appReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GRID_CELL': {
      return {...state, grid: updateGridCellState(state.grid, action)}
    }
    case 'UPDATE_GRID': {
      return {...state, grid: updateGridState(state.grid)}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function AppProvider({children}) {
  const [state, dispatch] = React.useReducer(appReducer, {
    grid: initialGrid,
  })
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

function DogNameInputProvider({children}) {
  const [dogName, setDogName] = React.useState('')
  const value = [dogName, setDogName]
  return (
    <DogNameInputContext.Provider value={value}>
      {children}
    </DogNameInputContext.Provider>
  )
}

function useAnyContext(contextInput = null) {
  const context = React.useContext(contextInput)
  if (!context) {
    throw new Error('useAnyContext must be used within a Provider')
  }
  return context
}

const useAppState = () => useAnyContext(AppStateContext)
const useAppDispatch = () => useAnyContext(AppDispatchContext)
const useDogInput = () => useAnyContext(DogNameInputContext)

function Grid() {
  const dispatch = useAppDispatch()
  const [rows, setRows] = useDebouncedState(50)
  const [columns, setColumns] = useDebouncedState(50)
  const updateGridData = () => dispatch({type: 'UPDATE_GRID'})
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  )
}
Grid = React.memo(Grid)

function Cell({row, column}) {
  const state = useAppState()
  const cell = state.grid[row][column]
  const dispatch = useAppDispatch()
  const handleClick = () => dispatch({type: 'UPDATE_GRID_CELL', row, column})
  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
}
Cell = React.memo(Cell)

function DogNameInput() {
  const [dogName, setDogName] = useDogInput()
  function handleChange(event) {
    const newDogName = event.target.value
    setDogName(newDogName)
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={dogName}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {dogName ? (
        <div>
          <strong>{dogName}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  )
}
function App() {
  const forceRerender = useForceRerender()
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        {/* Colocate state from Context Providers*/}
          <DogNameInputProvider>
            <DogNameInput />
          </DogNameInputProvider>
          <AppProvider>
            <Grid />
          </AppProvider>
        </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
