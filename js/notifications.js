// ======================================================
// iOS快捷指令集成 - notifications.js
// ======================================================
// 这个文件负责和iOS快捷指令通信，设置提醒
// iOS快捷指令可以：
// 1. 创建系统级提醒（支持Apple Watch震动）
// 2. 在锁屏上显示通知
// 3. 到时间后自动打开APP
// ======================================================

/**
 * 调用iOS快捷指令设置提醒
 * @param {Object} reminder - 提醒对象
 * @param {Date} reminder.time - 提醒时间
 * @param {String} reminder.message - 提醒消息
 * @param {Boolean} reminder.isLastReminder - 是否是最后一次提醒
 * @param {Boolean} reminder.isCappingReminder - 是否是封顶提醒
 */
function setIOSReminder(reminder) {
  // 格式化时间为 HH:MM
  const hours = reminder.time.getHours().toString().padStart(2, '0');
  const minutes = reminder.time.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  // 构建提醒消息
  let message = reminder.message;
  
  // 如果是最后一次提醒，添加特殊标记
  if (reminder.isLastReminder) {
    message += '\n💚 这是最后一次提醒，之后不会再打扰你。';
  }
  
  // 如果是封顶提醒，添加特殊标记
  if (reminder.isCappingReminder) {
    message += '\n⭐ 封顶提醒：可以放心继续停车！';
  }
  
  // 生成iOS快捷指令URL
  // 格式：shortcuts://run-shortcut?name=停车提醒&input=时间|消息
  const shortcutName = encodeURIComponent('停车提醒');
  const input = encodeURIComponent(`${timeString}|${message}`);
  const shortcutURL = `shortcuts://run-shortcut?name=${shortcutName}&input=${input}`;
  
  console.log('调用iOS快捷指令:', shortcutURL);
  console.log('提醒时间:', timeString);
  console.log('提醒消息:', message);
  
  // 跳转到快捷指令
  window.location.href = shortcutURL;
}

/**
 * 检测是否在iOS设备上
 */
function isIOSDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * 检测快捷指令是否可用
 * 注意：这个检测不是100%准确，只是尽力而为
 */
function isShortcutsAvailable() {
  return isIOSDevice() && 'standalone' in navigator;
}

/**
 * 显示快捷指令设置教程
 */
function showShortcutsTutorial() {
  const tutorial = `
📱 如何创建"停车提醒"快捷指令：

1️⃣ 打开iPhone的"快捷指令"APP
2️⃣ 点击右上角"+"创建新快捷指令
3️⃣ 添加以下步骤：

   步骤1: "获取快捷指令输入"
   步骤2: "分割文本"
      - 自定: "|"（竖线符号）
   步骤3: "创建提醒"
      - 时间: 分割文本的第1项
      - 标题: "停车提醒"  
      - 内容: 分割文本的第2项

4️⃣ 命名为："停车提醒"（必须是这个名字）
5️⃣ 点击完成

✅ 设置完成后，APP就能自动设置提醒了！
  `;
  
  alert(tutorial);
}

/**
 * 测试快捷指令是否正常工作
 */
function testShortcuts() {
  const testTime = new Date();
  testTime.setMinutes(testTime.getMinutes() + 2);  // 2分钟后
  
  const testReminder = {
    time: testTime,
    message: '这是一条测试提醒，如果你看到这条通知，说明快捷指令工作正常！',
    isLastReminder: false,
    isCappingReminder: false
  };
  
  setIOSReminder(testReminder);
}

// ======================================================
// 导出函数（浏览器环境）
// ======================================================
if (typeof window !== 'undefined') {
  window.setIOSReminder = setIOSReminder;
  window.isIOSDevice = isIOSDevice;
  window.isShortcutsAvailable = isShortcutsAvailable;
  window.showShortcutsTutorial = showShortcutsTutorial;
  window.testShortcuts = testShortcuts;
}