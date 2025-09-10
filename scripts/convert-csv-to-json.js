const fs = require('fs');
const path = require('path');

// 读取CSV数据
const csvPath = path.join(__dirname, '../public/hollow_knight_silksong_checklist.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');

// 手动解析CSV行，处理引号内的逗号
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

const headers = parseCSVLine(lines[0]);
console.log('📋 CSV Headers:', headers);

// 解析CSV数据
const data = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  if (values.length >= 9) {
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.replace(/^"/, '').replace(/"$/, '') || '';
    });
    data.push(row);
  }
}

console.log(`📊 解析了 ${data.length} 条数据记录`);

// 按Category分组
const groupedData = {};
data.forEach(item => {
  const category = item.Category || 'Unknown';
  if (!groupedData[category]) {
    groupedData[category] = [];
  }
  groupedData[category].push(item);
});

console.log('🗂️ 类别分组:', Object.keys(groupedData));

// 类别映射和描述
const categoryMap = {
  'Bosses': {
    id: 'bosses',
    title: 'Bosses',
    description: 'Defeat all the powerful bosses in Hollow Knight: Silksong'
  },
  'Tools': {
    id: 'tools', 
    title: 'Tools',
    description: 'Collect and utilize various tools for combat, survival and exploration'
  },
  'Crests': {
    id: 'crests',
    title: 'Crests', 
    description: 'Discover and master different combat crests that define your playstyle'
  },
  'Abilities': {
    id: 'abilities',
    title: 'Abilities',
    description: 'Master essential abilities and arts for exploration and combat'
  },
  'Mask Shards': {
    id: 'mask-shards',
    title: 'Mask Shards',
    description: 'Collect mask shards to increase your health (4 shards = 1 health mask)'
  },
  'Spool Fragments': {
    id: 'spool-fragments', 
    title: 'Spool Fragments',
    description: 'Collect spool fragments to extend silk capacity beyond 9 rings'
  },
  'Items': {
    id: 'items',
    title: 'Items', 
    description: 'Discover and collect special items, equipment, and crafting materials'
  },
  'Areas': {
    id: 'areas',
    title: 'Areas',
    description: 'Explore and master all the diverse regions of Pharloom'
  },
  'NPCs': {
    id: 'npcs',
    title: 'NPCs',
    description: 'Meet and interact with various characters throughout Pharloom'  
  },
  'Quests': {
    id: 'quests',
    title: 'Quests',
    description: 'Complete various quests and challenges throughout your journey'
  }
};

// 生成JSON结构
const categories = [];

// 生成每个类别
Object.keys(categoryMap).forEach(categoryName => {
  if (groupedData[categoryName]) {
    const categoryInfo = categoryMap[categoryName];
    const items = groupedData[categoryName].map((item, index) => {
      const itemName = item['Item Name'] || 'Unknown Item';
      const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      return {
        id: slugify(itemName),
        name: item['Item Name'] || '',
        description: item['Description'] || '',
        location: item['Location'] || '',
        type: item['Type/Subtype'] || '',
        requiredFor: item['Required for'] || '',
        reward: item['Reward'] || '',
        mandatory: item['Mandatory/Optional'] || '',
        source: item['Source'] || '',
        completed: false
      };
    });
    
    categories.push({
      id: categoryInfo.id,
      title: categoryInfo.title,
      description: categoryInfo.description,
      items: items
    });
    
    console.log(`✅ ${categoryInfo.title}: ${items.length} 项目`);
  }
});

// 写入JSON文件
const outputPath = path.join(__dirname, '../data/checklist.json');
fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2));

console.log(`\n🎉 转换完成！`);
console.log(`📁 生成了 ${categories.length} 个类别`);
console.log(`📋 总共 ${categories.reduce((sum, cat) => sum + cat.items.length, 0)} 个项目`);
console.log(`📄 输出文件: ${outputPath}`);

// 验证所有9个字段都包含了
console.log('\n🔍 验证字段完整性:');
const sampleItem = categories[0].items[0];
const expectedFields = ['id', 'name', 'description', 'location', 'type', 'requiredFor', 'reward', 'mandatory', 'source', 'completed'];
console.log('✅ 示例项目字段:', Object.keys(sampleItem));
console.log('✅ 包含所有必需字段:', expectedFields.every(field => sampleItem.hasOwnProperty(field)));

