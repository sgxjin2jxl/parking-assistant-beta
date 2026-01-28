// ======================================================
// 停车场数据文件 - parkingLots.js
// ======================================================
// 这个文件存储了宁波市14个常去停车场的收费规则和提醒策略
// 每个停车场都有：
// 1. 基本信息（ID、名称）
// 2. 收费规则（分段计费）
// 3. 封顶价格
// 4. 提醒策略（第一次提醒时间、提醒间隔）
// ======================================================

/**
 * 停车场数据结构说明：
 * 
 * {
 *   id: 数字,                    // 停车场唯一标识
 *   name: "停车场名称",
 *   rules: [                      // 收费规则数组（按时间顺序）
 *     {
 *       duration: 30,             // 时长（分钟）
 *       price: 0,                 // 价格（元）
 *       type: "free"              // 类型：free(免费) / flat(固定) / hourly(按小时)
 *     }
 *   ],
 *   maxPrice: 15,                 // 封顶价格（元），null表示不封顶
 *   reminderStrategy: {
 *     firstReminderTime: 90,      // 第一次提醒时间（分钟）
 *     interval: 60,               // 后续提醒间隔（分钟）
 *     maxCount: 3                 // 最多提醒次数（不含封顶提醒）
 *   }
 * }
 */

const PARKING_LOTS = [
  // ==================== 1. 金融硅谷 ====================
  {
    id: 1,
    name: "金融硅谷",
    description: "前30分钟免费，3元/小时，15元封顶",
    rules: [
      {
        duration: 30,      // 前30分钟
        price: 0,          // 免费
        type: "free",
        description: "免费时段"
      },
      {
        duration: 60,      // 之后每60分钟（每小时）
        price: 3,          // 3元
        type: "hourly",
        description: "3元/小时"
      }
    ],
    maxPrice: 15,          // 15元封顶
    reminderStrategy: {
      firstReminderTime: 90,   // 第一次提醒：1.5小时（30分钟免费 + 60分钟第一个小时）
      interval: 60,            // 之后每隔1小时提醒
      maxCount: 3              // 最多提醒3次
    }
  },

  // ==================== 2. 文化广场 ====================
  {
    id: 2,
    name: "文化广场",
    description: "前1小时免费，3元/小时，20元封顶",
    rules: [
      {
        duration: 60,      // 前1小时
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 60,      // 之后每小时
        price: 3,
        type: "hourly",
        description: "3元/小时"
      }
    ],
    maxPrice: 20,
    reminderStrategy: {
      firstReminderTime: 120,  // 第一次提醒：2小时
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 3. 市民广场地下停车场 ====================
  {
    id: 3,
    name: "市民广场地下停车场",
    description: "前1小时免费，1-2小时3元，超出后2元/小时",
    rules: [
      {
        duration: 60,      // 前1小时
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 60,      // 1-2小时
        price: 3,
        type: "flat",      // 固定费用（1-2小时总共3元）
        description: "1-2小时固定3元"
      },
      {
        duration: 60,      // 超出2小时后，每小时
        price: 2,
        type: "hourly",
        description: "2元/小时"
      }
    ],
    maxPrice: null,        // 不封顶
    reminderStrategy: {
      firstReminderTime: 120,  // 第一次提醒：2小时
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 4. 阪急地下停车场 ====================
  {
    id: 4,
    name: "阪急地下停车场",
    description: "前30分钟免费，3元/30分钟",
    rules: [
      {
        duration: 30,      // 前30分钟
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 30,      // 之后每30分钟
        price: 3,
        type: "hourly",    // 虽然是30分钟计费，但用hourly类型，duration设为30
        description: "3元/30分钟"
      }
    ],
    maxPrice: null,
    reminderStrategy: {
      firstReminderTime: 60,   // 第一次提醒：1小时（30分钟免费 + 30分钟第一档）
      interval: 60,            // 统一按1小时间隔提醒（不是30分钟，避免太频繁）
      maxCount: 3
    }
  },

  // ==================== 5. 宏泰广场地下停车场 ====================
  {
    id: 5,
    name: "宏泰广场地下停车场",
    description: "前1小时免费，1-3小时5元，超出后5元/小时，45元封顶",
    rules: [
      {
        duration: 60,      // 前1小时
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 120,     // 1-3小时（总共120分钟）
        price: 5,
        type: "flat",      // 固定费用
        description: "1-3小时固定5元"
      },
      {
        duration: 60,      // 超出3小时后，每小时
        price: 5,
        type: "hourly",
        description: "5元/小时"
      }
    ],
    maxPrice: 45,
    reminderStrategy: {
      firstReminderTime: 180,  // 第一次提醒：3小时（60分钟免费 + 120分钟5元）
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 6. 和义大道地下停车场 ====================
  {
    id: 6,
    name: "和义大道地下停车场",
    description: "前30分钟免费，30分钟-2小时5元，超出后4元/小时，25元封顶",
    rules: [
      {
        duration: 30,      // 前30分钟
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 90,      // 30分钟-2小时（总共90分钟）
        price: 5,
        type: "flat",
        description: "30分钟-2小时固定5元"
      },
      {
        duration: 60,      // 超出2小时后，每小时
        price: 4,
        type: "hourly",
        description: "4元/小时"
      }
    ],
    maxPrice: 25,
    reminderStrategy: {
      firstReminderTime: 120,  // 第一次提醒：2小时
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 7. 江北来福士广场 ====================
  {
    id: 7,
    name: "江北来福士广场",
    description: "前30分钟免费，5元/小时，50元封顶",
    rules: [
      {
        duration: 30,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 60,
        price: 5,
        type: "hourly",
        description: "5元/小时"
      }
    ],
    maxPrice: 50,
    reminderStrategy: {
      firstReminderTime: 90,   // 第一次提醒：1.5小时
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 8. 绿地缤纷城 ====================
  {
    id: 8,
    name: "绿地缤纷城",
    description: "前30分钟免费，30分钟-2小时5元，超出后5元/小时，50元封顶",
    rules: [
      {
        duration: 30,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 90,      // 30分钟-2小时
        price: 5,
        type: "flat",
        description: "30分钟-2小时固定5元"
      },
      {
        duration: 60,
        price: 5,
        type: "hourly",
        description: "5元/小时"
      }
    ],
    maxPrice: 50,
    reminderStrategy: {
      firstReminderTime: 120,  // 第一次提醒：2小时
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 9. 钻石商业广场停车场 ====================
  {
    id: 9,
    name: "钻石商业广场停车场",
    description: "前30分钟免费，30分钟-2小时5元，超出后2元/小时，30元封顶",
    rules: [
      {
        duration: 30,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 90,
        price: 5,
        type: "flat",
        description: "30分钟-2小时固定5元"
      },
      {
        duration: 60,
        price: 2,
        type: "hourly",
        description: "2元/小时"
      }
    ],
    maxPrice: 30,
    reminderStrategy: {
      firstReminderTime: 120,
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 10. 老外滩美术馆 ====================
  {
    id: 10,
    name: "老外滩美术馆",
    description: "前30分钟免费，30分钟-2小时3元，超出后2元/小时，12元封顶",
    rules: [
      {
        duration: 30,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 90,
        price: 3,
        type: "flat",
        description: "30分钟-2小时固定3元"
      },
      {
        duration: 60,
        price: 2,
        type: "hourly",
        description: "2元/小时"
      }
    ],
    maxPrice: 12,
    reminderStrategy: {
      firstReminderTime: 120,
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 11. 1844和义艺术中心停车场 ====================
  {
    id: 11,
    name: "1844和义艺术中心停车场",
    description: "前15分钟免费，15分钟-1小时5元，超出后5元/小时，60元封顶",
    rules: [
      {
        duration: 15,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 45,      // 15分钟-1小时（45分钟）
        price: 5,
        type: "flat",
        description: "15分钟-1小时固定5元"
      },
      {
        duration: 60,
        price: 5,
        type: "hourly",
        description: "5元/小时"
      }
    ],
    maxPrice: 60,
    reminderStrategy: {
      firstReminderTime: 60,   // 第一次提醒：1小时
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 12. 宁波银泰大厦地面停车场 ====================
  {
    id: 12,
    name: "宁波银泰大厦地面停车场",
    description: "前30分钟免费，30分钟-1小时5元，超出后5元/小时，30元封顶",
    rules: [
      {
        duration: 30,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 30,      // 30分钟-1小时
        price: 5,
        type: "flat",
        description: "30分钟-1小时固定5元"
      },
      {
        duration: 60,
        price: 5,
        type: "hourly",
        description: "5元/小时"
      }
    ],
    maxPrice: 30,
    reminderStrategy: {
      firstReminderTime: 60,   // 第一次提醒：1小时
      interval: 60,
      maxCount: 3
    }
  },

  // ==================== 13. 东钱湖十里四香（钱湖秘境）停车场 ====================
  {
    id: 13,
    name: "东钱湖十里四香（钱湖秘境）停车场",
    description: "前30分钟免费，超出后10元/车（一次性）",
    rules: [
      {
        duration: 30,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: Infinity,    // 之后无论多久都是10元（一次性收费）
        price: 10,
        type: "flat",
        description: "10元/车（一次性）"
      }
    ],
    maxPrice: 10,              // 最多10元
    reminderStrategy: {
      firstReminderTime: 20,   // 第一次提醒：20分钟（30分钟前10分钟）
      interval: 60,            // 之后不需要提醒（一次性收费）
      maxCount: 1              // 只提醒1次
    }
  },

  // ==================== 14. 东钱湖韩岭老街停车场 ====================
  {
    id: 14,
    name: "东钱湖韩岭老街停车场",
    description: "前30分钟免费，30分钟-2小时5元，超出后3元/小时，20元封顶",
    rules: [
      {
        duration: 30,
        price: 0,
        type: "free",
        description: "免费时段"
      },
      {
        duration: 90,
        price: 5,
        type: "flat",
        description: "30分钟-2小时固定5元"
      },
      {
        duration: 60,
        price: 3,
        type: "hourly",
        description: "3元/小时"
      }
    ],
    maxPrice: 20,
    reminderStrategy: {
      firstReminderTime: 120,
      interval: 60,
      maxCount: 3
    }
  }
];

// ======================================================
// 工具函数：根据ID查找停车场
// ======================================================
function getParkingLotById(id) {
  return PARKING_LOTS.find(lot => lot.id === id);
}

// ======================================================
// 工具函数：计算停车费用
// ======================================================
/**
 * 计算停车费用
 * @param {Object} parkingLot - 停车场对象
 * @param {number} minutes - 已停时长（分钟）
 * @returns {number} - 停车费用（元）
 */
function calculateFee(parkingLot, minutes) {
  let totalFee = 0;
  let remainingMinutes = minutes;

  // 遍历每个收费规则，逐段计算
  for (let rule of parkingLot.rules) {
    if (remainingMinutes <= 0) break;

    if (rule.type === "free") {
      // 免费时段，跳过
      remainingMinutes -= rule.duration;
    } else if (rule.type === "flat") {
      // 固定费用（比如"1-3小时5元"）
      totalFee += rule.price;
      remainingMinutes -= rule.duration;
    } else if (rule.type === "hourly") {
      // 按小时（或其他周期）计费
      // 向上取整：停了61分钟按2小时算
      const cycles = Math.ceil(remainingMinutes / rule.duration);
      totalFee += cycles * rule.price;
      remainingMinutes = 0;  // 已经计算完所有剩余时间
    }
  }

  // 封顶处理
  if (parkingLot.maxPrice !== null && totalFee > parkingLot.maxPrice) {
    totalFee = parkingLot.maxPrice;
  }

  return totalFee;
}

// ======================================================
// 工具函数：计算提醒时间点
// ======================================================
/**
 * 计算所有提醒时间点
 * @param {Object} parkingLot - 停车场对象
 * @param {Date} startTime - 开始停车时间
 * @returns {Array} - 提醒时间点数组
 */
function calculateReminderTimes(parkingLot, startTime) {
  const reminders = [];
  const strategy = parkingLot.reminderStrategy;

  // 第1步：计算常规提醒（最多3次）
  for (let i = 0; i < strategy.maxCount; i++) {
    const reminderMinutes = strategy.firstReminderTime + (i * strategy.interval) - 10;  // 提前10分钟
    const reminderTime = new Date(startTime.getTime() + reminderMinutes * 60 * 1000);
    
    // 计算此时的费用和下一小时的费用
    const currentFee = calculateFee(parkingLot, strategy.firstReminderTime + (i * strategy.interval));
    const nextHourFee = calculateFee(parkingLot, strategy.firstReminderTime + ((i + 1) * strategy.interval));
    
    reminders.push({
      time: reminderTime,
      message: i === strategy.maxCount - 1 
        ? `已停${Math.floor((strategy.firstReminderTime + (i * strategy.interval)) / 60)}小时，当前费用${currentFee}元。⚠️ 这是最后一次提醒，之后不会再打扰你。`
        : `已停${Math.floor((strategy.firstReminderTime + (i * strategy.interval)) / 60)}小时，当前费用${currentFee}元，再停1小时会变成${nextHourFee}元`,
      isLastReminder: i === strategy.maxCount - 1,
      isCappingReminder: false
    });
  }

  // 第2步：如果有封顶，计算封顶提醒
  if (parkingLot.maxPrice !== null) {
    // 找到到达封顶的时间
    let cappingMinutes = 0;
    
    // 模拟计费直到到达封顶
    for (let min = 1; min <= 1440; min++) {  // 最多计算24小时
      const fee = calculateFee(parkingLot, min);
      if (fee >= parkingLot.maxPrice) {
        cappingMinutes = min;
        break;
      }
    }

    // 如果封顶时间在第3次提醒之后，添加封顶提醒
    const lastReminderMinutes = strategy.firstReminderTime + ((strategy.maxCount - 1) * strategy.interval);
    if (cappingMinutes > lastReminderMinutes + 30) {  // 至少在最后一次提醒30分钟后
      const cappingReminderTime = new Date(startTime.getTime() + (cappingMinutes - 10) * 60 * 1000);
      reminders.push({
        time: cappingReminderTime,
        message: `快到${parkingLot.maxPrice}元封顶了，之后停多久都是${parkingLot.maxPrice}元，可以放心继续停`,
        isLastReminder: false,
        isCappingReminder: true
      });
    }
  }

  return reminders;
}

// ======================================================
// 导出（如果在浏览器环境中使用）
// ======================================================
// 注意：在浏览器中，这些会成为全局变量
// 如果使用模块化（ES6 modules），可以用 export
if (typeof window !== 'undefined') {
  window.PARKING_LOTS = PARKING_LOTS;
  window.getParkingLotById = getParkingLotById;
  window.calculateFee = calculateFee;
  window.calculateReminderTimes = calculateReminderTimes;
}