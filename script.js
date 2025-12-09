// Mock Data
const currentUser = {
    id: 1,
    nickname: "TrailblazerUser",
    avatar: "https://ui-avatars.com/api/?name=Trailblazer+User&background=00A1E0&color=fff"
};

const users = [
    currentUser,
    { id: 2, nickname: "ApexGuru", avatar: "https://ui-avatars.com/api/?name=Apex+Guru&background=random" },
    { id: 3, nickname: "LWC_Dev", avatar: "https://ui-avatars.com/api/?name=LWC+Dev&background=random" }
];

let questions = [
    {
        id: 101,
        user_id: 2,
        title: "How to handle large data volumes in LWC?",
        body: "I'm facing performance issues when rendering a datatable with over 5000 records. What are the best practices for pagination or infinite scrolling in Lightning Web Components?",
        status: "Open",
        views: 120,
        votes: 5,
        answer_count: 2,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        tags: ["LWC", "Performance", "JavaScript"],
        favorited: false
    },
    {
        id: 102,
        user_id: 3,
        title: "Apex Trigger context variables explanation",
        body: "Can someone explain the difference between Trigger.new and Trigger.oldMap? I'm getting null pointer exceptions when trying to access fields in a before insert trigger.",
        status: "Open",
        views: 85,
        votes: 2,
        answer_count: 1,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        tags: ["Apex", "Triggers"],
        favorited: false
    },
    {
        id: 103,
        user_id: 1,
        title: "Salesforce Flow vs Apex for complex logic",
        body: "At what point should I switch from Flow to Apex? I have a complex approval process that involves multiple related objects.",
        status: "Open",
        views: 200,
        votes: 10,
        answer_count: 5,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        tags: ["Flow", "Apex", "Architecture"],
        favorited: false
    }
];

// Generate more mock questions for testing load more
for (let i = 1; i <= 30; i++) {
    questions.push({
        id: 103 + i,
        user_id: (i % 3) + 1,
        title: `Mock Question ${i} for Load More Testing`,
        body: `This is a generated question to test the load more functionality. Question number ${i}.`,
        status: "Open",
        views: Math.floor(Math.random() * 100),
        votes: Math.floor(Math.random() * 10),
        answer_count: 0,
        created_at: new Date(Date.now() - 3600000 * (48 + i)).toISOString(),
        tags: ["General"],
        favorited: false
    });
}

const leaderboardData = [
    { id: 1, name: "Anirban Sen", points: 4300, rank: 1, avatar: "https://ui-avatars.com/api/?name=Anirban+Sen&background=random" },
    { id: 2, name: "Juan Cruz Basso", points: 610, rank: 2, avatar: "https://ui-avatars.com/api/?name=Juan+Cruz&background=random" },
    { id: 3, name: "Keiji Otsubo", points: 530, rank: 3, avatar: "https://ui-avatars.com/api/?name=Keiji+Otsubo&background=random" },
    { id: 4, name: "Abhishek R", points: 497, rank: 4, avatar: "https://ui-avatars.com/api/?name=Abhishek+R&background=random" },
    { id: 5, name: "Vishal Verma", points: 379, rank: 5, avatar: "https://ui-avatars.com/api/?name=Vishal+Verma&background=random" }
];

// Role List for filtering
const rolesList = [
    "Administrator",
    "Architect",
    "Business Analyst",
    "Consultant",
    "Customer Service Professional",
    "Data Analyst",
    "Developer",
    "Marketer",
    "Not Applicable",
    "Sales Professional",
    "UX Designer"
];

