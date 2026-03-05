import { execSync } from 'child_process';

const TARGET_API_URL =
  process.env.VITE_API_BASE_URL ||
  'https://gemini-ai-recipe-gen-mvp.vercel.app';
const DEPLOY_SECRET = process.env.ADMIN_DEPLOY_SECRET;

async function notifyRelease() {
  if (!DEPLOY_SECRET) {
    console.error(
      '❌ Missing ADMIN_DEPLOY_SECRET environment variable. Skipping release notification.',
    );
    process.exit(1); // Return error code so CI knows it failed if it was meant to run
  }

  // Get current version from package.json
  const version = process.env.npm_package_version || 'unknown';

  // Get the latest git commit message as the "changes"
  let changes = '系統例行更新與優化';
  try {
    const gitMsg = execSync('git log -1 --pretty=%B').toString().trim();
    if (gitMsg) {
      changes = gitMsg;
    }
  } catch (err) {
    console.warn(
      '⚠️ Could not get git commit message, using default changes text.',
    );
  }

  console.log(`🚀 Sending release notification for version ${version}...`);
  console.log(`📝 Changes: ${changes}`);

  try {
    const response = await fetch(`${TARGET_API_URL}/api/v1/admin/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Deploy-Secret': DEPLOY_SECRET,
      },
      body: JSON.stringify({
        version,
        changes,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API responded with status ${response.status}: ${errorText}`,
      );
    }

    const result = await response.json();
    console.log('✅ Release notification sent successfully!');
    console.log(JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to send release notification:', error.message);
    process.exit(1);
  }
}

notifyRelease();
