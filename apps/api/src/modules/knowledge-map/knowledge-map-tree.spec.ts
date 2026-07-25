import { buildKnowledgeTree } from './knowledge-map-tree';

describe('buildKnowledgeTree', () => {
  it('собирает дерево независимо от порядка плоского списка', () => {
    const nodes = [
      { id: 'skill', parentId: 'subtopic', name: 'Навык' },
      { id: 'section', parentId: null, name: 'Раздел' },
      { id: 'subtopic', parentId: 'topic', name: 'Подтема' },
      { id: 'topic', parentId: 'section', name: 'Тема' },
    ];

    expect(buildKnowledgeTree(nodes)).toEqual([
      {
        ...nodes[1],
        children: [
          {
            ...nodes[3],
            children: [
              {
                ...nodes[2],
                children: [{ ...nodes[0], children: [] }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('оставляет несколько корневых разделов отдельными ветками', () => {
    const nodes = [
      { id: 'first', parentId: null },
      { id: 'second', parentId: null },
    ];

    expect(buildKnowledgeTree(nodes)).toEqual([
      { ...nodes[0], children: [] },
      { ...nodes[1], children: [] },
    ]);
  });
});
