// ======================================================
// 核心应用逻辑 - app.js
// ======================================================
// 这个文件是整个APP的"大脑"，负责：
// 1. 管理应用状态（正在停车？选了哪个停车场？）
// 2. 实时更新显示（已停多久？当前费用？）
// 3. 处理用户操作（点击按钮时做什么？）
// 4. 调用iOS快捷指令（设置提醒）
// ======================================================

// ======================================================
// 应用状态管理
// ======================================================
const AppState = {
  // 当前停车状态
  isParking: false,                    // 是否正在停车
  selectedParkingLotId: null,          // 选中的停车场ID
  startTime: null,                     // 开始时间（Date对象）
  adjustedStartTime: null,             // 用户调整后的开始时间
  qrCodeImage: null,                   // 二维码照片（base64）
  reminderCount: 0,                    // 已发送的提醒次数
  reminders: [],                       // 提醒列表

  // 保存状态到localStorage
  save() {
    const stateToSave = {
      isParking: this.isParking,
      selectedParkingLotId: this.selectedParkingLotId,
      startTime: this.startTime ? this.startTime.toISOString() : null,
      adjustedStartTime: this.adjustedStartTime ? this.adjustedStartTime.toISOString() : null,
      qrCodeImage: this.qrCodeImage,
      reminderCount: this.reminderCount,
      reminders: this.reminders.map(r => ({
        ...r,
        time: r.time.toISOString()
      }))
    };
    localStorage.setItem('parkingState', JSON.stringify(stateToSave));
    console.log('状态已保存:', stateToSave);
  },

  // 从localStorage加载状态
  load() {
    const saved = localStorage.getItem('parkingState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.isParking = state.isParking || false;
        this.selectedParkingLotId = state.selectedParkingLotId || null;
        this.startTime = state.startTime ? new Date(state.startTime) : null;
        this.adjustedStartTime = state.adjustedStartTime ? new Date(state.adjustedStartTime) : null;
        this.qrCodeImage = state.qrCodeImage || null;
        this.reminderCount = state.reminderCount || 0;
        this.reminders = (state.reminders || []).map(r => ({
          ...r,
          time: new Date(r.time)
        }));
        console.log('状态已加载:', state);
      } catch (error) {
        console.error('加载状态失败:', error);
        this.clear();
      }
    }
  },

  // 清除状态
  clear() {
    this.isParking = false;
    this.selectedParkingLotId = null;
    this.startTime = null;
    this.adjustedStartTime = null;
    this.qrCodeImage = null;
    this.reminderCount = 0;
    this.reminders = [];
    localStorage.removeItem('parkingState');
    console.log('状态已清除');
  }
};

// ======================================================
// 定时器相关
// ======================================================
let updateInterval = null;  // 实时更新的定时器

// ======================================================
// 初始化应用
// ======================================================
function initApp() {
  console.log('初始化应用...');
  
  // 加载保存的状态
  AppState.load();

  // 填充停车场下拉列表
  populateParkingLotSelector();

  // 根据状态显示对应界面
  if (AppState.isParking) {
    showParkingView();
    startUpdateTimer();
  } else {
    showIdleView();
  }

  // 绑定事件监听器
  bindEventListeners();

  console.log('应用初始化完成');
}

// ======================================================
// 填充停车场下拉列表
// ======================================================
function populateParkingLotSelector() {
  const selector = document.getElementById('parking-lot-selector');
  
  // 清空现有选项
  selector.innerHTML = '<option value="">-- 请选择停车场 --</option>';

  // 添加所有停车场
  PARKING_LOTS.forEach(lot => {
    const option = document.createElement('option');
    option.value = lot.id;
    option.textContent = `${lot.name} - ${lot.description}`;
    selector.appendChild(option);
  });

  // 如果有保存的选择，恢复它
  if (AppState.selectedParkingLotId) {
    selector.value = AppState.selectedParkingLotId;
  }
}

// ======================================================
// 界面切换
// ======================================================
function showIdleView() {
  document.getElementById('idle-view').style.display = 'block';
  document.getElementById('parking-view').style.display = 'none';
  console.log('显示空闲界面');
}

