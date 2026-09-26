import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export async function createGoogleEvent(workOrderData: any) {
  try {
    const { title, description, location, scheduledDate, startTime, endTime } = workOrderData;
    
    if (!scheduledDate) return null;

    // Parse startTime/endTime to DateTime based on scheduledDate
    let startDateTime = new Date(scheduledDate).toISOString();
    let endDateTime = new Date(scheduledDate);
    endDateTime.setHours(endDateTime.getHours() + 1); // default 1 hour
    let endDateTimeStr = endDateTime.toISOString();

    if (startTime) {
      const [hours, minutes] = startTime.split(':');
      const start = new Date(scheduledDate);
      start.setHours(Number(hours), Number(minutes), 0, 0);
      startDateTime = start.toISOString();
    }
    
    if (endTime) {
      const [hours, minutes] = endTime.split(':');
      const end = new Date(scheduledDate);
      end.setHours(Number(hours), Number(minutes), 0, 0);
      endDateTimeStr = end.toISOString();
    }

    const event = {
      summary: title,
      location: location,
      description: description,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTimeStr,
        timeZone: 'America/Sao_Paulo',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    return response.data.id;
  } catch (error) {
    console.error('Error creating Google Event:', error);
    return null; // Don't fail the main request
  }
}

export async function deleteGoogleEvent(eventId: string) {
  if (!eventId) return;
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting Google Event:', error);
    return false;
  }
}
