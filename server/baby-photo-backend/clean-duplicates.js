const { PrismaClient } = require('./generated/prisma');

async function cleanDuplicates() {
  const prisma = new PrismaClient();
  
  try {
    // 找出重复的时间段
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
        { id: 'asc' } // 按ID排序，保留最早的记录
      ]
    });
    
    const seen = new Set();
    const toDelete = [];
    
    timeSlots.forEach(slot => {
      const key = `${slot.date.toISOString().split('T')[0]}-${slot.startTime}`;
      if (seen.has(key)) {
        toDelete.push(slot.id);
        console.log(`标记删除重复记录: ID ${slot.id}, 日期: ${slot.date.toISOString().split('T')[0]}, 时间: ${slot.startTime}`);
      } else {
        seen.add(key);
      }
    });
    
    if (toDelete.length > 0) {
      console.log(`准备删除 ${toDelete.length} 条重复记录`);
      
      // 删除重复记录
      const result = await prisma.timeSlot.deleteMany({
        where: {
          id: {
            in: toDelete
          }
        }
      });
      
      console.log(`成功删除 ${result.count} 条重复记录`);
    } else {
      console.log('没有发现需要删除的重复记录');
    }
    
  } catch (error) {
    console.error('清理失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicates();