// DOM Elements
const feedListEl = document.getElementById('feed-list');
const feedHeaderEl = document.querySelector('.feed-header');
const questionDetailEl = document.getElementById('question-detail');
const detailContentEl = document.getElementById('detail-content');
const backToFeedBtn = document.getElementById('back-to-feed');
const leaderboardListEl = document.getElementById('leaderboard-list');
const roleTagsListEl = document.getElementById('role-tags-list');
const askBtn = document.getElementById('ask-question-btn');
const modal = document.getElementById('question-modal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelModalBtn = document.querySelector('.close-modal-btn');
const questionForm = document.getElementById('question-form');
const filterLinks = document.querySelectorAll('.filters a');
const sortSelect = document.getElementById('sort-select');

// State
let currentFilter = 'all';
let currentSort = 'latest';
let currentRole = null; // Track selected role for filtering
let editingQuestionId = null; // Track question being edited
let questionToDelete = null; // Track question to delete
let displayedItemsCount = 10;
const itemsPerPage = 10;

// Helper Functions
function getUser(id) {
    return users.find(u => u.id === id) || users[0];
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

// Core Logic
function getFilteredAndSortedQuestions() {
    let filtered = [...questions];

    // Role filtering
    if (currentRole) {
        filtered = filtered.filter(q => q.tags && q.tags.includes(currentRole));
    }

    // Other filters
    if (currentFilter === 'unanswered') {
        filtered = filtered.filter(q => q.answer_count === 0);
    } else if (currentFilter === 'my-questions') {
        filtered = filtered.filter(q => q.user_id === currentUser.id);
    }

    filtered.sort((a, b) => {
        if (currentSort === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at);
        } else if (currentSort === 'votes') {
            return b.votes - a.votes;
        } else {
            return new Date(b.created_at) - new Date(a.created_at);
        }
    });

    return filtered;
}

// Render Functions
function renderFeed() {
    feedListEl.innerHTML = '';
    const allFilteredQuestions = getFilteredAndSortedQuestions();

    if (allFilteredQuestions.length === 0) {
        feedListEl.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">No questions found.</div>';
        return;
    }

    // Load More Logic
    const displayQuestions = allFilteredQuestions.slice(0, displayedItemsCount);

    displayQuestions.forEach(q => {
        const user = getUser(q.user_id);
        const card = document.createElement('div');
        card.className = 'feed-item';
        // Check if favorited
        const favoriteClass = q.favorited ? 'favorited' : '';
        const favoriteIcon = q.favorited ? '★' : '☆';

        card.innerHTML = `
            <div class="feed-item-header">
                <div class="user-info">
                    <img src="${user.avatar}" alt="${user.nickname}" class="avatar-sm">
                    <div>
                        <div class="user-name">${user.nickname}</div>
                        <div class="post-meta">${timeAgo(q.created_at)}</div>
                    </div>
                </div>
                <div class="post-menu-container">
                    <button class="favorite-btn ${favoriteClass}" onclick="toggleFavorite(${q.id})" title="Bookmark">
                        ${favoriteIcon}
                    </button>
                    <button class="post-menu-btn" onclick="togglePostMenu(${q.id}, event)">⋮</button>
                    <div class="post-menu-dropdown" id="menu-${q.id}">
                        ${q.user_id === currentUser.id ?
                `<a href="#" onclick="editQuestion(${q.id})">Edit</a>
                             <a href="#" onclick="confirmDelete(${q.id})">Delete</a>` :
                `<a href="#" onclick="reportQuestion(${q.id})">Report</a>
                             <a href="#" onclick="muteQuestion(${q.id})">Mute</a>`
            }
                    </div>
                </div>
            </div>
            <a href="#" class="question-title" onclick="showQuestionDetail(${q.id}); return false;">${q.title}</a>
            <div class="question-body">${q.body}</div>
            <div class="tags">
                ${q.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="feed-stats">
                <div class="stat-item"><span>👁️</span> ${q.views} Views</div>
                <div class="stat-item"><span>💬</span> ${q.answer_count} Answers</div>
                <div class="stat-item" onclick="voteQuestion(${q.id})"><span>👍</span> ${q.votes} Votes</div>
            </div>
        `;
        feedListEl.appendChild(card);
    });

    // Render Load More Button (Salesforce style - always visible)
    renderLoadMoreButton();
}

function renderLoadMoreButton() {
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'load-more-container';
    loadMoreContainer.innerHTML = `
        <button class="load-more-btn" onclick="loadMoreItems()">더보기</button>
    `;
    feedListEl.appendChild(loadMoreContainer);
}

function loadMoreItems() {
    displayedItemsCount += itemsPerPage;
    renderFeed();
}

function renderLeaderboard() {
    if (!leaderboardListEl) return;
    leaderboardListEl.innerHTML = leaderboardData.map(user => `
            <div class="leaderboard-item">
            <div class="lb-user-info">
                <img src="${user.avatar}" alt="${user.name}" class="avatar-sm">
                <div class="lb-details">
                    <div class="lb-points">#${user.rank} · ${user.points} Points</div>
                    <div class="lb-name">${user.name}</div>
                </div>
            </div>
            <button class="btn-icon-sm" title="Follow">+</button>
        </div>
            `).join('');
}

function renderRoleTags() {
    if (!roleTagsListEl) return;

    roleTagsListEl.innerHTML = rolesList.map(role => {
        const count = getQuestionCountByRole(role);
        const isActive = currentRole === role;

        return `
            <div class="role-tag-item ${isActive ? 'active' : ''}" data-role="${role}">
                <span class="role-tag-name">${role}</span>
                <span class="role-tag-count">${count}</span>
            </div>
            `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.role-tag-item').forEach(item => {
        item.addEventListener('click', () => {
            const role = item.dataset.role;
            filterByRole(role);
        });
    });
}

function getQuestionCountByRole(role) {
    return questions.filter(q => q.tags && q.tags.includes(role)).length;
}

function filterByRole(role) {
    // Toggle role filter
    if (currentRole === role) {
        currentRole = null; // Deselect if clicking the same role
    } else {
        currentRole = role;
    }

    // Reset other filters to 'all'
    currentFilter = 'all';
    filterLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');

    displayedItemsCount = 10; // Reset load more
    renderFeed();
    renderRoleTags(); // Re-render to update active state
}

function showQuestionDetail(id) {
    const q = questions.find(q => q.id === id);
    if (!q) return;

    const user = getUser(q.user_id);

    const mockAnswers = [
        {
            id: 201,
            user_id: 2,
            body: "This is a great question! I think you should try using pagination with OFFSET in SOQL.",
            is_accepted: false,
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 202,
            user_id: 3,
            body: "Actually, for LWC datatables, infinite loading is better supported. Check the documentation.",
            is_accepted: true,
            created_at: new Date(Date.now() - 1800000).toISOString()
        }
    ];

    let answersHtml = mockAnswers.map(a => {
        const aUser = getUser(a.user_id);
        return `
            <div class="answer-item ${a.is_accepted ? 'accepted-answer' : ''}">
                ${a.is_accepted ? '<div class="accepted-badge">✓ Accepted Answer</div>' : ''}
                <div class="user-info">
                    <img src="${aUser.avatar}" alt="${aUser.nickname}" class="avatar-sm">
                    <div>
                        <div class="user-name">${aUser.nickname}</div>
                        <div class="post-meta">${timeAgo(a.created_at)}</div>
                    </div>
                </div>
                <div class="answer-body">${a.body}</div>
            </div>
            `;
    }).join('');

    detailContentEl.innerHTML = `
            <div class="detail-header">
            <div class="user-info">
                <img src="${user.avatar}" alt="${user.nickname}" class="avatar-sm">
                <div>
                    <div class="user-name">${user.nickname}</div>
                    <div class="post-meta">${timeAgo(q.created_at)}</div>
                </div>
            </div>
            <h1 class="detail-title">${q.title}</h1>
            <div class="detail-body">${q.body}</div>
            <div class="tags">
                ${q.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="feed-stats">
                <div class="stat-item"><span>👁️</span> ${q.views} Views</div>
                <div class="stat-item"><span>👍</span> ${q.votes} Votes</div>
            </div>
        </div>
            <div class="answers-section">
                <div class="answers-header">${mockAnswers.length} Answers</div>
                
                <div class="answer-input-section" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                     <textarea placeholder="Write an answer..." rows="3" style="width:100%; margin-bottom:10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                     <div class="file-attachment-ui" style="margin-bottom: 10px; font-size: 0.9em; color: #666;">
                        <span>이미지 첨부 (PNG, JPG, GIF - 최대 10MB)</span>
                     </div>
                     <button class="btn-primary">Post Answer</button>
                </div>

                ${answersHtml}
            </div>
        `;

    feedListEl.classList.add('hidden');
    feedHeaderEl.classList.add('hidden');
    questionDetailEl.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function hideQuestionDetail() {
    questionDetailEl.classList.add('hidden');
    feedListEl.classList.remove('hidden');
    feedHeaderEl.classList.remove('hidden');
}

function voteQuestion(id) {
    const q = questions.find(q => q.id === id);
    if (q) {
        q.votes++;
        renderFeed();
        if (!questionDetailEl.classList.contains('hidden')) {
            showQuestionDetail(id);
        }
    }
}

// Event Listeners
backToFeedBtn.addEventListener('click', hideQuestionDetail);

filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentFilter = link.dataset.filter;
        renderFeed();
        hideQuestionDetail();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderFeed();
});


