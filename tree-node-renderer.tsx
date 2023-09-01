import React from 'react'
import { ConnectDropTarget } from 'react-dnd'
import { TreeItem, TreePath } from 'react-sortable-tree-wcag-editor'
import { classnames } from './utils.ts'
import styles from './tree-node-renderer.scss'

export interface TreeNode {
  node: TreeItem
}

export interface FlatDataItem extends TreeNode, TreePath {
  lowerSiblingCounts: number[]
  parentNode: TreeItem
}

export interface TreeRendererProps {
  treeIndex: number
  treeId: string
  swapFrom?: number | undefined
  swapDepth?: number | undefined
  swapLength?: number | undefined
  scaffoldBlockPxWidth: number
  lowerSiblingCounts: number[]
  rowDirection?: 'ltr' | 'rtl' | string | undefined
  rowHeight: number | ((treeIndex: number, node: any, path: any[]) => number)

  listIndex: number
  children: JSX.Element[]
  style?: React.CSSProperties | undefined

  // Drop target
  connectDropTarget: ConnectDropTarget
  isOver: boolean
  canDrop?: boolean | undefined
  draggedNode?: TreeItem | undefined

  // used in dndManager
  getPrevRow: () => FlatDataItem | undefined
  node: TreeItem
  path: number[]
  isDraggedDescendant: boolean
  selectedNodes: TreeNode[]
}

const defaultProps = {
  swapFrom: undefined,
  swapDepth: undefined,
  swapLength: undefined,
  canDrop: false,
  draggedNode: undefined,
  rowDirection: 'ltr',
}

function TreeNodeComponent(props: TreeRendererProps) {
  const {
    children,
    listIndex,
    swapFrom,
    swapLength,
    swapDepth,
    scaffoldBlockPxWidth,
    lowerSiblingCounts,
    connectDropTarget,
    isOver,
    draggedNode,
    canDrop,
    treeIndex,
    rowHeight,
    treeId: _treeId, // Delete from otherProps
    getPrevRow: _getPrevRow, // Delete from otherProps
    node: _node, // Delete from otherProps
    path: _path, // Delete from otherProps
    rowDirection,
    selectedNodes,
    isDraggedDescendant,
    ...otherProps
  } = { ...defaultProps, ...props }

  const multipleDraggingNodeDescendant =
    selectedNodes.length > 1 && isDraggedDescendant

  if (multipleDraggingNodeDescendant) {
    return null // TODO this causes virtuoso error - fix
  }

  const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : undefined

  const scaffoldBlockCount = lowerSiblingCounts.length - 1
  return connectDropTarget(
    <div
      {...otherProps}
      style={{
        paddingLeft: scaffoldBlockPxWidth * scaffoldBlockCount,
      }}
      className={classnames(styles.node, rowDirectionClass ?? '')}
    >
      <div className={styles.nodeContent}>
        {React.Children.map(children, (child: any) =>
          React.cloneElement(child, {
            isOver,
            canDrop,
            draggedNode,
          })
        )}
      </div>
    </div>
  )
}

export default TreeNodeComponent
