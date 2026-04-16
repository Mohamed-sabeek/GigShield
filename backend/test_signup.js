async function testSignup() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Worker',
                email: 'worker' + Date.now() + '@test.com',
                password: 'password123',
                phone: '1234567890',
                role: 'worker',
                platform: 'Zomato',
                district: 'Chennai',
                workingArea: 'Adyar',
                averageDailyIncome: 500
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Signup Successful:', data);
        } else {
            console.error('Signup Failed:', data);
        }
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

testSignup();
