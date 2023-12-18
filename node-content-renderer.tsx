import React, { useEffect, useRef } from 'react'
import { ConnectDragPreview, ConnectDragSource } from 'react-dnd'
import {
  NodeData,
  SelectedNode,
  TreeItem,
  TreeNodeId,
  find,
} from 'react-sortable-tree-wcag-editor'
import styles from './node-content-renderer.scss'
import { classnames } from './utils'

const defaultProps = {
  isSearchMatch: false,
  isSearchFocus: false,
  canDrag: false,
  toggleChildrenVisibility: undefined,
  buttons: [],
  className: '',
  style: {},
  parentNode: undefined,
  draggedNode: undefined,
  canDrop: false,
  title: undefined,
  subtitle: undefined,
  rowDirection: 'ltr',
}

export interface NodeRendererProps {
  node: TreeItem
  path: number[]
  treeIndex: number
  isSearchMatch: boolean
  isSearchFocus: boolean
  canDrag: boolean
  scaffoldBlockPxWidth: number
  toggleChildrenVisibility?(data: NodeData): void | undefined
  buttons?: JSX.Element[] | undefined
  className?: string | undefined
  style?: React.CSSProperties | undefined
  title?: ((data: NodeData) => JSX.Element | JSX.Element) | undefined
  subtitle?: ((data: NodeData) => JSX.Element | JSX.Element) | undefined
  icons?: JSX.Element[] | undefined
  lowerSiblingCounts: number[]
  swapDepth?: number | undefined
  swapFrom?: number | undefined
  swapLength?: number | undefined
  listIndex: number
  treeId: string
  rowDirection?: 'ltr' | 'rtl' | string | undefined
  selectedNodes: TreeNodeId[]
  isDraggedDescendant: boolean

  connectDragPreview: ConnectDragPreview
  connectDragSource: ConnectDragSource
  updateSelectedNodes: (
    inputFn: (selectedNodes: TreeNodeId[]) => SelectedNode[]
  ) => void
  parentNode?: TreeItem | undefined
  startDrag: ({ path }: { path: number[] | number[][] }) => void
  endDrag: (dropResult: unknown) => void
  isDragging: boolean
  didDrop: boolean
  draggedNode?: TreeItem | undefined
  isOver: boolean
  canDrop?: boolean | undefined
}

