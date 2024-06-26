const input=document.querySelector(".input-element");
const addButton=document.querySelector(".add-button");
const tasklist=document.querySelector(".list-events");
addButton.addEventListener("click",addElement);
function addElement(){
    const inputText=input.value;
    if(inputText.trim()!==""){
        const li=document.createElement("li");
        li.classList="lists-dis"
        li.textContent=inputText;
        const deleteButton=document.createElement("i");
        deleteButton.classList="fa fa-trash-o hello";
        deleteButton.addEventListener("click",()=>li.remove());
        tasklist.appendChild(li);
        li.appendChild(deleteButton)
        input.value="";
    }

}