function showParkingView() {
  document.getElementById('idle-view').style.display = 'none';
  document.getElementById('parking-view').style.display = 'block';
  
  // 显示停车场名称
  const parkingLot = getParkingLotById(AppState.selectedParkingLotId);
  if (parkingLot) {
    document.getElementById('current-parking-lot').textContent = parkingLot.name;
  }

  // 如果有二维码，显示它
  if (AppState.qrCodeImage) {
    document.getElementById('qr-code-display').src = AppState.qrCodeImage;
    document.getElementById('qr-code-container').style.display = 'block';
  }

  console.log('显示停车中界面');
}

// ======================================================
// 绑定事件监听器
// ======================================================
function bindEventListeners() {
  // 开始停车按钮
  document.getElementById('start-parking-btn').addEventListener('click', onStartParking);

  // 调整开始时间按钮
  document.getElementById('adjust-time-btn').addEventListener('click', onAdjustTime);

  // 拍摄二维码按钮
  document.getElementById('capture-qr-btn').addEventListener('click', onCaptureQR);

  // 设置提醒按钮
  document.getElementById('set-reminder-btn').addEventListener('click', onSetReminder);

  // 我要走了按钮
  document.getElementById('finish-parking-btn').addEventListener('click', onFinishParking);

  // 我已支付按钮
  document.getElementById('paid-btn').addEventListener('click', onPaid);

  // 弹窗取消按钮
  document.getElementById('modal-cancel-btn').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
  });

  // 弹窗确定按钮
  document.getElementById('modal-confirm-btn').addEventListener('click', onModalConfirm);

  console.log('事件监听器已绑定');
}

// ======================================================
// 事件处理函数
// ======================================================

// 开始停车
function onStartParking() {
  const selector = document.getElementById('parking-lot-selector');
  const selectedId = parseInt(selector.value);

  if (!selectedId) {
    alert('请先选择一个停车场！');
    return;
  }

  // 设置状态
  AppState.isParking = true;
  AppState.selectedParkingLotId = selectedId;
  AppState.startTime = new Date();
  AppState.adjustedStartTime = null;  // 初始没有调整
  AppState.reminderCount = 0;

  // 计算提醒时间
  const parkingLot = getParkingLotById(selectedId);
  AppState.reminders = calculateReminderTimes(parkingLot, AppState.startTime);

  // 保存状态
  AppState.save();

  // 切换界面
  showParkingView();

  // 开始实时更新
  startUpdateTimer();

  console.log('开始停车:', parkingLot.name);
}

// 调整开始时间
function onAdjustTime() {
  const currentTime = AppState.adjustedStartTime || AppState.startTime;
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  
  const timeInput = document.getElementById('modal-time-input');
  timeInput.value = `${hours}:${minutes}`;
  
  document.getElementById('modal-overlay').style.display = 'flex';
}

// 弹窗确认处理
function onModalConfirm() {
  const newTime = document.getElementById('modal-time-input').value;
  
  if (newTime) {
    const [h, m] = newTime.split(':');
    const adjusted = new Date(AppState.startTime);
    adjusted.setHours(parseInt(h), parseInt(m), 0, 0);
    
    AppState.adjustedStartTime = adjusted;
    
    // 重新计算提醒时间
    const parkingLot = getParkingLotById(AppState.selectedParkingLotId);
    AppState.reminders = calculateReminderTimes(parkingLot, adjusted);
    
    AppState.save();
    updateParkingInfo();
    
    document.getElementById('modal-overlay').style.display = 'none';
    alert(`开始时间已调整为：${adjusted.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}`);
  }
}

// 拍摄二维码
function onCaptureQR() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'camera';  // 在移动设备上直接打开摄像头
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        AppState.qrCodeImage = event.target.result;
        AppState.save();
        
        // 显示二维码
        document.getElementById('qr-code-display').src = AppState.qrCodeImage;
        document.getElementById('qr-code-container').style.display = 'block';
        
        alert('二维码已保存！');
      };
      reader.readAsDataURL(file);
    }
  });
  
  input.click();
}

// 设置提醒
function onSetReminder() {
  if (AppState.reminderCount >= AppState.reminders.length) {
    alert('所有提醒已设置完毕！');
    return;
  }

  const reminder = AppState.reminders[AppState.reminderCount];
  
  // 调用iOS快捷指令
  setIOSReminder(reminder);
  
  AppState.reminderCount++;
  AppState.save();
  
  updateParkingInfo();
}

