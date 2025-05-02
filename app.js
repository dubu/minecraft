// GitHub API 설정
const GITHUB_USERNAME = 'dubu'; // GitHub 사용자 이름으로 변경
const GITHUB_REPO = 'minecraft'; // 저장소 이름으로 변경

// 댓글 목록을 표시하는 함수
async function loadComments() {
    try {
        const response = await fetch('comments.json');
        let comments = [];
        if (response.ok) {
            comments = await response.json();
        }
        
        const commentsContainer = document.getElementById('comments');
        commentsContainer.innerHTML = '';
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="text-center text-muted">아직 댓글이 없습니다.</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentCard = document.createElement('div');
            commentCard.className = 'card comment-card';
            commentCard.innerHTML = `
                <div class="card-body">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <h5 class="comment-title">${comment.title}</h5>
                    <p class="comment-content">${comment.body}</p>
                </div>
            `;
            commentsContainer.appendChild(commentCard);
        });
    } catch (error) {
        console.error('댓글을 불러오는 중 오류가 발생했습니다:', error);
        const commentsContainer = document.getElementById('comments');
        commentsContainer.innerHTML = '<p class="text-center text-muted">댓글을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 댓글 작성 함수
async function postComment(name, comment) {
    try {
        const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.PERSONAL_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: `Comment from ${name}`,
                body: comment
            })
        });
        
        if (response.ok) {
            document.getElementById('commentForm').reset();
            // GitHub Actions가 댓글을 처리하고 정적 파일을 업데이트할 때까지 잠시 대기
            setTimeout(loadComments, 2000);
            return true;
        }
    } catch (error) {
        console.error('댓글 작성 중 오류가 발생했습니다:', error);
        return false;
    }
}

// 폼 제출 이벤트 처리
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const comment = document.getElementById('comment').value;
    
    await postComment(name, comment);
});

// 페이지 로드 시 댓글 목록 불러오기
document.addEventListener('DOMContentLoaded', loadComments); 