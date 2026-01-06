const userEmail = localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "index.html"; 
});

//switch between active and completed goals
const tabs = document.querySelectorAll('.tab');
const activeGoalsSection = document.querySelector('.bottom-rect');
const completedGoalsSection = document.querySelector('.completed-rect');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if(tab.textContent === "Active Goals"){
            activeGoalsSection.style.display = "flex";
            completedGoalsSection.style.display = "none";
        }else{
            activeGoalsSection.style.display = "none";
            completedGoalsSection.style.display = "flex";
        }
    });
});

//add goal modal elements
const addGoalModal = document.getElementById('addGoalModal');
const addGoalForm = document.getElementById('addGoalForm');
const modalTitle = document.getElementById('modalTitle');
const modalSaveButton = document.getElementById('modalSaveButton');
const closeAddModal = document.getElementById('closeModal');
const addButton = document.querySelector('.add-goal-button');


let editingGoalId = null;


//open add goal modal
addButton.addEventListener('click', () => {
    modalTitle.textContent = "Add New Goal";
    modalSaveButton.textContent = "Add Goal";
    editingGoalId = null;
    addGoalForm.reset();
    addGoalModal.style.display = "flex";
});

// closs add modal
closeAddModal.addEventListener('click', () => {
    addGoalModal.style.display = "none";
});

window.addEventListener('click', e => {
    if (e.target === addGoalModal) addGoalModal.style.display = "none";
});


//goal details modal elements
const detailsModal = document.getElementById('goalDetailsModal');
const closeDetailsModal = document.getElementById('closeDetailsModal');
const detailsTitle = document.getElementById('detailsTitle');
const detailsDescription = document.getElementById('detailsDescription');

const editBtn = document.getElementById('editGoalBtn');
const deleteBtn = document.getElementById('deleteGoalBtn');
const completeBtn = document.getElementById('completeGoalBtn');

let currentGoalObject = null;

closeDetailsModal.addEventListener('click', () => {
    detailsModal.style.display = "none";
});

window.addEventListener('click', e => {
    if (e.target === detailsModal) detailsModal.style.display = "none";
});

function showSuccessMessage(message, duration = 2000) {
    const modal = document.getElementById('successModal');
    const msgSpan = document.getElementById('successMessage');
    msgSpan.textContent = message;

    modal.classList.add('show'); 
    modal.style.display = "block"; 

    setTimeout(() => {
        modal.classList.remove('show'); 
        setTimeout(() => {
            modal.style.display = "none";
        }, 300); 
    }, duration);
}


//load goals from backend
async function loadGoals(){
    try{
        console.log("Fetching goals from backend...");
        const res = await fetch(`http://localhost:8080/api/goals?email=${userEmail}`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return; 
        }
        const goals = await res.json();
        console.log("Goals loaded:", goals);

        activeGoalsSection.innerHTML = "";
        completedGoalsSection.innerHTML = "";

        goals.forEach(goal => {
            const card = createGoalCard(goal);
            if (goal.completed) completedGoalsSection.appendChild(card);
            else activeGoalsSection.appendChild(card);
        });

        updateThriveMeter(goals);
    }catch (err){
        console.error("Failed to load goals:", err);
        if (err instanceof TypeError){
            alert("Failed to load goals. Make sure the backend server is running on port 8080.");
        }
    }
}

//create goal card
function createGoalCard(goal){
    const div = document.createElement("div");
    div.className = "goal-card";
    div.dataset.id = goal._id;
    div.innerHTML = `
        <div class="goal-name">${goal.name}</div>
        <div class="goal-desc">${goal.description}</div>
    `;
    div.addEventListener("click", () => openGoalDetails(goal));
    return div;
}

//goal details modal
function openGoalDetails(goal){
    currentGoalObject = goal;
    detailsTitle.textContent = goal.name;
    detailsDescription.textContent = goal.description;
    completeBtn.textContent = goal.completed ? "Mark as Active" : "Mark as Completed";
    detailsModal.style.display = "flex";
}

