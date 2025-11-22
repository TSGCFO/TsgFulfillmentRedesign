import { outlookClient } from '../integrations/outlook';
import { sharePointClient } from '../integrations/sharepoint';
import type { Contract } from '@shared/schema';

export class ContractMonitoringService {
  private reminderDays = [30, 14, 7, 3, 1]; // Days before deadline to send reminders

  // Create calendar reminders for contract deadlines
  async createContractReminders(contract: Contract) {
    if (!contract.expiryDate) {
      console.log('Contract has no expiry date, skipping reminders');
      return;
    }

    const expiryDate = new Date(contract.expiryDate);
    const contractTitle = `Contract ${contract.contractNumber || contract.id}`;

    try {
      // Create reminders at different intervals
      for (const daysBefore of this.reminderDays) {
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - daysBefore);

        // Only create future reminders
        if (reminderDate > new Date()) {
          await outlookClient.createCalendarEvent({
            subject: `⚠️ Contract Expiry Alert: ${contractTitle}`,
            body: {
              contentType: 'HTML',
              content: `
                <h3>Contract Expiry Reminder</h3>
                <p>This contract will expire in <strong>${daysBefore} days</strong>.</p>
                <ul>
                  <li><strong>Contract:</strong> ${contractTitle}</li>
                  <li><strong>Client:</strong> ${contract.clientName}</li>
                  <li><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</li>
                  <li><strong>Value:</strong> $${contract.value?.toLocaleString() || 'N/A'}</li>
                </ul>
                <p>Please take necessary action to renew or close out this contract.</p>
              `
            },
            start: {
              dateTime: reminderDate.toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: new Date(reminderDate.getTime() + 30 * 60000).toISOString(), // 30 minute event
              timeZone: 'UTC'
            },
            isReminderOn: true,
            reminderMinutesBeforeStart: 15,
            importance: daysBefore <= 7 ? 'high' : 'normal',
            categories: ['Contract Management', 'Deadline']
          });

          console.log(`Created ${daysBefore}-day reminder for contract ${contractTitle}`);
        }
      }

      // Also create a final deadline event
      await outlookClient.createCalendarEvent({
        subject: `🚨 CONTRACT EXPIRES TODAY: ${contractTitle}`,
        body: {
          contentType: 'HTML',
          content: `
            <h2 style="color: red;">Contract Expiry - Immediate Action Required</h2>
            <p>This contract expires <strong>TODAY</strong>!</p>
            <ul>
              <li><strong>Contract:</strong> ${contractTitle}</li>
              <li><strong>Client:</strong> ${contract.clientName}</li>
              <li><strong>Value:</strong> $${contract.value?.toLocaleString() || 'N/A'}</li>
            </ul>
            <p>Immediate action is required to prevent contract lapse.</p>
          `
        },
        start: {
          dateTime: expiryDate.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(expiryDate.getTime() + 60 * 60000).toISOString(), // 1 hour event
          timeZone: 'UTC'
        },
        isReminderOn: true,
        reminderMinutesBeforeStart: 0,
        importance: 'high',
        showAs: 'busy',
        categories: ['Contract Management', 'URGENT']
      });

      return { success: true, message: 'Contract reminders created successfully' };
    } catch (error) {
      console.error('Error creating contract reminders:', error);
      throw error;
    }
  }

  // Check upcoming contract deadlines and send email alerts
  async checkUpcomingDeadlines(contracts: Contract[]) {
    const today = new Date();
    const alerts: Array<{ contract: Contract; daysUntilExpiry: number }> = [];

    for (const contract of contracts) {
      if (!contract.expiryDate || contract.status === 'completed' || contract.status === 'cancelled') {
        continue;
      }

      const expiryDate = new Date(contract.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Alert for contracts expiring within 30 days
      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        alerts.push({ contract, daysUntilExpiry });
      }
    }

    // Send consolidated email alert if there are expiring contracts
    if (alerts.length > 0) {
      await this.sendDeadlineAlertEmail(alerts);
    }

    return alerts;
  }

  // Send email alert for upcoming deadlines
  private async sendDeadlineAlertEmail(alerts: Array<{ contract: Contract; daysUntilExpiry: number }>) {
    // Sort by urgency
    alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    const criticalContracts = alerts.filter(a => a.daysUntilExpiry <= 3);
    const warningContracts = alerts.filter(a => a.daysUntilExpiry > 3 && a.daysUntilExpiry <= 7);
    const upcomingContracts = alerts.filter(a => a.daysUntilExpiry > 7);

    let emailBody = `
      <h2>Contract Deadline Alert</h2>
      <p>The following contracts have upcoming expiry dates:</p>
    `;

    if (criticalContracts.length > 0) {
      emailBody += `
        <h3 style="color: red;">🚨 CRITICAL - Expiring within 3 days:</h3>
        <ul>
      `;
      for (const alert of criticalContracts) {
        emailBody += `
          <li>
            <strong>${alert.contract.contractNumber || `Contract #${alert.contract.id}`}</strong> - 
            ${alert.contract.clientName} - 
            Expires in <strong>${alert.daysUntilExpiry} day(s)</strong>
            ${alert.contract.value ? ` - Value: $${alert.contract.value.toLocaleString()}` : ''}
          </li>
        `;
      }
      emailBody += '</ul>';
    }

    if (warningContracts.length > 0) {
      emailBody += `
        <h3 style="color: orange;">⚠️ WARNING - Expiring within 7 days:</h3>
        <ul>
      `;
      for (const alert of warningContracts) {
        emailBody += `
          <li>
            <strong>${alert.contract.contractNumber || `Contract #${alert.contract.id}`}</strong> - 
            ${alert.contract.clientName} - 
            Expires in <strong>${alert.daysUntilExpiry} days</strong>
            ${alert.contract.value ? ` - Value: $${alert.contract.value.toLocaleString()}` : ''}
          </li>
        `;
      }
      emailBody += '</ul>';
    }

    if (upcomingContracts.length > 0) {
      emailBody += `
        <h3>📅 Upcoming - Expiring within 30 days:</h3>
        <ul>
      `;
      for (const alert of upcomingContracts) {
        emailBody += `
          <li>
            ${alert.contract.contractNumber || `Contract #${alert.contract.id}`} - 
            ${alert.contract.clientName} - 
            Expires in ${alert.daysUntilExpiry} days
            ${alert.contract.value ? ` - Value: $${alert.contract.value.toLocaleString()}` : ''}
          </li>
        `;
      }
      emailBody += '</ul>';
    }

    emailBody += `
      <hr>
      <p><em>This is an automated alert from the TSG Fulfillment Contract Management System.</em></p>
      <p>Please review these contracts and take appropriate action to renew or close them out.</p>
    `;

    try {
      await outlookClient.sendEmail({
        subject: criticalContracts.length > 0 
          ? `🚨 URGENT: ${criticalContracts.length} Contracts Expiring Soon` 
          : `Contract Deadline Alert: ${alerts.length} Contracts Need Attention`,
        body: {
          contentType: 'HTML',
          content: emailBody
        },
        toRecipients: [
          { emailAddress: { address: 'contracts@tsgfulfillment.com' } }
        ],
        importance: criticalContracts.length > 0 ? 'high' : 'normal'
      });

      console.log(`Sent deadline alert for ${alerts.length} contracts`);
    } catch (error) {
      console.error('Error sending deadline alert email:', error);
      throw error;
    }
  }

  // Sync contract status with SharePoint
  async syncContractWithSharePoint(contract: Contract) {
    try {
      // Create or update contract metadata in SharePoint
      const metadata = {
        Title: contract.contractNumber || `Contract ${contract.id}`,
        ClientName: contract.clientName,
        Status: contract.status,
        ExpiryDate: contract.expiryDate,
        Value: contract.value,
        LastModified: new Date().toISOString()
      };

      // Upload contract metadata to SharePoint
      await sharePointClient.uploadFile(
        `Contracts/${contract.clientName}/${contract.contractNumber || contract.id}/metadata.json`,
        JSON.stringify(metadata, null, 2),
        'application/json'
      );

      console.log(`Synced contract ${contract.contractNumber} with SharePoint`);
      return { success: true };
    } catch (error) {
      console.error('Error syncing contract with SharePoint:', error);
      throw error;
    }
  }

  // Get contracts nearing deadlines from storage
  async getExpiringContracts(storage: any, daysAhead: number = 30): Promise<Contract[]> {
    const allContracts = await storage.getContracts();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return allContracts.filter((contract: Contract) => {
      if (!contract.expiryDate || contract.status === 'completed' || contract.status === 'cancelled') {
        return false;
      }
      const expiryDate = new Date(contract.expiryDate);
      return expiryDate >= today && expiryDate <= futureDate;
    });
  }

  // Create a recurring task to check deadlines
  async scheduleDeadlineChecks(storage: any) {
    // This would typically be run as a cron job or scheduled task
    // For now, it's a method that can be called periodically
    
    console.log('Checking contract deadlines...');
    const expiringContracts = await this.getExpiringContracts(storage);
    
    if (expiringContracts.length > 0) {
      const alerts = await this.checkUpcomingDeadlines(expiringContracts);
      console.log(`Found ${alerts.length} contracts with upcoming deadlines`);
      
      // Create calendar reminders for new contracts
      for (const contract of expiringContracts) {
        if (!contract.remindersCreated) {
          await this.createContractReminders(contract);
          // Mark reminders as created (would update in storage)
          await storage.updateContract(contract.id, { remindersCreated: true });
        }
      }
    }
    
    return { contractsChecked: expiringContracts.length };
  }
}

export const contractMonitoringService = new ContractMonitoringService();