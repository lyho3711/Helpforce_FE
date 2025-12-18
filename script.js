// Mock Data
const currentUser = {
    id: 1,
    nickname: "TrailblazerUser",
    crmCohort: "1기",
    avatar: "https://ui-avatars.com/api/?name=1기&background=00A1E0&color=fff&length=2"
};

const users = [
    currentUser,
    { id: 2, nickname: "ApexGuru", crmCohort: "2기", avatar: "https://ui-avatars.com/api/?name=2기&background=random&length=2" },
    { id: 3, nickname: "LWC_Dev", crmCohort: "3기", avatar: "https://ui-avatars.com/api/?name=3기&background=random&length=2" },
    { id: 4, nickname: "Abhishek R", crmCohort: "4기", avatar: "https://ui-avatars.com/api/?name=4기&background=random&length=2" },
    { id: 5, nickname: "Vishal Verma", crmCohort: "5기", avatar: "https://ui-avatars.com/api/?name=5기&background=random&length=2" }
];

// Sync current user data from storage if available
function syncCurrentUserWithStorage() {
    const storedUserDataStr = localStorage.getItem('userData');
    if (storedUserDataStr) {
        const userData = JSON.parse(storedUserDataStr);
        if (userData.nickname) currentUser.nickname = userData.nickname;
        if (userData.crmCohort) currentUser.crmCohort = userData.crmCohort;
        // Update avatar based on cohort
        currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.crmCohort)}&background=00A1E0&color=fff&length=2`;
    }
}
syncCurrentUserWithStorage();

// Global Answers Data
let allAnswers = [
    {
        id: 201,
        question_id: 101,
        user_id: 2,
        body: "This is a great question! I think you should try using pagination with OFFSET in SOQL.",
        is_accepted: false,
        likes: 5,
        likedByMe: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 202,
        question_id: 101,
        user_id: 3,
        body: "Actually, for LWC datatables, infinite loading is better supported. Check the documentation.",
        is_accepted: true,
        likes: 12,
        likedByMe: false,
        created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: 203,
        question_id: 102,
        user_id: 1, // currentUser
        body: "Trigger.new is a list of the new versions of the sObject records. Trigger.oldMap is a map of IDs to the old versions of the sObject records.",
        is_accepted: true,
        likes: 8,
        likedByMe: false,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
];

// Initial Mock Questions
let questions = [
    {
        id: 101,
        user_id: 1, // Changed to currentUser for testing
        title: "How to handle large data volumes in LWC?",
        body: "I'm facing performance issues when rendering a datatable with over 5000 records. What are the best practices for pagination or infinite scrolling in Lightning Web Components?",
        status: "Open",
        views: 120,
        votes: 5,
        answer_count: 2,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        tags: ["Developer"],
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
        tags: ["Developer"],
        favorited: true
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
        tags: ["Architect"],
        favorited: false
    },
    {
        id: 104,
        user_id: 2,
        title: "Best practices for Data Loader?",
        body: "I need to import 50k records. What are the recommended batch sizes and settings?",
        status: "Open",
        views: 45,
        votes: 1,
        answer_count: 0,
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        tags: ["Data Analyst"],
        favorited: false
    }
];

// Generate more mock questions for pagination testing
for (let i = 1; i <= 30; i++) {
    questions.push({
        id: 104 + i,
        user_id: (i % 3) + 1,
        title: `Mock Question ${i} for Pagination Testing`,
        body: `This is a generated question to test the pagination functionality. Question number ${i}.`,
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

const rolesList = [
    "Administrator", "Architect", "Business Analyst", "Consultant",
    "Customer Service Professional", "Data Analyst", "Developer",
    "Marketer", "Not Applicable", "Sales Professional", "UX Designer"
];

// DOM Elements
const feedListEl = document.getElementById('feed-list');
const feedHeaderEl = document.querySelector('.feed-header');
const searchContainerEl = document.querySelector('.search-container'); // Add search container selection
const sidebarRightEl = document.querySelector('.sidebar-right'); // Add right sidebar selection
const mainLayoutEl = document.querySelector('.main-layout'); // Add main layout selection
const questionDetailEl = document.getElementById('question-detail');
const detailContentEl = document.getElementById('detail-content');
const backToFeedBtn = document.getElementById('back-to-feed');
const leaderboardListEl = document.getElementById('leaderboard-list');
const recommendedTopicsListEl = document.getElementById('recommended-topics-list');
const askBtn = document.getElementById('ask-question-btn');
const modal = document.getElementById('question-modal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelModalBtn = document.querySelector('.close-modal-btn');
const questionForm = document.getElementById('question-form');
const qTitleInput = document.getElementById('q-title');
const qBodyInput = document.getElementById('q-body');
const postQuestionBtn = document.getElementById('post-question-btn');
const qFileInput = document.getElementById('q-file');
const qFileNameDisplay = document.getElementById('q-file-name');
const qPreviewImg = document.getElementById('q-preview-img');
const filterLinks = document.querySelectorAll('.filters a');
const sortSelect = document.getElementById('sort-select');
const answerEditModal = document.getElementById('answer-edit-modal');
const closeAnswerEditBtn = document.querySelector('.close-answer-edit');
const cancelAnswerEditBtn = document.querySelector('.close-answer-edit-btn');
const answerEditForm = document.getElementById('answer-edit-form');

// State
let currentFilter = 'all';
let currentSort = 'latest';
let currentTagFilter = null;
let editingQuestionId = null;
let questionToDelete = null;
let editingAnswerId = null;
let answerToDelete = null;
let currentPage = 1;
const itemsPerPage = 10;
let selectedRoles = [];
let searchQuery = '';
let searchScope = 'content';
let currentQuestionImage = null; // Store base64 image for new question
let currentAnswerImage = null; // Store base64 image for new answer

// Helper Functions
function getUser(id) {
    return users.find(u => u.id === id) || users[0];
}

function getAcceptButtonHtml(isQuestionAuthor, answer, question) {
    if (!isQuestionAuthor) return '';

    if (answer.is_accepted) {
        return `<button class="accept-btn unaccept-btn" onclick="acceptAnswer(${answer.id})">✓ 채택 취소</button>`;
    }

    if (!question.has_accepted_answer) {
        return `<button class="accept-btn" onclick="acceptAnswer(${answer.id})">✓ 채택하기</button>`;
    }

    return '';
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

    // Search Filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (searchScope === 'content') {
            filtered = filtered.filter(q =>
                q.title.toLowerCase().includes(query) ||
                q.body.toLowerCase().includes(query)
            );
        } else if (searchScope === 'title') {
            filtered = filtered.filter(q =>
                q.title.toLowerCase().includes(query)
            );
        } else if (searchScope === 'body') {
            filtered = filtered.filter(q =>
                q.body.toLowerCase().includes(query)
            );
        }
    }

    if (currentTagFilter) {
        filtered = filtered.filter(q => q.tags && q.tags.includes(currentTagFilter));
    }

    if (currentFilter === 'my-questions') {
        filtered = filtered.filter(q => q.user_id === currentUser.id);
    } else if (currentFilter === 'my-answers') {
        const answeredQuestionIds = allAnswers
            .filter(a => a.user_id === currentUser.id)
            .map(a => a.question_id);
        filtered = filtered.filter(q => answeredQuestionIds.includes(q.id));
    } else if (currentFilter === 'bookmarks') {
        filtered = filtered.filter(q => q.favorited === true);
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

    // Pagination Logic
    const totalPages = Math.ceil(allFilteredQuestions.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = 1; // Reset if out of bounds
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayQuestions = allFilteredQuestions.slice(startIndex, endIndex);

    displayQuestions.forEach(q => {
        const user = getUser(q.user_id);
        const card = document.createElement('div');
        card.className = 'feed-item';
        const isOwnPost = q.user_id === currentUser.id;
        const favoriteClass = q.favorited ? 'favorited' : '';
        const favoriteIcon = q.favorited ? '★' : '☆';

        // Calculate total likes from answers for Votes display
        const qAnswers = allAnswers.filter(a => a.question_id === q.id);
        const totalAnswerLikes = qAnswers.reduce((sum, a) => sum + a.likes, 0);

        card.innerHTML = `
            <div class="feed-main-content">
                <div class="feed-item-header">
                    <div class="user-info">
                        <img src="${user.avatar}" alt="${user.nickname}" class="avatar-sm">
                        <div>
                            <div class="user-name">${user.nickname}</div>
                            <div class="post-meta">${timeAgo(q.created_at)}</div>
                        </div>
                    </div>
                    <div class="feed-item-actions">
                        <button class="favorite-btn ${favoriteClass}" onclick="toggleFavorite(${q.id})" title="Bookmark">${favoriteIcon}</button>
                        ${isOwnPost ? `
                            <div style="position: relative;">
                                <button class="post-menu-btn" onclick="togglePostMenu(${q.id}, event)">▼</button>
                                <div class="post-menu-dropdown" id="menu-${q.id}">
                                    <button class="post-menu-item" onclick="editQuestion(${q.id})"><span class="menu-icon">✏️</span><span>편집</span></button>
                                    <button class="post-menu-item delete" onclick="confirmDelete(${q.id})"><span class="menu-icon">🗑️</span><span>삭제</span></button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <a href="#" class="question-title" onclick="showQuestionDetail(${q.id}); return false;">${q.title}</a>
                <div class="question-body">
                    ${q.body}
                    ${q.image ? `<img src="${q.image}" class="uploaded-image" alt="Question Image" onclick="showQuestionDetail(${q.id}); event.stopPropagation();">` : ''}
                </div>
                <div class="tags">
                    ${q.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    ${q.has_accepted_answer || q.status === 'Solved' ? `<span class="solved-badge">✓ Solved</span>` : ''}
                </div>
                <div class="feed-stats">
                    <div class="stat-item"><span>👁️</span> ${q.views} Views</div>
                    <div class="stat-item"><span>💬</span> ${q.answer_count} Answers</div>
                    <div class="stat-item" style="cursor: default;"><span>👍</span> ${totalAnswerLikes} Votes</div>
                </div>
            </div>
        `;
        feedListEl.appendChild(card);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    if (totalPages <= 1) return;

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';

    let paginationHtml = '';

    // Previous Button
    paginationHtml += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            &lt; Previous
        </button>
    `;

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <button class="pagination-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    // Next Button
    paginationHtml += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            Next &gt;
        </button>
    `;

    paginationContainer.innerHTML = paginationHtml;
    feedListEl.appendChild(paginationContainer);
}

