/* eslint-disable */
const { PrismaClient } = require('./generated/prisma');

async function checkDuplicates() {
  const prisma = new PrismaClient();
  
  try {
    // 获取所有时间段数据
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
    
    console.log('所有时间段数据：');
    timeSlots.forEach(slot => {
      console.log(`ID: ${slot.id}, 日期: ${slot.date.toISOString().split('T')[0]}, 开始时间: ${slot.startTime}, 结束时间: ${slot.endTime}, 已预订: ${slot.isBooked}`);
    });
    
    // 检查重复
    const duplicates = {};
    timeSlots.forEach(slot => {
      const key = `${slot.date.toISOString().split('T')[0]}-${slot.startTime}`;
      if (duplicates[key]) {
        duplicates[key].push(slot);
      } else {
        duplicates[key] = [slot];
      }
    });
    
    const hasDuplicates = Object.values(duplicates).some(group => group.length > 1);
    
    if (hasDuplicates) {
      console.log('\n发现重复数据：');
      Object.entries(duplicates).forEach(([key, slots]) => {
        if (slots.length > 1) {
          console.log(`重复的时间段: ${key}`);
          slots.forEach(slot => {
            console.log(`  - ID: ${slot.id}, 已预订: ${slot.isBooked}`);
          });
        }
      });
    } else {
      console.log('\n没有发现重复数据');
    }
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
