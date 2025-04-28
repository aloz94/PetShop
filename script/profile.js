/*async function checkLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('אתה לא מחובר. נא להתחבר.');
        window.location.href = '/index.html'; // או לדף התחברות שלך
        return;
    }

    // אפשר בעתיד לשלוח בקשה לשרת לבדוק תקינות הטוקן


    try {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('username').innerText = `ברוך הבא, ${data.user.name}!`;
        } else {
            // 🔥 טוקן לא תקין או פג תוקף
            alert('ההתחברות שלך פגה תוקפה. נא להתחבר שוב.');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Error checking token:', error);
        alert('בעיה באימות ההתחברות. נא להתחבר שוב.');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/index.html';
    }
}*/

async function checkLogin() {
    try {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            credentials: 'include'   // 🔥 חשוב מאוד כדי שהקוקי יישלח אוטומטית
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('username').innerText = `ברוך הבא, ${data.user.name}!`;
        } else {
            alert('ההתחברות שלך פגה תוקפה. נא להתחבר שוב.');
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Error checking token:', error);
        alert('בעיה באימות ההתחברות. נא להתחבר שוב.');
        window.location.href = '/index.html';
    }
}





    // הצגת שם המשתמש אם שמרת אותו בלוקאל סטורג'
    //const username = localStorage.getItem('username') || 'משתמש';
  //  document.getElementById('username').innerText = `ברוך הבא, ${username}!`;



//function logout() {
   // localStorage.removeItem('token');
    //localStorage.removeItem('username');
    //window.location.href = '\index.html'; // חזרה לדף הראשי
//}
async function logout() {
    await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = '/index.html';
}

window.onload = checkLogin;
