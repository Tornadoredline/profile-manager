const cron = require('node-cron');
const db = require('../config/database');

class ReminderService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Reminder service is already running');
      return;
    }

    console.log('Starting reminder service...');

    // Check for verification reminders every hour
    cron.schedule('0 * * * *', async () => {
      try {
        await this.checkVerificationReminders();
      } catch (error) {
        console.error('Error in reminder service:', error);
      }
    });

    this.isRunning = true;
    console.log('Reminder service started');
  }

  async checkVerificationReminders() {
    try {
      console.log('Checking for verification reminders...');

      // Find profiles with "pending" status that are older than 12 hours
      const [profiles] = await db.query(`
        SELECT p.*, u.username 
        FROM profiles p
        INNER JOIN users u ON p.user_id = u.id
        WHERE p.status = 'pending' 
        AND p.created_at <= DATE_SUB(NOW(), INTERVAL 12 HOUR)
        AND NOT EXISTS (
          SELECT 1 FROM reminders r 
          WHERE r.profile_id = p.id 
          AND r.type = 'verification' 
          AND r.created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
        )
      `);

      for (const profile of profiles) {
        await this.createVerificationReminder(profile);
      }

      if (profiles.length > 0) {
        console.log(`Created reminders for ${profiles.length} profiles`);
      }

    } catch (error) {
      console.error('Error checking verification reminders:', error);
    }
  }

  async createVerificationReminder(profile) {
    try {
      const message = `Профиль "${profile.site_name}" находится на проверке более 12 часов. Проверьте статус верификации.`;

      // Create reminder in database
      await db.query(
        `INSERT INTO reminders (user_id, profile_id, type, message, status) 
         VALUES (?, ?, 'verification', ?, 'pending')`,
        [profile.user_id, profile.id, message]
      );

      console.log(`Created verification reminder for profile ${profile.id}`);

      // Here you would typically send real-time notification via Socket.IO
      // For now, we'll just log it
      console.log(`Reminder for user ${profile.user_id}: ${message}`);

    } catch (error) {
      console.error('Error creating verification reminder:', error);
    }
  }

  stop() {
    this.isRunning = false;
    console.log('Reminder service stopped');
  }
}

module.exports = new ReminderService();