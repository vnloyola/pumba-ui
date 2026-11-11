const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

module.exports = async ({ github, context, core }) => {
  const repo = context.repo;
  const run = context.payload.workflow_run;
  // Use GitHub's association, never PR numbers or branch names from the artifact.
  if (run.event !== 'pull_request' || run.head_repository?.full_name !== `${repo.owner}/${repo.repo}` ||
      run.path !== '.github/workflows/update-visual-baselines.yml' || run.pull_requests.length !== 1) {
    core.info('Run is not associated with one eligible pull request.');
    return;
  }
  const pull_number = run.pull_requests[0].number;
  const loadPR = async () => (await github.rest.pulls.get({ ...repo, pull_number })).data;
  let expectedSha = run.head_sha;
  const eligible = (pr) => pr.state === 'open' && pr.head.repo?.full_name === `${repo.owner}/${repo.repo}` &&
    pr.head.sha === expectedSha && pr.labels.some(({ name }) => name === 'update-visual-baselines');
  const pr = await loadPR();
  if (!eligible(pr)) {
    core.info('Pull request is closed, stale, unlabelled, or from another repository.');
    return;
  }
  if (run.conclusion === 'success') {
    const artifacts = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, { ...repo, run_id: run.id });
    const matches = artifacts.filter(({ name, expired }) => name === 'visual-baselines' && !expired);
    if (matches.length !== 1 || matches[0].size_in_bytes > 100 * 1024 * 1024) {
      throw new Error('Expected one bounded visual-baselines artifact.');
    }
    const download = await github.rest.actions.downloadArtifact({ ...repo, artifact_id: matches[0].id, archive_format: 'zip' });
    const archive = path.join(process.env.RUNNER_TEMP, 'visual-baselines.zip');
    fs.writeFileSync(archive, Buffer.from(download.data));
    // This validator is from the default branch. It never extracts archive paths.
    const images = JSON.parse(execFileSync('python3', ['.github/scripts/validate-visual-baselines.py', archive], {
      maxBuffer: 140 * 1024 * 1024,
    }));
    const prefix = 'apps/storybook/visual/stories.visual.ts-snapshots/';
    const commit = (await github.rest.git.getCommit({ ...repo, commit_sha: pr.head.sha })).data;
    const oldTree = (await github.rest.git.getTree({ ...repo, tree_sha: commit.tree.sha, recursive: 'true' })).data;
    if (oldTree.truncated) throw new Error('Cannot safely replace a truncated tree.');
    // Replace the complete snapshot directory, preserving every other repository file.
    const tree = oldTree.tree.filter(({ path: name, type }) => type !== 'tree' && !name.startsWith(prefix));
    for (const image of images) {
      const blob = (await github.rest.git.createBlob({ ...repo, content: image.content, encoding: 'base64' })).data;
      tree.push({ path: prefix + image.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const updated = (await github.rest.git.createTree({ ...repo, tree: tree.map(({ path, mode, type, sha }) => ({ path, mode, type, sha })) })).data;
    if (updated.sha !== commit.tree.sha) {
      const next = (await github.rest.git.createCommit({ ...repo, message: 'chore: update visual baselines', tree: updated.sha, parents: [pr.head.sha] })).data;
      if (!eligible(await loadPR())) throw new Error('Pull request changed during baseline generation.');
      // Non-forced update rejects a concurrent push instead of overwriting it.
      await github.rest.git.updateRef({ ...repo, ref: `heads/${pr.head.ref}`, sha: next.sha, force: false });
      expectedSha = next.sha;
    }
  }
  // Retain the label on validation or commit errors, so the request can be retried.
  if (!eligible(await loadPR())) throw new Error('Pull request changed before label cleanup.');
  await github.rest.issues.removeLabel({ ...repo, issue_number: pull_number, name: 'update-visual-baselines' });
};
