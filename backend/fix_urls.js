const fs = require('fs');
const path = require('path');

const files = [
    'd:\\GigShield\\frontend\\src\\pages\\WorkerDashboard.jsx',
    'd:\\GigShield\\frontend\\src\\pages\\Policies.jsx',
    'd:\\GigShield\\frontend\\src\\pages\\ClaimRequests.jsx',
    'd:\\GigShield\\frontend\\src\\pages\\ClaimPolicy.jsx',
    'd:\\GigShield\\frontend\\src\\pages\\AdminDashboard.jsx',
    'd:\\GigShield\\frontend\\src\\context\\AuthContext.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace hardcoded url strings while swapping quotes to backticks
    // Matches 'http://localhost:5000(.*?)' or "http://localhost:5000(.*?)"
    content = content.replace(/['"]http:\/\/localhost:5000(.*?)['"]/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
    
    fs.writeFileSync(file, content);
    console.log(`Updated URLs in: ${path.basename(file)}`);
});
