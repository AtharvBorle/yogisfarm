const fs = require('fs');
const path = require('path');

const emojiPairs = [
  ['📁', '<Folder />', 'Folder'],
  ['🖼️', '<Image size={48} />', 'Image'],
  ['🖼', '<Image size={48} />', 'Image'],
  ['💰', '<DollarSign size={16} />', 'DollarSign'],
  ['🕒', '<Clock size={16} />', 'Clock'],
  ['✏️', '<Edit size={16} />', 'Edit'],
  ['✏', '<Edit size={16} />', 'Edit'],
  ['👁️', '<Eye size={16} />', 'Eye'],
  ['👁', '<Eye size={16} />', 'Eye'],
  ['📄', '<FileText size={16} />', 'FileText'],
  ['🚚', '<Truck size={16} />', 'Truck'],
  ['⚙️', '<Settings size={16} />', 'Settings'],
  ['⚙', '<Settings size={16} />', 'Settings'],
  ['🖨️', '<Printer size={16} />', 'Printer'],
  ['🖨', '<Printer size={16} />', 'Printer'],
  ['☰', '<Menu size={16} />', 'Menu'],
  ['👤', '<User size={16} />', 'User'],
  ['📱', '<Smartphone size={16} />', 'Smartphone'],
  ['✉️', '<Mail size={16} />', 'Mail'],
  ['✉', '<Mail size={16} />', 'Mail'],
  ['📍', '<MapPin size={16} />', 'MapPin'],
  ['📞', '<Phone size={16} />', 'Phone'],
  ['📅', '<Calendar size={16} />', 'Calendar'],
  ['📊', '<BarChart2 size={16} />', 'BarChart2'],
  ['💳', '<CreditCard size={16} />', 'CreditCard'],
  ['📦', '<Package size={16} />', 'Package'],
  ['📝', '<FileText size={16} />', 'FileText'],
  ['🗑️', '<Trash2 size={16} />', 'Trash2'],
  ['🗑', '<Trash2 size={16} />', 'Trash2'],
  ['➕', '<Plus size={16} />', 'Plus'],
  ['✕', '<X size={18} />', 'X'],
  ['▼', '<ChevronDown size={16} />', 'ChevronDown'],
  ['✓', '<Check size={16} />', 'Check'],
  ['🌿', '<Leaf size={16} />', 'Leaf'],
  ['🌱', '<Leaf size={16} color="green" />', 'Leaf'],
  ['❤️', '<Heart size={16} color="red" />', 'Heart'],
  ['❤', '<Heart size={16} color="red" />', 'Heart'],
  ['➜', '<ArrowRight size={16} />', 'ArrowRight'],
  ['→', '<ArrowRight size={16} />', 'ArrowRight'],
  ['←', '<ArrowLeft size={16} />', 'ArrowLeft'],
  ['👋', '<User size={24} />', 'User'],
  ['⏳', '<Clock size={16} />', 'Clock'],
  ['✅', '<CheckCircle size={16} color="green" />', 'CheckCircle'],
  ['📥', '<Inbox size={16} />', 'Inbox'],
  ['🗺️', '<Map size={16} />', 'Map'],
  ['🗺', '<Map size={16} />', 'Map'],
  ['⚠️', '<AlertTriangle size={16} color="orange" />', 'AlertTriangle'],
  ['⚠', '<AlertTriangle size={16} color="orange" />', 'AlertTriangle'],
  ['❌', '<XSquare size={16} color="red" />', 'XSquare']
];

const filesToProcess = [
  'admin/src/components/common/FileManager.jsx',
  'admin/src/pages/Brand.jsx',
  'admin/src/pages/Category.jsx',
  'admin/src/pages/Collections.jsx',
  'admin/src/pages/Order.jsx',
  'admin/src/pages/OrderDetail.jsx',
  'admin/src/pages/Product.jsx',
  'admin/src/pages/Profile.jsx',
  'admin/src/pages/Slider.jsx',
  'frontend/src/pages/About.jsx',
  'frontend/src/pages/Category.jsx',
  'frontend/src/pages/Checkout.jsx',
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/delivery/Dashboard.jsx',
  'frontend/src/pages/delivery/OrderDetails.jsx',
  'frontend/src/pages/Home.jsx',
  'frontend/src/pages/Payment.jsx',
  'frontend/src/pages/TrackOrder.jsx'
];

filesToProcess.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let usedIcons = new Set();
  
  let modified = false;
  emojiPairs.forEach(([emoji, replaceWith, iconName]) => {
    if (content.includes(emoji)) {
      usedIcons.add(iconName);
      content = content.split(emoji).join(replaceWith);
      modified = true;
    }
  });

  if (modified) {
    const importStr = `\nimport { ${Array.from(usedIcons).join(', ')} } from 'react-feather';\n`;
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
        const lineBreakIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, lineBreakIndex + 1) + importStr + content.slice(lineBreakIndex + 1);
    } else {
        content = importStr + content;
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Modified', file);
  }
});
