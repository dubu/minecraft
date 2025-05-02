// GitHub Discussions 설정
const DISCUSSIONS_CATEGORY = 'comments'; // Discussions 카테고리 이름
const DISCUSSIONS_REPO = 'dubu/minecraft'; // 저장소 이름

// 댓글 목록을 표시하는 함수
async function loadComments() {
    try {
        const response = await fetch(`https://api.github.com/repos/${DISCUSSIONS_REPO}/discussions?category=${DISCUSSIONS_CATEGORY}`);
        let discussions = [];
        if (response.ok) {
            discussions = await response.json();
        }
        
        const commentsContainer = document.getElementById('comments');
        commentsContainer.innerHTML = '';
        
        if (discussions.length === 0) {
            commentsContainer.innerHTML = '<p class="text-center text-muted">아직 댓글이 없습니다.</p>';
            return;
        }
        
        discussions.forEach(discussion => {
            console.log(discussion);
            const commentCard = document.createElement('div');
            commentCard.className = 'card comment-card';
            commentCard.innerHTML = `
                <div class="card-body">
                    <div class="comment-header">
                        <span class="comment-author"></span>
                        <span class="comment-date">${new Date(discussion.createdAt).toLocaleString()}</span>
                    </div>
                    <h5 class="comment-title">${discussion.title}</h5>
                    <p class="comment-content">${discussion.body}</p>
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
        // GitHub Discussions API를 사용하여 댓글 작성
        const response = await fetch(`https://api.github.com/repos/${DISCUSSIONS_REPO}/discussions`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: `Comment from ${name}`,
                body: comment,
                category: DISCUSSIONS_CATEGORY
            })
        });
        
        if (response.ok) {
            document.getElementById('commentForm').reset();
            // 댓글 목록 새로고침
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