// Prison Return Management System - Version 1.2.0
// Developed by OboteSofTech

// Data structures
const returnsData = {
    monthly: [
        "Staff Nominal Roll", "Staff Causality", "Staff Strength", "Staff SACCO Membership", "PF 1",
        "Prisoners Statistics", "Normal Releases", "Death of Prisoners", "Death of Staff", "Escape",
        "Recapture", "Search", "Prisoners' Ration", "NTR", "Arms & Ammunitions", "Public Complaint",
        "Bricks Activities", "Progressive Afforestation", "Progressive Farm Production",
        "Foreigners (CON & REM)", "Ary Prisoners", "Court Operations", "Donations", "Intelligence"
    ],
    quarterly: [
        "PF 30", "Recidivists", "Adm & Disc Board", "Released Prisoners", "Staff & Prisoners HR",
        "Welfare & Rehab", "NGO Activities", "Homosexuality", "High Risks Prisoners",
        "Accountabilities", "Requisition For Prs Due for Release"
    ],
    annual: [
        "PF 24", "PSF4 (PO II & Above And Civilian Officers)", "Annual Report"
    ]
};

let currentUser = null;

// Notification system
function playBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Fallback: try to play an audio file if available
        console.log('Web Audio API not supported, using fallback');
    }
}

function showNotification(message, station) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <strong>New Return Submitted</strong><br>
            <span>Station: ${station}</span><br>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Play beep
    playBeep();

    // Close button - notification persists until clicked
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

function checkForNewReturns() {
    const lastCheck = localStorage.getItem('lastReturnCheck');
    const currentReturns = JSON.parse(localStorage.getItem('returns') || '[]');
    const currentCount = currentReturns.length;

    if (lastCheck && parseInt(lastCheck) < currentCount) {
        // New returns were added
        const newReturns = currentReturns.slice(parseInt(lastCheck));
        newReturns.forEach(returnItem => {
            const message = `Return Type: ${returnItem.returnType.replace(/-/g, ' ')} (${returnItem.frequency})`;
            showNotification(message, returnItem.station);
        });
    }

    localStorage.setItem('lastReturnCheck', currentCount.toString());
}

// Listen for storage changes (works across tabs)
window.addEventListener('storage', function(e) {
    if (e.key === 'returns') {
        checkForNewReturns();
    }
});

// Authentication
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const submitReturnForm = document.getElementById('submitReturnForm');
    if (submitReturnForm) {
        submitReturnForm.addEventListener('submit', handleSubmitReturn);
        document.getElementById('frequency').addEventListener('change', updateReturnTypes);
    }

    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleFileUpload);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const backToDashboardBtns = document.querySelectorAll('#backToDashboard');
    backToDashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => window.location.href = 'dashboard.html');
    });

    // Initialize notification checking for all pages
    checkForNewReturns();

    // Load dashboard content
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboard();
    }

    // Load returns list
    if (window.location.pathname.includes('view-returns.html')) {
        loadReturns();
        const searchInput = document.getElementById('searchReturns');
        if (searchInput) {
            searchInput.addEventListener('input', filterReturns);
        }
        const sortSelect = document.getElementById('sortReturns');
        if (sortSelect) {
            sortSelect.addEventListener('change', sortReturns);
        }
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', exportReturnsToCsv);
        }
    }

    // Check if user is logged in
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser && !window.location.pathname.includes('dashboard.html') && !window.location.pathname.includes('submit-return.html') && !window.location.pathname.includes('view-returns.html') && !window.location.pathname.includes('user-management.html')) {
        window.location.href = 'dashboard.html';
    } else if (!loggedInUser && (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('submit-return.html') || window.location.pathname.includes('view-returns.html') || window.location.pathname.includes('user-management.html'))) {
        window.location.href = 'index.html';
    }

    // Initialize chat functionality
    initializeChat();

    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    }

    // Initialize user management functionality
    if (window.location.pathname.includes('user-management.html')) {
        loadUserManagement();
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', handleCreateUser);
        }
        const toggleUserForm = document.getElementById('toggleUserForm');
        if (toggleUserForm) {
            toggleUserForm.addEventListener('click', toggleUserFormSection);
        }
    }
});