//save goal (add or edit)
addGoalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("goalName").value;
    const description = document.getElementById("goalDesc").value;

    try{
        if (!editingGoalId){
            const res = await fetch("http://localhost:8080/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, email: userEmail })
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const savedGoal = await res.json();  
            console.log("Goal added:", savedGoal);
            showSuccessMessage("Goal added successfully!");
        }else{
            const res = await fetch(`http://localhost:8080/api/goals/${editingGoalId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description , email: userEmail })
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            showSuccessMessage("Goal edited successfully!");
        }
        addGoalModal.style.display = "none";
        loadGoals();
    } catch (err){
        console.error("Failed to save goal:", err);
        alert("Failed to save goal. Check console for details.");
    }
});

const goalNameInput = document.getElementById("goalName");
const submitButton = document.getElementById("modalSaveButton");

//edit goal
editBtn.addEventListener('click', () => {
    editingGoalId = currentGoalObject._id;
    modalTitle.textContent = "Edit Goal";
    modalSaveButton.textContent = "Save Changes";
    document.getElementById("goalName").value = currentGoalObject.name;
    document.getElementById("goalDesc").value = currentGoalObject.description;
    detailsModal.style.display = "none";
    addGoalModal.style.display = "flex";
});

//delete goal
deleteBtn.addEventListener('click', async () => {
    try {
        const res = await fetch(`http://localhost:8080/api/goals/${currentGoalObject._id}?email=${encodeURIComponent(userEmail)}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        detailsModal.style.display = "none";
        loadGoals();
        showSuccessMessage("Goal deleted successfully!");
    } catch (err) {
        console.error("Failed to delete goal:", err);
        alert("Failed to delete goal. Check console for details.");
    }
});

//completed and uncompleted goals
completeBtn.addEventListener('click', async () => {
    try {
        const res = await fetch(`http://localhost:8080/api/goals/${currentGoalObject._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentGoalObject.completed, email: userEmail })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        detailsModal.style.display = "none";
        loadGoals();
    } catch (err) {
        console.error("Failed to toggle goal completion:", err);
        alert("Failed to update goal. Check console for details.");
    }
});

//thrive meter and pie chart
let pieChart; 

function updateThriveMeter(goals){
    const total = goals.length;
    if (total === 0){
        document.querySelector(".progress-text").textContent = "0% of the way there";
        document.querySelector(".goals-total").textContent = "0 goals total";
        document.querySelector(".goals-completed").textContent = "0 goals completed";
        updatePieChart(0, 1); 
        return;
    }
    const completed = goals.filter(g => g.completed).length;
    const percent = Math.round((completed / total) * 100);

    document.querySelector(".progress-text").textContent = `${percent}% of the way there`;
    document.querySelector(".goals-total").textContent = `${total} goals total`;
    document.querySelector(".goals-completed").textContent = `${completed} goals completed`;

    updatePieChart(completed, total);
}

const ctx = document.getElementById('pieChart').getContext('2d');
function getLabelFontSize(){
    const width = window.innerWidth;
    if (width <= 576) return 7;    
    if (width <= 992) return 14;       
    return 18;                         
}
pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#FCDEB6', '#FFF8F8'],
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: getLabelFontSize()
                    },
                    color: '#FCDEB6'
                }
            }
        }
    }
});
window.addEventListener('resize', () => {
    pieChart.options.plugins.legend.labels.font.size = getLabelFontSize();
    pieChart.update();
});

function updatePieChart(completed, total){
    const remaining = total - completed;
    pieChart.data.datasets[0].data = [completed, remaining];
    pieChart.update();
}

//initial load
document.addEventListener('DOMContentLoaded', () => {
    const goalNameInput = document.getElementById("goalName");
    const goalDescInput = document.getElementById("goalDesc");
    const submitButton = document.getElementById("modalSaveButton");
    function validateGoalForm() {
        const name = goalNameInput.value.trim();
        const desc = goalDescInput.value.trim();
        submitButton.disabled = (name === "" || desc === "");
    }
    goalNameInput.addEventListener("input", validateGoalForm);
    goalDescInput.addEventListener("input", validateGoalForm);
    validateGoalForm();

    loadGoals();
});

