// Code splitting
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

// What webpack does, or the browser, or another bundler, is that it maintain
// a cache for all promises made, and the resolved values, by dynamic imports.
// So when React later goes ahead and loads the component the dynamic import
// is already in the bundlers, or browsers, cache. 
const loadGlobe = () => import('../globe')

// The import is already in the bundlers, or browsers, cache, when this 
// is getting rendered to the screen
const Globe = React.lazy(loadGlobe)

// If we are using webpack we can make use of Magic Comments. This comment will
// should be used if we are just about 100% about what the next step the user 
// is going to take will be. 
// const Globe = React.lazy(() => import(/* webpackPrefetch: true */ '../globe'))

function App() {
  const [showGlobe, setShowGlobe] = React.useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        padding: '2rem',
      }}
    >
      {/* 
            We load the Globe component and it gets stashed to the bundlers, 
            or browsers, cache. Giving the effect that the component 
            loads faster to the screen.
      */}
      <label
        style={{marginBottom: '1rem'}}
        onMouseEnter={loadGlobe}
        onFocus={loadGlobe}
      >
        <input
          type="checkbox"
          checked={showGlobe}
          onChange={e => setShowGlobe(e.target.checked)}
        />
        {' show globe'}
      </label>
      <div style={{width: 400, height: 400}}>
        <React.Suspense fallback={<div>...loading</div>}>
          {showGlobe ? <Globe /> : null}
        </React.Suspense>
      </div>
    </div>
  )
}
// 🦉 Note that if you're not on the isolated page, then you'll notice that this
// app actually already has a React.Suspense component higher up in the tree
// where this component is rendered, so you *could* just rely on that one.

export default App