function initializeDefaultAccounts() {
    const storedUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');

    // Pre-populate admin and PHQ-KLA accounts if they don't exist
    if (!storedUsers['admin@prison.go.ug']) {
        storedUsers['admin@prison.go.ug'] = {
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
    }

    if (!storedUsers['phq-kla@prison.go.ug']) {
        storedUsers['phq-kla@prison.go.ug'] = {
            password: 'phqkla123',
            role: 'phq-kla',
            createdAt: new Date().toISOString()
        };
    }

    localStorage.setItem('systemUsers', JSON.stringify(storedUsers));
}

function handleForgotPassword() {
    const email = prompt('Enter your email address to reset password:');
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');

    if (storedUsers[email]) {
        // For demo purposes, show the password. In a real app, this would send an email
        alert(`Password reset: Your password is "${storedUsers[email].password}". Please change it after logging in.`);
    } else {
        alert('Email address not found in the system.');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Initialize default accounts on first login attempt
    initializeDefaultAccounts();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        alert('Please enter a valid Google Account email address');
        return;
    }

    // Simple authentication (in a real app, this would be server-side)
    if (username && password && role) {
        // Check if user credentials exist, if not create them
        const storedUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');

        // For clerk, receptionist, officer roles, check if they belong to a station
        if (['clerk', 'receptionist', 'officer'].includes(role)) {
            const userStation = getUserStation({ username });
            if (userStation === 'Default Station') {
                alert('This email is not authorized for any station. Please contact your administrator.');
                return;
            }
        }

        // If user doesn't exist, create them
        if (!storedUsers[username]) {
            storedUsers[username] = {
                password: password,
                role: role,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('systemUsers', JSON.stringify(storedUsers));
        } else {
            // Check if password matches
            if (storedUsers[username].password !== password) {
                alert('Incorrect password');
                return;
            }
            // Check if role matches (prevent role switching)
            if (storedUsers[username].role !== role) {
                alert('This email is registered with a different role. Please select the correct role.');
                return;
            }
        }

        currentUser = { username, role };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'dashboard.html';
    } else {
        alert('Please fill in all fields');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

function loadDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    const dashboardContent = document.getElementById('dashboardContent');
    dashboardContent.innerHTML = '';

    // Show User Management link for admin and phq-kla
    const userManagementLink = document.getElementById('userManagementLink');
    if (userManagementLink && (user.role === 'phq-kla' || user.role === 'admin')) {
        userManagementLink.style.display = 'block';
        const manageUsersBtn = document.getElementById('manageUsersBtn');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', () => window.location.href = 'user-management.html');
        }
    }

    if (user.role === 'phq-kla' || user.role === 'admin') {
        // PHQ-KLA and Admin can view all returns
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View All Returns';
        viewBtn.addEventListener('click', () => window.location.href = 'view-returns.html');
        dashboardContent.appendChild(viewBtn);
    } else {
        // Other roles can submit returns
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit Return';
        submitBtn.addEventListener('click', () => window.location.href = 'submit-return.html');
        dashboardContent.appendChild(submitBtn);

        // Allow viewing their own submissions
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View My Returns';
        viewBtn.addEventListener('click', () => window.location.href = 'view-returns.html');
        dashboardContent.appendChild(viewBtn);
    }
}

function updateReturnTypes() {
    const frequency = document.getElementById('frequency').value;
    const returnTypeSelect = document.getElementById('returnType');
    returnTypeSelect.innerHTML = '<option value="">Select Return Type</option>';

    if (frequency && returnsData[frequency]) {
        returnsData[frequency].forEach(returnType => {
            const option = document.createElement('option');
            option.value = returnType.toLowerCase().replace(/\s+/g, '-');
            option.textContent = returnType;
            returnTypeSelect.appendChild(option);
        });
    }
}

function handleSubmitReturn(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const frequency = document.getElementById('frequency').value;
    const returnType = document.getElementById('returnType').value;
    const station = document.getElementById('station').value;
    const data = document.getElementById('data').value;
    const comment = document.getElementById('comment').value;

    // Check if user is restricted to a specific station
    const userStation = getUserStation(user);
    if (userStation && userStation !== 'Default Station' && station !== userStation) {
        alert(`You are only authorized to submit returns for station: ${userStation}`);
        return;
    }

    // Allow submission if either data or file is provided
    if (frequency && returnType && station && (data || window.selectedFile)) {
        const currentSubmission = {
            frequency,
            returnType,
            station,
            data,
            fileName: window.selectedFile ? window.selectedFile.name : null
        };

        // Check for consecutive same submissions
        const lastSubmission = JSON.parse(localStorage.getItem('lastSubmission') || 'null');
        let attemptCount = parseInt(localStorage.getItem('attemptCount') || '0');

        const isSame = lastSubmission &&
            lastSubmission.frequency === currentSubmission.frequency &&
            lastSubmission.returnType === currentSubmission.returnType &&
            lastSubmission.station === currentSubmission.station &&
            lastSubmission.data === currentSubmission.data &&
            lastSubmission.fileName === currentSubmission.fileName;

        if (isSame) {
            attemptCount++;
            if (attemptCount >= 3) {
                // Beep warning
                alert('Warning: You have submitted the same return 3 times. Please review your submission.');
            }
            localStorage.setItem('attemptCount', attemptCount.toString());
            localStorage.setItem('lastSubmission', JSON.stringify(currentSubmission));
        } else {
            localStorage.setItem('attemptCount', '0');
            localStorage.setItem('lastSubmission', JSON.stringify(currentSubmission));
        }

        const returnItem = {
            id: Date.now(),
            frequency,
            returnType,
            station,
            data,
            comment,
            submittedBy: user.username,
            submittedAt: new Date().toISOString(),
            status: 'pending', // For PHQ-KLA to review
            file: window.selectedFile ? {
                name: window.selectedFile.name,
                type: window.selectedFile.type,
                size: window.selectedFile.size,
                data: null // Will store base64 later
            } : null
        };

        // If there's a file, read it as base64 for storage
        if (window.selectedFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                returnItem.file.data = e.target.result;
                saveReturn(returnItem);
            };
            reader.readAsDataURL(window.selectedFile);
        } else {
            saveReturn(returnItem);
        }
    } else {
        alert('Please fill in all required fields and provide either return data or upload a file');
    }
}

function saveReturn(returnItem) {
    const returns = JSON.parse(localStorage.getItem('returns') || '[]');
    returns.push(returnItem);
    localStorage.setItem('returns', JSON.stringify(returns));

    // Clear the selected file and form fields for next submission
    window.selectedFile = null;
    document.getElementById('fileUpload').value = '';
    document.getElementById('data').value = '';
    document.getElementById('comment').value = '';

    alert('Return submitted successfully!');
    // Stay on the page to allow another submission
}

function handleFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    // Store the file for later use in submission
    window.selectedFile = file;
    alert('File selected successfully. It will be attached to the return.');
}

