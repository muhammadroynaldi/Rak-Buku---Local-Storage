const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function generateId() {
  return +new Date();
}

function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id,
    task,
    timestamp,
    isCompleted
  };
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeTodo(todoObject) {

  const {id, task, timestamp, isCompleted} = todoObject;

  const textTitle = document.createElement('h2');
  textTitle.innerText = task;

  const textTimestamp = document.createElement('p');
  textTimestamp.innerText = timestamp;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textTimestamp);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow')
  container.append(textContainer);
  container.setAttribute('id', `todo-${id}`);

  if (isCompleted) {

    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(id);
    });

    container.append(undoButton, trashButton);
  } else {

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });

    container.append(checkButton);
  }

  return container;
}

function addTodo() {
  const textTodo = document.getElementById('title').value;
  const timestamp = document.getElementById('date').value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false);
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast(`Tugas "${textTodo}" berhasil ditambah.`);
}

function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast(`Tugas "${todoTarget.task}" telah ditandai sebagai selesai.`);
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  const removedTask = todos[todoTarget].task; // Mengambil task yang akan dihapus
  todos.splice(todoTarget, 1);
  saveData();
  showToast(`Tugas "${removedTask}" telah dihapus dari daftar selesai.`);

  // Memicu ulang rendering untuk memperbarui tampilan
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function undoTaskFromCompleted(todoId) {

  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast(`Tugas "${todoTarget.task}" telah dikembalikan ke daftar yang belum selesai.`);
}

document.addEventListener('DOMContentLoaded', function () {

  const submitForm = document.getElementById('form');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addTodo();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function showToast(message) {
  const toast = document.getElementById('toastMessage');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(function() {
    toast.classList.remove('show');
  }, 3000); // 3000 milidetik atau 3 detik
}

// document.addEventListener(SAVED_EVENT, () => {
//   const data = localStorage.getItem(STORAGE_KEY);
//   if (data) {
//     showToast(`Data telah diperbarui: ${data}`);
//   }
// });

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById('todos');
  const listCompleted = document.getElementById('completed-todos');

  uncompletedTODOList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (todoItem.isCompleted) {
      listCompleted.append(todoElement);
    } else {
      uncompletedTODOList.append(todoElement);
    }
  }
});
