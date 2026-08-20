import serverlessExpress from '@vendia/serverless-express';
import app, { runAutomatedEmailCron } from './server.js';

export const handler = serverlessExpress({ app });

export const cronScheduler = async (event) => {
  console.log('[AWS EventBridge Cron] Triggered automated daily email reminder scheduler...');
  try {
    const result = await runAutomatedEmailCron();
    console.log('[AWS EventBridge Cron] Automated email scheduler finished successfully:', result);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    console.error('[AWS EventBridge Cron Error]', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