function getUserStation(user) {
    // Station restriction mapping - each email can only submit for one specific station
    // Clerk, Receptionist, and Officer in Charge roles share the same email and password per station
    const stationMapping = {
        // Prison Units - All three roles (clerk, receptionist, officer) use the same email per station
        'maxpri_upper@prison.go.ug': 'MaxPri Upper',
        'm_bay_pri@prison.go.ug': 'M-Bay Pri',
        'luzira_w@prison.go.ug': 'Luzira (W)',
        'kigo_m@prison.go.ug': 'Kigo (M)',
        'kigo_w@prison.go.ug': 'Kigo (W)',
        'masaka_m@prison.go.ug': 'Masaka (M)',
        'masaka_w@prison.go.ug': 'Masaka (W)',
        'mbale_m@prison.go.ug': 'Mbale (M)',
        'mbale_w@prison.go.ug': 'Mbale (W)',
        'lira_m@prison.go.ug': 'Lira (M)',
        'lira_w@prison.go.ug': 'Lira (W)',
        'arua_m@prison.go.ug': 'Arua (M)',
        'arua_w@prison.go.ug': 'Arua (W)',
        'mbarara_m@prison.go.ug': 'Mbarara (M)',
        'mbarara_w@prison.go.ug': 'Mbarara (W)',
        'gulu_m@prison.go.ug': 'Gulu (M)',
        'gulu_w@prison.go.ug': 'Gulu (W)',

        // District Prisons - All three roles use the same email per station
        'masaka_dist@prison.go.ug': 'Masaka',
        'mbarara_dist@prison.go.ug': 'Mbarara',
        'arua_dist@prison.go.ug': 'Arua',
        'bushe_zone@prison.go.ug': 'Bushe Zone',
        'ibanda_zone@prison.go.ug': 'IBANDA ZONE',
        'kalungu@prison.go.ug': 'Kalungu',
        'dpc_luweero@prison.go.ug': 'DPC Luweero',
        'dpc_wakiso@prison.go.ug': 'DPC Wakiso',
        'dpc_mpigi@prison.go.ug': 'DPC Mpigi',
        'dpc_iganga@prison.go.ug': 'DPC Iganga',
        'dpc_soroti@prison.go.ug': 'DPC Soroti',
        'dpc_tororo@prison.go.ug': 'DPC Tororo',
        'dpc_bugiri@prison.go.ug': 'DPC Bugiri',
        'dpc_kamuli@prison.go.ug': 'DPC Kamuli',
        'dpc_kaliro@prison.go.ug': 'DPC Kaliro',
        'dpc_mayuge@prison.go.ug': 'DPC Mayuge',
        'dpc_kasese@prison.go.ug': 'DPC Kasese',
        'dpc_rakai@prison.go.ug': 'DPC Rakai',
        'dpc_kalangala@prison.go.ug': 'DPC Kalangala',
        'dpc_lwengo@prison.go.ug': 'DPC Lwengo',
        'dpc_masindi@prison.go.ug': 'DPC Masindi',
        'dpc_kabale@prison.go.ug': 'DPC Kabale',
        'dpc_lira@prison.go.ug': 'DPC Lira',
        'dpc_alebtong@prison.go.ug': 'DPC Alebtong',
        'dpc_apac@prison.go.ug': 'DPC Apac',

        // Regional Prisons - All three roles use the same email per station
        'northern@prison.go.ug': 'NORTHERN',
        'north_eastern@prison.go.ug': 'NORTH-EASTERN',
        'west@prison.go.ug': 'WEST',
        'mid_western@prison.go.ug': 'MID-WESTERN',
        'south_western@prison.go.ug': 'SOUTH-WESTERN',
        'southern@prison.go.ug': 'SOUTHERN',
        'central@prison.go.ug': 'CENTRAL',
        'ker@prison.go.ug': 'KER',
        'eastern@prison.go.ug': 'EASTERN',
        'east_central@prison.go.ug': 'EAST CENTRAL',
        'mid_central@prison.go.ug': 'MID CENTRAL',
        'north_central@prison.go.ug': 'NORTH CENTRAL',
        'mid_northern@prison.go.ug': 'MID NORTHERN',
        'north_western@prison.go.ug': 'NORTH WESTERN',
        'mid_eastern@prison.go.ug': 'MID EASTERN',
        'south_eastern@prison.go.ug': 'SOUTH EASTERN',
        'kigezi@prison.go.ug': 'KIGEZI',
        'kooki@prison.go.ug': 'KOOKI',
        'iganga@prison.go.ug': 'IGANGA',

        // New District Prisons
        'luweero@prison.go.ug': 'Luweero',
        'kanoni@prison.go.ug': 'Kanoni',
        'wakiso@prison.go.ug': 'Wakiso',
        'mpigi@prison.go.ug': 'Mpigi',
        'buikwe@prison.go.ug': 'Buikwe',
        'lugazi@prison.go.ug': 'Lugazi',
        'koome@prison.go.ug': 'Koome',
        'buvuma@prison.go.ug': 'Buvuma',
        'kauga@prison.go.ug': 'Kauga',
        'nyenga@prison.go.ug': 'Nyenga',
        'kagadi@prison.go.ug': 'Kagadi',
        'mityana@prison.go.ug': 'Mityana',
        'magala@prison.go.ug': 'Magala',
        'myanzi@prison.go.ug': 'Myanzi',
        'mwera@prison.go.ug': 'Mwera',
        'kassanda@prison.go.ug': 'Kassanda',
        'kibaale@prison.go.ug': 'Kibaale',
        'kyakasengura@prison.go.ug': 'Kyakasengura',
        'muinaina@prison.go.ug': 'Muinaina',
        'kitwe@prison.go.ug': 'Kitwe',
        'lugore@prison.go.ug': 'Lugore',
        'orom_tikau@prison.go.ug': 'Orom-Tikau',
        'lamwo@prison.go.ug': 'Lamwo',
        'patongo@prison.go.ug': 'Patongo',
        'lotuturu@prison.go.ug': 'Lotuturu',
        'pader@prison.go.ug': 'Pader',
        'pece@prison.go.ug': 'Pece',
        'kaladima@prison.go.ug': 'Kaladima',
        'kitgum@prison.go.ug': 'Kitgum',
        'otuke_remand@prison.go.ug': 'Otuke Remand',
        'apac@prison.go.ug': 'Apac',
        'maruzi@prison.go.ug': 'Maruzi',
        'kwania@prison.go.ug': 'Kwania',
        'aber@prison.go.ug': 'Aber',
        'oyam@prison.go.ug': 'Oyam',
        'kole@prison.go.ug': 'Kole',
        'dokolo@prison.go.ug': 'Dokolo',
        'amolatar@prison.go.ug': 'Amolatar',
        'awei@prison.go.ug': 'Awei',
        'odina@prison.go.ug': 'Odina',
        'aswa_i@prison.go.ug': 'Aswa I',
        'aswa_ii@prison.go.ug': 'Aswa II',
        'aswa_iii@prison.go.ug': 'Aswa III',
        'adjumani@prison.go.ug': 'Adjumani',
        'yumbe@prison.go.ug': 'Yumbe',
        'lobule@prison.go.ug': 'Lobule',
        'giligili@prison.go.ug': 'Giligili',
        'moyo@prison.go.ug': 'Moyo',
        'koboko@prison.go.ug': 'Koboko',
        'ragem@prison.go.ug': 'Ragem',
        'paidha@prison.go.ug': 'Paidha',
        'olia@prison.go.ug': 'Olia',
        'nebbi@prison.go.ug': 'Nebbi',
        'bidibidi@prison.go.ug': 'Bidibidi',
        'bubulo@prison.go.ug': 'Bubulo',
        'kisoko@prison.go.ug': 'Kisoko',
        'mukuju@prison.go.ug': 'Mukuju',
        'budaka@prison.go.ug': 'Budaka',
        'masafu@prison.go.ug': 'Masafu',
        'ngenge@prison.go.ug': 'Ngenge',
        'kapchorwa@prison.go.ug': 'Kapchorwa',
        'mutufu@prison.go.ug': 'Mutufu',
        'butaleja@prison.go.ug': 'Butaleja',
        'agule@prison.go.ug': 'Agule',
        'kakoro@prison.go.ug': 'Kakoro',
        'kibuku@prison.go.ug': 'Kibuku',
        'kamuge@prison.go.ug': 'Kamuge',
        'bukwo@prison.go.ug': 'Bukwo',
        'amuria@prison.go.ug': 'Amuria',
        'kaberamaido@prison.go.ug': 'Kaberamaido',
        'nakatunya@prison.go.ug': 'Nakatunya',
        'serere@prison.go.ug': 'Serere',
        'kumi@prison.go.ug': 'Kumi',
        'katakwi@prison.go.ug': 'Katakwi',
        'bukedea@prison.go.ug': 'Bukedea',
        'ngora@prison.go.ug': 'Ngora',
        'bugiri@prison.go.ug': 'Bugiri',
        'kamuli@prison.go.ug': 'Kamuli',
        'kaliro@prison.go.ug': 'Kaliro',
        'mayuge@prison.go.ug': 'Mayuge',
        'bufumbira@prison.go.ug': 'Bufumbira',
        'bugembe@prison.go.ug': 'Bugembe',
        'buyende@prison.go.ug': 'Buyende',
        'namalemba@prison.go.ug': 'Namalemba',
        'namungalwe@prison.go.ug': 'Namungalwe',
        'nawanyago@prison.go.ug': 'Nawanyago',
        'kiyunga@prison.go.ug': 'Kiyunga',
        'buyinja@prison.go.ug': 'Buyinja',
        'ivukula@prison.go.ug': 'Ivukula',
        'kagoma@prison.go.ug': 'Kagoma',
        'kaiti@prison.go.ug': 'Kaiti',
        'nabwigulu@prison.go.ug': 'Nabwigulu',
        'butagaya@prison.go.ug': 'Butagaya',
        'iganga@prison.go.ug': 'Iganga',
        'busesa@prison.go.ug': 'Busesa',
        'imanyiro@prison.go.ug': 'Imanyiro',
        'kidera@prison.go.ug': 'Kidera',
        'busedde@prison.go.ug': 'Busedde',
        'kigandalo@prison.go.ug': 'Kigandalo',
        'kityerera@prison.go.ug': 'Kityerera',
        'ikulwe@prison.go.ug': 'Ikulwe',
        'bubukwanga@prison.go.ug': 'Bubukwanga',
        'kibiito@prison.go.ug': 'Kibiito',
        'nyabirongo@prison.go.ug': 'Nyabirongo',
        'rokooki@prison.go.ug': 'Rokooki',
        'bwera@prison.go.ug': 'Bwera',
        'maliba@prison.go.ug': 'Maliba',
        'kyenjojo@prison.go.ug': 'Kyenjojo',
        'lake_katwe@prison.go.ug': 'Lake Katwe',
        'muhokya@prison.go.ug': 'Muhokya',
        'butiti@prison.go.ug': 'Butiti',
        'kyegegwa@prison.go.ug': 'Kyegegwa',
        'butuntumula@prison.go.ug': 'Butuntumula',
        'muduuma@prison.go.ug': 'Muduuma',
        'nyimbwa@prison.go.ug': 'Nyimbwa',
        'bamunanika@prison.go.ug': 'Bamunanika',
        'kasangati@prison.go.ug': 'Kasangati',
        'wabusaana@prison.go.ug': 'Wabusaana',
        'sentema@prison.go.ug': 'Sentema',
        'mukulubita@prison.go.ug': 'Mukulubita',
        'buwambo@prison.go.ug': 'Buwambo',
        'kapeeka@prison.go.ug': 'Kapeeka',
        'kitala@prison.go.ug': 'Kitala',
        'wakyato@prison.go.ug': 'Wakyato',
        'kasanje@prison.go.ug': 'Kasanje',
        'butoolo@prison.go.ug': 'Butoolo',
        'buwama@prison.go.ug': 'Buwama',
        'nkozi@prison.go.ug': 'Nkozi',
        'kabasanda@prison.go.ug': 'Kabasanda',
        'ngoma@prison.go.ug': 'Ngoma',
        'bulaula@prison.go.ug': 'Bulaula',
        'busaana@prison.go.ug': 'Busaana',
        'galilaya@prison.go.ug': 'Galilaya',
        'kayonza@prison.go.ug': 'Kayonza',
        'ntenjeru@prison.go.ug': 'Ntenjeru',
        'kangulumira@prison.go.ug': 'Kangulumira',
        'nagojje@prison.go.ug': 'Nagojje',
        'nakiffuma@prison.go.ug': 'Nakiffuma',
        'nakisunga@prison.go.ug': 'Nakisunga',
        'ngogwe@prison.go.ug': 'Ngogwe',

        // Farm Stations - All three roles use the same email per station
        'kitalya_farm@prison.go.ug': 'Kitalya Farm',
        'kakumiro_farm@prison.go.ug': 'Kakumiro Farm',
        'kijjumba_farm@prison.go.ug': 'Kijjumba Farm',
        'kaweeri_farm@prison.go.ug': 'Kaweeri Farm',
        'loro_farm@prison.go.ug': 'Loro Farm',
        'arocha_farm@prison.go.ug': 'Arocha Farm',
        'erute_farm@prison.go.ug': 'Erute Farm',
        'alebtong_farm@prison.go.ug': 'Alebtong Farm',
        'tororo_farm@prison.go.ug': 'Tororo Farm',
        'ruimi_farm@prison.go.ug': 'Ruimi Farm',
        'ibuga_farm@prison.go.ug': 'Ibuga Farm',
        'mubuku_farm@prison.go.ug': 'Mubuku Farm',

        // Special Stations (Headquarters, Academy, Band, Barracks, Remand) - All three roles use the same email per station
        'kampala_remand_prison@prison.go.ug': 'Kampala Remand Prison',
        'prisons_academy_training_school_and_staff_college@prison.go.ug': 'Prisons Academy Training School and Staff College',
        'barracks_and_security_luzira@prison.go.ug': 'Barracks and Security Luzira',
        'uganda_prisons_band@prison.go.ug': 'Uganda Prisons Band',
        'prisons_headquarters@prison.go.ug': 'Prisons Headquarters',
        'kitalya_min_max@prison.go.ug': 'Kitalya Min-Max',
        'bugungu_y_p@prison.go.ug': 'Bugungu Y.P',
        'bugungu_y_o@prison.go.ug': 'Bugungu Y.O',

        // Admin and PHQ-KLA can submit for any station (no restriction)
        // They will return 'Default Station' which bypasses the restriction check

        // New stations added
        'bukomero@prison.go.ug': 'Bukomero',
        'masindi_m@prison.go.ug': 'Masindi (M)',
        'masindi_w@prison.go.ug': 'Masindi (W)',
        'biiso@prison.go.ug': 'Biiso',
        'bugambe@prison.go.ug': 'Bugambe',
        'hoima@prison.go.ug': 'Hoima',
        'isimba_farm@prison.go.ug': 'Isimba Farm',
        'maiha@prison.go.ug': 'Maiha',
        'kiryandongo@prison.go.ug': 'Kiryandongo',
        'kiboga@prison.go.ug': 'Kiboga',
        'ntwetwe@prison.go.ug': 'Ntwetwe',
        'kigumba@prison.go.ug': 'Kigumba',
        'buliisa@prison.go.ug': 'Buliisa',
        'kakiika_farm@prison.go.ug': 'Kakiika Farm',
        'bushenyi_m@prison.go.ug': 'Bushenyi (M)',
        'bushenyi_w@prison.go.ug': 'Bushenyi (W)',
        'ntungamo@prison.go.ug': 'Ntungamo',
        'kiburara_farm@prison.go.ug': 'Kiburara Farm',
        'nyabuhikye@prison.go.ug': 'Nyabuhikye',
        'mbarara_m@prison.go.ug': 'Mbarara (M)',
        'mbarara_w@prison.go.ug': 'Mbarara (W)',
        'mitooma@prison.go.ug': 'Mitooma',
        'sanga@prison.go.ug': 'Sanga',
        'isingiro@prison.go.ug': 'Isingiro',
        'kakiika@prison.go.ug': 'Kakiika',
        'buhweju@prison.go.ug': 'Buhweju',
        'kiruhura@prison.go.ug': 'Kiruhura',
        'kamwenge@prison.go.ug': 'Kamwenge',
        'kicheche@prison.go.ug': 'Kicheche',
        'ndorwa@prison.go.ug': 'Ndorwa',
        'kanungu@prison.go.ug': 'Kanungu',
        'kisoro@prison.go.ug': 'Kisoro',
        'rubanda@prison.go.ug': 'Rubanda',
        'mparo@prison.go.ug': 'Mparo',
        'rukungiri@prison.go.ug': 'Rukungiri',
        'kihihi@prison.go.ug': 'Kihihi',
        'nyarushanje@prison.go.ug': 'Nyarushanje',
        'ssaza@prison.go.ug': 'Ssaza',
        'masaka_m@prison.go.ug': 'Masaka (M)',
        'masaka_w@prison.go.ug': 'Masaka (W)',
        'mtutkula_farm@prison.go.ug': 'Mtutkula Farm',
        'bigasa@prison.go.ug': 'Bigasa',
        'ndagwe@prison.go.ug': 'Ndagwe',
        'kisekka@prison.go.ug': 'Kisekka',
        'kitanda@prison.go.ug': 'Kitanda',
        'lwabenge@prison.go.ug': 'Lwabenge',
        'kyamulibwa@prison.go.ug': 'Kyamulibwa',
        'kyanamukaka@prison.go.ug': 'Kyanamukaka',
        'mukungwe@prison.go.ug': 'Mukungwe',
        'lukaaya@prison.go.ug': 'Lukaaya',
        'lwamagwa@prison.go.ug': 'Lwamagwa',
        'rakai@prison.go.ug': 'Rakai',
        'sembabule@prison.go.ug': 'Sembabule',
        'lwebitakuli@prison.go.ug': 'Lwebitakuli',
        'ntuusi@prison.go.ug': 'Ntuusi',
        'mateete@prison.go.ug': 'Mateete',
        'lwemiyaga@prison.go.ug': 'Lwemiyaga',
        'kyazanga@prison.go.ug': 'Kyazanga',
        'lwengo@prison.go.ug': 'Lwengo',
        'bukulula@prison.go.ug': 'Bukulula',
        'buwunga@prison.go.ug': 'Buwunga',
        'kabonera@prison.go.ug': 'Kabonera',
        'kalungu@prison.go.ug': 'Kalungu',
        'kasaali@prison.go.ug': 'Kasaali',
        'kayanja@prison.go.ug': 'Kayanja',
        'kabula@prison.go.ug': 'Kabula',
        'kabira@prison.go.ug': 'Kabira',
        'kacheera@prison.go.ug': 'Kacheera',
        'kakuuto@prison.go.ug': 'Kakuuto',
        'kalisizo@prison.go.ug': 'Kalisizo',
        'kalangala@prison.go.ug': 'Kalangala',
        'butenga@prison.go.ug': 'Butenga',
        'moroto@prison.go.ug': 'Moroto',
        'namalu@prison.go.ug': 'Namalu',
        'amita@prison.go.ug': 'Amita',
        'kotido@prison.go.ug': 'Kotido',
        'kaabong@prison.go.ug': 'Kaabong',
        'nakapiripirit@prison.go.ug': 'Nakapiripirit',
    };

    return stationMapping[user.username] || 'Default Station'; // Fallback - no restriction
}