function changePage(newPage) {
    currentPage = newPage;
    renderFeed();
    window.scrollTo(0, 0);
}

function renderLeaderboard() {
    if (!leaderboardListEl) return;

    // Calculate total likes for each user
    const userLikes = {};
    allAnswers.forEach(a => {
        if (!userLikes[a.user_id]) userLikes[a.user_id] = 0;
        userLikes[a.user_id] += a.likes;
    });

    // Map users to leaderboard format
    const leaderboard = users.map(user => ({
        id: user.id,
        name: user.nickname,
        avatar: user.avatar,
        points: userLikes[user.id] || 0
    }));

    // Sort by points (likes) descending
    leaderboard.sort((a, b) => b.points - a.points);

    // Take top 5
    const top5 = leaderboard.slice(0, 5);

    leaderboardListEl.innerHTML = top5.map((user, index) => `
        <div class="leaderboard-item">
            <div class="lb-user-info">
                <div class="lb-rank">${index + 1}</div>
                <img src="${user.avatar}" alt="${user.name}" class="avatar-sm">
                <div class="lb-details">
                    <div class="lb-name">${user.name}</div>
                    <div class="lb-points">${user.points} Likes</div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderRecommendedTopics() {
    if (!recommendedTopicsListEl) return;

    const tagCounts = {};
    questions.forEach(q => {
        if (q.tags && q.tags.length > 0) {
            q.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    // Show ALL roles, sorted by count (desc) then name (asc)
    const allRoles = rolesList.map(role => {
        return {
            name: role,
            count: tagCounts[role] || 0
        };
    }).sort((a, b) => {
        if (b.count !== a.count) {
            return b.count - a.count; // Sort by count descending
        }
        return a.name.localeCompare(b.name); // Sort by name ascending
    });

    recommendedTopicsListEl.innerHTML = allRoles.map(topic => {
        const isActive = currentTagFilter === topic.name;
        return `
        <div class="topic-item ${isActive ? 'active-topic' : ''}" onclick="filterByTag('${topic.name}')" style="cursor: pointer;">
            <div class="topic-info">
                <div class="topic-details">
                    <div class="topic-name">${topic.name}</div>
                </div>
                <div class="topic-stats">${topic.count}</div>
            </div>
        </div>
    `}).join('');
}

function filterByTag(tagName) {
    if (currentTagFilter === tagName) {
        currentTagFilter = null;
    } else {
        currentTagFilter = tagName;
    }

    filterLinks.forEach(l => l.classList.remove('active'));
    if (!currentTagFilter) {
        document.querySelector('[data-filter="all"]').classList.add('active');
        currentFilter = 'all';
    } else {
        currentFilter = 'tag';
    }

    currentPage = 1; // Reset to first page on filter change
    renderFeed();
    renderRecommendedTopics();
}

function showQuestionDetail(id) {
    const q = questions.find(q => q.id === id);
    if (!q) return;

    const user = getUser(q.user_id);
    const isQuestionAuthor = q.user_id === currentUser.id;

    let answers = allAnswers.filter(a => a.question_id === id);
    answers.sort((a, b) => {
        if (a.is_accepted) return -1;
        if (b.is_accepted) return 1;
        return b.likes - a.likes;
    });

    const totalAnswerLikes = answers.reduce((sum, a) => sum + a.likes, 0);

    let answersHtml = answers.map(a => {
        const aUser = getUser(a.user_id);
        const isOwnAnswer = a.user_id === currentUser.id;
        const likedClass = a.likedByMe ? 'liked' : '';

        return `
            <div class="answer-item ${a.is_accepted ? 'accepted-answer' : ''}">
                <div class="answer-header">
                    <div class="answer-header-top">
                        <div class="user-info">
                            <img src="${aUser.avatar}" alt="${aUser.nickname}" class="avatar-sm">
                            <div>
                                <div class="user-name">${aUser.nickname}</div>
                                <div class="post-meta">${timeAgo(a.created_at)}</div>
                            </div>
                        </div>
                         ${a.is_accepted ? '<div class="answer-badge-container"><div class="accepted-badge"><span style="font-size: 1.1em;">✓</span> 선택된 답변</div></div>' : ''}
                        ${isOwnAnswer ? `
                            <div style="position: relative; margin-left: 0.5rem;">
                                <button class="answer-menu-btn" onclick="toggleAnswerMenu(${a.id}, event)">▼</button>
                                <div class="post-menu-dropdown" id="answer-menu-${a.id}">
                                    <button class="post-menu-item" onclick="editAnswer(${a.id})"><span class="menu-icon">✏️</span><span>편집</span></button>
                                    <button class="post-menu-item delete" onclick="confirmDeleteAnswer(${a.id})"><span class="menu-icon">🗑️</span><span>삭제</span></button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="answer-body">
                    ${a.body}
                    ${a.image ? `<img src="${a.image}" class="uploaded-image" alt="Answer Image">` : ''}
                </div>
                
                <div class="answer-actions">
                    <button class="like-btn ${likedClass}" onclick="toggleAnswerLike(${a.id})">
                        <span class="like-icon">👍</span> 좋아요 ${a.likes}개
                    </button>
                    ${getAcceptButtonHtml(isQuestionAuthor, a, q)}
                </div>
                </div>
            </div>
        `;
    }).join('');

    const answerInputHtml = `
        <div class="answer-input-container expanded" id="answer-input-container-detail">
            <div class="answer-input-header">
                <img src="${currentUser.avatar}" class="avatar-sm" style="width: 24px; height: 24px;">
                <span>댓글 추가</span>
            </div>
            <textarea id="new-answer-body-detail" class="answer-textarea" placeholder="댓글을 작성하세요..." style="min-height: 100px;"></textarea>
            <div class="answer-controls">
                 <label class="file-attachment-ui">
                    <input type="file" id="file-input-detail" style="display: none;" onchange="handleFileSelect(event, 'detail')">
                    <span>📎 파일첨부 (JPG, PNG)</span>
                    <span id="file-name-detail" class="file-name-display"></span>
                </label>
            </div>
            <img id="preview-answer-detail" class="preview-image" alt="Image Preview">
            <div class="answer-submit-actions" style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                <button class="btn-primary" onclick="submitAnswer(${q.id}, 'detail')">답글 쓰기</button>
            </div>
        </div>
    `;

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
            <div class="detail-body">
                ${q.body}
                ${q.image ? `<img src="${q.image}" class="uploaded-image" alt="Question Image">` : ''}
            </div>
            <div class="tags">
                ${q.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                ${q.has_accepted_answer || q.status === 'Solved' ? `<span class="solved-badge">✓ Solved</span>` : ''}
            </div>
            <div class="feed-stats">
                <div class="stat-item"><span>👁️</span> ${q.views} Views</div>
                <div class="stat-item"><span>👍</span> ${totalAnswerLikes} Votes</div>
            </div>
        </div>
        <div class="answers-section">
            <div class="answers-header">댓글 ${answers.length}개</div>
            ${answersHtml}
            ${answerInputHtml}
        </div>
    `;

    feedListEl.classList.add('hidden');
    feedHeaderEl.classList.add('hidden');

    // Hide Search and Sidebar
    if (searchContainerEl) searchContainerEl.classList.add('hidden');
    if (sidebarRightEl) sidebarRightEl.classList.add('hidden');
    if (mainLayoutEl) mainLayoutEl.classList.add('detail-active');

    questionDetailEl.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function hideQuestionDetail() {
    questionDetailEl.classList.add('hidden');

    // Show Search and Sidebar
    if (searchContainerEl) searchContainerEl.classList.remove('hidden');
    if (sidebarRightEl) sidebarRightEl.classList.remove('hidden');
    if (mainLayoutEl) mainLayoutEl.classList.remove('detail-active');

    feedListEl.classList.remove('hidden');
    feedHeaderEl.classList.remove('hidden');
    renderFeed(); // Re-render to show updates
}

// Answer Functions
function expandAnswerInput(questionId) {
    const container = document.getElementById(`answer-input-container-${questionId}`);
    if (container) {
        container.classList.add('expanded');
    }
}

function handleFileSelect(event, questionId) {
    const input = event.target;
    const fileNameDisplay = document.getElementById(`file-name-${questionId}`);

    // For answer preview in detail view
    const previewId = questionId === 'detail' ? 'preview-answer-detail' : `preview-answer-${questionId}`;
    const previewImg = document.getElementById(previewId);

    if (input.files && input.files[0]) {
        const file = input.files[0];
        fileNameDisplay.textContent = file.name;

        // Read file for preview and storage
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImg) {
                previewImg.src = e.target.result;
                previewImg.classList.add('show');
            }
            if (questionId === 'detail') {
                currentAnswerImage = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    } else {
        fileNameDisplay.textContent = '';
        if (previewImg) {
            previewImg.classList.remove('show');
            previewImg.src = '';
        }
        currentAnswerImage = null;
    }
}

function submitAnswer(questionId, context = 'feed') {
    const inputId = context === 'detail' ? 'new-answer-body-detail' : `new-answer-body-${questionId}`;
    const body = document.getElementById(inputId).value;

    if (!body.trim()) {
        alert('내용을 입력해주세요.');
        return;
    }

    const newAnswer = {
        id: allAnswers.length + 201,
        question_id: questionId,
        user_id: currentUser.id,
        body: body,
        image: currentAnswerImage, // Add image data
        is_accepted: false,
        likes: 0,
        likedByMe: false,
        created_at: new Date().toISOString()
    };

    // Reset image state
    currentAnswerImage = null;

    allAnswers.push(newAnswer);

    const q = questions.find(q => q.id === questionId);
    if (q) q.answer_count++;

    if (context === 'detail') {
        showQuestionDetail(questionId);
    } else {
        renderFeed();
    }
}

function toggleAnswerMenu(answerId, event) {
    event.stopPropagation();
    const menu = document.getElementById(`answer-menu-${answerId}`);
    document.querySelectorAll('.post-menu-dropdown').forEach(m => {
        if (m.id !== `answer-menu-${answerId}`) m.classList.remove('show');
    });
    menu.classList.toggle('show');
}

function editAnswer(answerId) {
    const answer = allAnswers.find(a => a.id === answerId);
    if (!answer) return;

    editingAnswerId = answerId;
    document.getElementById('edit-answer-body').value = answer.body;

    const menu = document.getElementById(`answer-menu-${answerId}`);
    if (menu) menu.classList.remove('show');

    answerEditModal.classList.remove('hidden');
}

function confirmDeleteAnswer(answerId) {
    answerToDelete = answerId;
    const confirmModal = document.getElementById('confirm-modal');
    confirmModal.querySelector('.confirm-modal-title').textContent = '댓글 삭제';
    confirmModal.querySelector('.confirm-modal-message').textContent = '정말로 이 댓글을 삭제하시겠습니까?';
    confirmModal.classList.remove('hidden');

    const menu = document.getElementById(`answer-menu-${answerId}`);
    if (menu) menu.classList.remove('show');
}

function deleteAnswer() {
    if (!answerToDelete) return;

    const idx = allAnswers.findIndex(a => a.id === answerToDelete);
    if (idx !== -1) {
        const deletedAnswer = allAnswers[idx];
        const questionId = deletedAnswer.question_id;

        // If the deleted answer was accepted, reset the question status
        if (deletedAnswer.is_accepted) {
            const q = questions.find(q => q.id === questionId);
            if (q) {
                q.has_accepted_answer = false;
                q.status = 'Open';
            }
        }

        allAnswers.splice(idx, 1);

        const q = questions.find(q => q.id === questionId);
        if (q) q.answer_count--;

        if (!questionDetailEl.classList.contains('hidden')) {
            showQuestionDetail(questionId);
        }
        renderFeed();
        showToast('댓글이 삭제되었습니다');
    }

    document.getElementById('confirm-modal').classList.add('hidden');
    answerToDelete = null;
}

function toggleAnswerLike(answerId) {
    const answer = allAnswers.find(a => a.id === answerId);
    if (answer) {
        if (answer.likedByMe) {
            answer.likes--;
            answer.likedByMe = false;
        } else {
            answer.likes++;
            answer.likedByMe = true;
        }

        const qId = answer.question_id;
        if (!questionDetailEl.classList.contains('hidden')) {
            showQuestionDetail(qId);
        } else {
            renderFeed();
        }
    }
}

function acceptAnswer(answerId) {
    const answer = allAnswers.find(a => a.id === answerId);
    if (!answer) return;

    const q = questions.find(q => q.id === answer.question_id);
    if (!q) return;

    if (answer.is_accepted) {
        // Unselect logic
        answer.is_accepted = false;
        q.has_accepted_answer = false;
        q.status = 'Open';
    } else {
        // Reset others if multiple (optional, assuming only one accepted)
        allAnswers.forEach(a => {
            if (a.question_id === answer.question_id) a.is_accepted = false;
        });

        answer.is_accepted = true;
        q.has_accepted_answer = true;
        q.status = 'Solved'; // Mark as solved
    }

    if (!questionDetailEl.classList.contains('hidden')) {
        showQuestionDetail(answer.question_id);
    } else {
        renderFeed();
    }
}

// Feed Action Functions
function toggleFavorite(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.favorited = !question.favorited;
        renderFeed();
        if (currentFilter === 'bookmarks' && !question.favorited) {
            renderFeed();
        }
    }
}

function togglePostMenu(questionId, event) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${questionId}`);
    document.querySelectorAll('.post-menu-dropdown').forEach(m => {
        if (m.id !== `menu-${questionId}`) m.classList.remove('show');
    });
    menu.classList.toggle('show');
}

function editQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    editingQuestionId = questionId;
    document.getElementById('q-title').value = question.title;
    document.getElementById('q-body').value = question.body;

    // Populate selected roles
    selectedRoles = [...question.tags];
    renderRoleBadges();

    const menu = document.getElementById(`menu-${questionId}`);
    if (menu) menu.classList.remove('show');
    openModal();
    // Re-check validity after populating values
    checkFormValidity();
}

function confirmDelete(questionId) {
    questionToDelete = questionId;
    const confirmModal = document.getElementById('confirm-modal');
    confirmModal.querySelector('.confirm-modal-title').textContent = '질문 삭제';
    confirmModal.querySelector('.confirm-modal-message').textContent = '정말로 이 질문을 삭제하시겠습니까?';
    confirmModal.classList.remove('hidden');
    const menu = document.getElementById(`menu-${questionId}`);
    if (menu) menu.classList.remove('show');
}

function deleteQuestion() {
    if (!questionToDelete) return;
    const idx = questions.findIndex(q => q.id === questionToDelete);
    if (idx !== -1) {
        questions.splice(idx, 1);
        renderFeed();
        renderRecommendedTopics();
        showToast('질문이 삭제되었습니다');
    }
    document.getElementById('confirm-modal').classList.add('hidden');
    questionToDelete = null;
}

function cancelDelete() {
    document.getElementById('confirm-modal').classList.add('hidden');
    questionToDelete = null;
    answerToDelete = null;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>✓</span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Role Badge Logic
function renderRoleBadges() {
    const container = document.getElementById('selected-roles-container');
    container.innerHTML = '';
    selectedRoles.forEach(role => {
        const badge = document.createElement('span');
        badge.className = 'role-badge';
        badge.textContent = `#${role}`;
        badge.onclick = () => {
            selectedRoles = selectedRoles.filter(r => r !== role);
            renderRoleBadges();
        };
        container.appendChild(badge);
    });
}

// Event Listeners
backToFeedBtn.addEventListener('click', hideQuestionDetail);

filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentFilter = link.dataset.filter;
        currentTagFilter = null;
        renderFeed();
        renderRecommendedTopics();
        hideQuestionDetail();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderFeed();
});

function openModal() {
    modal.classList.remove('hidden');
    const modalTitle = modal.querySelector('h2');
    const postBtn = modal.querySelector('button[type="submit"]');
    if (editingQuestionId) {
        modalTitle.textContent = 'Edit Question'; // Changed to English for consistency
        postBtn.textContent = 'Update'; // Changed to English for consistency
    } else {
        modalTitle.textContent = 'Ask a Question';
        postBtn.textContent = 'Post Question';
        selectedRoles = []; // Reset roles for new question
        renderRoleBadges();

        // Reset file input
        if (qFileInput) qFileInput.value = '';
        if (qFileNameDisplay) qFileNameDisplay.textContent = '';
        currentQuestionImage = null; // Reset image
        if (qPreviewImg) {
            qPreviewImg.classList.remove('show');
            qPreviewImg.src = '';
        }

        // Check validity (will disable button since fields are empty)
        checkFormValidity();
    }
}

