import { execFileSync } from 'node:child_process';

export const getReleaseCommit = () => {
  const commit = (
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    process.env.COMMIT_SHA ??
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })
  ).trim();

  if (!/^[0-9a-f]{40}$/i.test(commit)) {
    throw new Error(`Ungültige Git-Commit-Kennung für den Build: ${commit}`);
  }

  return commit;
};
