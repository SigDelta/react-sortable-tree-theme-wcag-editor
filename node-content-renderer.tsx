import React, { useEffect, useRef } from 'react'
import { ConnectDragPreview, ConnectDragSource } from 'react-dnd'
import { NodeData, TreeItem, TreeNode } from 'react-sortable-tree-wcag-editor'
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
  selectedNodes: TreeItem[]

  connectDragPreview: ConnectDragPreview
  connectDragSource: ConnectDragSource
  updateSelectedNodes: (
    inputFn: (selectedNodes: TreeItem[]) => TreeItem[]
  ) => void
  parentNode?: TreeItem | undefined
  startDrag: ({ path }: { path: number[] | number[][] }) => void
  endDrag: (dropResult: unknown) => void
  isDragging: boolean
  didDrop: boolean
  draggedNode?: TreeItem | undefined
  isOver: boolean
  canDrop?: boolean | undefined
  getNodeKey: ({ node }: { node: TreeItem }) => string
  isDraggedDescendant: boolean
}

const NodeRendererDefault: React.FC<NodeRendererProps> = function (props) {
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
    getNodeKey,
    isDraggedDescendant,
    updateNode,
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
    assumedParentPath: (string | number)[],
    assumedChildPath: (string | number)[]
  ) => {
    return assumedParentPath.every(
      (pathCrumb, index) => pathCrumb === assumedChildPath[index]
    )
  }

  const isAnyParentSelected = selectedNodes.some((selectedNode) =>
    isOneofParentNodes(selectedNode.path, path)
  )

  const nodeTitle = title || node.title
  const nodeSubtitle = subtitle || node.subtitle
  const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : undefined
  const nodeKey = getNodeKey({ node })
  const isSelected = selectedNodes.some(
    (selectedNode) => getNodeKey({ node: selectedNode }) === nodeKey
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
    draggedNode &&
    getNodeKey({ node: draggedNode }) === nodeKey &&
    selectedNodes.length > 1

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
          {getNodeTitle()}
          <input
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
          />
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
    </div>
  )

  const isLandingPadActive = !didDrop && isDragging

  let buttonStyle = { left: -0.5 * scaffoldBlockPxWidth, right: 0 }
  if (rowDirection === 'rtl') {
    buttonStyle = { right: -0.5 * scaffoldBlockPxWidth, left: 0 }
  }

  const getNewSelectedNodes = (e, prevNodesList) => {
    if (!e.ctrlKey) {
      return isSelected && !(selectedNodes.length > 1)
        ? []
        : [{ ...node, path }]
    }

    return isSelected
      ? prevNodesList.filter(
          (selectedNode) => !(getNodeKey({ node: selectedNode }) === nodeKey)
        )
      : [
          ...prevNodesList.filter(
            (prevNode) => !isOneofParentNodes(path, prevNode.path)
          ),
          { ...node, path },
        ]
  }

  const handleSelectNode = (e) => {
    if (!(isAnyParentSelected && !isSelected)) {
      updateSelectedNodes((prevNodesList) => {
        const newSelectedNodes = getNewSelectedNodes(e, prevNodesList)

        return {
          selectedNodesList: newSelectedNodes,
          isNodeSelected: !isSelected,
          node,
        }
      })
    } else if (!e.ctrlKey) {
      updateSelectedNodes(() => {
        return {
          selectedNodesList: [{ ...node, path }],
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
