/**
 * API Service Layer
 * Handles all communication with the backend server.
 */

const API_BASE_URL = 'http://13.211.149.164';

// --- Helper Functions ---

function getAuthToken() {
    return localStorage.getItem('jwt_token');
}

function setAuthToken(token) {
    localStorage.setItem('jwt_token', token);
}

function removeAuthToken() {
    localStorage.removeItem('jwt_token');
}

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        ...options.headers,
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Handle 204 No Content
        if (response.status === 204) {
            return { success: true };
        }

        const data = await response.json();

        if (!response.ok) {
            // Return the error response from server
            return { error: true, status: response.status, ...data };
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        return { error: true, status: 500, message: '서버 연결에 실패했습니다.' };
    }
}

// --- Auth API ---
const AuthAPI = {
    /**
     * POST /signup
     */
    async signup({ email, password, nickname, crm_generation, department, auth_code }) {
        return request('/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, nickname, crm_generation, department, auth_code }),
        });
    },

    /**
     * POST /users/login
     */
    async login({ email, password }) {
        return request('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    /**
     * POST /users/logout
     */
    async logout() {
        const result = await request('/users/logout', { method: 'POST' });
        removeAuthToken();
        return result;
    },

    /**
     * GET /users/me
     */
    async getMe() {
        return request('/users/me', { method: 'GET' });
    },
};

// --- Questions API ---
const QuestionsAPI = {
    /**
     * GET /questions
     * @param {Object} params - { page, size, tag_ids, search_type, keyword, sort }
     */
    async getList(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page);
        if (params.size) query.append('size', params.size);
        if (params.tag_ids && params.tag_ids.length > 0) {
            query.append('tag_ids', params.tag_ids.join(','));
        }
        if (params.search_type) query.append('search_type', params.search_type);
        if (params.keyword) query.append('keyword', params.keyword);
        if (params.sort) query.append('sort', params.sort);

        const queryString = query.toString();
        return request(`/questions${queryString ? '?' + queryString : ''}`, { method: 'GET' });
    },

    /**
     * GET /questions/{question_id}
     */
    async getDetail(questionId) {
        return request(`/questions/${questionId}`, { method: 'GET' });
    },

    /**
     * POST /questions (multipart/form-data)
     */
    async create({ title, body, tag_ids, files }) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('body', body);
        if (tag_ids && tag_ids.length > 0) {
            formData.append('tag_ids', JSON.stringify(tag_ids));
        }
        if (files && files.length > 0) {
            files.forEach(file => formData.append('files', file));
        }
        return request('/questions', { method: 'POST', body: formData });
    },

    /**
     * PATCH /questions/{question_id}
     */
    async update(questionId, { title, body, tag_ids }) {
        return request(`/questions/${questionId}`, {
            method: 'PATCH',
            body: JSON.stringify({ title, body, tag_ids }),
        });
    },

    /**
     * DELETE /questions/{question_id}
     */
    async delete(questionId) {
        return request(`/questions/${questionId}`, { method: 'DELETE' });
    },

    /**
     * POST /questions/{question_id}/accept-answer
     */
    async acceptAnswer(questionId, answerId) {
        return request(`/questions/${questionId}/accept-answer`, {
            method: 'POST',
            body: JSON.stringify({ answer_id: answerId }),
        });
    },

    /**
     * POST /questions/{question_id}/bookmark
     */
    async toggleBookmark(questionId) {
        return request(`/questions/${questionId}/bookmark`, { method: 'POST' });
    },

    /**
     * POST /questions/{question_id}/views
     */
    async incrementViews(questionId) {
        return request(`/questions/${questionId}/views`, { method: 'POST' });
    },
};

// --- Answers API ---
const AnswersAPI = {
    /**
     * POST /questions/{question_id}/answers
     */
    async create(questionId, { body, parent_answer_id }) {
        return request(`/questions/${questionId}/answers`, {
            method: 'POST',
            body: JSON.stringify({ body, parent_answer_id: parent_answer_id || null }),
        });
    },

    /**
     * PATCH /answers/{answer_id}
     */
    async update(answerId, { body }) {
        return request(`/answers/${answerId}`, {
            method: 'PATCH',
            body: JSON.stringify({ body }),
        });
    },

    /**
     * DELETE /answers/{answer_id}
     */
    async delete(answerId) {
        return request(`/answers/${answerId}`, { method: 'DELETE' });
    },

    /**
     * POST /answers/{answer_id}/likes
     */
    async toggleLike(answerId) {
        return request(`/answers/${answerId}/likes`, { method: 'POST' });
    },

    /**
     * GET /answers/{answer_id}  (for like count)
     */
    async getLikeCount(answerId) {
        return request(`/answers/${answerId}`, { method: 'GET' });
    },
};

// --- Tags API ---
const TagsAPI = {
    /**
     * GET /api/tags
     */
    async getList() {
        return request('/api/tags', { method: 'GET' });
    },

    /**
     * GET /api/tags/usage-count
     */
    async getUsageCount() {
        return request('/api/tags/usage-count', { method: 'GET' });
    },
};

// --- Rankings API ---
const RankingsAPI = {
    /**
     * GET /rankings/top-contributors
     */
    async getTopContributors() {
        return request('/rankings/top-contributors', { method: 'GET' });
    },
};

// --- MyPage API ---
const MyPageAPI = {
    /**
     * GET /users/me/questions
     */
    async getMyQuestions(page = 1, size = 10) {
        return request(`/users/me/questions?page=${page}&size=${size}`, { method: 'GET' });
    },

    /**
     * GET /users/me/answered-questions
     */
    async getMyAnsweredQuestions(page = 1, size = 10) {
        return request(`/users/me/answered-questions?page=${page}&size=${size}`, { method: 'GET' });
    },

    /**
     * GET /users/me/bookmarks
     */
    async getMyBookmarks(page = 1, size = 10) {
        return request(`/users/me/bookmarks?page=${page}&size=${size}`, { method: 'GET' });
    },
};

// Export as global API object
const API = {
    auth: AuthAPI,
    questions: QuestionsAPI,
    answers: AnswersAPI,
    tags: TagsAPI,
    rankings: RankingsAPI,
    myPage: MyPageAPI,
    getAuthToken,
    setAuthToken,
    removeAuthToken,
};
