export type KnowledgeTreeNode<T> = T & {
  children: Array<KnowledgeTreeNode<T>>;
};

export const buildKnowledgeTree = <
  T extends {
    id: string;
    parentId: string | null;
  },
>(
  nodes: T[],
): Array<KnowledgeTreeNode<T>> => {
  const childrenByParent = new Map<string | null, T[]>();

  for (const node of nodes) {
    const siblings = childrenByParent.get(node.parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(node.parentId, siblings);
  }

  const buildChildren = (
    parentId: string | null,
  ): Array<KnowledgeTreeNode<T>> =>
    (childrenByParent.get(parentId) ?? []).map((node) => ({
      ...node,
      children: buildChildren(node.id),
    }));

  return buildChildren(null);
};
