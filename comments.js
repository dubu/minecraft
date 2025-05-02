// GitHub API configuration
const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'dubu';
const REPO_NAME = 'minecraft';
const DISCUSSION_CATEGORY = 'comments'; // Category for comments
const APP_ID = 'YOUR_APP_ID'; // GitHub App ID
const CLIENT_ID = 'YOUR_CLIENT_ID'; // GitHub App Client ID

// DOM elements
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');

// Load comments when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    const token = localStorage.getItem('github_token');
    if (!token) {
        // Redirect to GitHub OAuth
        const redirectUri = encodeURIComponent(window.location.href);
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=discussions:write`;
        window.location.href = authUrl;
        return;
    }
    
    await loadComments();
});

// Handle comment submission
commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const comment = document.getElementById('comment').value;
    
    try {
        await postComment(username, comment);
        commentForm.reset();
        await loadComments();
    } catch (error) {
        console.error('Error posting comment:', error);
        alert(error.message || '댓글 작성에 실패했습니다. 다시 시도해주세요.');
    }
});

// Load comments from GitHub Discussions
async function loadComments() {
    try {
        const token = localStorage.getItem('github_token');
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/discussions`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`댓글을 불러오는데 실패했습니다: ${errorData.message || '알 수 없는 오류'}`);
        }
        
        const discussions = await response.json();
        displayComments(discussions);
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `<p>${error.message}</p>`;
    }
}

// Post a new comment to GitHub Discussions
async function postComment(username, content) {
    const title = `Comment from ${username}`;
    const body = content;
    const token = localStorage.getItem('github_token');
    
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/discussions`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                body,
                category: DISCUSSION_CATEGORY
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`댓글 작성에 실패했습니다: ${errorData.message || '알 수 없는 오류'}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
}

// Display comments in the UI
function displayComments(discussions) {
    commentsList.innerHTML = '';
    
    if (discussions.length === 0) {
        commentsList.innerHTML = '<p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>';
        return;
    }
    
    discussions.forEach(discussion => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        const header = document.createElement('div');
        header.className = 'comment-header';
        
        const username = document.createElement('span');
        username.className = 'comment-username';
        username.textContent = discussion.user.login;
        
        const date = document.createElement('span');
        date.className = 'comment-date';
        date.textContent = new Date(discussion.created_at).toLocaleDateString();
        
        const content = document.createElement('div');
        content.className = 'comment-content';
        content.textContent = discussion.body;
        
        header.appendChild(username);
        header.appendChild(date);
        commentElement.appendChild(header);
        commentElement.appendChild(content);
        commentsList.appendChild(commentElement);
    });
}

// Handle OAuth callback
if (window.location.search.includes('code=')) {
    const code = new URLSearchParams(window.location.search).get('code');
    fetch(`/api/auth?code=${code}`)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('github_token', data.token);
            window.location.href = window.location.pathname;
        })
        .catch(error => {
            console.error('Error getting token:', error);
            alert('인증에 실패했습니다. 다시 시도해주세요.');
        });
} 