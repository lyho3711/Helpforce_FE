// Password Validation Functions
function hasConsecutiveChars(password) {
    for (let i = 0; i < password.length - 2; i++) {
        if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
            return true;
        }
    }
    return false;
}

function countCharacterTypes(password) {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let count = 0;
    if (hasLetter) count++;
    if (hasNumber) count++;
    if (hasSpecial) count++;

    return count;
}

function validatePassword(password) {
    const validations = {
        length: password.length >= 8 && password.length <= 32,
        types: countCharacterTypes(password) >= 2,
        consecutive: !hasConsecutiveChars(password)
    };

    return validations;
}

// Signup Page Logic
if (document.getElementById('signup-form')) {
    const signupForm = document.getElementById('signup-form');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    const emailInput = document.getElementById('email');
    const crmCohortInput = document.getElementById('crm-cohort');

    const reqLength = document.getElementById('req-length');
    const reqTypes = document.getElementById('req-types');
    const reqConsecutive = document.getElementById('req-consecutive');
    const passwordMatchMessage = document.getElementById('password-match-message');

    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const validations = validatePassword(password);

        // Update requirement indicators
        if (validations.length) {
            reqLength.classList.add('met');
        } else {
            reqLength.classList.remove('met');
        }

        if (validations.types) {
            reqTypes.classList.add('met');
        } else {
            reqTypes.classList.remove('met');
        }

        if (validations.consecutive) {
            reqConsecutive.classList.add('met');
        } else {
            reqConsecutive.classList.remove('met');
        }

        // Update input styling
        const allValid = validations.length && validations.types && validations.consecutive;
        if (password.length > 0) {
            if (allValid) {
                passwordInput.classList.add('valid');
                passwordInput.classList.remove('invalid');
            } else {
                passwordInput.classList.add('invalid');
                passwordInput.classList.remove('valid');
            }
        } else {
            passwordInput.classList.remove('valid', 'invalid');
        }

        // Check password match if confirm field has value
        if (passwordConfirmInput.value) {
            checkPasswordMatch();
        }
    });

    // Password confirmation validation
    passwordConfirmInput.addEventListener('input', checkPasswordMatch);

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        if (passwordConfirm.length === 0) {
            passwordMatchMessage.textContent = '';
            passwordMatchMessage.className = 'validation-message';
            passwordConfirmInput.classList.remove('valid', 'invalid');
            return;
        }

        if (password === passwordConfirm) {
            passwordMatchMessage.textContent = '✓ 비밀번호가 일치합니다';
            passwordMatchMessage.className = 'validation-message success';
            passwordConfirmInput.classList.add('valid');
            passwordConfirmInput.classList.remove('invalid');
        } else {
            passwordMatchMessage.textContent = '✗ 비밀번호가 일치하지 않습니다';
            passwordMatchMessage.className = 'validation-message error';
            passwordConfirmInput.classList.add('invalid');
            passwordConfirmInput.classList.remove('valid');
        }
    }

    // Form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;
        const crmCohort = crmCohortInput.value;
        const affiliation = document.getElementById('affiliation').value;

        // Validate password
        const validations = validatePassword(password);
        if (!validations.length || !validations.types || !validations.consecutive) {
            alert('비밀번호가 요구사항을 충족하지 않습니다.');
            passwordInput.classList.add('shake');
            setTimeout(() => passwordInput.classList.remove('shake'), 300);
            return;
        }

        // Check password match
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            passwordConfirmInput.classList.add('shake');
            setTimeout(() => passwordConfirmInput.classList.remove('shake'), 300);
            return;
        }

        // Store user data (in real app, this would be sent to server)
        const userData = {
            email,
            password, // In real app, never store plain password
            crmCohort,
            affiliation,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage for demo purposes
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');

        // Success feedback
        alert('회원가입이 완료되었습니다!');

        // Redirect to main page
        window.location.href = 'index.html';
    });
}

// Login Page Logic
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Get stored user data
        const storedUserData = localStorage.getItem('userData');

        if (!storedUserData) {
            alert('등록된 계정이 없습니다. 회원가입을 먼저 진행해주세요.');
            return;
        }

        const userData = JSON.parse(storedUserData);

        // Validate credentials
        if (email === userData.email && password === userData.password) {
            localStorage.setItem('isLoggedIn', 'true');
            alert('로그인 성공!');
            window.location.href = 'index.html';
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.');
            passwordInput.classList.add('shake');
            setTimeout(() => passwordInput.classList.remove('shake'), 300);
            passwordInput.value = '';
        }
    });
}