// 我要走了
function onFinishParking() {
  const effectiveStartTime = AppState.adjustedStartTime || AppState.startTime;
  const now = new Date();
  const elapsedMinutes = Math.floor((now - effectiveStartTime) / 1000 / 60);
  
  const parkingLot = getParkingLotById(AppState.selectedParkingLotId);
  const currentFee = calculateFee(parkingLot, elapsedMinutes);

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  let message = `您已停车 ${hours}小时${minutes}分钟\n`;
  message += `当前费用：${currentFee} 元\n\n`;
  
  if (currentFee === 0) {
    message += '恭喜！还在免费时段内！';
  } else if (AppState.qrCodeImage) {
    message += '请扫描二维码支付';
  } else {
    message += '请前往停车场收费处支付';
  }

  if (confirm(message + '\n\n是否已支付并准备离开？')) {
    onPaid();
  }
}

// 我已支付
function onPaid() {
  if (confirm('确认已支付并停止计时？')) {
    stopUpdateTimer();
    AppState.clear();
    showIdleView();
    
    // 清空二维码显示
    document.getElementById('qr-code-container').style.display = 'none';
    document.getElementById('qr-code-display').src = '';
    
    alert('停车记录已清除，欢迎下次使用！');
  }
}

// ======================================================
// 实时更新停车信息
// ======================================================
function startUpdateTimer() {
  // 先更新一次
  updateParkingInfo();
  
  // 然后每秒更新一次
  updateInterval = setInterval(updateParkingInfo, 1000);
  console.log('实时更新已启动');
}

function stopUpdateTimer() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log('实时更新已停止');
  }
}

function updateParkingInfo() {
  if (!AppState.isParking) return;

  const effectiveStartTime = AppState.adjustedStartTime || AppState.startTime;
  const now = new Date();
  const elapsedMinutes = Math.floor((now - effectiveStartTime) / 1000 / 60);

  const parkingLot = getParkingLotById(AppState.selectedParkingLotId);
  if (!parkingLot) return;

  // 计算费用
  const currentFee = calculateFee(parkingLot, elapsedMinutes);

  // 格式化时长
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = Math.floor(elapsedMinutes % 60);
  
  // 使用 CSS 动画实现冒号跳动效果
  const timeString = `${hours.toString().padStart(2, '0')}<span class="blinking-colon">:</span>${minutes.toString().padStart(2, '0')}`;
  document.getElementById('elapsed-time').innerHTML = timeString;

  // 更新显示
  document.getElementById('current-fee').textContent = `${currentFee} 元`;

  // 显示当前时段状态
  const statusText = getCurrentPeriodStatus(parkingLot, elapsedMinutes);
  document.getElementById('current-status').textContent = statusText;

  // 显示下一次提醒
  if (AppState.reminderCount < AppState.reminders.length) {
    const nextReminder = AppState.reminders[AppState.reminderCount];
    const timeToReminder = Math.floor((nextReminder.time - now) / 1000 / 60);
    
    if (timeToReminder > 0) {
      document.getElementById('next-reminder').textContent = 
        `还有 ${timeToReminder} 分钟后提醒`;
    } else {
      document.getElementById('next-reminder').textContent = '提醒时间已到！';
    }
  } else {
    document.getElementById('next-reminder').textContent = '无后续提醒';
  }
}

// 获取当前时段状态描述
function getCurrentPeriodStatus(parkingLot, minutes) {
  let accumulatedMinutes = 0;
  
  for (let rule of parkingLot.rules) {
    accumulatedMinutes += rule.duration;
    
    if (minutes < accumulatedMinutes) {
      return rule.description || '计费中';
    }
  }

  // 检查是否封顶
  const currentFee = calculateFee(parkingLot, minutes);
  if (parkingLot.maxPrice !== null && currentFee >= parkingLot.maxPrice) {
    return `已封顶（${parkingLot.maxPrice}元）`;
  }

  return '计费中';
}

// ======================================================
// iOS快捷指令集成（在 notifications.js 中实现）
// ======================================================
// 这个函数在 notifications.js 中定义
// function setIOSReminder(reminder) { ... }

// ======================================================
// 页面加载时初始化
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM加载完成，开始初始化...');
  initApp();
});