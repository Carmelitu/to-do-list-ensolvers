// Vars
const form = document.querySelector('#form');
const tasksList = document.querySelector('#list');
var edit = false;
let DB;

// Principal Obj
var taskObj = {
    id: '',
    task: '',
    done: false
}

// Folders
var folders = [];

var folder = {
    name: '',
    listTasks: []
}

// DB starts with App
window.onload = () => {
    eventListeners();
    createDB();
}

// Event Listeners
function eventListeners(){
    // Carga tweet al enviar form
    form.addEventListener('submit', addTask);

    // Carga tweets cuando el documento está listo
    document.addEventListener('DOMContentLoaded', () => {
        refreshHTML();
    })
}

// --------- Functions ---------

// Adds task when submit
function addTask(e){
    e.preventDefault();

    task = document.querySelector('#todolist').value;

    if (task === ''){
        showAlert('Task cannot be empty', 'error');
        return;
    }

    if(edit) {
        // Edit starts
        taskObj.task = task;

        // Edit on IndexedDB
        const transaction = DB.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');

        objectStore.put(taskObj);

        transaction.oncomplete = () => {
            showAlert('Modified successfully', 'success');

            document.querySelector('#add-task').textContent = `Add a task:`;
            document.querySelector('#form-button').value = 'Add task';

            edit = false;
        }

        transaction.onerror = () => {
            showAlert('Oops! An error ocurred', 'error');
        }

    } else {
        // Generate unique ID
        taskObj = {
            id: Date.now(),
            task,
            done: false
        }
        
        // Uploading to IndexedDB
        const transaction = DB.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');

        objectStore.add(taskObj);

        transaction.oncomplete = () => {
            console.log('Task added');

            // Added OK to DB
            showAlert('Added successfully', 'success');
        }

        transaction.onerror = () => {
            showAlert('Oops! An error ocurred', 'error');
        }
        
    }

    refreshHTML();
    form.reset();
}

// Shows an error o success message
function showAlert(message, type){
    const alertMsg = document.createElement('p');
    alertMsg.textContent = message;
    alertMsg.classList.add(type);

    form.appendChild(alertMsg);

    setTimeout(() => {
        alertMsg.remove();
    }, 3000);
}

// Shows updated HTML
function refreshHTML(){
    cleanHTML();

    // Reads DB
    const objectStore = DB.transaction('tasks').objectStore('tasks');

    let total = objectStore.count();
    total.onsuccess = function() {
        total = total.result;
        console.log(total);
    }

    objectStore.openCursor().onsuccess = function (e) {

        const cursor = e.target.result
        
        if (cursor){

            var {id, task, done} = cursor.value

            // Delete Button
            const deleteBtn = document.createElement('a');
            deleteBtn.classList.add('delete-task');
            deleteBtn.innerText = 'X';
    
            deleteBtn.onclick = () => deleteTask(id);
    
            // Edit Button
            const editBtn = document.createElement('a'); 
            editBtn.classList.add('edit-task');
            editBtn.innerText = 'Edit';

            const eTask = cursor.value;
    
            editBtn.onclick = () => editTask(eTask);
    
            
            const check = document.createElement('a');

            const li = document.createElement('li');
            li.classList.add('pendiente');
            li.innerText = task;

            if (done === false) {
                check.classList.add('unchecked');
                check.classList.remove('checked');
                check.innerText ='...';
                li.classList.add('pendiente');
                li.classList.remove('tachar');
            } else {
                check.classList.remove('unchecked');
                check.classList.add('checked');
                check.innerText ='✓';
                li.classList.add('tachar');
                li.classList.remove('pendiente');
            }
    
            check.onclick = () => { if (done === false){
                check.classList.remove('unchecked');
                check.classList.add('checked');
                check.innerText ='✓';
                li.classList.add('tachar');
                li.classList.remove('pendiente');
                changeStatus(eTask);

            } else {
                check.classList.add('unchecked');
                check.classList.remove('checked');
                check.innerText ='...';
                li.classList.add('pendiente');
                li.classList.remove('tachar');
                changeStatus(eTask);
            }};              
    
            li.appendChild(check);
            li.appendChild(deleteBtn);
            li.appendChild(editBtn);
    
            tasksList.appendChild(li);

            // Next element

            cursor.continue();
        }
    }    
}

// Limpia HTML
function cleanHTML(){
    while(tasksList.firstChild){
        tasksList.removeChild(tasksList.firstChild);
    }
}

// Deletes task from DB
function deleteTask(id){
    const transaction = DB.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');

    objectStore.delete(id);

    transaction.oncomplete = () => {
        showAlert('Task deleted', 'success');
        refreshHTML();
    }

    transaction.onerror = () => {
        showAlert('Oops! An error ocurred', 'error');
    }
}

// Edits task on DB
function editTask(eTask){
    document.querySelector('#todolist').value = eTask.task;

    // Cambiar texto del botón
    document.querySelector('#form-button').value = 'Save Changes';
    document.querySelector('#add-task').textContent = `Modifying "${eTask.task}" task:`;
    
    edit = true;

    taskObj = {
        id: eTask.id,
        task: eTask.task,
        done: eTask.done
    }

    refreshHTML();
}

// Change task status
function changeStatus(eTask){
    const transaction = DB.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');

    if (eTask.done === false){
        eTask.done = true;
    } else {
        eTask.done = false;
    }
    
    objectStore.put(eTask);

    transaction.oncomplete = () => {
        if (eTask.done === true){
            showAlert('Good Job!', 'success');
        } else {
            showAlert('Task status changed', 'success');
        }
    }

    refreshHTML();
}

// Creates IndexedDB
function createDB(){
    const createDB = window.indexedDB.open('tasks', 1);

    // DB not created
    createDB.onerror = () => {
        console.log('Error loading DB...');
    }

    // DB created ok
    createDB.onsuccess = () => {
        console.log('DB created successfully');

        DB = createDB.result;

        refreshHTML();
    }

    // Define Schema
    createDB.onupgradeneeded = (e) => {
        const db = e.target.result;

        const objectStore = db.createObjectStore('tasks', {
            keyPath: 'id',
            autoincrement: true
        });

        // Define columns
        objectStore.createIndex('id', 'id', {unique: true} );
        objectStore.createIndex('task', 'task', {unique: false} );

    }
}