// Modal and Form Handling
let selectedImage = null;

function openModal() {
    modal.classList.remove('hidden');

    // Update modal title based on edit mode
    const modalTitle = modal.querySelector('h2');
    const postBtn = document.getElementById('post-question-btn');

    if (editingQuestionId) {
        modalTitle.textContent = '질문 수정';
        postBtn.textContent = '수정 완료';
    } else {
        modalTitle.textContent = 'Ask a Question';
        postBtn.textContent = 'Post Question';
    }

    checkFormValidity(); // Check initial state
}

function closeModal() {
    modal.classList.add('hidden');
    questionForm.reset();
    selectedImage = null;
    editingQuestionId = null;

    // Clear image preview
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const fileNameDisplay = document.getElementById('file-name');
    imagePreviewContainer.classList.add('hidden');
    fileNameDisplay.textContent = '';

    // Reset button state
    const postBtn = document.getElementById('post-question-btn');
    postBtn.disabled = true;
}

askBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Form Validation - Enable/Disable Post Button
const titleInput = document.getElementById('q-title');
const bodyInput = document.getElementById('q-body');
const postBtn = document.getElementById('post-question-btn');

function checkFormValidity() {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Enable button only if both title and body have content
    if (title && body) {
        postBtn.disabled = false;
    } else {
        postBtn.disabled = true;
    }
}

