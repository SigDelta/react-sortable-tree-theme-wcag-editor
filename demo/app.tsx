import React, { useState, useRef } from 'react'
import {
  toggleExpandedForAll,
  SortableTreeWithoutDndContext as SortableTree,
  changeNodeAtPath,
} from 'react-sortable-tree-wcag-editor'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import CustomTheme from '../index'
import ExternalNode, { externalNodeType } from './externalSourceNode'
import './app.css'
import onOutsideClick from './onOutsideClick'

const data = [
  {
    title: 'Chicken',
    id: 1,
    expanded: true,
    dragDisabled: true,
    editingDisabled: true,
    children: [{ title: 'Egg', id: 5 }],
  },
  { title: 'Cow', id: 2, expanded: true, children: [{ title: 'Milk', id: 6 }] },
  {
    title: 'Sheep',
    id: 3,
    expanded: true,
    children: [{ title: 'Wool', id: 7 }],
  },
  { title: 'Pig', id: 4, expanded: true, children: [{ title: 'Meet', id: 8 }] },
  {
    title: 'Chicken 2',
    id: 9,
    expanded: true,
    children: [{ title: 'Egg 2', id: 13 }],
  },
  {
    title: 'Cow 2',
    id: 10,
    expanded: true,
    children: [{ title: 'Milk 2', id: 14 }],
  },
  {
    title: 'Sheep 2',
    id: 11,
    expanded: true,
    children: [{ title: 'Wool 2', id: 15 }],
  },
  {
    title: 'Pig 2',
    id: 12,
    expanded: true,
    children: [{ title: 'Meet 2', id: 16 }],
  },
]

const App = () => {
  const [searchString, setSearchString] = useState('')
  const [searchFocusIndex, setSearchFocusIndex] = useState(0)
  const [searchFoundCount, setSearchFoundCount] = useState(null)
  const [treeData, setTreeData] = useState(data)
  const virtuosoRef = useRef(null)

  function deselectAllTreeItems(tree) {
    if (!Array.isArray(tree)) return []

    return tree.map((node) => {
      const newNode = { ...node }

      if (newNode.isSelected !== undefined) {
        newNode.isSelected = false
      }

      if (newNode.isEditing) {
        newNode.isEditing = false
        newNode.dragTemporarilyDisabled = false
      }

      if (newNode.children) {
        newNode.children = deselectAllTreeItems(newNode.children)
      }

      return newNode
    })
  }

  const handleOnOutsideClick = () => {
    const updatedTreeData = deselectAllTreeItems(treeData)
    setTreeData((prevTreeData) => updatedTreeData)
  }

  onOutsideClick(
    document.querySelector('[data-test-id="virtuoso-item-list"]'),
    handleOnOutsideClick
  )

  const expand = (expanded) => {
    setTreeData((prevTreeData) =>
      toggleExpandedForAll({
        treeData: prevTreeData,
        expanded,
      })
    )
  }

  const expandAll = () => {
    expand(true)
  }

  const collapseAll = () => {
    expand(false)
  }

  const selectPrevMatch = () => {
    setSearchFocusIndex((prevIndex) =>
      prevIndex !== null
        ? (searchFoundCount + prevIndex - 1) % searchFoundCount
        : searchFoundCount - 1
    )
  }

  const selectNextMatch = () => {
    setSearchFocusIndex((prevIndex) =>
      prevIndex !== null ? (prevIndex + 1) % searchFoundCount : 0
    )
  }

  const getNodeKey = ({ node }) => node.id

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
            <button onClick={expandAll}>Expand All</button>
            <button onClick={collapseAll}>Collapse All</button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <form
              style={{ display: 'inline-block' }}
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <label htmlFor="find-box">
                Search:&nbsp;
                <input
                  id="find-box"
                  type="text"
                  value={searchString}
                  onChange={(event) => setSearchString(event.target.value)}
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
              height: 400,
            }}
          >
            <SortableTree
              getNodeKey={getNodeKey}
              theme={CustomTheme}
              treeData={treeData}
              onChange={setTreeData}
              // searchQuery={searchString}
              // searchFocusOffset={searchFocusIndex}
              style={{ width: '600px' }}
              // virtuosoRef={virtuosoRef}
              // searchFinishCallback={matches =>
              //   setSearchFoundCount(matches.length)
              // }
              canDrag={({ node }) =>
                !node.dragDisabled && !node.dragTemporarilyDisabled
              }
              generateNodeProps={({ node, path }) => {
                const updateNode = (newNode, event) => {
                  setTreeData((prevTreeData) => {
                    const newTreeData =
                      event && event.ctrlKey
                        ? prevTreeData
                        : deselectAllTreeItems(prevTreeData)

                    return changeNodeAtPath({
                      treeData: newTreeData,
                      path,
                      getNodeKey,
                      newNode,
                    })
                  })
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

export default App
