const fs = require('fs');

const files = [
  'src/components/BookAppointmentModal.tsx',
  'src/components/BrowsePartsModal.tsx',
  'src/components/MechanicsModal.tsx',
  'src/components/ViewAppointmentsModal.tsx',
  'src/components/ServiceHistoryModal.tsx',
  'src/components/CustomerSettingsModal.tsx',
  'src/components/AddMechanicModal.tsx',
  'src/components/CustomerPortalModal.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Background and borders
  content = content.replace(/bg-slate-900/g, 'bg-[#111111]');
  content = content.replace(/bg-\\[#0f172a\\]/g, 'bg-[#111111]');
  content = content.replace(/bg-slate-800\/30|bg-slate-800\/40|bg-slate-800|bg-\\[#1e293b\\]/g, 'bg-[#161616]');
  content = content.replace(/border-slate-700\/30|border-slate-700\/40|border-slate-700/g, 'border-[rgba(255,255,255,0.07)]');
  content = content.replace(/hover:border-slate-600\/50|hover:border-slate-600/g, 'hover:border-[rgba(255,255,255,0.2)]');
  
  // Texts
  content = content.replace(/text-slate-400|text-slate-300\/70/g, 'text-[#6b6b6b]');
  content = content.replace(/text-slate-500/g, 'text-[#555555]');
  content = content.replace(/text-slate-600/g, 'text-[#444444]');
  
  // Accents (blue to red theme)
  content = content.replace(/text-blue-400|text-blue-500/g, 'text-[#d63a2f]');
  content = content.replace(/bg-blue-600/g, 'bg-[#d63a2f]');
  content = content.replace(/hover:bg-blue-700|hover:bg-\\[#ea580c\\]/g, 'hover:bg-[#c0322a]');
  content = content.replace(/shadow-blue-600\/25|shadow-blue-500\/10|shadow-blue-500\/20/g, 'shadow-[#d63a2f]/25');
  content = content.replace(/bg-blue-500\/10|bg-blue-500\/15|bg-blue-500\/50/g, 'bg-[#d63a2f]/10');
  content = content.replace(/border-blue-500\/30|border-blue-500\/50/g, 'border-[#d63a2f]/50');

  // Other Accents (emerald)
  content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-[#c0322a]');
  content = content.replace(/shadow-emerald-600\/25/g, 'shadow-[#d63a2f]/25');
  content = content.replace(/text-emerald-400/g, 'text-[#d63a2f]');
  content = content.replace(/bg-emerald-500\/15|bg-emerald-500\/30/g, 'bg-[#d63a2f]/10');
  content = content.replace(/border-emerald-500\/30/g, 'border-[#d63a2f]/50');
  content = content.replace(/bg-emerald-500|bg-emerald-600/g, 'bg-[#d63a2f]');
  content = content.replace(/text-emerald-500/g, 'text-[#d63a2f]');

  content = content.replace(/from-blue-500 to-indigo-600/g, 'from-[#d63a2f] to-[#c0322a]');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
