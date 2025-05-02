const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function generateComments() {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner: process.env.GITHUB_REPOSITORY.split('/')[0],
      repo: process.env.GITHUB_REPOSITORY.split('/')[1],
      state: 'all'
    });

    const comments = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      body: issue.body,
      author: issue.user.login,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    }));

    fs.writeFileSync('comments.json', JSON.stringify(comments, null, 2));
  } catch (error) {
    console.error('Error generating comments:', error);
    process.exit(1);
  }
}

generateComments(); 