function closeModal() {
    modal.classList.add('hidden');
    questionForm.reset();
    editingQuestionId = null;
    selectedRoles = [];
    renderRoleBadges();
}

askBtn.addEventListener('click', () => {
    editingQuestionId = null; // Ensure we are in create mode
    document.getElementById('q-title').value = '';
    document.getElementById('q-body').value = '';
    openModal();
});
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

// Question Form Validation & File Handler
function checkFormValidity() {
    const title = qTitleInput.value.trim();
    const body = qBodyInput.value.trim();
    if (title && body) {
        postQuestionBtn.disabled = false;
    } else {
        postQuestionBtn.disabled = true;
    }
}

if (qTitleInput) qTitleInput.addEventListener('input', checkFormValidity);
if (qBodyInput) qBodyInput.addEventListener('input', checkFormValidity);

if (qFileInput) {
    qFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            qFileNameDisplay.textContent = file.name;

            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                if (qPreviewImg) {
                    qPreviewImg.src = e.target.result;
                    qPreviewImg.classList.add('show');
                }
                currentQuestionImage = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            qFileNameDisplay.textContent = '';
            if (qPreviewImg) {
                qPreviewImg.classList.remove('show');
                qPreviewImg.src = '';
            }
            currentQuestionImage = null;
        }
    });
}