function loadReturns() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const returns = JSON.parse(localStorage.getItem('returns') || '[]');
    const returnsList = document.getElementById('returnsList');
    returnsList.innerHTML = '';

    let filteredReturns = returns;
    if (user.role === 'phq-kla' || user.role === 'admin') {
        // PHQ-KLA (GENOFF) and Admin can view all returns from all stations
        filteredReturns = returns;
    } else if (['clerk', 'receptionist', 'officer'].includes(user.role)) {
        // Clerk, Receptionist, and Officer in Charge can view their own submitted returns
        filteredReturns = returns.filter(r => r.submittedBy === user.username);
    } else {
        // Other roles (if any) see nothing or handle accordingly
        filteredReturns = [];
    }

    // Store the filtered returns for search functionality
    window.allReturns = filteredReturns;

    if (filteredReturns.length === 0) {
        returnsList.innerHTML = '<p>No returns found.</p>';
        return;
    }

    renderReturns(filteredReturns);
}

function renderReturns(returnsToRender) {
    const returnsList = document.getElementById('returnsList');
    returnsList.innerHTML = '';

    if (returnsToRender.length === 0) {
        returnsList.innerHTML = '<p>No returns match your search.</p>';
        return;
    }

    returnsToRender.forEach(returnItem => {
        const returnDiv = document.createElement('div');
        returnDiv.className = 'return-item';

        let fileDownloadLink = '';
        if (returnItem.file) {
            fileDownloadLink = `<p><strong>Attached File:</strong> <a href="${returnItem.file.data}" download="${returnItem.file.name}">${returnItem.file.name}</a> (${(returnItem.file.size / 1024).toFixed(2)} KB)</p>`;
        }

        returnDiv.innerHTML = `
            <h3>${returnItem.returnType.replace(/-/g, ' ')}</h3>
            <p><strong>Frequency:</strong> ${returnItem.frequency}</p>
            <p><strong>Station:</strong> ${returnItem.station}</p>
            <p><strong>Submitted By:</strong> ${returnItem.submittedBy}</p>
            <p><strong>Submitted At:</strong> ${new Date(returnItem.submittedAt).toLocaleString()}</p>
            <p><strong>Status:</strong> ${returnItem.status}</p>
            ${fileDownloadLink}
            <p><strong>Return Data:</strong></p>
            <textarea rows="5" readonly style="width: 100%;">${returnItem.data}</textarea>
            ${returnItem.comment ? `<p><strong>Comment:</strong> ${returnItem.comment}</p>` : ''}
        `;
        returnsList.appendChild(returnDiv);
    });
}

