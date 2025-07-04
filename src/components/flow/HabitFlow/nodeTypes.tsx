import { ClickableHabitNode, TriggerNode, ConditionalNode } from '../../nodes'

// カスタムノードタイプの定義（静的に定義）
export const nodeTypes = {
  habit: ClickableHabitNode,
  trigger: TriggerNode,
  conditional: ConditionalNode,
}
