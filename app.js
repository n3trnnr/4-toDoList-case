const select = document.getElementById('user-todo')
const input = document.getElementById('new-todo')
const todoList = document.getElementById('todo-list')
const btn = document.querySelector('button')

let usersArr = []
let todosArr = []

function findUser(id) {
    const user = usersArr.find((user) => user.id === id)
    return user.name
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

const getData = async () => {
    try {
        const [usersResponse, todosResponse] = await Promise.all([
            fetch('https://jsonplaceholder.typicode.com/users'),
            fetch('https://jsonplaceholder.typicode.com/todos')
        ])
        if (!usersResponse.ok) {
            throw new Error(`${usersResponse.status}`)
        } else if (!todosResponse.ok) {
            throw new Error(`${todosResponse.status}`)
        } else {
            const users = await usersResponse.json()
            const todos = await todosResponse.json()

            usersArr = users
            todosArr = todos

            users.forEach((user) => {
                const option = document.createElement('option')
                option.innerText = user.name
                select.appendChild(option)
            })

            todosArr.forEach((todo) => {
                createTodo(todo.id, todo.completed, findUser(todo.userId), todo.title)
            })
        }
    }
    catch (error) {
        alert(error)
    }
}

async function postData(event) {
    event.preventDefault()

    if (!input.value || select.value === 'select user') {
        alert('Заполните все необходимые поля!')
        input.value = ''
    } else {
        const user = usersArr.find(user => user.name === select.value)
        try {
            const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user.id,
                    id: todosArr.length + 1,
                    title: input.value,
                    completed: false
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                throw new Error(`${res.status}`)
            } else {
                const data = await res.json()
                createTodo(todosArr.length + 1, data.completed, select.value, data.title)
                todosArr.push({ ...data, id: todosArr.length + 1 })
            }
        } catch (error) {
            alert(error)
        }
        input.value = ''
    }
}

async function patchData(event) {
    if (event.target.tagName === 'INPUT') {
        try {
            const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${+event.target.parentElement.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    completed: event.target.checked
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                throw new Error(`${res.status}`)
            } else {
                const data = await res.json()

                todosArr.forEach((i) => {
                    if (data.id === i.id) {
                        i.completed = data.completed
                    }
                })
            }
        } catch (error) {
            event.target.checked === true ? event.target.checked = false : event.target.checked = true
            alert(error)
        }
    }
}

async function deleteData(event) {
    if (event.target.classList.contains('close')) {
        try {
            const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${+event.target.parentElement.id}`, {
                method: 'DELETE'
            })
            if (!res.ok) {
                throw new Error(`${res.status}`)
            } else {
                const data = await res.json()

                todosArr.forEach((val, indx) => {
                    if (val.id === +event.target.parentElement.id) {
                        todosArr.splice(indx, 1)
                        event.target.parentElement.remove()
                    }
                })
            }
        } catch (error) {
            alert(error)
        }
    }
}

function isOnline() {
    if (!navigator.onLine) {
        alert('Проверьте подключение к интернету!')
    } else {
        getData()
    }
}

window.addEventListener('load', isOnline)
btn.addEventListener('click', postData)
todoList.addEventListener('click', patchData)
todoList.addEventListener('click', deleteData)