function filterReturns() {
    const searchTerm = document.getElementById('searchReturns').value.toLowerCase().trim();
    const allReturns = window.allReturns || [];

    if (!searchTerm) {
        renderReturns(allReturns);
        return;
    }

    const filteredReturns = allReturns.filter(returnItem => {
        const returnType = returnItem.returnType.toLowerCase();
        const frequency = returnItem.frequency.toLowerCase();
        const station = returnItem.station.toLowerCase();
        const submittedBy = returnItem.submittedBy.toLowerCase();

        return returnType.includes(searchTerm) ||
               frequency.includes(searchTerm) ||
               station.includes(searchTerm) ||
               submittedBy.includes(searchTerm);
    });

    renderReturns(filteredReturns);
}

function sortReturns() {
    const sortBy = document.getElementById('sortReturns').value;
    const allReturns = window.allReturns || [];

    if (!sortBy) {
        renderReturns(allReturns);
        return;
    }

    const sortedReturns = [...allReturns].sort((a, b) => {
        let valueA, valueB;

        switch (sortBy) {
            case 'submittedBy':
                valueA = a.submittedBy.toLowerCase();
                valueB = b.submittedBy.toLowerCase();
                break;
            case 'returnType':
                valueA = a.returnType.toLowerCase();
                valueB = b.returnType.toLowerCase();
                break;
            case 'frequency':
                valueA = a.frequency.toLowerCase();
                valueB = b.frequency.toLowerCase();
                break;
            case 'station':
                valueA = a.station.toLowerCase();
                valueB = b.station.toLowerCase();
                break;
            case 'submittedAt':
                valueA = new Date(a.submittedAt);
                valueB = new Date(b.submittedAt);
                return valueB - valueA; // Newest first for date/time
            default:
                return 0;
        }

        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
    });

    renderReturns(sortedReturns);
}

