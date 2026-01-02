// =====================================================
// STATE MANAGEMENT
// =====================================================
let currentUser = null;
let questions = [];
let allAnswers = [];
let tagsData = [];
let leaderboardData = [];

// Pagination State
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;
let totalItems = 0;

// Filter State
let currentFilter = 'all';
let currentSort = 'latest';
let currentTagFilter = null;
let searchQuery = '';
let searchScope = 'content';

// Edit State
let editingQuestionId = null;
let questionToDelete = null;
let editingAnswerId = null;
let answerToDelete = null;
let selectedRoles = [];

// Image State
let currentQuestionImage = null;
let currentAnswerImage = null;
let currentQuestionFiles = [];

// =====================================================
// DOM ELEMENTS
// =====================================================
const feedListEl = document.getElementById('feed-list');
const feedHeaderEl = document.querySelector('.feed-header');
const searchContainerEl = document.querySelector('.search-container');
const sidebarRightEl = document.querySelector('.sidebar-right');
const mainLayoutEl = document.querySelector('.main-layout');
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
const userProfileContainer = document.getElementById('user-profile-container');

// =====================================================
// HELPER FUNCTIONS
// =====================================================
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

function getTagName(tagId) {
    const tag = tagsData.find(t => t.id === tagId);
    return tag ? tag.name : `Tag ${tagId}`;
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

function showError(message) {
    alert(message);
}

function isLoggedIn() {
    return !!API.getAuthToken();
}

// =====================================================
// API DATA FETCHING
// =====================================================
async function fetchCurrentUser() {
    if (!isLoggedIn()) {
        currentUser = null;
        return;
    }
    const result = await API.auth.getMe();
    if (result.error) {
        if (result.status === 401) {
            API.removeAuthToken();
            localStorage.removeItem('userData');
            currentUser = null;
        }
        return;
    }
    currentUser = result;
    localStorage.setItem('userData', JSON.stringify(result));
}

async function fetchQuestions() {
    const params = {
        page: currentPage,
        size: itemsPerPage,
        sort: currentSort
    };

    // Search params
    if (searchQuery) {
        params.keyword = searchQuery;
        if (searchScope === 'content') {
            params.search_type = 'all';
        } else if (searchScope === 'title') {
            params.search_type = 'title';
        } else if (searchScope === 'body') {
            params.search_type = 'body';
        }
    }

    // Tag filter
    if (currentTagFilter) {
        const tag = tagsData.find(t => t.name === currentTagFilter);
        if (tag) {
            params.tag_ids = [tag.id];
        }
    }

    // Filter type - For my-questions, my-answers, bookmarks we need different endpoints
    if (currentFilter === 'my-questions') {
        const result = await API.myPage.getMyQuestions(currentPage, itemsPerPage);
        if (result.error) {
            console.error('Failed to fetch my questions:', result);
            questions = [];
            return;
        }
        questions = result.questions || [];
        if (result.pagination) {
            totalPages = result.pagination.total_pages;
            totalItems = result.pagination.total_items;
        }
        return;
    } else if (currentFilter === 'my-answers') {
        const result = await API.myPage.getMyAnsweredQuestions(currentPage, itemsPerPage);
        if (result.error) {
            console.error('Failed to fetch my answered questions:', result);
            questions = [];
            return;
        }
        questions = result.questions || [];
        if (result.pagination) {
            totalPages = result.pagination.total_pages;
            totalItems = result.pagination.total_items;
        }
        return;
    } else if (currentFilter === 'bookmarks') {
        const result = await API.myPage.getMyBookmarks(currentPage, itemsPerPage);
        if (result.error) {
            console.error('Failed to fetch bookmarks:', result);
            questions = [];
            return;
        }
        questions = result.questions || [];
        if (result.pagination) {
            totalPages = result.pagination.total_pages;
            totalItems = result.pagination.total_items;
        }
        return;
    }

    // Default: all questions
    const result = await API.questions.getList(params);
    if (result.error) {
        console.error('Failed to fetch questions:', result);
        questions = [];
        return;
    }

    questions = result.questions || [];
    if (result.pagination) {
        totalPages = result.pagination.total_pages;
        totalItems = result.pagination.total_items;
    }
}

async function fetchTags() {
    const result = await API.tags.getUsageCount();
    if (result.error) {
        console.error('Failed to fetch tags:', result);
        tagsData = [];
        return;
    }
    tagsData = result.tags || [];
}

async function fetchLeaderboard() {
    const result = await API.rankings.getTopContributors();
    if (result.error) {
        console.error('Failed to fetch leaderboard:', result);
        leaderboardData = [];
        return;
    }
    leaderboardData = result.rankings || [];
}

// =====================================================
// RENDER FUNCTIONS
// =====================================================
function renderFeed() {
    feedListEl.innerHTML = '';

    if (questions.length === 0) {
        feedListEl.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">No questions found.</div>';
        return;
    }

    questions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'feed-item';
        const isOwnPost = currentUser && q.user && q.user.id === currentUser.id;
        const favoriteClass = q.is_bookmarked ? 'favorited' : '';
        const favoriteIcon = q.is_bookmarked ? '★' : '☆';

        // Get user info
        const userName = q.user ? q.user.nickname : '익명';
        const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00A1E0&color=fff`;

        // Get tags
        const tagNames = (q.tag_ids || []).map(id => getTagName(id));

        // Calculate votes (answer_count or from answers if available)
        const answerCount = q.answer_count || 0;
        const votes = q.votes || 0;

        card.innerHTML = `
            <div class="feed-main-content">
                <div class="feed-item-header">
                    <div class="user-info">
                        <img src="${userAvatar}" alt="${userName}" class="avatar-sm">
                        <div>
                            <div class="user-name">${userName}</div>
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
                </div>
                <div class="tags">
                    ${tagNames.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    ${q.accepted_answer_id || q.status === 'closed' ? `<span class="solved-badge">✓ Solved</span>` : ''}
                </div>
                <div class="feed-stats">
                    <div class="stat-item"><span>👁️</span> ${q.views || 0} Views</div>
                    <div class="stat-item"><span>💬</span> ${answerCount} Answers</div>
                    <div class="stat-item" style="cursor: default;"><span>👍</span> ${votes} Votes</div>
                </div>
            </div>
        `;
        feedListEl.appendChild(card);
    });

    renderPagination();
}

function renderPagination() {
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

    // Page Numbers (show max 5 pages around current)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
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

async function changePage(newPage) {
    currentPage = newPage;
    await fetchQuestions();
    renderFeed();
    window.scrollTo(0, 0);
}

function renderLeaderboard() {
    if (!leaderboardListEl) return;

    if (leaderboardData.length === 0) {
        leaderboardListEl.innerHTML = '<div style="padding: 1rem; color: #666;">No data available</div>';
        return;
    }

    leaderboardListEl.innerHTML = leaderboardData.map((item, index) => {
        const user = item.user || {};
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname || 'User')}&background=random`;
        return `
            <div class="leaderboard-item">
                <div class="lb-user-info">
                    <div class="lb-rank">${item.rank || index + 1}</div>
                    <img src="${avatar}" alt="${user.nickname}" class="avatar-sm">
                    <div class="lb-details">
                        <div class="lb-name">${user.nickname || 'Unknown'}</div>
                        <div class="lb-points">${item.total_likes || 0} Likes</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderRecommendedTopics() {
    if (!recommendedTopicsListEl) return;

    if (tagsData.length === 0) {
        recommendedTopicsListEl.innerHTML = '<div style="padding: 1rem; color: #666;">No tags available</div>';
        return;
    }

    // Sort by usage count
    const sortedTags = [...tagsData].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

    recommendedTopicsListEl.innerHTML = sortedTags.map(tag => {
        const isActive = currentTagFilter === tag.name;
        return `
            <div class="topic-item ${isActive ? 'active-topic' : ''}" onclick="filterByTag('${tag.name}')" style="cursor: pointer;">
                <div class="topic-info">
                    <div class="topic-details">
                        <div class="topic-name">${tag.name}</div>
                    </div>
                    <div class="topic-stats">${tag.usage_count || 0}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function filterByTag(tagName) {
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

    currentPage = 1;
    await fetchQuestions();
    renderFeed();
    renderRecommendedTopics();
}

// =====================================================
// QUESTION DETAIL
// =====================================================
async function showQuestionDetail(id) {
    // Increment view count
    if (isLoggedIn()) {
        await API.questions.incrementViews(id);
    }

    const result = await API.questions.getDetail(id);
    if (result.error) {
        showError(result.message || '질문을 찾을 수 없습니다.');
        return;
    }

    const q = result;
    const user = q.user || { nickname: '익명' };
    const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname)}&background=00A1E0&color=fff`;
    const isQuestionAuthor = currentUser && user.id === currentUser.id;

    // Get tags
    const tagNames = (q.tag_ids || []).map(tid => getTagName(tid));

    // Answers from response
    const answers = q.answers || [];

    // Calculate total votes
    const totalAnswerLikes = answers.reduce((sum, a) => sum + (a.like_count || 0), 0);

    let answersHtml = answers.map(a => {
        const aUser = a.user || { nickname: '익명' };
        const aUserAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(aUser.nickname)}&background=random`;
        const isOwnAnswer = currentUser && aUser.id === currentUser.id;
        const likedClass = a.is_liked ? 'liked' : '';

        let acceptButtonHtml = '';
        if (isQuestionAuthor) {
            if (a.is_accepted) {
                acceptButtonHtml = `<button class="accept-btn unaccept-btn" onclick="acceptAnswer(${q.id}, ${a.id})">✓ 채택 취소</button>`;
            } else if (!q.accepted_answer_id) {
                acceptButtonHtml = `<button class="accept-btn" onclick="acceptAnswer(${q.id}, ${a.id})">✓ 채택하기</button>`;
            }
        }

        // Child answers (replies)
        let childAnswersHtml = '';
        if (a.child_answers && a.child_answers.length > 0) {
            childAnswersHtml = a.child_answers.map(child => {
                const childUser = child.user || { nickname: '익명' };
                const childAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(childUser.nickname)}&background=random`;
                const childLikedClass = child.is_liked ? 'liked' : '';
                return `
                    <div class="child-answer" style="margin-left: 2rem; padding: 1rem; border-left: 2px solid #e0e0e0;">
                        <div class="answer-header">
                            <div class="user-info">
                                <img src="${childAvatar}" alt="${childUser.nickname}" class="avatar-sm">
                                <div>
                                    <div class="user-name">${childUser.nickname}</div>
                                    <div class="post-meta">${timeAgo(child.created_at)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="answer-body">${child.body}</div>
                        <div class="answer-actions">
                            <button class="like-btn ${childLikedClass}" onclick="toggleAnswerLike(${child.id})">
                                <span class="like-icon">👍</span> 좋아요 ${child.like_count || 0}개
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        return `
            <div class="answer-item ${a.is_accepted ? 'accepted-answer' : ''}">
                <div class="answer-header">
                    <div class="answer-header-top">
                        <div class="user-info">
                            <img src="${aUserAvatar}" alt="${aUser.nickname}" class="avatar-sm">
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
                
                <div class="answer-body">${a.body}</div>
                
                <div class="answer-actions">
                    <button class="like-btn ${likedClass}" onclick="toggleAnswerLike(${a.id})">
                        <span class="like-icon">👍</span> 좋아요 ${a.like_count || 0}개
                    </button>
                    ${acceptButtonHtml}
                </div>
                ${childAnswersHtml}
            </div>
        `;
    }).join('');

    const currentUserAvatar = currentUser
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname || 'U')}&background=00A1E0&color=fff`
        : 'https://ui-avatars.com/api/?name=U&background=ccc&color=fff';

    const answerInputHtml = isLoggedIn() ? `
        <div class="answer-input-container expanded" id="answer-input-container-detail">
            <div class="answer-input-header">
                <img src="${currentUserAvatar}" class="avatar-sm" style="width: 24px; height: 24px;">
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
                <button class="btn-primary" onclick="submitAnswer(${q.id})">답글 쓰기</button>
            </div>
        </div>
    ` : '<div style="padding: 1rem; text-align: center; color: #666;">로그인 후 댓글을 작성할 수 있습니다.</div>';

    detailContentEl.innerHTML = `
        <div class="detail-header">
            <div class="user-info">
                <img src="${userAvatar}" alt="${user.nickname}" class="avatar-sm">
                <div>
                    <div class="user-name">${user.nickname}</div>
                    <div class="post-meta">${timeAgo(q.created_at)}</div>
                </div>
            </div>
            <h1 class="detail-title">${q.title}</h1>
            <div class="detail-body">
                ${q.body}
                ${q.attachments && q.attachments.length > 0 ? q.attachments.map(att => `<img src="${att.file_url}" class="uploaded-image" alt="Attachment">`).join('') : ''}
            </div>
            <div class="tags">
                ${tagNames.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                ${q.accepted_answer_id ? `<span class="solved-badge">✓ Solved</span>` : ''}
            </div>
            <div class="feed-stats">
                <div class="stat-item"><span>👁️</span> ${q.views || 0} Views</div>
                <div class="stat-item"><span>👍</span> ${totalAnswerLikes} Votes</div>
            </div>
        </div>
        <div class="answers-section">
            <div class="answers-header">댓글 ${answers.length}개</div>
            ${answersHtml}
            ${answerInputHtml}
        </div>
    `;

    // Store current question ID for later use
    window.currentDetailQuestionId = q.id;

    feedListEl.classList.add('hidden');
    feedHeaderEl.classList.add('hidden');

    if (searchContainerEl) searchContainerEl.classList.add('hidden');
    if (sidebarRightEl) sidebarRightEl.classList.add('hidden');
    if (mainLayoutEl) mainLayoutEl.classList.add('detail-active');

    questionDetailEl.classList.remove('hidden');
    window.scrollTo(0, 0);
}

async function hideQuestionDetail() {
    questionDetailEl.classList.add('hidden');

    if (searchContainerEl) searchContainerEl.classList.remove('hidden');
    if (sidebarRightEl) sidebarRightEl.classList.remove('hidden');
    if (mainLayoutEl) mainLayoutEl.classList.remove('detail-active');

    feedListEl.classList.remove('hidden');
    feedHeaderEl.classList.remove('hidden');

    await fetchQuestions();
    renderFeed();
}

// =====================================================
// ANSWER FUNCTIONS
// =====================================================
function handleFileSelect(event, questionId) {
    const input = event.target;
    const fileNameDisplay = document.getElementById(`file-name-${questionId}`);
    const previewId = questionId === 'detail' ? 'preview-answer-detail' : `preview-answer-${questionId}`;
    const previewImg = document.getElementById(previewId);

    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (fileNameDisplay) fileNameDisplay.textContent = file.name;

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
        if (fileNameDisplay) fileNameDisplay.textContent = '';
        if (previewImg) {
            previewImg.classList.remove('show');
            previewImg.src = '';
        }
        currentAnswerImage = null;
    }
}

async function submitAnswer(questionId) {
    if (!isLoggedIn()) {
        showError('로그인이 필요합니다.');
        return;
    }

    const body = document.getElementById('new-answer-body-detail').value;
    if (!body.trim()) {
        showError('내용을 입력해주세요.');
        return;
    }

    const result = await API.answers.create(questionId, { body: body, parent_answer_id: null });
    if (result.error) {
        showError(result.message || '답변 등록에 실패했습니다.');
        return;
    }

    currentAnswerImage = null;
    showToast('답변이 등록되었습니다.');
    showQuestionDetail(questionId);
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
    // Store for later
    editingAnswerId = answerId;
    // We need to get the answer body - for now we'll use a simple approach
    const answerBody = document.querySelector(`#answer-menu-${answerId}`)?.closest('.answer-item')?.querySelector('.answer-body')?.textContent || '';
    document.getElementById('edit-answer-body').value = answerBody.trim();

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

async function deleteAnswer() {
    if (!answerToDelete) return;

    const result = await API.answers.delete(answerToDelete);
    if (result.error) {
        showError(result.message || '답변 삭제에 실패했습니다.');
        return;
    }

    document.getElementById('confirm-modal').classList.add('hidden');
    showToast('댓글이 삭제되었습니다');

    if (window.currentDetailQuestionId) {
        showQuestionDetail(window.currentDetailQuestionId);
    }

    answerToDelete = null;
}

async function toggleAnswerLike(answerId) {
    if (!isLoggedIn()) {
        showError('로그인이 필요합니다.');
        return;
    }

    const result = await API.answers.toggleLike(answerId);
    if (result.error) {
        showError(result.message || '좋아요 처리에 실패했습니다.');
        return;
    }

    // Refresh detail view
    if (window.currentDetailQuestionId) {
        showQuestionDetail(window.currentDetailQuestionId);
    }
}

async function acceptAnswer(questionId, answerId) {
    if (!isLoggedIn()) {
        showError('로그인이 필요합니다.');
        return;
    }

    const result = await API.questions.acceptAnswer(questionId, answerId);
    if (result.error) {
        showError(result.message || '채택 처리에 실패했습니다.');
        return;
    }

    showToast(result.message || '답변이 채택되었습니다.');
    showQuestionDetail(questionId);
}

// =====================================================
// QUESTION FUNCTIONS
// =====================================================
async function toggleFavorite(questionId) {
    if (!isLoggedIn()) {
        showError('로그인이 필요합니다.');
        return;
    }

    const result = await API.questions.toggleBookmark(questionId);
    if (result.error) {
        showError(result.message || '북마크 처리에 실패했습니다.');
        return;
    }

    await fetchQuestions();
    renderFeed();
}

function togglePostMenu(questionId, event) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${questionId}`);
    document.querySelectorAll('.post-menu-dropdown').forEach(m => {
        if (m.id !== `menu-${questionId}`) m.classList.remove('show');
    });
    menu.classList.toggle('show');
}

async function editQuestion(questionId) {
    // Fetch question detail for editing
    const result = await API.questions.getDetail(questionId);
    if (result.error) {
        showError(result.message || '질문을 찾을 수 없습니다.');
        return;
    }

    const question = result;
    editingQuestionId = questionId;
    document.getElementById('q-title').value = question.title;
    document.getElementById('q-body').value = question.body;

    // Populate selected roles
    selectedRoles = (question.tag_ids || []).map(id => getTagName(id));
    renderRoleBadges();

    const menu = document.getElementById(`menu-${questionId}`);
    if (menu) menu.classList.remove('show');
    openModal();
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

async function deleteQuestion() {
    if (!questionToDelete) return;

    const result = await API.questions.delete(questionToDelete);
    if (result.error) {
        showError(result.message || '질문 삭제에 실패했습니다.');
        return;
    }

    document.getElementById('confirm-modal').classList.add('hidden');
    showToast('질문이 삭제되었습니다');

    await fetchQuestions();
    renderFeed();
    await fetchTags();
    renderRecommendedTopics();

    questionToDelete = null;
}

function cancelDelete() {
    document.getElementById('confirm-modal').classList.add('hidden');
    questionToDelete = null;
    answerToDelete = null;
}

// =====================================================
// ROLE BADGE LOGIC
// =====================================================
function renderRoleBadges() {
    const container = document.getElementById('selected-roles-container');
    if (!container) return;
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

// =====================================================
// MODAL FUNCTIONS
// =====================================================
function openModal() {
    modal.classList.remove('hidden');
    const modalTitle = modal.querySelector('h2');
    const postBtn = modal.querySelector('button[type="submit"]');
    if (editingQuestionId) {
        modalTitle.textContent = 'Edit Question';
        postBtn.textContent = 'Update';
    } else {
        modalTitle.textContent = 'Ask a Question';
        postBtn.textContent = 'Post Question';
        selectedRoles = [];
        renderRoleBadges();

        if (qFileInput) qFileInput.value = '';
        if (qFileNameDisplay) qFileNameDisplay.textContent = '';
        currentQuestionImage = null;
        currentQuestionFiles = [];
        if (qPreviewImg) {
            qPreviewImg.classList.remove('show');
            qPreviewImg.src = '';
        }

        checkFormValidity();
    }
}

function closeModal() {
    modal.classList.add('hidden');
    questionForm.reset();
    editingQuestionId = null;
    selectedRoles = [];
    currentQuestionFiles = [];
    renderRoleBadges();
}

function checkFormValidity() {
    const title = qTitleInput.value.trim();
    const body = qBodyInput.value.trim();
    if (title && body) {
        postQuestionBtn.disabled = false;
    } else {
        postQuestionBtn.disabled = true;
    }
}

// =====================================================
// HEADER PROFILE
// =====================================================
function renderHeaderProfile() {
    if (isLoggedIn() && currentUser) {
        const displayNickname = currentUser.nickname || 'User';
        const displayEmail = currentUser.email || '';
        const displayCohort = currentUser.crm_generation || '';
        const displayDepartment = currentUser.department || '';

        const cohortAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayCohort || displayNickname)}&background=00A1E0&color=fff&length=2`;

        userProfileContainer.innerHTML = `
            <img src="${cohortAvatarUrl}" alt="${displayNickname}" class="avatar" id="header-avatar">
            <div class="profile-dropdown" id="profile-dropdown">
                <div class="dropdown-header">
                    <img src="${cohortAvatarUrl}" alt="${displayNickname}" class="avatar-large">
                    <div class="dropdown-user-name">${displayNickname}</div>
                    <div class="dropdown-user-meta" style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        ${displayEmail}<br>
                        ${displayDepartment}
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

        document.getElementById('logout-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            await logout();
        });
    } else {
        userProfileContainer.innerHTML = `
            <button class="login-btn" id="login-btn">Log In</button>
        `;

        document.getElementById('login-btn').addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}

async function logout() {
    await API.auth.logout();
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    currentUser = null;
    renderHeaderProfile();
    currentFilter = 'all';
    filterLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    await fetchQuestions();
    renderFeed();
}

// =====================================================
// EVENT LISTENERS
// =====================================================
backToFeedBtn.addEventListener('click', hideQuestionDetail);

filterLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();

        // Check if login required
        const filter = link.dataset.filter;
        if (['my-questions', 'my-answers', 'bookmarks'].includes(filter) && !isLoggedIn()) {
            showError('로그인이 필요합니다.');
            return;
        }

        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentFilter = filter;
        currentTagFilter = null;
        currentPage = 1;

        await fetchQuestions();
        renderFeed();
        renderRecommendedTopics();
        hideQuestionDetail();
    });
});

sortSelect.addEventListener('change', async (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    await fetchQuestions();
    renderFeed();
});

askBtn.addEventListener('click', () => {
    if (!isLoggedIn()) {
        showError('로그인이 필요합니다.');
        return;
    }
    editingQuestionId = null;
    document.getElementById('q-title').value = '';
    document.getElementById('q-body').value = '';
    openModal();
});

closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

if (qTitleInput) qTitleInput.addEventListener('input', checkFormValidity);
if (qBodyInput) qBodyInput.addEventListener('input', checkFormValidity);

if (qFileInput) {
    qFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            qFileNameDisplay.textContent = file.name;
            currentQuestionFiles = [file];

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
            currentQuestionFiles = [];
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
        e.target.value = "";
    });
}

// Search Listeners
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const searchScopeSelect = document.getElementById('search-scope');

if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        searchQuery = searchInput.value;
        searchScope = searchScopeSelect.value;
        currentPage = 1;
        await fetchQuestions();
        renderFeed();
    });
}

if (searchInput) {
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value;
            searchScope = searchScopeSelect.value;
            currentPage = 1;
            await fetchQuestions();
            renderFeed();
        }
    });
}

// Answer Edit Modal Listeners
closeAnswerEditBtn.addEventListener('click', () => answerEditModal.classList.add('hidden'));
cancelAnswerEditBtn.addEventListener('click', () => answerEditModal.classList.add('hidden'));

answerEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (editingAnswerId) {
        const body = document.getElementById('edit-answer-body').value;
        const result = await API.answers.update(editingAnswerId, { body });
        if (result.error) {
            showError(result.message || '답변 수정에 실패했습니다.');
            return;
        }
        answerEditModal.classList.add('hidden');
        showToast('답변이 수정되었습니다.');
        if (window.currentDetailQuestionId) {
            showQuestionDetail(window.currentDetailQuestionId);
        }
        editingAnswerId = null;
    }
});

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
    if (e.target === answerEditModal) answerEditModal.classList.add('hidden');
});

questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
        showError('로그인이 필요합니다.');
        return;
    }

    const title = document.getElementById('q-title').value;
    const body = document.getElementById('q-body').value;

    // Get tag IDs from selected role names
    const tagIds = selectedRoles.map(roleName => {
        const tag = tagsData.find(t => t.name === roleName);
        return tag ? tag.id : null;
    }).filter(id => id !== null);

    if (editingQuestionId) {
        const result = await API.questions.update(editingQuestionId, {
            title,
            body,
            tag_ids: tagIds
        });
        if (result.error) {
            showError(result.message || '질문 수정에 실패했습니다.');
            return;
        }
        showToast('질문이 수정되었습니다.');
    } else {
        const result = await API.questions.create({
            title,
            body,
            tag_ids: tagIds,
            files: currentQuestionFiles
        });
        if (result.error) {
            showError(result.message || '질문 등록에 실패했습니다.');
            return;
        }
        showToast('질문이 등록되었습니다.');
    }

    await fetchQuestions();
    renderFeed();
    await fetchTags();
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

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && dropdown.classList.contains('show') && !e.target.closest('.user-profile')) {
        dropdown.classList.remove('show');
    }
});

// Logo Click Handler
const logoEl = document.querySelector('.logo');
if (logoEl) {
    logoEl.style.cursor = 'pointer';
    logoEl.addEventListener('click', async () => {
        currentFilter = 'all';
        currentTagFilter = null;
        searchQuery = '';
        searchScope = 'content';
        currentPage = 1;

        filterLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        if (searchInput) searchInput.value = '';
        if (searchScopeSelect) searchScopeSelect.value = 'content';

        hideQuestionDetail();
        await fetchQuestions();
        renderFeed();
        renderRecommendedTopics();
    });
}

// =====================================================
// INITIALIZATION
// =====================================================
async function init() {
    // Fetch user profile if logged in
    await fetchCurrentUser();
    renderHeaderProfile();

    // Fetch tags
    await fetchTags();

    // Fetch questions
    await fetchQuestions();
    renderFeed();

    // Fetch leaderboard
    await fetchLeaderboard();
    renderLeaderboard();

    // Render topics
    renderRecommendedTopics();
}

// Run initialization
init();
