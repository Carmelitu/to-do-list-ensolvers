// Vars
const form = document.querySelector('#form');
const tasksList = document.querySelector('#list');
const formFolder = document.querySelector('#folder-button');
var foldersArray = [];

var edit = false;
var DB;

// Principal Obj
var taskObj = {
    id: '',
    task: '',
    done: false,
    folder: ''
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
    folder = document.querySelector('#folder').value;

    if (task === '' || folder === ''){
        showAlert('All field must be completed', 'error');
        return;
    }

    if(edit) {
        // Edit starts
        taskObj.task = task;
        taskObj.folder = folder;

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
            done: false,
            folder
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
    getFolders();
    var folders = [];

    // Reads DB
    const objectStore = DB.transaction('tasks').objectStore('tasks');

    // Counts Elements
    let total = objectStore.count();
    total.onsuccess = function() {
        total = total.result;
        console.log(total);
    }

    objectStore.openCursor().onsuccess = function (e) {

        const cursor = e.target.result;
        
        if (cursor){
            var {id, task, done, folder} = cursor.value;
            const eTask = cursor.value;

            folders.push(folder);

            // Delete Button
            const deleteBtn = document.createElement('a');
            deleteBtn.classList.add('delete-task');
            deleteBtn.innerText = 'X';
    
            deleteBtn.onclick = () => deleteTask(id);
    
            // Edit Button
            const editBtn = document.createElement('a'); 
            editBtn.classList.add('edit-task');
            editBtn.innerText = 'Edit';
  
            editBtn.onclick = () => editTask(eTask);
    
            // Check Button
            const check = document.createElement('a');

            // List
            const li = document.createElement('li');
            li.classList.add('pendiente');
            li.classList.remove('folder');
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
        
            ubicacion = document.querySelector(`#${eTask.folder.replaceAll(' ','-')}`);

            ubicacion.appendChild(li);

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
    document.querySelector('#folder').value = eTask.folder;

    // Cambiar texto del botón
    document.querySelector('#form-button').value = 'Save Changes';
    document.querySelector('#add-task').textContent = `Modifying "${eTask.task}" task:`;
    
    edit = true;

    taskObj = {
        id: eTask.id,
        task: eTask.task,
        done: eTask.done,
        folder: eTask.folder
    }

    refreshHTML();
}

// Gets folders
function getFolders(){
    const transaction = DB.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');
    const folders = [];

    objectStore.openCursor().onsuccess = function (e) {

    const cursor = e.target.result
        
        if (cursor){
            var {folder} = cursor.value;

            if (folders.includes(folder)){
                cursor.continue();
            } else {
                const divFolder = document.createElement('div');
                divFolder.textContent = folder;
                folderId = folder.replaceAll(' ','-');
                console.log(folderId);
                divFolder.id = folderId;
                divFolder.classList.add('folder');

                // Class Delete Button
                const deleteBtn = document.createElement('a');
                deleteBtn.classList.add('delete-folder');
                deleteBtn.innerText = 'Remove';

                divFolder.appendChild(deleteBtn);

                tasksList.appendChild(divFolder);

                cursor.continue();
            }
            folders.push(folder);
            foldersArray = [... new Set(folders)];
         }   
    }
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
        objectStore.createIndex('folder', 'folder', {unique: false} );

    }
}