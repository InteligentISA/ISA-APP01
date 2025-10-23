# Chat Moderation System

## Overview

The Chat Moderation System is a comprehensive solution designed to prevent unauthorized data exchange and enforce safe communication between customers and vendors in the MyPlug application. The system automatically detects, masks, or blocks sensitive content while maintaining a complete audit trail for administrative review.

## Features

### Core Functionality
- **Real-time Message Moderation**: Automatically processes messages before they are sent
- **Content Detection**: Identifies phone numbers, emails, URLs, social media platforms, and contact-related keywords
- **Smart Masking**: Replaces sensitive information (like phone numbers) with masked versions
- **Message Blocking**: Prevents messages containing prohibited content from being sent
- **Violation Tracking**: Maintains a comprehensive log of all moderation actions
- **User Suspension System**: Automatically suspends users after multiple violations

### Security Features
- **Multilingual Support**: Regex patterns support various input formats and languages
- **Performance Optimized**: Minimal latency for real-time message processing
- **Admin Audit Trail**: Complete logging for administrative review and compliance
- **Strike System**: Progressive enforcement with automatic suspension after 3 violations

## Database Schema

### Moderation Logs Table
```sql
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  original_message TEXT NOT NULL,
  moderated_message TEXT NOT NULL,
  violations TEXT[] NOT NULL DEFAULT '{}',
  action_taken TEXT NOT NULL CHECK (action_taken IN ('blocked', 'masked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Violations Table
```sql
CREATE TABLE IF NOT EXISTS public.user_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  violation_count INTEGER NOT NULL DEFAULT 1,
  last_violation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, violation_type)
);
```

### Order Messages Table
```sql
CREATE TABLE IF NOT EXISTS public.order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'vendor')),
  message_text TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Moderation Rules

### Blocked Content (Messages are completely blocked)
- **Email Addresses**: Any email format (user@domain.com)
- **URLs and Domains**: http/https URLs, www domains, any .com/.org/.io extensions
- **Social Media Platforms**: WhatsApp, Telegram, Instagram, Facebook, Skype, Twitter, LinkedIn, etc.
- **Contact Keywords**: "call me", "phone me", "text me", "email me", "contact me", etc.
- **External Platforms**: Zoom, Google Meet, Teams, Slack, FaceTime, etc.

### Masked Content (Content is modified but message is sent)
- **Phone Numbers**: 10-11 digit numbers in various formats
  - (123) 456-7890 → (***) ***-****
  - 123-456-7890 → ***-***-****
  - +1-555-123-4567 → +*-***-***-****

### Warning Message
When content is blocked, users see:
> "This message contains restricted information and cannot be sent. For your safety and to ensure all transactions are protected by our Guarantee, please do not share personal contact details, emails, or external links."

## Implementation Details

### ModerationService Class

The core moderation logic is implemented in `src/services/moderationService.ts`:

```typescript
// Main moderation function
static moderateMessage(message: string, userId: string, orderId: string): ModerationResult

// Logging functions
static async logModerationAction(...)
static async updateUserViolations(...)

// Utility functions
static async isUserSuspended(userId: string): Promise<boolean>
static async getUserViolationCount(userId: string, violationType: string): Promise<number>
```

### Integration with OrderMessaging Component

The moderation system is integrated into the existing chat interface in `src/components/vendor/OrderMessaging.tsx`:

1. **Message Validation**: Every message is processed through the moderation system
2. **Real-time Feedback**: Users receive immediate feedback about blocked or masked content
3. **Suspension Handling**: Suspended users cannot send messages
4. **Visual Indicators**: Clear UI indicators for moderation status

### Admin Components (Website)

The admin interface for the moderation system is located on your website at `C:\Users\Milton\Desktop\ISA-WEB05\isa-web\src\components\admin\sections\AdminModeration.tsx`.

#### AdminModeration Component
- **Location**: Website admin section (`isa-web/src/components/admin/sections/AdminModeration.tsx`)
- **Purpose**: Admin interface for reviewing moderation logs and user violations
- **Features**:
  - Real-time moderation statistics
  - Detailed log viewing with filtering
  - User violation tracking
  - Suspension status monitoring
  - Modal view for detailed log inspection

#### ChatModerationService (Website)
- **Location**: Website services (`isa-web/src/services/chatModerationService.ts`)
- **Purpose**: Core moderation logic and admin functions
- **Features**:
  - Message moderation with regex patterns
  - Logging and violation tracking
  - User suspension management
  - Admin data retrieval functions