// Role Dropdown Listener
const roleSelect = document.getElementById('q-tags');
if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (selectedValue && !selectedRoles.includes(selectedValue)) {
            selectedRoles.push(selectedValue);
            renderRoleBadges();
        }
        e.target.value = ""; // Reset dropdown
    });
}

// Search Listeners
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const searchScopeSelect = document.getElementById('search-scope');

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        searchQuery = searchInput.value;
        searchScope = searchScopeSelect.value;
        currentPage = 1;
        renderFeed();
    });
}

if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value;
            searchScope = searchScopeSelect.value;
            currentPage = 1;
            renderFeed();
        }
    });
}

// Answer Edit Modal Listeners
closeAnswerEditBtn.addEventListener('click', () => answerEditModal.classList.add('hidden'));
cancelAnswerEditBtn.addEventListener('click', () => answerEditModal.classList.add('hidden'));

answerEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (editingAnswerId) {
        const answer = allAnswers.find(a => a.id === editingAnswerId);
        if (answer) {
            answer.body = document.getElementById('edit-answer-body').value;
            if (!questionDetailEl.classList.contains('hidden')) {
                showQuestionDetail(answer.question_id);
            } else {
                renderFeed();
            }
            answerEditModal.classList.add('hidden');
            editingAnswerId = null;
        }
    }
});

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
    if (e.target === answerEditModal) answerEditModal.classList.add('hidden');
});

questionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('q-title').value;
    const body = document.getElementById('q-body').value;

    if (editingQuestionId) {
        const q = questions.find(q => q.id === editingQuestionId);
        if (q) {
            q.title = title;
            q.body = body;
            q.tags = selectedRoles;
        }
    } else {
        const newQuestion = {
            id: questions.length + 101,
            user_id: currentUser.id,
            title: title,
            body: body,
            image: currentQuestionImage, // Add image
            status: "Open",
            views: 0,
            votes: 0,
            answer_count: 0,
            created_at: new Date().toISOString(),
            tags: selectedRoles,
            favorited: false
        };
        questions.unshift(newQuestion);
    }
    renderFeed();
    renderRecommendedTopics();
    closeModal();
});

// Confirmation modal handlers
const confirmModal = document.getElementById('confirm-modal');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmDeleteBtn = document.getElementById('confirm-delete');

confirmCancelBtn.addEventListener('click', cancelDelete);
confirmDeleteBtn.addEventListener('click', () => {
    if (questionToDelete) deleteQuestion();
    else if (answerToDelete) deleteAnswer();
});
confirmModal.addEventListener('click', e => {
    if (e.target === confirmModal) cancelDelete();
});

// Init
renderFeed();
renderLeaderboard();
renderRecommendedTopics();

