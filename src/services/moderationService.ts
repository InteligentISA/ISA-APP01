import { supabase } from '@/integrations/supabase/client';

export interface ModerationResult {
  isBlocked: boolean;
  isMasked: boolean;
  originalMessage: string;
  moderatedMessage: string;
  violations: string[];
  warningMessage?: string;
}

export interface ModerationLog {
  id: string;
  user_id: string;
  order_id: string;
  original_message: string;
  moderated_message: string;
  violations: string[];
  action_taken: 'blocked' | 'masked';
  created_at: string;
}

export class ModerationService {
  // Regex patterns for detecting sensitive content
  private static readonly PATTERNS = {
    // Phone numbers: 10-11 digits with optional separators
    phone: /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    phoneAlt: /\b\d{10,11}\b/g,
    
    // Email addresses
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // URLs and domains
    url: /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi,
    
    // Social media platforms and messaging apps
    socialPlatforms: /\b(whatsapp|telegram|instagram|facebook|skype|twitter|x|linkedin|snapchat|tiktok|discord|signal|viber|wechat|line)\b/gi,
    
    // Contact-related keywords
    contactKeywords: /\b(call me|phone me|text me|email me|contact me|reach me|get in touch|my number|my email|my contact)\b/gi,
    
    // External communication platforms
    externalPlatforms: /\b(zoom|meet|google meet|teams|slack|facetime|duo|hangouts)\b/gi
  };

  private static readonly WARNING_MESSAGE = 
    "This message contains restricted information and cannot be sent. For your safety and to ensure all transactions are protected by our Guarantee, please do not share personal contact details, emails, or external links.";

  /**
   * Moderate a message and return the result
   */
  static moderateMessage(message: string, userId: string, orderId: string): ModerationResult {
    const violations: string[] = [];
    let moderatedMessage = message;
    let isBlocked = false;
    let isMasked = false;

    // Check for phone numbers
    if (this.PATTERNS.phone.test(message) || this.PATTERNS.phoneAlt.test(message)) {
      violations.push('phone_number');
      moderatedMessage = this.maskPhoneNumbers(moderatedMessage);
      isMasked = true;
    }

    // Check for email addresses
    if (this.PATTERNS.email.test(message)) {
      violations.push('email_address');
      isBlocked = true;
    }

    // Check for URLs and domains
    if (this.PATTERNS.url.test(message)) {
      violations.push('url_or_domain');
      isBlocked = true;
    }

    // Check for social media platforms
    if (this.PATTERNS.socialPlatforms.test(message)) {
      violations.push('social_platform');
      isBlocked = true;
    }

    // Check for contact-related keywords
    if (this.PATTERNS.contactKeywords.test(message)) {
      violations.push('contact_keywords');
      isBlocked = true;
    }

    // Check for external communication platforms
    if (this.PATTERNS.externalPlatforms.test(message)) {
      violations.push('external_platform');
      isBlocked = true;
    }

    // If message is blocked, don't process it further
    if (isBlocked) {
      return {
        isBlocked: true,
        isMasked: false,
        originalMessage: message,
        moderatedMessage: message, // Keep original for logging
        violations,
        warningMessage: this.WARNING_MESSAGE
      };
    }

    // If message is masked, return the masked version
    if (isMasked) {
      return {
        isBlocked: false,
        isMasked: true,
        originalMessage: message,
        moderatedMessage,
        violations
      };
    }

    // Message is clean
    return {
      isBlocked: false,
      isMasked: false,
      originalMessage: message,
      moderatedMessage: message,
      violations: []
    };
  }

  /**
   * Mask phone numbers in a message
   */
  private static maskPhoneNumbers(message: string): string {
    // First pattern: (123) 456-7890 or similar formats
    let masked = message.replace(this.PATTERNS.phone, (match, countryCode, area, first, last) => {
      if (area && first && last) {
        return `(***) ***-****`;
      }
      return match.replace(/\d/g, '*');
    });

    // Second pattern: Simple digit sequences
    masked = masked.replace(this.PATTERNS.phoneAlt, (match) => {
      if (match.length >= 10) {
        return '*'.repeat(match.length);
      }
      return match;
    });

    return masked;
  }

  /**
   * Log moderation action to database
   */
  static async logModerationAction(
    userId: string,
    orderId: string,
    originalMessage: string,
    moderatedMessage: string,
    violations: string[],
    actionTaken: 'blocked' | 'masked'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('moderation_logs')
        .insert({
          user_id: userId,
          order_id: orderId,
          original_message: originalMessage,
          moderated_message: moderatedMessage,
          violations,
          action_taken: actionTaken
        });

      if (error) {
        console.error('Error logging moderation action:', error);
      }
    } catch (error) {
      console.error('Error logging moderation action:', error);
    }
  }

  /**
   * Update user violation count
   */
  static async updateUserViolations(userId: string, violationType: string): Promise<void> {
    try {
      // Check if user already has violations of this type
      const { data: existingViolation, error: fetchError } = await supabase
        .from('user_violations')
        .select('*')
        .eq('user_id', userId)
        .eq('violation_type', violationType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user violations:', fetchError);
        return;
      }

      if (existingViolation) {
        // Update existing violation count
        const newCount = existingViolation.violation_count + 1;
        const shouldSuspend = newCount >= 3; // Suspend after 3 violations

        const { error: updateError } = await supabase
          .from('user_violations')
          .update({
            violation_count: newCount,
            last_violation: new Date().toISOString(),
            is_suspended: shouldSuspend
          })
          .eq('id', existingViolation.id);

        if (updateError) {
          console.error('Error updating user violations:', updateError);
        }
      } else {
        // Create new violation record
        const { error: insertError } = await supabase
          .from('user_violations')
          .insert({
            user_id: userId,
            violation_type: violationType,
            violation_count: 1,
            last_violation: new Date().toISOString(),
            is_suspended: false
          });

        if (insertError) {
          console.error('Error inserting user violation:', insertError);
        }
      }
    } catch (error) {
      console.error('Error updating user violations:', error);
    }
  }

  /**
   * Check if user is suspended
   */
  static async isUserSuspended(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_violations')
        .select('is_suspended')
        .eq('user_id', userId)
        .eq('is_suspended', true)
        .limit(1);

      if (error) {
        console.error('Error checking user suspension status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking user suspension status:', error);
      return false;
    }
  }

  /**
   * Get user violation count for a specific type
   */
  static async getUserViolationCount(userId: string, violationType: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_violations')
        .select('violation_count')
        .eq('user_id', userId)
        .eq('violation_type', violationType)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return 0;
        }
        console.error('Error fetching user violation count:', error);
        return 0;
      }

      return data?.violation_count || 0;
    } catch (error) {
      console.error('Error fetching user violation count:', error);
      return 0;
    }
  }

  /**
   * Get moderation logs for admin review
   */
  static async getModerationLogs(
    limit: number = 50,
    offset: number = 0,
    userId?: string,
    orderId?: string
  ): Promise<ModerationLog[]> {
    try {
      let query = supabase
        .from('moderation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching moderation logs:', error);
        return [];
      }

      return (data || []) as ModerationLog[];
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      return [];
    }
  }

  /**
   * Get user violations for admin review
   */
  static async getUserViolations(userId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('user_violations')
        .select('*')
        .order('last_violation', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user violations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user violations:', error);
      return [];
    }
  }
}
