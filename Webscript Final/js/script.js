//initial data load from localstorage or default setup
let boardData = JSON.parse(localStorage.getItem('gridBoardData')) || {
    columns: [
        { id: 'col-1', title: 'to do', items: [] },
        { id: 'col-2', title: 'in progress', items: [] },
        { id: 'col-3', title: 'done', items: [] }
    ]
};

//state management
let currentType = 'note';
let editingContext = null; 
let draggedColumnIdx = null; 

//main render function
function renderBoard() {
    const container = document.getElementById('column-container');
    container.innerHTML = '';
    const search = document.getElementById('search-input').value.toLowerCase();

    boardData.columns.forEach((col, colIdx) => {
        const colEl = document.createElement('div');
        colEl.className = 'column';
        colEl.dataset.index = colIdx;
        colEl.dataset.colId = col.id;

        colEl.innerHTML = `
            <div class="column-header" draggable="true">
                <h2>${col.title}</h2>
                <button onclick="deleteColumn('${col.id}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">×</button>
            </div>
            <div class="card-list" data-col-id="${col.id}"></div>
        `;

        const headerEl = colEl.querySelector('.column-header');
        const listEl = colEl.querySelector('.card-list');

        //column drag events (triggered by header only)
        headerEl.addEventListener('dragstart', (e) => {
            draggedColumnIdx = colIdx;
            e.dataTransfer.setData('column-index', colIdx);
            //styling the parent column while dragging
            setTimeout(() => colEl.classList.add('dragging-column'), 0);
        });

        headerEl.addEventListener('dragend', () => {
            colEl.classList.remove('dragging-column');
            draggedColumnIdx = null;
            renderBoard();
        });

        //handle pushing logic
        colEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            //only swap if we are currently dragging a column, not a card
            if (draggedColumnIdx !== null && draggedColumnIdx !== colIdx) {
                handleColumnSwap(draggedColumnIdx, colIdx);
            }
        });

        //render items
        col.items.forEach((item, idx) => {
            const matchesSearch = item.title.toLowerCase().includes(search) || 
                                 (item.content && item.content.toLowerCase().includes(search));
            if (matchesSearch) {
                listEl.appendChild(createCard(item, col.id, idx));
            }
        });

        //card drop listeners
        listEl.addEventListener('dragover', e => e.preventDefault());
        listEl.addEventListener('dragenter', () => listEl.classList.add('drag-over'));
        listEl.addEventListener('dragleave', () => listEl.classList.remove('drag-over'));
        listEl.addEventListener('drop', e => {
            //if we are dragging a column, don't trigger card drop logic
            if (draggedColumnIdx !== null) return;
            
            e.stopPropagation(); 
            handleDrop(e, col.id);
        });

        container.appendChild(colEl);
    });

    localStorage.setItem('gridBoardData', JSON.stringify(boardData));
    updateSelectors();
    document.getElementById('board-stats').textContent = `${boardData.columns.reduce((acc, col) => acc + col.items.length, 0)} items total`;
}

function handleColumnSwap(sourceIdx, targetIdx) {
    const [movedCol] = boardData.columns.splice(sourceIdx, 1);
    boardData.columns.splice(targetIdx, 0, movedCol);
    draggedColumnIdx = targetIdx; 
    renderBoard();
}

