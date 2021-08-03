// Variables
const form = document.querySelector('#form');
const tasksList = document.querySelector('#list');
var tasks = [];
var edit = false;

var taskObj = {
    id: '',
    task: ''
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

    const task = document.querySelector('#todolist').value;

    if (task === ''){
        showAlert('Task cannot be empty', 'error');
        return;
    }

    if(edit) {
        // Estamos editando
        taskObj.task = task;
        taskEditor( {...taskObj} );

        showAlert('Modified successfully', 'success');

        document.querySelector('#form-button').value = 'Add task';

        edit = false;

    } else {

        // Generar un ID único
        taskObj = {
            id: Date.now(),
            task
        }

        tasks =[...tasks, taskObj];

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

            // Separate
            const separate = document.createElement('a');
            separate.classList.add('edit-task');

            const li = document.createElement('li');            
            li.classList.add ('checkbox');
            li.innerText = task.task;
            //li.innerHTML = `<input type="checkbox"> ${task.task}`;
            
            li.appendChild(deleteBtn);
            li.appendChild(separate);
            li.appendChild(editBtn);
            

            tasksList.appendChild(li);
            
        })
    }

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
    console.log(newTask);
    tasks = tasks.map( task => task.id === newTask.id ? task = newTask : task);
}


function editTask(eTask){
    console.log('ARREGLO EN EDITTASK');
    console.log(tasks);
    document.querySelector('#todolist').value = eTask.task;
    //propietarioInput.value = propietario;


    // Cambiar texto del botón
    document.querySelector('#form-button').value = 'Save Changes';
    
    edit = true;
    taskObj.task = eTask.task;
    taskObj.id = eTask.id;
    createHTML();
}

function resetObj() {
    taskObj.task = '';
    taskObj.id = '';
}
