// Variables
const form = document.querySelector('#form');
const tasksList = document.querySelector('#list');
var tasks = [];
var edit = false;

// Principal Obj
var taskObj = {
    id: '',
    task: ''
}

// Folders
var folders = [];

var folder = {
    name: '',
    listTasks: []
}

// Event Listeners
eventListeners();

function eventListeners(){
    // Carga tweet al enviar form
    form.addEventListener('submit', addTask);

    // Carga tweets cuando el documento está listo
    document.addEventListener('DOMContentLoaded', () => {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        createHTML();
    })
}

// Funciones

// Agrega task al enviar form
function addTask(e){
    e.preventDefault();

    task = document.querySelector('#todolist').value;

    if (task === ''){
        showAlert('Task cannot be empty', 'error');
        return;
    }

    if(edit) {

        taskObj.task = task;

        taskEditor({...taskObj});

        showAlert('Modified successfully', 'success');

        document.querySelector('#add-task').textContent = `Add a task:`;
        document.querySelector('#form-button').value = 'Add task';

        edit = false;

    } else {

        // Generar un ID único
        taskObj = {
            id: Date.now(),
            task
        }

        tasks = [...tasks, taskObj];

        // Mostrar mensaje de que todo esta bien...
        showAlert('Added successfully', 'success');
    }

    createHTML();
    form.reset();
    console.log(tasks);
}

// Muestra error recibido por parametro
function showAlert(message, type){
    const alertMsg = document.createElement('p');
    alertMsg.textContent = message;
    alertMsg.classList.add(type);

    form.appendChild(alertMsg);

    setTimeout(() => {
        alertMsg.remove();
    }, 3000);
}

// Muestra listado de tweets
function createHTML(){
    cleanHTML();

    if (tasks.length > 0){
        tasks.forEach( task => {
            // Delete Button
            const deleteBtn = document.createElement('a');
            deleteBtn.classList.add('delete-task');
            deleteBtn.innerText = 'X';
    
            deleteBtn.onclick = () => deleteTask(task.id);
    
            // Edit Button
            const editBtn = document.createElement('a'); 
            editBtn.classList.add('edit-task');
            editBtn.innerText = 'Edit';
    
            editBtn.onclick = () => editTask(task);
    
            
            const check = document.createElement('a');
            check.classList.add('unchecked');
            check.innerText ='...';
    
            check.onclick = () => { if (check.classList.contains('unchecked')){
                check.classList.remove('unchecked');
                check.classList.add('checked');
                check.innerText ='✓';
                li.classList.add('tachar');
                li.classList.remove('pendiente');
            } else {
                check.classList.add('unchecked');
                check.classList.remove('checked');
                check.innerText ='...';
                li.classList.add('pendiente');
                li.classList.remove('tachar');
            }}
    
            const li = document.createElement('li');
            li.classList.add('pendiente');
            li.innerText = task.task;
    
            li.appendChild(check);
            li.appendChild(deleteBtn);
            li.appendChild(editBtn);
    
            tasksList.appendChild(li);
            
        })}

    syncStorage();
}

// Limpia HTML
function cleanHTML(){
    while(tasksList.firstChild){
        tasksList.removeChild(tasksList.firstChild);
    }
}

// Agrega las tasks a Local Storage
function syncStorage(){
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTask(id){
    tasks = tasks.filter(task => task.id !== id);
    showAlert('Task deleted', 'success');
    createHTML();
}

function taskEditor(newTask) {
    tasks = tasks.map( task => task.id === newTask.id ? task = newTask : task);
}


function editTask(eTask){
    document.querySelector('#todolist').value = eTask.task;

    // Cambiar texto del botón
    document.querySelector('#form-button').value = 'Save Changes';
    document.querySelector('#add-task').textContent = `Modifying "${eTask.task}" task:`;
    
    edit = true;

    taskObj = {
        id: eTask.id,
        task: eTask.task
    }

    createHTML();
}


