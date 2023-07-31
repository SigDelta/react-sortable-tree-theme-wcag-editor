import React, { Component } from 'react'
import {
  toggleExpandedForAll,
  SortableTreeWithoutDndContext as SortableTree,
  changeNodeAtPath,
} from '@nosferatu500/react-sortable-tree'
import CustomTheme from '../index'
import ExternalNode, { externalNodeType } from './externalSourceNode'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './app.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
      treeData: [
        { title: 'Node 1' },
        { title: 'Node 2' },
        {
          title: 'This node is not draggable',
          dragDisabled: true,
        },
        { title: 'Chicken', children: [{ title: 'Egg' }] },
      ],
    }
    this.updateTreeData = this.updateTreeData.bind(this)
    this.expandAll = this.expandAll.bind(this)
    this.collapseAll = this.collapseAll.bind(this)
  }

  updateTreeData(treeData) {
    this.setState({ treeData })
  }

  expand(expanded) {
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    })
  }

  expandAll() {
    this.expand(true)
  }

  collapseAll() {
    this.expand(false)
  }

  render() {
    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
    } = this.state

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      })

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      })

    const getNodeKey = ({ treeIndex }) => treeIndex

    return (
      <DndProvider backend={HTML5Backend}>
        <ExternalNode node={{ title: 'Tag: P' }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          }}
        >
          <div>
            <div style={{ flex: '0 0 auto', padding: '0 15px' }}>
              <h3>Full Node Drag Theme</h3>
              <button onClick={this.expandAll}>Expand All</button>
              <button onClick={this.collapseAll}>Collapse All</button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <form
                style={{ display: 'inline-block' }}
                onSubmit={event => {
                  event.preventDefault()
                }}
              >
                <label htmlFor="find-box">
                  Search:&nbsp;
                  <input
                    id="find-box"
                    type="text"
                    value={searchString}
                    onChange={event =>
                      this.setState({
                        searchString: event.target.value,
                      })
                    }
                  />
                </label>

                <button
                  type="button"
                  disabled={!searchFoundCount}
                  onClick={selectPrevMatch}
                >
                  &lt;
                </button>

                <button
                  type="submit"
                  disabled={!searchFoundCount}
                  onClick={selectNextMatch}
                >
                  &gt;
                </button>

                <span>
                  &nbsp;
                  {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
                  &nbsp;/&nbsp;
                  {searchFoundCount || 0}
                </span>
              </form>
            </div>

            <div
              style={{
                flex: '1 0 50%',
                padding: '50px 15px',
                height: '400px',
              }}
            >
              <SortableTree
                theme={CustomTheme}
                treeData={treeData}
                onChange={this.updateTreeData}
                searchQuery={searchString}
                searchFocusOffset={searchFocusIndex}
                style={{ width: '600px' }}
                searchFinishCallback={matches =>
                  this.setState({
                    searchFoundCount: matches.length,
                    searchFocusIndex:
                      matches.length > 0
                        ? searchFocusIndex % matches.length
                        : 0,
                  })
                }
                canDrag={({ node }) =>
                  !node.dragDisabled && !node.dragTemporarilyDisabled
                }
                generateNodeProps={({ node, path }) => {
                  const updateNode = newNode => {
                    this.updateTreeData(
                      changeNodeAtPath({
                        treeData,
                        path,
                        getNodeKey,
                        newNode,
                      })
                    )
                  }

                  return {
                    updateNode,
                    buttons: [<button onClick={() => {}}>delete</button>],
                  }
                }}
                dndType={externalNodeType}
              />
            </div>
          </div>
        </div>
      </DndProvider>
    )
  }
}

export default App
