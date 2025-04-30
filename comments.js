// GitHub API configuration
const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'dubu'; // Replace with your GitHub username
const REPO_NAME = 'minecraft'; // Replace with your repository name
const DISCUSSION_CATEGORY = 'comments'; // Category for comments

// Get token from environment variable
const GITHUB_TOKEN = process.env.DISCUSSIONS_TOKEN;

// DOM elements
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');

// Load comments when page loads
document.addEventListener('DOMContentLoaded', loadComments);

// Handle comment submission
commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!GITHUB_TOKEN) {
        alert('GitHub token is not configured. Please check repository settings.');
        return;
    }
    
    const username = document.getElementById('username').value;
    const comment = document.getElementById('comment').value;
    
    try {
        await postComment(username, comment);
        commentForm.reset();
        loadComments();
    } catch (error) {
        console.error('Error posting comment:', error);
        alert(error.message || 'Failed to post comment. Please try again.');
    }
});

// Load comments from GitHub Discussions
async function loadComments() {
    if (!GITHUB_TOKEN) {
        commentsList.innerHTML = '<p>GitHub token is not configured. Please check repository settings.</p>';
        return;
    }

    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/discussions`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
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
    
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/discussions`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                title,
                body,
                category: DISCUSSION_CATEGORY
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to post comment: ${errorData.message || 'Unknown error'}`);
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
        commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
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