// Chat functionality
let chatUser = null;
let chatMessages = [];
let chatCollapsed = false;

function initializeChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatContent = document.getElementById('chatContent');

    // Check if user is logged in
    if (!localStorage.getItem('currentUser')) {
        // Show login required message on login page
        if (chatContent) {
            chatContent.innerHTML = `
                <div class="chat-login-required">
                    <p>First login into system before starting to chat</p>
                </div>
            `;
        }
        return;
    }

    // User is logged in, initialize full chat functionality
    const chatToggle = document.getElementById('chatToggle');
    const chatSignInBtn = document.getElementById('chatSignInBtn');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatMessageInput = document.getElementById('chatMessage');

    if (chatToggle) {
        chatToggle.addEventListener('click', toggleChat);
    }

    if (chatSignInBtn) {
        chatSignInBtn.addEventListener('click', signInToChat);
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendChatMessage);
    }

    if (chatMessageInput) {
        chatMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

    // Load chat messages from localStorage
    loadChatMessages();

    // Check for new messages every 5 seconds
    setInterval(checkForNewChatMessages, 5000);
}

function toggleChat() {
    const chatContent = document.getElementById('chatContent');
    const chatToggle = document.getElementById('chatToggle');

    chatCollapsed = !chatCollapsed;

    if (chatCollapsed) {
        chatContent.style.display = 'none';
        chatToggle.textContent = '+';
    } else {
        chatContent.style.display = 'flex';
        chatToggle.textContent = '−';
    }
}

