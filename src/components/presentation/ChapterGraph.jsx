import { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { X, BookOpen, FileText, RotateCcw, Play, PenTool, Calculator } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const NODE_COLORS = {
  topic: { bg: '#10b981', border: '#059669' },
  concept: { bg: '#f59e0b', border: '#d97706' },
  formula: { bg: '#ef4444', border: '#dc2626' },
};

const ChapterGraph = ({ data, chapterCode, subjectInfo }) => {
  const cyRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('ChapterGraph 받은 데이터:', {
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      sample: Array.isArray(data) && data.length > 0 ? data[0] : null,
      chapterCode,
    });
  }, [data, chapterCode]);

useEffect(() => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ 유효하지 않은 데이터');
    return;
  }

  const nodes = [];
  const edges = [];
  const nodeSet = new Set();

  console.log(`🔄 ${data.length}개의 Topic 처리 시작...`);
  console.log('전체 데이터:', JSON.stringify(data, null, 2)); // ✅ 전체 데이터 출력

  data.forEach((item, idx) => {
    const topicId = `T-${item.uid}`;
    
    nodes.push({
      data: {
        id: topicId,
        label: item.title || 'Unknown Topic',
        type: 'topic',
        description: item.description || '',
      },
    });

    console.log(`\nTopic ${idx + 1}: ${item.title}`);
    console.log('  concepts:', item.concepts);

    if (item.concepts && Array.isArray(item.concepts)) {
      item.concepts.forEach((concept, cIdx) => {
        const conceptId = `K-${concept.uid}`;
        
        console.log(`\n  Concept ${cIdx + 1}: ${concept.name}`);
        console.log('    concept 전체:', concept);
        console.log('    concept.formulas:', concept.formulas);
        console.log('    typeof formulas:', typeof concept.formulas);
        console.log('    isArray formulas:', Array.isArray(concept.formulas));
        
        // ✅ formulas 안전 추출
        let formulaList = [];
        
        if (concept.formulas) {
          if (Array.isArray(concept.formulas)) {
            formulaList = concept.formulas.filter(f => f && typeof f === 'string' && f.trim() !== '');
          } else if (typeof concept.formulas === 'string') {
            // 문자열인 경우
            formulaList = [concept.formulas];
          }
        }

        console.log('    추출된 formulaList:', formulaList);

        if (!nodeSet.has(conceptId)) {
          const conceptNodeData = {
            id: conceptId,
            label: concept.name || 'Unknown Concept',
            type: 'concept',
            parentTopic: topicId,
            description: concept.summary || '',
            definition: concept.definition || '',
            formulas: formulaList, // ✅ 여기에 저장
          };
          
          console.log('    생성할 Concept 노드:', conceptNodeData);
          
          nodes.push({ data: conceptNodeData });
          nodeSet.add(conceptId);

          edges.push({
            data: {
              id: `${topicId}-${conceptId}`,
              source: topicId,
              target: conceptId,
            },
          });
        }

        // Formula 노드 생성
        if (formulaList.length > 0) {
          console.log(`    ${formulaList.length}개의 Formula 노드 생성 시작...`);
          
          formulaList.forEach((formula, fIdx) => {
            const formulaId = `F-${concept.uid}-${fIdx}`;
            
            console.log(`      Formula ${fIdx + 1}:`, formula.substring(0, 50) + '...');
            
            if (!nodeSet.has(formulaId)) {
              nodes.push({
                data: {
                  id: formulaId,
                  label: 'ƒ',
                  type: 'formula',
                  latex: formula,
                  parentConcept: conceptId,
                },
              });
              nodeSet.add(formulaId);

              edges.push({
                data: {
                  id: `${conceptId}-${formulaId}`,
                  source: conceptId,
                  target: formulaId,
                },
              });
            }
          });
        } else {
          console.warn(`    ⚠️ ${concept.name}에 Formula가 없습니다!`);
        }
      });
    }
  });

  const formulaCount = nodes.filter(n => n.data.type === 'formula').length;
  
  console.log(`\n✅ 노드 생성 완료:`, {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    byType: {
      topic: nodes.filter(n => n.data.type === 'topic').length,
      concept: nodes.filter(n => n.data.type === 'concept').length,
      formula: formulaCount,
    },
  });

  if (formulaCount === 0) {
    console.error('❌ Formula 노드가 하나도 생성되지 않았습니다!');
    console.error('첫 번째 Concept 확인:', data[0]?.concepts?.[0]);
  }

  setElements([...nodes, ...edges]);

}, [data, chapterCode]);
  useEffect(() => {
    if (!cyRef.current || elements.length === 0) return;

    const cy = cyRef.current;
    const timer = setTimeout(() => {
      try {
        cy.layout({
          name: 'cose',
          animate: true,
          animationDuration: 800,
          idealEdgeLength: 80,
          nodeOverlap: 30,
          fit: true,
          padding: 40,
          nodeRepulsion: 350000,
          gravity: 100,
        }).run();

        setTimeout(() => {
          cy.fit(40);
          cy.center();
        }, 900);
      } catch (error) {
        console.error('❌ 레이아웃 에러:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [elements]);

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-family': 'Pretendard, sans-serif',
        'font-weight': 700,
        'text-wrap': 'wrap',
        'text-max-width': '100px',
        'overlay-opacity': 0,
        'color': '#ffffff',
      },
    },
    {
      selector: 'node[type="topic"]',
      style: {
        'width': 90,
        'height': 90,
        'background-color': NODE_COLORS.topic.bg,
        'border-width': 4,
        'border-color': NODE_COLORS.topic.border,
        'font-size': '14px',
        'shape': 'ellipse',
      },
    },
    {
      selector: 'node[type="concept"]',
      style: {
        'width': 70,
        'height': 70,
        'background-color': NODE_COLORS.concept.bg,
        'border-width': 3,
        'border-color': NODE_COLORS.concept.border,
        'font-size': '12px',
        'shape': 'cut-rectangle',
      },
    },
    {
      selector: 'node[type="formula"]',
      style: {
        'width': 45,
        'height': 45,
        'background-color': NODE_COLORS.formula.bg,
        'border-width': 2,
        'border-color': NODE_COLORS.formula.border,
        'font-size': '20px',
        'font-family': 'serif',
        'shape': 'ellipse',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#64748b',
        'target-arrow-color': '#64748b',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'opacity': 0.4,
      },
    },
    {
      selector: '.highlighted',
      style: {
        'border-width': 5,
        'border-color': '#fbbf24',
        'z-index': 999,
      },
    },
  ];

  const handleNodeClick = (node) => {
    const nodeData = node.data();
    console.log('노드 클릭:', nodeData);
    
    if (nodeData.type === 'topic') {
      const cy = cyRef.current;
      const connectedConcepts = cy.nodes(`[parentTopic="${nodeData.id}"]`);
      const allFormulas = [];
      
      connectedConcepts.forEach(conceptNode => {
        const conceptFormulas = conceptNode.data('formulas') || [];
        allFormulas.push(...conceptFormulas);
      });

      setSelectedNode({
        name: nodeData.label,
        type: 'topic',
        description: nodeData.description || '',
        definition: '',
        formulas: allFormulas,
      });
      setIsModalOpen(true);
    } 
    else if (nodeData.type === 'concept') {
      // ✅ Concept 클릭 시 저장된 formulas 사용
      const formulas = nodeData.formulas || [];
      console.log('Concept 하위 수식:', formulas);

      setSelectedNode({
        name: nodeData.label,
        type: 'concept',
        description: nodeData.description || '',
        definition: nodeData.definition || '',
        formulas: formulas,
      });
      setIsModalOpen(true);
    }
    else if (nodeData.type === 'formula') {
      setSelectedNode({
        name: '수식',
        type: 'formula',
        description: '',
        definition: '',
        formulas: [nodeData.latex],
      });
      setIsModalOpen(true);
    }
    
    if (cyRef.current) {
      cyRef.current.elements().removeClass('highlighted');
      node.addClass('highlighted');
    }
  };

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit(40);
      cyRef.current.zoom(1);
      cyRef.current.center();
    }
  };

  if (!data || !Array.isArray(data)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <p className="text-red-400">데이터 오류: 배열이 아닙니다</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <p className="text-yellow-400">해당 챕터에 데이터가 없습니다.</p>
      </div>
    );
  }

  if (elements.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <p className="text-white">노드 생성 중...</p>
      </div>
    );
  }

  const nodesByType = {
    topic: elements.filter(e => e.data?.type === 'topic').length,
    concept: elements.filter(e => e.data?.type === 'concept').length,
    formula: elements.filter(e => e.data?.type === 'formula').length,
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* 범례 */}
      <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
        <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          NODE TYPE
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: NODE_COLORS.topic.bg, border: `2px solid ${NODE_COLORS.topic.border}` }} />
            <span className="text-xs font-semibold text-slate-700">Topic ({nodesByType.topic})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: NODE_COLORS.concept.bg, border: `2px solid ${NODE_COLORS.concept.border}` }} />
            <span className="text-xs font-semibold text-slate-700">Concept ({nodesByType.concept})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: NODE_COLORS.formula.bg, border: `2px solid ${NODE_COLORS.formula.border}` }} />
            <span className="text-xs font-semibold text-slate-700">Formula ({nodesByType.formula})</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
          <div>💡 마우스 휠로 줌 조절</div>
          <div>🖱️ 노드 클릭 시 상세정보</div>
        </div>
      </div>

      {/* 초기화 버튼 */}
      <div className="absolute bottom-6 right-6 z-10">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white transition-all"
        >
          <RotateCcw size={18} />
          <span className="text-sm font-bold">초기화</span>
        </button>
      </div>

      {/* Cytoscape */}
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        style={{ width: '100%', height: '100%' }}
        cy={(cy) => {
          cyRef.current = cy;
          cy.on('tap', 'node', (evt) => handleNodeClick(evt.target));
          cy.userZoomingEnabled(true);
          cy.userPanningEnabled(true);
        }}
        wheelSensitivity={0.5}
        minZoom={0.3}
        maxZoom={3}
      />

      {/* 모달 */}
      {isModalOpen && selectedNode && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-6 py-5 border-b flex justify-between items-center ${
              selectedNode.type === 'formula' ? 'bg-gradient-to-r from-red-50 to-rose-50' :
              selectedNode.type === 'topic' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
              'bg-gradient-to-r from-orange-50 to-amber-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedNode.type === 'formula' ? 'bg-red-500' :
                  selectedNode.type === 'topic' ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {selectedNode.type === 'formula' ? <Calculator size={20} className="text-white" /> : <BookOpen size={20} className="text-white" />}
                </div>
                <div>
                  <div className={`text-xs font-bold uppercase ${
                    selectedNode.type === 'formula' ? 'text-red-600' :
                    selectedNode.type === 'topic' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {selectedNode.type === 'topic' ? 'Topic' : selectedNode.type === 'concept' ? 'Concept' : 'Formula'}
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">{selectedNode.name}</h2>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedNode.description && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
                    <FileText size={16} /> 설명
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedNode.description}</p>
                </div>
              )}

              {selectedNode.definition && (
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="text-xs font-bold text-blue-600 uppercase mb-2">정의</div>
                  <p className="text-gray-800 font-medium">{selectedNode.definition}</p>
                </div>
              )}

              {/* ✅ 하위 수식 표시 */}
              {selectedNode.formulas && selectedNode.formulas.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-bold text-gray-500 mb-3">
                    {selectedNode.type === 'formula' ? '수식' : `하위 수식 (${selectedNode.formulas.length}개)`}
                  </div>
                  <div className="space-y-3">
                    {selectedNode.formulas.map((formula, idx) => (
                      <div key={idx} className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        {selectedNode.formulas.length > 1 && (
                          <div className="text-xs text-amber-700 font-bold mb-2">Formula {idx + 1}</div>
                        )}
                        <div className="flex justify-center text-2xl overflow-x-auto">
                          <BlockMath math={formula} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.type !== 'formula' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold">
                    <Play size={20} /> 강의 보기
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold">
                    <PenTool size={20} /> 문제 풀기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterGraph;