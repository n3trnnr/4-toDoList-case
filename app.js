const select = document.getElementById('user-todo')
const input = document.getElementById('new-todo')
const todoList = document.getElementById('todo-list')
const btn = document.querySelector('button')

const usersArr = []

const getData = async () => {
    const [usersResponse, todosResponse] = await Promise.all([
        fetch('https://jsonplaceholder.typicode.com/users'),
        fetch('https://jsonplaceholder.typicode.com/todos')
    ])

    const users = await usersResponse.json()
    const todos = await todosResponse.json()
    return [users, todos]
}
try {
    getData().then(([users, todos]) => {

        usersArr.push(...users)

        users.forEach((user) => {
            const option = document.createElement('option')
            option.innerText = user.name
            select.appendChild(option)
        })

        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < todos.length; j++) {
                if (users[i].id === todos[j].userId) {
                    createTodo(todos[j].id, todos[j].completed, users[i].name, todos[j].title)
                }
            }
        }
    })
}
catch (error) {
    console.log(error);
}
function createTodo(id, isChecked, userName, title) {
    const li = document.createElement('li')
    li.classList.add('todo-item')
    li.id = id

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = isChecked

    const delBtn = document.createElement('button')
    delBtn.innerText = 'x'
    delBtn.classList.add('close')

    li.innerHTML = `<p>${title} <i>by</i> <strong>${userName}</strong></p> `
    li.prepend(checkbox)
    li.appendChild(delBtn)

    todoList.prepend(li)
}
//POST
btn.addEventListener('click', (event) => {
    event.preventDefault()
    if (!input.value || select.value === 'select user') {
        alert('Заполните все необходимые поля!')
        input.value = ''
    } else {
        createTodo(todoList.childElementCount + 1, false, select.value, input.value)

        const userId = usersArr.filter(user => user.name === select.value)
        // console.log(todoList.childElementCount + 1, false, select.value, input.value);
        fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST',
            body: JSON.stringify({
                userId: userId.id,
                id: todoList.childElementCount + 1,
                title: input.value,
                completed: false
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => console.log('POST: ', data))
        input.value = ''
    }
})
//PATCH
todoList.addEventListener('click', (event) => {
    if (event.target.tagName === 'INPUT') {
        fetch(`https://jsonplaceholder.typicode.com/todos/${+event.target.parentNode.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                completed: event.target.checked
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('PATCH: ', data);
                const elements = todoList.children
                for (let i of elements) {
                    if (data.id === +i.id) {
                        i.firstChild.checked = data.completed
                    }
                }
            })
    }
})
//DELETE
todoList.addEventListener('click', (event) => {
    if (event.target.classList.contains('close')) {
        fetch(`https://jsonplaceholder.typicode.com/todos/${+event.target.parentNode.id}`, {
            method: 'DELETE'
        })
            .then((res) => res.json())
            .then((data) => console.log('DELETE: ', data))
        event.target.parentNode.remove()
    }
})
