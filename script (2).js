const form = document.getElementById('task-form');
const taskNameInput = document.getElementById('task-name');
const taskHoursInput = document.getElementById('task-hours');
const taskMinutesInput = document.getElementById('task-minutes');
const taskList = document.getElementById('task-list');
const remainingTimeEl = document.getElementById('remaining-time');
const overallProgress = document.getElementById('overall-progress');

let totalUsedTime = 0;
let tasks = [];

const colorPalette = [
  '#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0',
  '#00BCD4', '#FF9800', '#8BC34A', '#E91E63', '#3F51B5',
  '#CDDC39', '#795548'
];

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = taskNameInput.value.trim();
  let hours = parseInt(taskHoursInput.value);
  let minutes = parseInt(taskMinutesInput.value);

  if (isNaN(minutes)) {
    minutes = 0;
  }

  const totalMinutes = (hours * 60) + minutes;

  if (!name || isNaN(totalMinutes) || totalMinutes < 1 || totalMinutes > 1440) {
    Swal.fire({
      icon: 'error',
      title: '입력 오류',
      text: '올바른 값을 입력하세요. (시간 0~24, 분 0~59)',
    });
    return;
  }

  if (totalUsedTime + totalMinutes > 1440) {
    Swal.fire({
      icon: 'warning',
      title: '시간 초과',
      text: '총 24시간을 초과할 수 없습니다.',
    });
    return;
  }

  addTask(name, hours, minutes, totalMinutes);
  taskNameInput.value = '';
  taskHoursInput.value = '';
  taskMinutesInput.value = '';
});

function addTask(name, hours, minutes, totalMinutes) {
  const color = colorPalette[tasks.length % colorPalette.length];

  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center';

  const leftContent = document.createElement('div');
  const colorBox = document.createElement('span');
  colorBox.className = 'color-box';
  colorBox.style.backgroundColor = color;

  const text = document.createElement('span');
  text.textContent = `${name} - ${hours}시간 ${minutes}분`;

  leftContent.appendChild(colorBox);
  leftContent.appendChild(text);

  const delBtn = document.createElement('button');
  delBtn.textContent = '삭제';
  delBtn.className = 'btn btn-sm btn-danger';
  delBtn.onclick = () => {
    Swal.fire({
      title: '정말 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    }).then((result) => {
      if (result.isConfirmed) {
        li.remove();
        totalUsedTime -= totalMinutes;
        tasks = tasks.filter((t) => t.name !== name || t.totalMinutes !== totalMinutes);
        updateRemainingTime();
        updateOverallProgress();
      }
    });
  };

  li.appendChild(leftContent);
  li.appendChild(delBtn);
  taskList.appendChild(li);

  totalUsedTime += totalMinutes;
  tasks.push({ name, hours, minutes, totalMinutes, color });
  updateRemainingTime();
  updateOverallProgress();
}

function updateRemainingTime() {
  const remainingMinutes = 1440 - totalUsedTime;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  remainingTimeEl.textContent = `${remainingHours}시간 ${remainingMins}분`;
}

function updateOverallProgress() {
  overallProgress.innerHTML = '';
  let usedTime = 0;

  tasks.forEach((task) => {
    const bar = document.createElement('div');
    const widthPercent = (task.totalMinutes / 1440) * 100;
    bar.className = 'progress-bar';
    bar.style.width = `${widthPercent}%`;
    bar.style.backgroundColor = task.color;
    bar.title = `${task.name} (${task.hours}시간 ${task.minutes}분)`;
    bar.textContent = `${Math.round(widthPercent)}%`;
    overallProgress.appendChild(bar);
    usedTime += task.totalMinutes;
  });

  if (usedTime < 1440) {
    const emptyBar = document.createElement('div');
    emptyBar.className = 'progress-bar bg-light text-dark';
    emptyBar.style.width = `${((1440 - usedTime) / 1440) * 100}%`;
    emptyBar.textContent = `${Math.round(((1440 - usedTime) / 1440) * 100)}%`;
    emptyBar.title = `남은 시간`;
    overallProgress.appendChild(emptyBar);
  }
}