const NodeRendererDefault: React.FC<NodeRendererProps> = (props) => {
  props = { ...defaultProps, ...props }

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
    buttons,
    className,
    style,
    didDrop,
    treeId: _treeId,
    isOver: _isOver, // Not needed, but preserved for other renderers
    parentNode: _parentNode, // Needed for dndManager
    rowDirection,
    updateSelectedNodes,
    selectedNodes,
    isDraggedDescendant,
    ...otherProps
  } = props

  const inputRef = useRef(null)
  useEffect(() => {
    if (node.isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [node.isEditing])

  const isOneofParentNodes = (
    assumedParentNodeId: TreeNodeId,
    nodePath: TreeNodeId[]
  ) => {
    const pathElements = nodePath.slice(0, -1)
    return pathElements.some((pathCrumb) => pathCrumb === assumedParentNodeId)
  }

  const isOneofChildNodes = (
    assumedChildNodeId: TreeNodeId,
    testedNode: TreeItem
  ): boolean => {
    if (testedNode.children) {
      for (const childNode of testedNode.children) {
        if (childNode.nodeId === assumedChildNodeId) return true
        if (isOneofChildNodes(assumedChildNodeId, childNode)) {
          return true
        }
      }
    }
    return false
  }

  const isAnyParentSelected = selectedNodes.some((selectedNodeId) =>
    isOneofParentNodes(selectedNodeId, path)
  )

  const nodeTitle = title || node.title
  const nodeSubtitle = subtitle || node.subtitle
  const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : undefined
  const nodeKey = node.nodeId
  const isSelected = selectedNodes.some(
    (selectedNodeId) => selectedNodeId === nodeKey
  )

  const getNodeTitle = () => {
    if (!node.isEditing) {
      return typeof nodeTitle === 'function'
        ? nodeTitle({
            node,
            path,
            treeIndex,
          })
        : nodeTitle
    }
    return null
  }

  const areMultipleNodesBeingDragged =
    draggedNode && draggedNode.nodeId === nodeKey && selectedNodes.length > 1

  const multipleDraggedNodesPreview = (
    <div>Multiple nodes are being dragged...</div>
  )

  const nodeContent = connectDragPreview(
    <div
      className={classnames(
        isSelected || isAnyParentSelected ? styles.rowSelected : '',
        rowDirectionClass ?? '',
        styles.rowContents +
          (isSearchMatch ? ` ${styles.rowSearchMatch}` : '') +
          (isSearchFocus ? ` ${styles.rowSearchFocus}` : '') +
          (!canDrag ? ` ${styles.rowContentsDragDisabled}` : '')
      )}
    >
      <div className={classnames(styles.rowLabel, rowDirectionClass ?? '')}>
        <span
          className={classnames(
            styles.rowTitle +
              (node.subtitle ? ` ${styles.rowTitleWithSubtitle}` : '')
          )}
        >
          {typeof nodeTitle === 'function'
            ? nodeTitle({
                node,
                path,
                treeIndex,
              })
            : nodeTitle}
          {/* <input
            onBlur={() =>
              updateNode({
                ...node,
                title: node.title ? node.title : node.prevTitle,
                isEditing: false,
                prevTitle: undefined,
              })
            }
            onClick={(e) => e.stopPropagation()}
            className={`${styles.nodeInput} ${
              node.isEditing ? '' : styles.nodeInputHidden
            }`}
            ref={inputRef}
            value={nodeTitle}
            onChange={(event) => {
              const newTitle = event.target.value
              updateNode({ ...node, title: newTitle })
            }}
          /> */}
        </span>

        {areMultipleNodesBeingDragged ? multipleDraggedNodesPreview : null}

        {nodeSubtitle && (
          <span className="rst__rowSubtitle">
            {typeof nodeSubtitle === 'function'
              ? nodeSubtitle({
                  node,
                  path,
                  treeIndex,
                })
              : nodeSubtitle}
          </span>
        )}
      </div>
      <div className="rst__rowToolbar">
        {buttons?.map((btn, index) => (
          <div key={index} className="rst__toolbarButton">
            {btn}
          </div>
        ))}
      </div>
    </div>
  )

  const isLandingPadActive = !didDrop && isDragging

  let buttonStyle = { left: -0.5 * scaffoldBlockPxWidth, right: 0 }
  if (rowDirection === 'rtl') {
    buttonStyle = { right: -0.5 * scaffoldBlockPxWidth, left: 0 }
  }

  const handleSelectNode = () => {
    if (isAnyParentSelected && !isSelected) {
      // TODO invert the condition
    } else {
      updateSelectedNodes((prevNodesList) => {
        const updatedNodesList = isSelected
          ? prevNodesList.filter(
              (selectedNodeId) => !(selectedNodeId === nodeKey)
            )
          : [
              ...prevNodesList.filter((prevNodeId) => {
                const isAnyChildOrParentSelected =
                  isOneofParentNodes(prevNodeId, path) ||
                  isOneofChildNodes(prevNodeId, node)
                return !isAnyChildOrParentSelected
              }),
              node.nodeId,
            ]

        return {
          selectedNodesList: updatedNodesList,
          isNodeSelected: !isSelected,
          node,
        }
      })
    }
  }

  return (
    <div style={{ height: '100%' }} {...otherProps}>
      {node.expanded && !isDragging && (
        <div
          style={{ width: scaffoldBlockPxWidth }}
          className={classnames(styles.lineChildren, rowDirectionClass ?? '')}
        />
      )}

      <button
        onDoubleClick={(e) => {
          if (!e.ctrlKey && !node.editingDisabled) {
            updateNode({
              ...node,
              isEditing: true,
              dragTemporarilyDisabled: true,
              prevTitle: node.title,
            })
            updateSelectedNodes(() => ({ selectedNodesList: [] }))
          }
        }}
        onClick={handleSelectNode}
        className={`${styles.rowWrapper} ${
          !canDrag ? ` ${styles.rowWrapperDragDisabled} ` : ''
        }${
          isAnyParentSelected || isSelected
            ? ` ${styles.rowWrapperSelected} `
            : ''
        }`}
      >
        {toggleChildrenVisibility &&
          node.children &&
          (node.children.length > 0 || typeof node.children === 'function') && (
            <div>
              <button
                type="button"
                aria-label={node.expanded ? 'Collapse' : 'Expand'}
                className={classnames(
                  (node.expanded
                    ? styles.collapseButton
                    : styles.expandButton) +
                    (isSearchMatch ? ` ${styles.collapseButtonDark}` : '')
                )}
                style={buttonStyle}
                onDoubleClick={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleChildrenVisibility({
                    node,
                    path,
                    treeIndex,
                  })
                }}
              />
            </div>
          )}
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

export default NodeRendererDefault