titleInput.addEventListener('input', checkFormValidity);
bodyInput.addEventListener('input', checkFormValidity);

// Image Upload Handling
const imageInput = document.getElementById('q-image');
const imagePreview = document.getElementById('image-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');
const removeImageBtn = document.getElementById('remove-image');
const fileNameDisplay = document.getElementById('file-name');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            alert('파일 크기는 5MB를 초과할 수 없습니다.');
            imageInput.value = '';
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            imageInput.value = '';
            return;
        }

        // Read and display image
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedImage = event.target.result;
            imagePreview.src = selectedImage;
            imagePreviewContainer.classList.remove('hidden');
            fileNameDisplay.textContent = `📎 ${file.name} `;
        };
        reader.readAsDataURL(file);
    }
});

removeImageBtn.addEventListener('click', () => {
    selectedImage = null;
    imageInput.value = '';
    imagePreviewContainer.classList.add('hidden');
    fileNameDisplay.textContent = '';
});

// Form Submission
questionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('q-title').value;
    const body = document.getElementById('q-body').value;
    const role = document.getElementById('q-role').value;

    if (editingQuestionId) {
        // Update existing question
        const question = questions.find(q => q.id === editingQuestionId);
        if (question) {
            question.title = title;
            question.body = body;
            question.tags = role ? [role] : [];
            question.image = selectedImage;
        }
    } else {
        // Create new question
        const newQuestion = {
            id: questions.length + 101,
            user_id: currentUser.id,
            title: title,
            body: body,
            status: "Open",
            views: 0,
            votes: 0,
            answer_count: 0,
            created_at: new Date().toISOString(),
            tags: role ? [role] : [],
            image: selectedImage,
            favorited: false
        };
        questions.unshift(newQuestion);
    }

    renderFeed();
    closeModal();
});


// Init
renderFeed();
renderLeaderboard();
renderRoleTags();

// Login/Logout Functionality
const userProfileContainer = document.getElementById('user-profile-container');
let isLoggedIn = true;

