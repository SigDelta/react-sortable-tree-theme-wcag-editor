import React, { useState } from 'react'
import { SortableTree, TreeNodeId } from 'react-sortable-tree-wcag-editor'
import CustomTheme from '../index'

export default {
  title: 'StructureTree',
  component: SortableTree,
  parameters: {
    layout: 'centered',
  },
}

const data = [
  {
    title: 'Chicken',
    nodeId: 1,
    expanded: true,
    children: [{ title: 'Egg', nodeId: 5 }],
  },
  {
    title: 'Cow',
    nodeId: 2,
    expanded: true,
    children: [{ title: 'Milk', nodeId: 6 }],
  },
  {
    title: 'Sheep',
    nodeId: 3,
    expanded: true,
    children: [{ title: 'Wool', nodeId: 7 }],
  },
  {
    title: 'Pig',
    nodeId: 4,
    expanded: true,
    children: [{ title: 'Meet', nodeId: 8 }],
  },
  {
    title: 'Chicken 2',
    nodeId: 9,
    expanded: true,
    children: [{ title: 'Egg 2', nodeId: 13 }],
  },
  {
    title: 'Cow 2',
    nodeId: 10,
    expanded: true,
    children: [{ title: 'Milk 2', nodeId: 14 }],
  },
  {
    title: 'Sheep 2',
    nodeId: 11,
    expanded: true,
    children: [{ title: 'Wool 2', nodeId: 15 }],
  },
  {
    title: 'Pig 2',
    nodeId: 12,
    expanded: true,
    children: [{ title: 'Meet 2', nodeId: 16 }],
  },
]

const Template = () => {
  const [treeData, setTreeData] = useState(data)
  const [selectedNodes, setSelectedNodes] = useState<TreeNodeId[]>([])
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ height: 800, width: 400 }}>
        <SortableTree
          theme={CustomTheme}
          treeData={treeData}
          onChange={setTreeData}
          setSelectedNodes={setSelectedNodes}
          selectedNodes={selectedNodes}
        />
      </div>
    </div>
  )
}

export const Default = Template.bind({})
