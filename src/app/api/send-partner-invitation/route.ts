import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      invitationId,
      inviterName,
      inviterEmail,
      inviteeEmail,
      inviteLink,
      message 
    } = await request.json();

    // In a production environment, you would integrate with your email service
    // For now, we'll log the invitation details and return success
    // This could be integrated with services like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Mailgun
    // etc.

    const emailData = {
      to: inviteeEmail,
      from: 'invitations@seggs.life',
      subject: `${inviterName} invited you to Seggs.Life 💕`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #3c1810 0%, #5c2317 100%); border-radius: 16px; padding: 32px; color: #f5e6d3;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #f5e6d3; font-size: 28px; margin: 0 0 16px 0;">💝</h1>
            <h2 style="color: #f5e6d3; font-size: 24px; margin: 0;">You're Invited to Seggs.Life!</h2>
          </div>
          
          <div style="background: rgba(245, 230, 211, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">
              <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join them on an intimate journey of discovery and connection.
            </p>
            
            ${message ? `
              <div style="background: rgba(245, 230, 211, 0.1); border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #d2691e;">
                <p style="margin: 0; font-style: italic;">"${message}"</p>
              </div>
            ` : ''}
          </div>

          <div style="background: rgba(245, 230, 211, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: #f5e6d3; font-size: 18px; margin: 0 0 12px 0;">What is Seggs.Life?</h3>
            <ul style="margin: 0; padding-left: 20px; color: rgba(245, 230, 211, 0.8);">
              <li>A private space for couples to explore intimacy together</li>
              <li>Personalized AI-powered suggestions based on your unique blueprint</li>
              <li>Privacy-first design - everything stays between you two</li>
              <li>Tools for deeper connection and understanding</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" 
               style="display: inline-block; background: #d2691e; color: #f5e6d3; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <div style="background: rgba(245, 230, 211, 0.05); border-radius: 8px; padding: 16px; margin-top: 24px;">
            <h4 style="color: #f5e6d3; font-size: 14px; margin: 0 0 8px 0;">How it works:</h4>
            <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: rgba(245, 230, 211, 0.7);">
              <li>You'll get your own private space to explore</li>
              <li>Take the intimacy blueprint assessment at your own pace</li>
              <li>Choose when (or if) to sync your journeys together</li>
              <li>Everything stays private until you both decide to share</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(245, 230, 211, 0.2);">
            <p style="margin: 0; font-size: 12px; color: rgba(245, 230, 211, 0.6);">
              This invitation will expire in 7 days. You can accept or decline at any time.
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: rgba(245, 230, 211, 0.6);">
              If you don't want to receive these invitations, you can ignore this email.
            </p>
          </div>
        </div>
      `
    };

    // Log the email data for development
    console.log('Partner invitation email:', emailData);

    // TODO: Replace with actual email service integration
    // Example with SendGrid:
    // await sgMail.send(emailData);
    
    // Example with Resend:
    // await resend.emails.send(emailData);

    // For now, return success to simulate email sending
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation email sent successfully',
      // In development, include the email content for testing
      ...(process.env.NODE_ENV === 'development' && { emailData })
    });

  } catch (error) {
    console.error('Error sending partner invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation email' },
      { status: 500 }
    );
  }
} 