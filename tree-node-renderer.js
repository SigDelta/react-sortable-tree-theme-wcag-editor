import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './tree-node-renderer.scss'

function MinimalThemeTreeNodeRenderer(props) {
  const {
    children,
    scaffoldBlockPxWidth,
    lowerSiblingCounts,
    connectDropTarget,
    isOver,
    draggedNode,
    canDrop,
    treeIndex,
    treeId,
    listIndex,
    rowDirection,
    getPrevRow, // Delete from otherProps
    node, // Delete from otherProps
    path, // Delete from otherProps
    rowHeight,
    ...otherProps
  } = props

  const [highlight, setHighlight] = useState(false)

  // Construct the scaffold representing the structure of the tree
  const scaffoldBlockCount = lowerSiblingCounts.length - 1
  let dropType
  if (canDrop && !isOver) {
    dropType = 'validDrop'
  } else if (!canDrop && isOver) {
    dropType = 'invalidDrop'
  }

  const handleMouseOver = () => {
    setHighlight(true)
  }

  const handleMouseLeave = () => {
    setHighlight(false)
  }

  return connectDropTarget(
    <div
      {...otherProps}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onFocus={() => {}}
      className={
        styles.node +
        (highlight ? ` ${styles.highlight}` : '') +
        (dropType ? ` ${styles[dropType]}` : '')
      }
      ref={(node) => (this.node = node)}
    >
      <div
        className={styles.nodeContent}
        style={{
          paddingLeft: scaffoldBlockPxWidth * scaffoldBlockCount,
        }}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            isOver,
            canDrop,
            draggedNode,
            scaffoldBlockCount,
          })
        )}
      </div>
    </div>
  )
}

MinimalThemeTreeNodeRenderer.defaultProps = {
  canDrop: false,
  draggedNode: null,
  rowDirection: 'ltr',
}

MinimalThemeTreeNodeRenderer.propTypes = {
  treeIndex: PropTypes.number.isRequired,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  lowerSiblingCounts: PropTypes.arrayOf(PropTypes.number).isRequired,
  treeId: PropTypes.string.isRequired,
  listIndex: PropTypes.number.isRequired,
  rowDirection: PropTypes.string,
  children: PropTypes.node.isRequired,

  // Drop target
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool,
  draggedNode: PropTypes.shape({}),

  // used in dndManager
  getPrevRow: PropTypes.func.isRequired,
  node: PropTypes.shape({}).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
}

export default MinimalThemeTreeNodeRenderer