function renderHeaderProfile() {
    if (isLoggedIn) {
        userProfileContainer.innerHTML = `
            <img src="${currentUser.avatar}" alt="${currentUser.nickname}" class="avatar" id="header-avatar">
            <div class="profile-dropdown" id="profile-dropdown">
                <div class="dropdown-header">
                    <img src="${currentUser.avatar}" alt="${currentUser.nickname}" class="avatar-large">
                    <div class="dropdown-user-name">${currentUser.nickname}</div>
                    <div class="dropdown-user-meta">Expeditioner · Innovator<br>51,600 Points</div>
                </div>
                <div class="dropdown-actions">
                    <a href="#" class="dropdown-item">Profile</a>
                    <a href="#" class="dropdown-item">Settings</a>
                    <a href="#" class="dropdown-item">Help & Support</a>
                    <a href="#" class="dropdown-item logout" id="logout-btn">Logout</a>
                </div>
            </div>
        `;

        const avatarBtn = document.getElementById('header-avatar');
        const dropdown = document.getElementById('profile-dropdown');

        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        userProfileContainer.innerHTML = `
            <button class="login-btn" id="login-btn">Log In</button>
        `;

        document.getElementById('login-btn').addEventListener('click', login);
    }
}

function login() {
    // Redirect to login page
    window.location.href = 'login.html';
}

function logout() {
    isLoggedIn = false;
    renderHeaderProfile();

    // Reset to "All Questions" if user was viewing "My Questions"
    if (currentFilter === 'my-questions') {
        currentFilter = 'all';
        filterLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        renderFeed();
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && dropdown.classList.contains('show') && !e.target.closest('.user-profile')) {
        dropdown.classList.remove('show');
    }
});

// Initialize profile
renderHeaderProfile();

// Feed Post Action Functions
function toggleFavorite(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.favorited = !question.favorited;
        renderFeed();
    }
}

function togglePostMenu(questionId, event) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${questionId}`);

    // Close all other menus
    document.querySelectorAll('.post-menu-dropdown').forEach(m => {
        if (m.id !== `menu-${questionId}`) {
            m.classList.remove('show');
        }
    });

    menu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.post-menu-btn')) {
        document.querySelectorAll('.post-menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

function editQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    editingQuestionId = questionId;

    // Pre-fill form with existing data
    document.getElementById('q-title').value = question.title;
    document.getElementById('q-body').value = question.body;
    document.getElementById('q-role').value = question.tags[0] || '';

    // Handle image if exists
    if (question.image) {
        selectedImage = question.image;
        const imagePreview = document.getElementById('image-preview');
        const imagePreviewContainer = document.getElementById('image-preview-container');
        imagePreview.src = selectedImage;
        imagePreviewContainer.classList.remove('hidden');
    }

    // Close dropdown menu
    document.getElementById(`menu-${questionId}`).classList.remove('show');

    // Open modal
    openModal();
}

function confirmDelete(questionId) {
    questionToDelete = questionId;
    const confirmModal = document.getElementById('confirm-modal');
    confirmModal.classList.remove('hidden');

    // Close dropdown menu
    document.getElementById(`menu-${questionId}`).classList.remove('show');
}

function deleteQuestion() {
    if (!questionToDelete) return;

    const index = questions.findIndex(q => q.id === questionToDelete);
    if (index !== -1) {
        questions.splice(index, 1);
        renderFeed();

        // Show success toast
        showToast('질문이 삭제되었습니다');
    }

    // Close confirmation modal
    document.getElementById('confirm-modal').classList.add('hidden');
    questionToDelete = null;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>✓</span> ${message}`;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Confirmation Modal Event Listeners
const confirmModal = document.getElementById('confirm-modal');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmDeleteBtn = document.getElementById('confirm-delete');

confirmCancelBtn.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
    questionToDelete = null;
});

confirmDeleteBtn.addEventListener('click', deleteQuestion);

// Close confirmation modal when clicking outside
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.add('hidden');
        questionToDelete = null;
    }
});

// Report and Mute functions
function reportQuestion(questionId) {
    const menu = document.getElementById(`menu-${questionId}`);
    if (menu) menu.classList.remove('show');
    showToast('신고가 접수되었습니다');
}

function muteQuestion(questionId) {
    const menu = document.getElementById(`menu-${questionId}`);
    if (menu) menu.classList.remove('show');
    showToast('알림이 해제되었습니다');
}
