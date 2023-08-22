import React, { useMemo } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { classnames } from './utils.ts';
import styles from './tree-node-renderer.scss';
import { TreeItem, TreePath } from 'react-sortable-tree-test';

export interface TreeNode {
  node: TreeItem;
}

export interface FlatDataItem extends TreeNode, TreePath {
  lowerSiblingCounts: number[];
  parentNode: TreeItem;
}

export interface TreeRendererProps {
  treeIndex: number;
  treeId: string;
  swapFrom?: number | undefined;
  swapDepth?: number | undefined;
  swapLength?: number | undefined;
  scaffoldBlockPxWidth: number;
  lowerSiblingCounts: number[];
  rowDirection?: 'ltr' | 'rtl' | string | undefined;
  rowHeight: number | ((treeIndex: number, node: any, path: any[]) => number);

  listIndex: number;
  children: JSX.Element[];
  style?: React.CSSProperties | undefined;

  // Drop target
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  canDrop?: boolean | undefined;
  draggedNode?: TreeItem | undefined;

  // used in dndManager
  getPrevRow: () => FlatDataItem | undefined;
  node: TreeItem;
  path: number[];
  isDraggedDescendant: boolean;
  selectedNodes: TreeNode[];
}

const defaultProps = {
  swapFrom: undefined,
  swapDepth: undefined,
  swapLength: undefined,
  canDrop: false,
  draggedNode: undefined,
  rowDirection: 'ltr',
};

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
  } = { ...defaultProps, ...props };

  const multipleDraggingNodeDescendant =
    selectedNodes.length > 1 && isDraggedDescendant;

  if (multipleDraggingNodeDescendant) {
    return null; // TODO this causes virtuoso error - fix
  }

  const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : undefined;

  const scaffold = useMemo(() => {
    const scaffoldBlockCount = lowerSiblingCounts.length;
    const scaffoldElements: JSX.Element[] = [];

    lowerSiblingCounts.forEach((lowerSiblingCount, i) => { // TODO - remove
      let lineClass = '';

      if (lowerSiblingCount > 0) {
        if (listIndex === 0) {
          lineClass = 'rst__lineHalfHorizontalRight rst__lineHalfVerticalBottom';
        } else if (i === scaffoldBlockCount - 1) {
          lineClass = 'rst__lineHalfHorizontalRight rst__lineFullVertical';
        } else {
          lineClass = 'rst__lineFullVertical';
        }
      } else if (listIndex === 0) {
        lineClass = 'rst__lineHalfHorizontalRight';
      } else if (i === scaffoldBlockCount - 1) {
        lineClass = 'rst__lineHalfVerticalTop rst__lineHalfHorizontalRight';
      }

      scaffoldElements.push(
        <div
          key={`pre_${1 + i}`}
          style={{ width: scaffoldBlockPxWidth }}
          className={classnames('rst__lineBlock', lineClass, rowDirectionClass ?? '')}
        />
      );

      if (treeIndex !== listIndex && i === swapDepth) {
        let highlightLineClass = '';

        if (listIndex === swapFrom! + swapLength! - 1) {
          highlightLineClass = 'rst__highlightBottomLeftCorner';
        } else if (treeIndex === swapFrom) {
          highlightLineClass = 'rst__highlightTopLeftCorner';
        } else {
          highlightLineClass = 'rst__highlightLineVertical';
        }

        const style =
          rowDirection === 'rtl'
            ? {
                width: scaffoldBlockPxWidth,
                right: scaffoldBlockPxWidth * i,
              }
            : {
                width: scaffoldBlockPxWidth,
                left: scaffoldBlockPxWidth * i,
              };

        scaffoldElements.push(
          <div
            key={i}
            style={style}
            className={classnames(
              'rst__absoluteLineBlock',
              highlightLineClass,
              rowDirectionClass ?? ''
            )}
          />
        );
      }
    });

    const style =
      rowDirection === 'rtl'
        ? { right: scaffoldBlockPxWidth * scaffoldBlockCount }
        : { left: scaffoldBlockPxWidth * scaffoldBlockCount };

    return {
      elements: scaffoldElements,
      style: style,
    };
  }, [
    lowerSiblingCounts,
    listIndex,
    swapDepth,
    swapFrom,
    swapLength,
    rowDirection,
    scaffoldBlockPxWidth,
    treeIndex,
  ]);

  const calculatedRowHeight = useMemo(() => {
    if (typeof rowHeight === 'function') {
      return rowHeight(treeIndex, _node, _path);
    }
    return rowHeight;
  }, [rowHeight, treeIndex, _node, _path]);

  return connectDropTarget(
    <div
      {...otherProps}
      style={{ height: `${calculatedRowHeight}px` }}
      className={classnames('rst__node', rowDirectionClass ?? '', styles.node)}>
      {scaffold.elements}

      <div className="rst__nodeContent" style={scaffold.style}>
        {React.Children.map(children, (child: any) =>
          React.cloneElement(child, {
            isOver,
            canDrop,
            draggedNode,
          })
        )}
      </div>
    </div>
  );
}

export default TreeNodeComponent;
