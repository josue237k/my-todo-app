document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector(".input-element");
    const addButton = document.querySelector(".add-button");
    const tasklist = document.querySelector(".list-events");
    addButton.addEventListener("click", addElement);
    function addElement() {
        const inputText = input.value;
        if (inputText.trim() !== "") {
            addTask(inputText);
            saveTask(inputText)
        }
    }
    function addTask(task) {
            const li = document.createElement("li");
            li.classList = "lists-dis";
            li.textContent = task;
            const deleteButton = document.createElement("i");
            deleteButton.classList.add("fa", "fa-trash-o", "hello");
            deleteButton.addEventListener("click", () => {
                sessionStorage.removeItem("tasks")
                li.remove();
            });
            li.appendChild(deleteButton);
            tasklist.appendChild(li);
        
    }
    function loadTasks(){
        const tasks = JSON.parse(sessionStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTask(task);
        });
    }
    function saveTask(task) {
        const tasks = JSON.parse(sessionStorage.getItem('tasks')) || [];
        tasks.push(task);
        sessionStorage.setItem('tasks', JSON.stringify(tasks));
    }
    loadTasks();
})

console.log(window.sessionStorage);
