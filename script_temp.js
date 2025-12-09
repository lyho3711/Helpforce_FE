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
    const displayQuestions = getFilteredAndSortedQuestions();

    if (displayQuestions.length === 0) {
        feedListEl.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">No questions found.</div>';
    }

    displayQuestions.forEach(q => {
        const user = getUser(q.user_id);
        const card = document.createElement('div');
        card.className = 'feed-item';
        
        const isOwnPost = q.user_id === currentUser.id;
        const favoriteIcon = '';
        const favoriteClass = q.favorited ? 'favorited' : '';
        
        card.innerHTML = `
            <div class="feed-item-header">
                <div class="user-info">
                    <img src="${user.avatar}" alt="${user.nickname}" class="avatar-sm">
                    <div>
                        <div class="user-name">${user.nickname}</div>
                        <div class="post-meta">${timeAgo(q.created_at)}</div>
                    </div>
                </div>
                <div class="feed-item-actions">
                    <button class="favorite-btn ${favoriteClass}" onclick="toggleFavorite(${q.id})" title="즐겨찾기">${favoriteIcon}</button>
                    ${isOwnPost ? `
                        <div style="position: relative;">
                            <button class="post-menu-btn" onclick="togglePostMenu(${q.id}, event)"></button>
                            <div class="post-menu-dropdown" id="menu-${q.id}">
                                <button class="post-menu-item" onclick="editQuestion(${q.id})">
                                    <span class="menu-icon"></span>
                                    <span>편집</span>
                                </button>
                                <button class="post-menu-item delete" onclick="confirmDelete(${q.id})">
                                    <span class="menu-icon"></span>
                                    <span>삭제</span>
                                </button>
                                <button class="post-menu-item" onclick="reportQuestion(${q.id})">
                                    <span class="menu-icon"></span>
                                    <span>신고</span>
                                </button>
                                <button class="post-menu-item" onclick="muteQuestion(${q.id})">
                                    <span class="menu-icon"></span>
                                    <span>알림 해제</span>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <a href="#" class="question-title" onclick="showQuestionDetail(${q.id}); return false;">${q.title}</a>
            <div class="question-body">${q.body}</div>
            <div class="tags">
                ${q.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="feed-stats">
                <div class="stat-item"><span></span> ${q.views} Views</div>
                <div class="stat-item"><span></span> ${q.answer_count} Answers</div>
                <div class="stat-item" onclick="voteQuestion(${q.id})"><span></span> ${q.votes} Votes</div>
            </div>
        `;
        feedListEl.appendChild(card);
    });
}
