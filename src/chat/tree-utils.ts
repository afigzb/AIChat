import type { 
  FlatMessage, 
  MessageNode, 
  ConversationTree, 
  BranchNavigation, 
  RegenerateContext 
} from './types'

// ===== 工具函数 =====

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// 创建扁平消息
export function createFlatMessage(
  content: string, 
  role: FlatMessage['role'], 
  parentId: string | null,
  reasoning_content?: string
): FlatMessage {
  return {
    id: generateId(),
    content,
    role,
    timestamp: new Date(),
    parentId,
    reasoning_content
  }
}

// ===== 树构建与管理 =====

// 从扁平结构构建树
export function buildTreeFromFlat(flatMessages: Map<string, FlatMessage>): MessageNode[] {
  const nodes = new Map<string, MessageNode>()
  const roots: MessageNode[] = []

  // 第一遍：创建所有节点
  for (const [id, message] of flatMessages) {
    nodes.set(id, {
      id: message.id,
      content: message.content,
      role: message.role,
      timestamp: message.timestamp,
      reasoning_content: message.reasoning_content,
      parentId: message.parentId,
      children: [],
      depth: 0 // 稍后计算
    })
  }

  // 第二遍：建立父子关系并计算深度
  for (const [id, node] of nodes) {
    if (node.parentId === null) {
      // 根节点
      node.depth = 0
      roots.push(node)
    } else {
      // 子节点
      const parent = nodes.get(node.parentId)
      if (parent) {
        parent.children.push(node)
        node.depth = parent.depth + 1
      }
    }
  }

  // 对每个节点的子节点按时间排序
  for (const node of nodes.values()) {
    node.children.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  return roots.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

// 从根节点构建节点映射（避免重复遍历）
export function buildNodeMap(roots: MessageNode[]): Map<string, MessageNode> {
  const nodeMap = new Map<string, MessageNode>()
  
  function addToMap(node: MessageNode) {
    nodeMap.set(node.id, node)
    node.children.forEach(addToMap)
  }
  
  roots.forEach(addToMap)
  return nodeMap
}

// 在树中查找节点（使用预构建的节点映射）
export function findNode(nodeId: string, nodeMapOrRoots: Map<string, MessageNode> | MessageNode[]): MessageNode | null {
  if (nodeMapOrRoots instanceof Map) {
    return nodeMapOrRoots.get(nodeId) || null
  } else {
    // 如果传入的是roots，临时构建映射
    const nodeMap = buildNodeMap(nodeMapOrRoots)
    return nodeMap.get(nodeId) || null
  }
}

// ===== 路径管理 =====

// 获取从根到指定节点的路径（利用扁平存储直接追溯）
export function getPathToNode(nodeId: string, flatMessages: Map<string, FlatMessage>): string[] {
  const path: string[] = []
  let currentId: string | null = nodeId

  // 从目标节点向上追溯到根节点
  while (currentId) {
    const message = flatMessages.get(currentId)
    if (!message) break
    
    path.unshift(currentId) // 插入到开头，构建正向路径
    currentId = message.parentId
  }

  return path
}

// 根据激活路径获取要渲染的节点序列
export function getActiveNodesFromPath(activePath: string[], roots: MessageNode[]): MessageNode[] {
  if (activePath.length === 0) return []
  
  // 构建节点映射，避免重复搜索
  const nodeMap = buildNodeMap(roots)
  
  // 直接从映射中获取节点，过滤掉不存在的
  return activePath
    .map(nodeId => nodeMap.get(nodeId))
    .filter((node): node is MessageNode => node !== undefined)
}

// ===== 分支导航 =====

// 获取分支导航信息
export function getBranchNavigation(nodeId: string, activePath: string[], roots: MessageNode[]): BranchNavigation {
  const nodeMap = buildNodeMap(roots)
  const node = nodeMap.get(nodeId)
  
  if (!node) {
    return { currentIndex: 0, totalBranches: 1, canNavigateLeft: false, canNavigateRight: false }
  }

  // 如果是根节点，检查根节点列表
  if (node.parentId === null) {
    const currentIndex = roots.findIndex(root => root.id === nodeId)
    return {
      currentIndex,
      totalBranches: roots.length,
      canNavigateLeft: currentIndex > 0,
      canNavigateRight: currentIndex < roots.length - 1
    }
  }

  // 查找父节点
  const parent = nodeMap.get(node.parentId)
  if (!parent) {
    return { currentIndex: 0, totalBranches: 1, canNavigateLeft: false, canNavigateRight: false }
  }

  const currentIndex = parent.children.findIndex(child => child.id === nodeId)
  return {
    currentIndex,
    totalBranches: parent.children.length,
    canNavigateLeft: currentIndex > 0,
    canNavigateRight: currentIndex < parent.children.length - 1
  }
}

// 切换分支
export function navigateBranch(
  nodeId: string, 
  direction: 'left' | 'right', 
  activePath: string[], 
  roots: MessageNode[]
): string[] | null {
  const nodeMap = buildNodeMap(roots)
  const node = nodeMap.get(nodeId)
  
  if (!node) return null

  const navigation = getBranchNavigation(nodeId, activePath, roots)
  
  let newIndex: number
  if (direction === 'left' && navigation.canNavigateLeft) {
    newIndex = navigation.currentIndex - 1
  } else if (direction === 'right' && navigation.canNavigateRight) {
    newIndex = navigation.currentIndex + 1
  } else {
    return null // 无法导航
  }

  // 获取目标兄弟节点
  let siblings: MessageNode[]
  if (node.parentId === null) {
    siblings = roots
  } else {
    const parent = nodeMap.get(node.parentId)
    if (!parent) return null
    siblings = parent.children
  }

  const targetSibling = siblings[newIndex]
  if (!targetSibling) return null

  // 获取当前节点在激活路径中的位置
  const nodeIndex = activePath.findIndex(id => id === nodeId)
  if (nodeIndex === -1) return null

  // 正确的分支切换逻辑：
  // 1. 保留到切换节点之前的路径
  // 2. 切换到目标兄弟节点
  // 3. 在新分支中找到最深的可用路径（利用现有的树结构）
  const pathBeforeNode = activePath.slice(0, nodeIndex)
  const newBasePath = [...pathBeforeNode, targetSibling.id]
  
  // 在目标分支中找到最深的路径
  const deepestPath = findDeepestPathInBranch(targetSibling)
  
  return [...newBasePath, ...deepestPath]
}

/**
 * 在给定分支中找到最深的路径
 * 策略：沿着每层最新的子节点向下走，直到叶子节点
 * 这样能更好地反映用户的最新对话状态
 */
function findDeepestPathInBranch(branchRoot: MessageNode): string[] {
  const deepPath: string[] = []
  let currentNode = branchRoot
  
  // 沿着每层最新的子节点向下走（子节点已按时间排序）
  while (currentNode.children.length > 0) {
    // 选择最新的子节点（时间戳最大的）
    const latestChild = currentNode.children[currentNode.children.length - 1]
    deepPath.push(latestChild.id)
    currentNode = latestChild
  }
  
  return deepPath
}

// ===== 对话历史构建 =====

// 获取到指定节点的对话历史
export function getConversationHistory(nodeId: string, flatMessages: Map<string, FlatMessage>): FlatMessage[] {
  const history: FlatMessage[] = []
  let currentId: string | null = nodeId

  // 从目标节点向上追溯到根节点
  while (currentId) {
    const message = flatMessages.get(currentId)
    if (!message) break
    
    history.unshift(message) // 插入到开头，保持时间顺序
    currentId = message.parentId
  }

  return history
}

// ===== 重新生成支持 =====

// 获取重新生成的上下文
export function getRegenerateContext(nodeId: string, flatMessages: Map<string, FlatMessage>): RegenerateContext | null {
  const targetMessage = flatMessages.get(nodeId)
  if (!targetMessage) return null

  // 对于AI消息，重新生成意味着要替换这条消息
  // 对于用户消息，重新生成意味着要基于这条消息生成新的AI回复
  const parentNodeId = targetMessage.role === 'assistant' 
    ? targetMessage.parentId || '' 
    : nodeId

  // 获取到父节点为止的对话历史（已优化：直接使用扁平结构追溯）
  const conversationHistory = parentNodeId 
    ? getConversationHistory(parentNodeId, flatMessages)
    : []

  return {
    targetNodeId: nodeId,
    parentNodeId,
    conversationHistory
  }
}

// ===== 树操作 =====

// 添加新消息到树中
export function addMessageToTree(
  flatMessages: Map<string, FlatMessage>,
  activePath: string[],
  newMessage: FlatMessage
): { newFlatMessages: Map<string, FlatMessage>, newActivePath: string[] } {
  // 复制现有的扁平消息映射
  const newFlatMessages = new Map(flatMessages)
  newFlatMessages.set(newMessage.id, newMessage)

  // 更新激活路径
  const newActivePath = [...activePath, newMessage.id]

  return { newFlatMessages, newActivePath }
}

// 创建初始对话树
export function createInitialConversationTree(welcomeMessage?: string): ConversationTree {
  const flatMessages = new Map<string, FlatMessage>()
  
  if (welcomeMessage) {
    const welcomeMsg = createFlatMessage(welcomeMessage, 'assistant', null)
    flatMessages.set(welcomeMsg.id, welcomeMsg)
    
    return {
      flatMessages,
      rootNodes: buildTreeFromFlat(flatMessages),
      activePath: [welcomeMsg.id]
    }
  }

  return {
    flatMessages,
    rootNodes: [],
    activePath: []
  }
} 