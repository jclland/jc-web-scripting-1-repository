let tasks = [];

let statusFilter = "all";
let tagFilterValue = "all";


const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const tagSelect = document.querySelector("#tag-select");
const taskList = document.querySelector("#task-list");
const errorMessage = document.querySelector("#error-message");
const taskCounter = document.querySelector("#task-counter");

const filterButtons = document.querySelectorAll("[data-filter]");
const tagFilter = document.querySelector("#tag-filter");


// message helpers
function showMessage(text) {
	errorMessage.textContent = text;
}

function clearMessage() {
	errorMessage.textContent = "";
}


// load tasks
function loadTasks() {
	const saved = localStorage.getItem("tasks");

	if (!saved) {
		tasks = [];
		return;
	}

	try {
		tasks = JSON.parse(saved);
	} catch (err) {
		console.error("Error loading tasks:", err);
		tasks = [];
		showMessage("Could not load saved tasks.");
	}
}


//save tasks
function saveTasks() {
	localStorage.setItem("tasks", JSON.stringify(tasks));
}


// add task
form.addEventListener("submit", function (event) {
	event.preventDefault();

	const text = taskInput.value.trim();
	const tag = tagSelect.value;

	// validatoin
	if (!text) {
		showMessage("Task name is required.");
		return;
	}

	clearMessage();

	const newTask = {
		id: Date.now(),
		text: text,
		tag: tag,
		done: false
	};

	tasks.push(newTask);

	saveTasks();
	renderTasks();

	form.reset();
});


//  toggle task
function toggleTask(id) {
	for (let i = 0; i < tasks.length; i++) {
		if (tasks[i].id === id) {
			tasks[i].done = !tasks[i].done;
			break;
		}
	}

	saveTasks();
	renderTasks();
}


// delete task
function deleteTask(id) {
	tasks = tasks.filter(function (task) {
		return task.id !== id;
	});

	saveTasks();
	renderTasks();
}


// render tasks
function renderTasks() {
	taskList.innerHTML = "";

	let filteredTasks = tasks.filter(function (task) {
		// status filter
		let matchesStatus = false;

		if (statusFilter === "all") {
			matchesStatus = true;
		} else if (statusFilter === "active" && task.done === false) {
			matchesStatus = true;
		} else if (statusFilter === "completed" && task.done === true) {
			matchesStatus = true;
		}


		// tag filter
		let matchesTag = false;

		if (tagFilterValue === "all") {
			matchesTag = true;
		} else if (task.tag === tagFilterValue) {
			matchesTag = true;
		}

		return matchesStatus && matchesTag;
	});

	filteredTasks.forEach(function (task) {
		const li = document.createElement("li");

		if (task.done) {
			li.classList.add("completed");
		}

		// left side
		const leftDiv = document.createElement("div");
		leftDiv.classList.add("task-left");

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = task.done;

		checkbox.addEventListener("change", function () {
			toggleTask(task.id);
		});

		const textSpan = document.createElement("span");
		textSpan.textContent = task.text;

		leftDiv.appendChild(checkbox);
		leftDiv.appendChild(textSpan);

		if (task.tag) {
			const tagEl = document.createElement("small");
			tagEl.textContent = "(" + task.tag + ")";
			leftDiv.appendChild(tagEl);
		}

		// delete button
		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "Delete";

		deleteBtn.addEventListener("click", function () {
			deleteTask(task.id);
		});

		li.appendChild(leftDiv);
		li.appendChild(deleteBtn);

		taskList.appendChild(li);
	});

	updateCounter();
}


// counter
function updateCounter() {
	let activeCount = 0;

	for (let i = 0; i < tasks.length; i++) {
		if (tasks[i].done === false) {
			activeCount++;
		}
	}

	taskCounter.textContent = activeCount + " active tasks";
}


// filter buttons
filterButtons.forEach(function (button) {
	button.addEventListener("click", function () {
		statusFilter = button.dataset.filter;
		renderTasks();
	});
});


// tag filter
tagFilter.addEventListener("change", function () {
	tagFilterValue = tagFilter.value;
	renderTasks();
});


loadTasks();
renderTasks();