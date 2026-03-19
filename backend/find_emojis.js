const fs = require('fs');
const path = require('path');

const filePath = 'd:\\GigShield\\frontend\\src\\pages\\ClaimPolicy.jsx';
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
lines.forEach((line, index) => {
    // Regex for emojis and non-ascii
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}✅⚠️]/gu;
    if (emojiRegex.test(line)) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
