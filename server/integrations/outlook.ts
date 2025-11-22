import { Client } from '@microsoft/microsoft-graph-client';
import { Employee, Material } from '@shared/schema';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=outlook',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Outlook not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableOutlookClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

// Outlook Integration Service using Replit Connector
export class OutlookIntegrationService {
  // Send email notification
  async sendEmail(to: string, subject: string, htmlContent: string, ccEmails?: string[]) {
    try {
      const client = await getUncachableOutlookClient();
      
      const message = {
        subject,
        body: {
          contentType: 'HTML',
          content: htmlContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ],
        ...(ccEmails && ccEmails.length > 0 && {
          ccRecipients: ccEmails.map(email => ({
            emailAddress: {
              address: email
            }
          }))
        })
      };

      await client.api('/me/sendMail').post({
        message,
        saveToSentItems: true
      });

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Outlook send email error:', error);
      throw error;
    }
  }

  // Send stock alert notification
  async sendStockAlert(material: Material, recipientEmails: string[]) {
    const subject = `⚠️ Low Stock Alert: ${material.name}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f44336; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Low Stock Alert</h2>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px;">
          <p><strong>Material:</strong> ${material.name}</p>
          <p><strong>SKU:</strong> ${material.sku}</p>
          <p><strong>Current Stock:</strong> <span style="color: #f44336; font-weight: bold;">${material.currentStock}</span></p>
          <p><strong>Minimum Required:</strong> ${material.minimumStock}</p>
          <p><strong>Category:</strong> ${material.category}</p>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666;">Please reorder this material as soon as possible to avoid stockouts.</p>
          <a href="/employee/materials" style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Materials</a>
        </div>
      </div>
    `;

    for (const email of recipientEmails) {
      await this.sendEmail(email, subject, htmlContent);
    }
  }

  // Create calendar event
  async createCalendarEvent(
    title: string,
    startDateTime: Date,
    endDateTime: Date,
    description?: string,
    attendees?: string[],
    reminderMinutes?: number
  ) {
    try {
      const client = await getUncachableOutlookClient();
      
      const event = {
        subject: title,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'UTC'
        },
        body: {
          contentType: 'HTML',
          content: description || ''
        },
        ...(attendees && attendees.length > 0 && {
          attendees: attendees.map(email => ({
            emailAddress: {
              address: email
            },
            type: 'required'
          }))
        }),
        ...(reminderMinutes && {
          reminderMinutesBeforeStart: reminderMinutes,
          isReminderOn: true
        })
      };

      const response = await client.api('/me/events').post(event);
      return response;
    } catch (error) {
      console.error('Outlook create calendar event error:', error);
      throw error;
    }
  }

  // Create contract signing deadline reminder
  async createContractDeadlineReminder(
    contractTitle: string,
    clientName: string,
    deadline: Date,
    employeeEmail: string
  ) {
    const reminderDate = new Date(deadline);
    reminderDate.setDate(reminderDate.getDate() - 2); // Remind 2 days before deadline

    return await this.createCalendarEvent(
      `Contract Signing Deadline: ${clientName}`,
      reminderDate,
      new Date(reminderDate.getTime() + 30 * 60000), // 30 minute event
      `<p>Reminder: Contract "${contractTitle}" for ${clientName} needs to be signed by ${deadline.toLocaleDateString()}</p>
       <p>Please follow up with the client if not yet signed.</p>`,
      [employeeEmail],
      1440 // Remind 1 day before (1440 minutes)
    );
  }

  // Send inquiry assignment notification
  async sendInquiryAssignmentNotification(
    employee: Employee,
    inquiryDetails: {
      id: number;
      company: string;
      service: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    }
  ) {
    const priorityColors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#FF5722',
      urgent: '#f44336'
    };

    const subject = `New Inquiry Assignment: ${inquiryDetails.company}${inquiryDetails.priority === 'urgent' ? ' [URGENT]' : ''}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2196F3; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">New Inquiry Assigned to You</h2>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px;">
          <p>Hi ${employee.fullName},</p>
          <p>A new customer inquiry has been assigned to you:</p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Company:</strong> ${inquiryDetails.company}</p>
            <p><strong>Service Requested:</strong> ${inquiryDetails.service}</p>
            ${inquiryDetails.priority ? `<p><strong>Priority:</strong> <span style="color: ${priorityColors[inquiryDetails.priority]}; font-weight: bold;">${inquiryDetails.priority.toUpperCase()}</span></p>` : ''}
          </div>
          <a href="/employee/inquiries/${inquiryDetails.id}" style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Inquiry</a>
        </div>
      </div>
    `;

    await this.sendEmail(employee.email, subject, htmlContent);
  }

  // Get calendar events for a date range
  async getCalendarEvents(startDate: Date, endDate: Date) {
    try {
      const client = await getUncachableOutlookClient();
      
      const events = await client
        .api('/me/calendarview')
        .query({
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          $orderby: 'start/dateTime',
          $select: 'subject,start,end,body,attendees,isReminderOn,reminderMinutesBeforeStart'
        })
        .get();

      return events.value;
    } catch (error) {
      console.error('Outlook get calendar events error:', error);
      throw error;
    }
  }

  // Send quote status update
  async sendQuoteStatusUpdate(
    recipientEmail: string,
    quoteNumber: string,
    companyName: string,
    newStatus: string,
    quoteAmount?: number
  ) {
    const statusMessages: { [key: string]: string } = {
      sent: 'has been sent to you for review',
      accepted: 'has been accepted! Thank you for your business',
      rejected: 'has been marked as rejected',
      expired: 'has expired. Please contact us if you\'d like to receive a new quote'
    };

    const subject = `Quote #${quoteNumber} Status Update`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2196F3; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Quote Status Update</h2>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px;">
          <p>Dear ${companyName},</p>
          <p>Your quote #${quoteNumber} ${statusMessages[newStatus] || 'status has been updated'}.</p>
          ${quoteAmount ? `<p><strong>Quote Amount:</strong> $${quoteAmount.toFixed(2)}</p>` : ''}
          <div style="margin-top: 20px; padding: 15px; background-color: white; border-left: 4px solid #2196F3;">
            <p><strong>Current Status:</strong> ${newStatus.toUpperCase()}</p>
          </div>
          <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>
        </div>
      </div>
    `;

    await this.sendEmail(recipientEmail, subject, htmlContent);
  }
}

// Export a singleton instance
export const outlookIntegration = new OutlookIntegrationService();