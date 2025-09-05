# hCaptcha Integration Setup

This app has been integrated with hCaptcha to prevent bot access and unauthorized submissions.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
VITE_ENABLE_HCAPTCHA=true
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key_here
```

## Features

### Invisible hCaptcha (Hidden)
- **Login/Signup/Reset Password**: hCaptcha is invisible and triggered programmatically when users click the submit button
- **User Experience**: Users don't see the captcha until they try to submit, then it appears as a popup

### Visible hCaptcha
- **Vendor Application Form**: Visible captcha required before form submission
- **Vendor Training**: Visible captcha required before marking training modules complete
- **Checkout**: Visible captcha required before M-Pesa payment processing

## How It Works

1. **Authentication Flows**: When users click sign in/up/reset, hCaptcha executes invisibly
2. **Form Submissions**: Users must complete the visible captcha before submitting vendor applications or training
3. **Payment Processing**: Checkout requires captcha verification before processing M-Pesa payments
4. **Backend Integration**: Captcha tokens are passed to your Supabase backend (same as ISA-WEB05)

## Configuration

- Set `VITE_ENABLE_HCAPTCHA=false` to disable hCaptcha completely
- The component automatically hides when disabled or when no site key is provided
- Uses the same Supabase backend as your website for consistency

## Dependencies

- `@hcaptcha/react-hcaptcha` - Already installed
- No additional setup required beyond environment variables
