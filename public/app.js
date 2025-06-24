document.addEventListener('DOMContentLoaded', () => {
    // Инициализация WebSocket
    const socket = io();
    
    // Элементы интерфейса
    const diagramArea = document.getElementById('diagram-area');
    const generateBtn = document.getElementById('generate-btn');
    const aiAssistBtn = document.getElementById('ai-assist-btn');
    const userInput = document.getElementById('user-input');
    const codePanel = document.getElementById('generated-code');
    
    // Инициализация Cytoscape
    let cy = cytoscape({
        container: diagramArea,
        style: [
            {
                selector: 'node[type="person"]',
                style: {
                    'shape': 'ellipse',
                    'background-color': '#3498db',
                    'label': 'data(label)',
                    'width': 120,
                    'height': 60
                }
            },
            {
                selector: 'node[type="server"]',
                style: {
                    'shape': 'round-rectangle',
                    'background-color': '#e74c3c',
                    'label': 'data(label)',
                    'width': 150,
                    'height': 80
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#7f8c8d',
                    'target-arrow-color': '#7f8c8d',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': '14px',
                    'text-background-color': '#ecf0f1',
                    'text-background-opacity': 0.8,
                    'text-background-padding': '4px'
                }
            }
        ],
        layout: {
            name: 'cose',
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 50,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0
        }
    });
    
    // Обработчики событий
    generateBtn.addEventListener('click', () => {
        const requirements = userInput.value.trim();
        if (requirements) {
            socket.emit('generate', requirements);
        } else {
            alert('Введите требования!');
        }
    });
    
    aiAssistBtn.addEventListener('click', () => {
        const selected = cy.$(':selected');
        if (selected.length > 0) {
            const element = selected[0];
            const editData = {
                elementId: element.id(),
                currentLabel: element.data('label'),
                diagramData: cy.json()
            };
            socket.emit('ai-edit', editData);
        } else {
            alert('Выберите элемент для редактирования');
        }
    });
    
    // Обработка сообщений от сервера
    socket.on('diagram', (data) => {
        // Очистка предыдущей диаграммы
        cy.elements().remove();
        
        // Добавление новых элементов
        cy.add(data.elements);
        cy.layout({ name: 'cose' }).run();
        
        // Обновление кода
        codePanel.textContent = data.code;
        
        // Активация ИИ-ассистента
        aiAssistBtn.disabled = false;
    });
    
    socket.on('diagram-update', (updatedData) => {
        // Применение обновлений от ИИ
        cy.json(updatedData.diagramData);
        cy.layout({ name: 'cose' }).run();
        codePanel.textContent = updatedData.code;
    });
    
    // Выбор элементов
    cy.on('tap', 'node, edge', (evt) => {
        const target = evt.target;
        cy.elements().unselect();
        target.select();
    });
});