## Usage Examples

### Basic Message Moderation
```typescript
import { ModerationService } from '@/services/moderationService';

const result = ModerationService.moderateMessage(
  "Call me at 123-456-7890",
  "user-id",
  "order-id"
);

if (result.isBlocked) {
  // Show warning message to user
  console.log(result.warningMessage);
} else if (result.isMasked) {
  // Send masked message
  console.log(result.moderatedMessage); // "Call me at ***-***-****"
}
```

### Checking User Suspension
```typescript
const isSuspended = await ModerationService.isUserSuspended(userId);
if (isSuspended) {
  // Prevent user from sending messages
}
```

### Logging Moderation Actions
```typescript
await ModerationService.logModerationAction(
  userId,
  orderId,
  originalMessage,
  moderatedMessage,
  violations,
  actionTaken
);
```

## Security Considerations

### Row Level Security (RLS)
- All moderation tables have RLS enabled
- Only authorized admins can view moderation logs
- Users can only view their own violations
- System accounts can insert/update records

### Data Protection
- Original messages are logged for admin review only
- Sensitive information is masked in user-facing content
- Complete audit trail for compliance and security

### Performance
- Regex patterns are optimized for speed
- Minimal database queries during message processing
- Efficient indexing on frequently queried columns

## Configuration

### Environment Variables
No additional environment variables are required. The system uses existing Supabase configuration.

### Database Migrations
Run the following migration files in order:
1. `20250125000003-create-order-messages-table.sql`
2. The moderation tables should already exist from your backend setup

## Monitoring and Maintenance

### Daily Review Process
1. Review moderation logs for patterns
2. Check user violations for escalation
3. Monitor suspension rates
4. Update regex patterns if needed

### Admin Dashboard Integration
The moderation system is already integrated with your website admin panel at `isa-web/src/components/admin/sections/AdminModeration.tsx`. The admin interface provides:

- Complete moderation log viewing
- User violation tracking
- Suspension status monitoring
- Detailed message inspection
- Filtering and search capabilities

The admin interface is accessible through your existing website admin dashboard.

## Testing

### Manual Testing
Test the moderation system by sending various message types through the chat interface in the app:

- Phone number variations: `(123) 456-7890`, `123-456-7890`, `+1-555-123-4567`
- Email addresses: `user@example.com`
- URLs and domains: `https://example.com`, `www.google.com`
- Social media mentions: `WhatsApp`, `Telegram`, `Instagram`
- Contact keywords: `call me`, `phone me`, `email me`
- Clean messages: Normal conversation without sensitive content

### Test Cases
The system automatically handles various message types:
- Phone numbers are masked (e.g., `(123) 456-7890` → `(***) ***-****`)
- Emails, URLs, and social mentions are blocked
- Contact keywords trigger blocking
- Clean messages pass through without modification

## Troubleshooting

### Common Issues

1. **Messages not being moderated**
   - Check if moderation service is properly imported
   - Verify database tables exist
   - Check browser console for errors

2. **Users not getting suspended**
   - Verify violation counting logic
   - Check user_violations table updates
   - Ensure RLS policies allow system updates

3. **Admin cannot view logs**
   - Check admin role permissions
   - Verify RLS policies for moderation_logs table
   - Ensure user has proper admin role in admin_roles table

### Debug Mode
Enable debug logging by adding console.log statements in the ModerationService class for troubleshooting.

## Future Enhancements

### Planned Features
- **AI-Powered Detection**: Enhanced pattern recognition using machine learning
- **Custom Rules**: Admin-configurable moderation rules
- **Message Templates**: Pre-approved message templates for common communications
- **Analytics Dashboard**: Advanced analytics for moderation patterns
- **Auto-Unsuspension**: Time-based automatic unsuspension with warning system

### Integration Opportunities
- **Notification System**: Real-time notifications for admins about violations
- **Customer Support**: Integration with support ticket system
- **Compliance Reporting**: Automated compliance reports for regulatory requirements

## Support

For technical support or questions about the moderation system:
1. Check the troubleshooting section above
2. Review the test component for validation
3. Contact the development team with specific error messages and logs

---

**Note**: This moderation system is designed to protect user privacy and maintain platform security while ensuring smooth communication between customers and vendors. All moderation actions are logged and can be reviewed by authorized administrators.
