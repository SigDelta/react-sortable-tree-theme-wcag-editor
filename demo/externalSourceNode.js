import React from 'react';
import {  DragSource } from 'react-dnd'

export const externalNodeType = 'yourNodeType'
const externalNodeSpec = {
  // This needs to return an object with a property `node` in it.
  beginDrag: (componentProps) => ({ node: { ...componentProps.node } }),
}

const externalNodeCollect = (connect /* , monitor */) => ({
  connectDragSource: connect.dragSource(),
  // isDragging: monitor.isDragging(),
  // didDrop: monitor.didDrop(),
})

const externalNodeBaseComponent = (props) =>{
  const { connectDragSource, node } = props

    return connectDragSource(
      <div
        style={{
          display: 'inline-block',
          padding: '3px 5px',
          background: 'blue',
          color: 'white',
        }}>
        {node.title}
      </div>,
      { dropEffect: 'copy' }
    )

}


const ExternalNode = DragSource(
  externalNodeType,
  externalNodeSpec,
  externalNodeCollect
)(externalNodeBaseComponent)

export default ExternalNode
