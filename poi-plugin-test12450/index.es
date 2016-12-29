import { join } from 'path'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button } from 'react-bootstrap'

// Import selectors defined in poi
import { extensionSelectorFactory } from 'views/utils/selectors'

const EXTENSION_KEY = 'poi-plugin-click-button'

// This selector gets store.ext['poi-plugin-click-button']
const pluginDataSelector = createSelector(
  extensionSelectorFactory(EXTENSION_KEY),
  (state) => state || {}
)
// This selector gets store.ext['poi-plugin-click-button'].count
const clickCountSelector = createSelector(
  pluginDataSelector,
  (state) => state.count
)

// poi will insert this reducer into the root reducer of the app
export function reducer(state={count: 0}, action) {
  const {type} = action
  if (type === '@@poi-plugin-click-button@click')
    return {
      // don't modify the state, use Object Spread Operator
      ...state,
      count: (state.count || 0) + 1,
    }
  return state
}

// Action
function increaseClick() {
  console.log('test');
  return {
    type: '@@poi-plugin-click-button@click'
  }
}

// poi will render this component in the plugin panel
export const reactClass = connect(
  // mapStateToProps, get store.ext['poi-plugin-click-button'].count and set as this.props.count
  (state, props) => ({count: clickCountSelector(state, props)}),
  // mapDispatchToProps, wrap increaseClick with dispatch and set as this.props.increaseClick
  {
    increaseClick,
  }
)(class PluginClickButton extends Component {
  render() {
    const {count, increaseClick} = this.props
    return (
      <div className="test">
        <link rel='stylesheet' href={join(__dirname, 'test.css')} />
        <h1>Clicked: {count}</h1>
        <Button onClick={increaseClick}>
          Click here!
        </Button>
      </div>
    )
  }
})