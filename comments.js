// GitHub API configuration
const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'dubu'; // Replace with your GitHub username
const REPO_NAME = 'minecraft'; // Replace with your repository name
const DISCUSSION_CATEGORY = 'comments'; // Category for comments

// DOM elements
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');

// Load comments when page loads
document.addEventListener('DOMContentLoaded', loadComments);

// Handle form submission
commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const comment = document.getElementById('comment').value;
    
    try {
        await postComment(username, comment);
        commentForm.reset();
        loadComments();
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Failed to post comment. Please try again.');
    }
});

// Load comments from GitHub Discussions
async function loadComments() {
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/discussions`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        
        const discussions = await response.json();
        displayComments(discussions);
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<p>Failed to load comments. Please try again later.</p>';
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
                'Authorization': `token ${process.env.GITHUB_TOKEN}` // You'll need to set this up
            },
            body: JSON.stringify({
                title,
                body,
                category: DISCUSSION_CATEGORY
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to post comment');
        }
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