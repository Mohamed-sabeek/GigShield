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
    
    // 1. Add const API declaration below imports
    if (!content.includes('const API = import.meta.env.VITE_API_URL')) {
        const importMatch = content.match(/import[\s\S]*?from\s+['"].*?['"];/g);
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            const declaration = '\nconst API = import.meta.env.VITE_API_URL || "http://localhost:5000";';
            content = content.replace(lastImport, lastImport + declaration);
        }
    }

    // 2. Replace the previous inline fallback
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}|\$\{import\.meta\.env\.VITE_API_URL \|\| "http:\/\/localhost:5000"\}/g, '${API}');
    
    fs.writeFileSync(file, content);
    console.log(`Formatted with API variable in: ${path.basename(file)}`);
});