function createCard(item, colId, idx) {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.draggable = true;
    
    card.addEventListener('dragstart', (e) => {
        draggedColumnIdx = null; 
        e.dataTransfer.setData('application/json', JSON.stringify({ colId, idx }));
        setTimeout(() => card.classList.add('dragging-card'), 0);
    });

    card.addEventListener('dragend', () => card.classList.remove('dragging-card'));

    const accentColor = item.color || '#64ffda';
    let contentHtml = `<p>${item.content || ''}</p>`;
    
    if (item.type === 'image') contentHtml = `<img src="${item.content}" alt="card-image">`;
    if (item.type === 'todo') {
        const tasks = (item.tasks || []).map((t, tIdx) => `
            <div class="todo-item">
                <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo('${colId}', ${idx}, ${tIdx})">
                <span style="${t.done ? 'text-decoration: line-through; opacity: 0.5' : ''}">${t.text}</span>
                <button class="delete-todo-btn" onclick="removeTodoTask('${colId}', ${idx}, ${tIdx})">×</button>
            </div>
        `).join('');
        contentHtml = `
            <div class="todo-area">${tasks}</div>
            <div class="add-todo-row">
                <input type="text" placeholder="add task..." id="input-${colId}-${idx}">
                <button class="primary-btn" style="padding: 2px 10px;" onclick="addTodoTask('${colId}', ${idx})">+</button>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="card-accent-bar" style="background: ${accentColor}"></div>
        <span class="type-tag">${item.type}</span>
        <h3>${item.title}</h3>
        ${contentHtml}
        <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button onclick="openEditModal('${colId}', ${idx})" style="color:var(--accent); border:none; background:none; font-size:0.7rem; cursor:pointer; padding:0;">edit</button>
            <button onclick="deleteItem('${colId}', ${idx})" style="color:#ff4d4d; border:none; background:none; font-size:0.7rem; cursor:pointer; padding:0;">delete</button>
        </div>
    `;
    return card;
}

function handleDrop(e, targetColId) {
    e.preventDefault();
    const listEl = e.currentTarget;
    listEl.classList.remove('drag-over');

    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    try {
        const data = JSON.parse(rawData);
        const sourceCol = boardData.columns.find(c => c.id === data.colId);
        const targetCol = boardData.columns.find(c => c.id === targetColId);
        
        //safety check for index
        if (sourceCol && targetCol && sourceCol.items[data.idx]) {
            const [movedItem] = sourceCol.items.splice(data.idx, 1);
            targetCol.items.push(movedItem);
            renderBoard();
        }
    } catch (err) {
        //likely a non-card drop (like text or a column header)
    }
}

//ui and form handlers

function openEditModal(colId, idx) {
    const col = boardData.columns.find(c => c.id === colId);
    const item = col.items[idx];
    editingContext = { colId, idx };

    document.getElementById('title').value = item.title;
    document.getElementById('header-color').value = item.color || '#64ffda';
    document.getElementById('column-select').value = colId;
    
    currentType = item.type;
    const typeBtn = document.querySelector(`.type-btn[data-type="${item.type}"]`);
    if (typeBtn) typeBtn.click();

    const contentField = document.getElementById('content');
    if (item.type === 'todo') {
        contentField.value = item.tasks.length > 0 ? item.tasks[0].text : '';
    } else {
        contentField.value = item.content || '';
    }

    document.querySelector('.modal h2').textContent = "edit item";
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function removeTodoTask(colId, itemIdx, todoIdx) {
    const col = boardData.columns.find(c => c.id === colId);
    col.items[itemIdx].tasks.splice(todoIdx, 1);
    renderBoard();
}

function addTodoTask(colId, itemIdx) {
    const input = document.getElementById(`input-${colId}-${itemIdx}`);
    if (!input.value) return;
    const col = boardData.columns.find(c => c.id === colId);
    col.items[itemIdx].tasks.push({ text: input.value, done: false });
    renderBoard();
}

function toggleTodo(colId, itemIdx, todoIdx) {
    const col = boardData.columns.find(c => c.id === colId);
    col.items[itemIdx].tasks[todoIdx].done = !col.items[itemIdx].tasks[todoIdx].done;
    renderBoard();
}

function updateSelectors() {
    const select = document.getElementById('column-select');
    if(select) select.innerHTML = boardData.columns.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
}

document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
        const area = document.getElementById('dynamic-content-area');
        if (currentType === 'image') area.innerHTML = `<label>image url</label><input type="url" id="content" placeholder="link to image...">`;
        else if (currentType === 'todo') area.innerHTML = `<label>first task (new)</label><input type="text" id="content" placeholder="task name...">`;
        else area.innerHTML = `<label>description</label><textarea id="content" placeholder="details..."></textarea>`;
    };
});

document.getElementById('idea-form').onsubmit = (e) => {
    e.preventDefault();
    const colId = document.getElementById('column-select').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const color = document.getElementById('header-color').value;
    
    const itemData = { title, type: currentType, color };
    
    if (editingContext) {
        const oldCol = boardData.columns.find(c => c.id === editingContext.colId);
        const [existingItem] = oldCol.items.splice(editingContext.idx, 1);
        
        if (currentType === 'todo') {
             itemData.tasks = existingItem.tasks || [];
             if (content && (!existingItem.tasks || existingItem.tasks.length === 0)) {
                itemData.tasks = [{ text: content, done: false }];
             }
        } else {
            itemData.content = content;
        }
        
        boardData.columns.find(c => c.id === colId).items.push(itemData);
        editingContext = null;
    } else {
        if (currentType === 'todo') itemData.tasks = [{ text: content, done: false }];
        else itemData.content = content;
        boardData.columns.find(c => c.id === colId).items.push(itemData);
    }

    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('idea-form').reset();
    renderBoard();
};

document.getElementById('add-column-btn').onclick = () => {
    const name = prompt("enter the name of the column:");
    if (name) {
        boardData.columns.push({ id: 'col-' + Date.now(), title: name, items: [] });
        renderBoard();
    }
};

document.getElementById('open-modal-btn').onclick = () => {
    editingContext = null;
    document.querySelector('.modal h2').textContent = "new item";
    document.getElementById('idea-form').reset();
    document.getElementById('modal-overlay').classList.remove('hidden');
};

document.getElementById('close-modal').onclick = () => document.getElementById('modal-overlay').classList.add('hidden');
document.getElementById('search-input').oninput = renderBoard;

window.deleteItem = (colId, idx) => {
    boardData.columns.find(c => c.id === colId).items.splice(idx, 1);
    renderBoard();
};

window.deleteColumn = (id) => {
    if (confirm("are you sure you want to delete this column?")) {
        boardData.columns = boardData.columns.filter(c => c.id !== id);
        renderBoard();
    }
};

renderBoard();