// Login/Logout Functionality
const userProfileContainer = document.getElementById('user-profile-container');
let isLoggedIn = true;

function renderHeaderProfile() {
    if (isLoggedIn) {
        // Get stored user data if available
        const storedUserDataStr = localStorage.getItem('userData');
        let displayNickname = currentUser.nickname;
        let displayEmail = 'user@example.com';
        let displayCohort = '1기';
        let displayAffiliation = 'Trailblazer Community';

        if (storedUserDataStr) {
            const userData = JSON.parse(storedUserDataStr);
            if (userData.nickname) displayNickname = userData.nickname;
            if (userData.email) displayEmail = userData.email;
            if (userData.crmCohort) displayCohort = userData.crmCohort;
            if (userData.affiliation) displayAffiliation = userData.affiliation;
        }

        // Create avatar with cohort text
        const cohortAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayCohort)}&background=00A1E0&color=fff&length=2`;

        userProfileContainer.innerHTML = `
            <img src="${cohortAvatarUrl}" alt="${displayNickname}" class="avatar" id="header-avatar">
            <div class="profile-dropdown" id="profile-dropdown">
                <div class="dropdown-header">
                    <img src="${cohortAvatarUrl}" alt="${displayNickname}" class="avatar-large">
                    <div class="dropdown-user-name">${displayNickname}</div>
                    <div class="dropdown-user-meta" style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        ${displayEmail}<br>
                        ${displayAffiliation}
                    </div>
                </div>
                <div class="dropdown-actions">
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
    isLoggedIn = true;
    renderHeaderProfile();
}

function logout() {
    isLoggedIn = false;
    renderHeaderProfile();
    if (currentFilter === 'my-questions') {
        currentFilter = 'all';
        filterLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        renderFeed();
    }
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && dropdown.classList.contains('show') && !e.target.closest('.user-profile')) {
        dropdown.classList.remove('show');
    }
});

renderHeaderProfile();

// Logo Click Handler
const logoEl = document.querySelector('.logo');
if (logoEl) {
    logoEl.style.cursor = 'pointer';
    logoEl.addEventListener('click', () => {
        currentFilter = 'all';
        currentTagFilter = null;
        searchQuery = '';
        searchScope = 'content';
        currentPage = 1;

        // Reset UI states
        filterLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        if (searchInput) searchInput.value = '';
        if (searchScopeSelect) searchScopeSelect.value = 'content';

        hideQuestionDetail();
        renderFeed();
        renderRecommendedTopics();
    });
}