function signInToChat() {
    const identifier = document.getElementById('chatIdentifier').value.trim();

    if (!identifier) {
        alert('Please enter your phone number or email address.');
        return;
    }

    // Validate identifier (10-digit phone or email)
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(identifier) && !emailRegex.test(identifier)) {
        alert('Please enter a valid 10-digit phone number or email address.');
        return;
    }

    chatUser = {
        identifier: identifier,
        displayName: identifier.length === 10 ? formatPhoneNumber(identifier) : identifier.split('@')[0]
    };

    localStorage.setItem('chatUser', JSON.stringify(chatUser));

    // Switch to chat interface
    document.getElementById('chatSignIn').style.display = 'none';
    document.getElementById('chatInterface').style.display = 'flex';

    // Load existing messages
    renderChatMessages();
}

function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

function sendChatMessage() {
    if (!chatUser) return;

    const messageInput = document.getElementById('chatMessage');
    const message = messageInput.value.trim();

    if (!message) return;

    const chatMessage = {
        id: Date.now(),
        sender: chatUser.displayName,
        identifier: chatUser.identifier,
        message: message,
        timestamp: new Date().toISOString(),
        type: 'message'
    };

    // Add to local messages
    chatMessages.push(chatMessage);
    saveChatMessages();

    // Clear input
    messageInput.value = '';

    // Render messages
    renderChatMessages();

    // Simulate sending to other users (in a real app, this would be server-side)
    // For demo purposes, we'll just broadcast to localStorage
    broadcastMessage(chatMessage);
}

function broadcastMessage(message) {
    // In a real application, this would send to a server
    // For this demo, we'll use localStorage to simulate cross-tab communication
    const broadcastData = {
        type: 'new_message',
        message: message,
        timestamp: Date.now()
    };

    localStorage.setItem('chatBroadcast', JSON.stringify(broadcastData));

    // Clear the broadcast after a short delay
    setTimeout(() => {
        localStorage.removeItem('chatBroadcast');
    }, 1000);
}

function checkForNewChatMessages() {
    const broadcastData = localStorage.getItem('chatBroadcast');
    if (broadcastData) {
        const data = JSON.parse(broadcastData);
        if (data.type === 'new_message' && data.message.sender !== chatUser?.displayName) {
            // Add new message if not from current user
            const existingMessage = chatMessages.find(m => m.id === data.message.id);
            if (!existingMessage) {
                chatMessages.push(data.message);
                saveChatMessages();
                renderChatMessages();

                // Show notification if chat is collapsed
                if (chatCollapsed) {
                    showChatNotification(data.message);
                }
            }
        }
    }
}

function showChatNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <strong>New Chat Message</strong><br>
            <span>From: ${message.sender}</span><br>
            <span>${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Play beep
    playBeep();

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function loadChatMessages() {
    const stored = localStorage.getItem('chatMessages');
    if (stored) {
        chatMessages = JSON.parse(stored);
    }

    // Load chat user if exists
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
        chatUser = JSON.parse(storedUser);
        // Auto-sign in if user was previously signed in
        document.getElementById('chatSignIn').style.display = 'none';
        document.getElementById('chatInterface').style.display = 'flex';
        renderChatMessages();
    }
}

function saveChatMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

function renderChatMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = '';

    chatMessages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.sender === chatUser?.displayName ? 'sent' : 'received'}`;

        const timestamp = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        messageDiv.innerHTML = `
            <div class="sender">${message.sender}</div>
            <div>${message.message}</div>
            <div class="timestamp">${timestamp}</div>
        `;

        messagesContainer.appendChild(messageDiv);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Export returns to CSV
function exportReturnsToCsv() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const returns = JSON.parse(localStorage.getItem('returns') || '[]');
    let filteredReturns = returns;

    if (user.role === 'phq-kla' || user.role === 'admin') {
        // PHQ-KLA and Admin can export all returns
        filteredReturns = returns;
    } else if (['clerk', 'receptionist', 'officer'].includes(user.role)) {
        // Other roles can only export their own submissions
        filteredReturns = returns.filter(r => r.submittedBy === user.username);
    } else {
        alert('You do not have permission to export returns.');
        return;
    }

    if (filteredReturns.length === 0) {
        alert('No returns available to export.');
        return;
    }

    // Create CSV content
    const csvHeaders = [
        'Return Type',
        'Frequency',
        'Station',
        'Submitted By',
        'Submitted At',
        'Status',
        'Data',
        'Comment',
        'File Name'
    ];

    const csvRows = filteredReturns.map(returnItem => [
        returnItem.returnType.replace(/-/g, ' '),
        returnItem.frequency,
        returnItem.station,
        returnItem.submittedBy,
        new Date(returnItem.submittedAt).toLocaleString(),
        returnItem.status,
        `"${returnItem.data.replace(/"/g, '""')}"`, // Escape quotes in data
        returnItem.comment ? `"${returnItem.comment.replace(/"/g, '""')}"` : '',
        returnItem.file ? returnItem.file.name : ''
    ]);

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `prison-returns-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Returns exported successfully!');
}

// User Management Functions
function loadUserManagement() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Check if user has permission to access user management
    if (!['admin', 'phq-kla'].includes(user.role)) {
        alert('You do not have permission to access user management.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Load and display existing users
    displayUsersList();

    // Show/hide station field based on role selection
    const roleSelect = document.getElementById('newUserRole');
    const stationSelect = document.getElementById('newUserStation');

    if (roleSelect && stationSelect) {
        roleSelect.addEventListener('change', function() {
            const selectedRole = this.value;
            if (['clerk', 'receptionist', 'officer'].includes(selectedRole)) {
                stationSelect.style.display = 'block';
                stationSelect.required = true;
            } else {
                stationSelect.style.display = 'none';
                stationSelect.required = false;
            }
        });
    }

    // Handle back to dashboard button
    const backToDashboardBtn = document.getElementById('backToDashboard');
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
}

function displayUsersList() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    const storedUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');
    usersList.innerHTML = '';

    const users = Object.entries(storedUsers);
    if (users.length === 0) {
        usersList.innerHTML = '<p>No users found.</p>';
        return;
    }

    users.forEach(([email, userData]) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';

        userDiv.innerHTML = `
            <div class="user-info">
                <h4>${email}</h4>
                <p><strong>Role:</strong> ${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</p>
                <p><strong>Created:</strong> ${new Date(userData.createdAt).toLocaleDateString()}</p>
                ${userData.station ? `<p><strong>Station:</strong> ${userData.station}</p>` : ''}
            </div>
            <div class="user-actions">
                <button class="edit-user-btn" data-email="${email}">Edit</button>
                <button class="delete-user-btn" data-email="${email}">Delete</button>
            </div>
        `;

        usersList.appendChild(userDiv);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', handleEditUser);
    });

    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteUser);
    });
}

function handleCreateUser(e) {
    e.preventDefault();

    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    const station = document.getElementById('newUserStation').value;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Validate password
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');
    if (storedUsers[email]) {
        alert('A user with this email already exists');
        return;
    }

    // Create new user
    const newUser = {
        password: password,
        role: role,
        createdAt: new Date().toISOString()
    };

    // Add station for restricted roles
    if (['clerk', 'receptionist', 'officer'].includes(role)) {
        if (!station) {
            alert('Please select a station for this role');
            return;
        }
        newUser.station = station;
    }

    storedUsers[email] = newUser;
    localStorage.setItem('systemUsers', JSON.stringify(storedUsers));

    // Clear form
    document.getElementById('createUserForm').reset();

    // Refresh users list
    displayUsersList();

    alert('User account created successfully!');
}

function handleEditUser(e) {
    const email = e.target.getAttribute('data-email');
    const storedUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');
    const userData = storedUsers[email];

    if (!userData) return;

    // Prompt for new email (username change)
    const newEmail = prompt('Enter new email address (leave empty to keep current):', email);
    if (newEmail === null) return; // Cancelled

    let finalEmail = email;
    if (newEmail.trim() && newEmail !== email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            alert('Please enter a valid email address');
            return;
        }

        // Check if new email already exists
        if (storedUsers[newEmail]) {
            alert('A user with this email already exists');
            return;
        }

        finalEmail = newEmail.trim();
    }

    // Prompt for new password
    const newPassword = prompt('Enter new password (leave empty to keep current):');
    if (newPassword === null) return; // Cancelled

    if (newPassword && newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Update user data
    if (finalEmail !== email) {
        // Email changed - need to move user data
        storedUsers[finalEmail] = { ...userData };
        delete storedUsers[email];

        // Update any returns submitted by this user
        const returns = JSON.parse(localStorage.getItem('returns') || '[]');
        returns.forEach(returnItem => {
            if (returnItem.submittedBy === email) {
                returnItem.submittedBy = finalEmail;
            }
        });
        localStorage.setItem('returns', JSON.stringify(returns));
    }

    if (newPassword) {
        storedUsers[finalEmail].password = newPassword;
    }

    localStorage.setItem('systemUsers', JSON.stringify(storedUsers));

    // Refresh users list
    displayUsersList();

    alert('User account updated successfully!');
}

function handleDeleteUser(e) {
    const email = e.target.getAttribute('data-email');

    if (!confirm(`Are you sure you want to delete the user account for ${email}? This action cannot be undone.`)) {
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');

    // Don't allow deletion of the last admin account
    const adminCount = Object.values(storedUsers).filter(user => user.role === 'admin').length;
    if (storedUsers[email].role === 'admin' && adminCount <= 1) {
        alert('Cannot delete the last admin account');
        return;
    }

    // Delete user
    delete storedUsers[email];
    localStorage.setItem('systemUsers', JSON.stringify(storedUsers));

    // Refresh users list
    displayUsersList();

    alert('User account deleted successfully!');
}

function toggleUserFormSection() {
    const form = document.getElementById('createUserForm');
    const button = document.getElementById('toggleUserForm');

    if (form.style.display === 'none') {
        form.style.display = 'block';
        button.textContent = '−';
    } else {
        form.style.display = 'none';
        button.textContent = '+';
    }
}
