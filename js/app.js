// Variables
const form = document.querySelector('#form');
const tasksList = document.querySelector('#list');
let tasks = [];


// Event Listeners
eventListeners();

function eventListeners(){
    // Carga tweet al enviar formulario
    form.addEventListener('submit', addTask);

    // Carga tweets cuando el documento está listo
    document.addEventListener('DOMContentLoaded', () => {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        createHTML();
    })
}

// Funciones

// Agrega task al enviar formulario
function addTask(e){
    e.preventDefault();

    const task = document.querySelector('#todolist').value;

    if (task === ''){
        showError('Task cannot be empty');
        return;
    }

    const taskObj = {
        id: Date.now(),
        task
    }

    // Se agrega ultima task al arreglo
    tasks =[...tasks, taskObj];

    createHTML();

    // Reiniciar formulario
    form.reset();
}

// Muestra error recibido por parametro
function showError(error){
    const errorMsg = document.createElement('p');
    errorMsg.textContent = error;
    errorMsg.classList.add('error');

    form.appendChild(errorMsg);

    setTimeout(() => {
        errorMsg.remove();
    }, 3000);
}

// Muestra listado de tweets
function createHTML(){
    cleanHTML();

    if (tasks.length > 0){
        tasks.forEach( task => {
            // Boton para eliminar
            const deleteBtn = document.createElement('a');
            deleteBtn.classList.add('borrar-tweet');
            deleteBtn.innerText = 'X';

            // Funcion eliminar
            deleteBtn.onclick = () => {
                borrarTweet(task.id);
            }

            // Crea Lista de tweets
            const li = document.createElement('li');
            li.innerText = task.task;
            li.appendChild(deleteBtn);

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

function borrarTweet(id){
    tasks = tasks.filter(task => task.id !== id);
    createHTML();
}
