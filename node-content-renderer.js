import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './node-content-renderer.scss'
import useOnOutsideClick from './useOnOutsideClick'

function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== 'function' &&
    older.children.some(
      child => child === younger || isDescendant(child, younger)
    )
  )
}

// eslint-disable-next-line react/prefer-stateless-function
function MinimalThemeNodeContentRenderer(props) {
  const {
    scaffoldBlockPxWidth,
    toggleChildrenVisibility,
    connectDragPreview,
    connectDragSource,
    isDragging,
    canDrop,
    canDrag,
    node,
    title,
    subtitle,
    draggedNode,
    path,
    treeIndex,
    isSearchMatch,
    isSearchFocus,
    icons,
    buttons,
    className,
    style,
    didDrop,
    swapFrom,
    swapLength,
    swapDepth,
    treeId, // Not needed, but preserved for other renderers
    isOver, // Not needed, but preserved for other renderers
    parentNode, // Needed for dndManager
    rowDirection,
    scaffoldBlockCount,
    updateNode,
    ...otherProps
  } = props
  const nodeTitle = title || node.title
  const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node)
  const isLandingPadActive = !didDrop && isDragging
  const inputRef = useRef(null)

  useEffect(() => {
    if (node.isEditing) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [node.isEditing])

  const nodeContent = connectDragPreview(
    <div
      className={
        styles.rowContents +
        (isSearchMatch ? ` ${styles.rowSearchMatch}` : '') +
        (isSearchFocus ? ` ${styles.rowSearchFocus}` : '') +
        (!canDrag ? ` ${styles.rowContentsDragDisabled}` : '')
      }
    >
      <div className={styles.rowLabel}>
        <span
          className={
            styles.rowTitle +
            (node.subtitle ? ` ${styles.rowTitleWithSubtitle}` : '')
          }
        >
          {node.isEditing ? null : nodeTitle}
          <input
            ref={inputRef}
            className={`${styles.nodeInput} ${
              node.isEditing ? '' : styles.nodeInputHidden
            }`}
            value={nodeTitle}
            onChange={event => {
              const newTitle = event.target.value
              updateNode({ ...node, title: newTitle })
            }}
          />
        </span>
      </div>
    </div>
  )

  const nodeRef = useRef()

  useOnOutsideClick(nodeRef, () => {
    if (node.isEditing || node.isSelected) {
      updateNode({
        ...node,
        isEditing: false,
        dragTemporarilyDisabled: false,
        title: nodeTitle || node.prevTitle,
        prevTitle: undefined,
        isSelected: undefined,
      })
    }
  })

  return (
    <div style={{ height: '100%' }} {...otherProps}>
      {toggleChildrenVisibility &&
        node.children &&
        (node.children.length > 0 || typeof node.children === 'function') && (
          <div>
            <button
              type="button"
              aria-label={node.expanded ? 'Collapse' : 'Expand'}
              className={
                (node.expanded ? styles.collapseButton : styles.expandButton) +
                (isSearchMatch ? ` ${styles.collapseButtonDark}` : '')
              }
              onClick={() =>
                toggleChildrenVisibility({
                  node,
                  path,
                  treeIndex,
                })
              }
              style={{
                marginLeft: scaffoldBlockPxWidth * scaffoldBlockCount,
              }}
            />

            {node.expanded && !isDragging && (
              <div
                style={{ width: scaffoldBlockPxWidth }}
                className={styles.lineChildren}
              />
            )}
          </div>
        )}

      <button
        onDoubleClick={() => {
          updateNode({
            ...node,
            isEditing: true,
            dragTemporarilyDisabled: true,
            prevTitle: node.title,
          })
        }}
        onClick={() => {
          updateNode({ ...node, isSelected: true })
        }}
        ref={nodeRef}
        className={`${styles.rowWrapper} ${
          !canDrag ? ` ${styles.rowWrapperDragDisabled} ` : ''
        }${node.isSelected ? ` ${styles.rowWrapperSelected} ` : ''}${
          node.title
        }`}
      >
        <div
          className={
            styles.row +
            (isLandingPadActive ? ` ${styles.rowLandingPad}` : '') +
            (isLandingPadActive && !canDrop ? ` ${styles.rowCancelPad}` : '') +
            (className ? ` ${className}` : '')
          }
          style={{
            opacity: isDraggedDescendant ? 0.5 : 1,
            ...style,
          }}
        >
          {canDrag
            ? connectDragSource(nodeContent, { dropEffect: 'copy' })
            : nodeContent}
        </div>
      </button>
    </div>
  )
}

MinimalThemeNodeContentRenderer.defaultProps = {
  buttons: [],
  canDrag: false,
  canDrop: false,
  className: '',
  draggedNode: null,
  icons: [],
  isSearchFocus: false,
  isSearchMatch: false,
  parentNode: null,
  style: {},
  subtitle: null,
  swapDepth: null,
  swapFrom: null,
  swapLength: null,
  title: null,
  toggleChildrenVisibility: null,
  rowDirection: 'ltr',
}

MinimalThemeNodeContentRenderer.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.node),
  canDrag: PropTypes.bool,
  className: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isSearchFocus: PropTypes.bool,
  isSearchMatch: PropTypes.bool,
  node: PropTypes.shape({}).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  style: PropTypes.shape({}),
  subtitle: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  swapDepth: PropTypes.number,
  swapFrom: PropTypes.number,
  swapLength: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  toggleChildrenVisibility: PropTypes.func,
  treeIndex: PropTypes.number.isRequired,
  treeId: PropTypes.string.isRequired,

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  isDragging: PropTypes.bool.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  // Drop target
  canDrop: PropTypes.bool,
  isOver: PropTypes.bool.isRequired,
  rowDirection: PropTypes.string.isRequired,
}

export default MinimalThemeNodeContentRenderer
