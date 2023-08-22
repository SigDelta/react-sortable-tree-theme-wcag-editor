import React from 'react'
import { ConnectDragPreview, ConnectDragSource } from 'react-dnd'
import styles from './node-content-renderer.scss'
import { NodeData, TreeItem, TreeNode } from 'react-sortable-tree-test'
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
    ...otherProps
  } = props

  const isOneofParentNodes = (assumedParentPath: (string | number) [], assumedChildPath: (string | number)[]) => {
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

  let handle
  if (canDrag) {
    handle =
      typeof node.children === 'function' && node.expanded ? (
        <div className="rst__loadingHandle">
          <div className="rst__loadingCircle">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className={classnames(
                  'rst__loadingCirclePoint',
                  rowDirectionClass ?? ''
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        connectDragSource(<div className="rst__moveHandle" />, {
          dropEffect: 'copy',
        })
      )
  }

  const isLandingPadActive = !didDrop && isDragging

  let buttonStyle = { left: -0.5 * scaffoldBlockPxWidth, right: 0 }
  if (rowDirection === 'rtl') {
    buttonStyle = { right: -0.5 * scaffoldBlockPxWidth, left: 0 }
  }

  const handleSelectNode = () => {
    if (isAnyParentSelected && !isSelected) {
      // TODO invert the condition?
    } else {
      updateSelectedNodes((prevNodesList) => {
        return isSelected
          ? prevNodesList.filter(
              (selectedNode) =>
                !(getNodeKey({ node: selectedNode }) === nodeKey)
            )
          : [
              ...prevNodesList.filter(
                (prevNode) => !isOneofParentNodes(path, prevNode.path)
              ),
              { ...node, path },
            ]
      })
    }
  }

  const areMultipleNodesBeingDragged =
    draggedNode &&
    getNodeKey({ node: draggedNode }) === nodeKey &&
    selectedNodes.length > 1

  const multipleDraggedNodesPreview = (
    <div>Multiple nodes are being dragged...</div>
  )

  const draggedNodePreview = (
    <div
      className={classnames(
        'rst__rowContents',
        canDrag ? '' : 'rst__rowContentsDragDisabled',
        isSelected || isAnyParentSelected ? 'rst__rowContentsSelected' : '',
        rowDirectionClass ?? ''
      )}>
      <div className={classnames('rst__rowLabel', rowDirectionClass ?? '')}>
        <span
          className={classnames(
            'rst__rowTitle',
            node.subtitle ? 'rst__rowTitleWithSubtitle' : ''
          )}>
          {typeof nodeTitle === 'function'
            ? nodeTitle({
                node,
                path,
                treeIndex,
              })
            : nodeTitle}
        </span>

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

  return (
    <div style={{ height: '100%' }} {...otherProps} onClick={handleSelectNode}>
      {toggleChildrenVisibility &&
        node.children &&
        (node.children.length > 0 || typeof node.children === 'function') && (
          <div>
            <button
              type="button"
              aria-label={node.expanded ? 'Collapse' : 'Expand'}
              className={classnames(
                node.expanded ? 'rst__collapseButton' : 'rst__expandButton',
                rowDirectionClass ?? ''
              )}
              style={buttonStyle}
              onClick={() =>
                toggleChildrenVisibility({
                  node,
                  path,
                  treeIndex,
                })
              }
            />

            {node.expanded && !isDragging && (
              <div
                style={{ width: scaffoldBlockPxWidth }}
                className={classnames(
                  'rst__lineChildren',
                  rowDirectionClass ?? ''
                )}
              />
            )}
          </div>
        )}

      <div className={classnames('rst__rowWrapper', rowDirectionClass ?? '')}>
        {/* Set the row preview to be used during drag and drop */}
        {connectDragPreview(
          <div
            className={classnames(
              'rst__row',
              isLandingPadActive ? 'rst__rowLandingPad' : '',
              isLandingPadActive && !canDrop ? 'rst__rowCancelPad' : '',
              isSearchMatch ? 'rst__rowSearchMatch' : '',
              isSearchFocus ? 'rst__rowSearchFocus' : '',
              rowDirectionClass ?? '',
              className ?? ''
            )}
            style={{
              opacity: isDraggedDescendant ? 0.5 : 1,
              ...style,
            }}>
            {handle}
            {areMultipleNodesBeingDragged
              ? multipleDraggedNodesPreview
              : draggedNodePreview}
          </div>
        )}
      </div>
    </div>
  )
}

export default NodeRendererDefault
