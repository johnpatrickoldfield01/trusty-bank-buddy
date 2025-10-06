import { supabase } from '@/integrations/supabase/client';

export async function createLunoBugReport() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }

  const bugReport = {
    user_id: user.id,
    title: 'Bug #5: Luno API Rate Limit Error (403 Forbidden) - Blocking Production Crypto Transfers',
    description: `The Luno crypto send functionality is returning a "Limit exceeded" error (HTTP 403) despite the account having unlimited receiving limits.

**Error Details:**
- Error Code: ErrLimitExceeded
- HTTP Status: 403 Forbidden
- Message: "Limit exceeded."
- Exchange: Luno Exchange (Pty) Ltd
- API Endpoint: https://api.luno.com/api/1/send

**Impact:**
- ❌ Users cannot send real BTC transactions via Luno
- ✅ Only mock mode transactions work
- 🚫 Blocks production crypto transfers
- 📊 Presentation layer shows cryptic edge function errors

**Root Cause Analysis Required:**
1. Verify API credentials (LUNO_API_KEY_ID_NEW, LUNO_API_SECRET_NEW) are production keys from https://www.luno.com/wallet/security/api_keys
2. Check if API key has "Send" permissions enabled
3. Investigate if this is a:
   - Rate limit (requests per minute)
   - Withdrawal limit (despite user claiming unlimited)
   - API tier/plan limitation
   - Incorrect production vs sandbox endpoint
4. Verify API key tier matches account capabilities

**Technical Details:**
- Edge Function: luno-crypto-send
- Supabase Function Path: /functions/v1/luno-crypto-send
- Error Location: Line 154-158 in edge function
- User reports unlimited receiving limits on Luno account

**Temporary Workaround:**
- Users MUST use Mock mode toggle for testing
- Edge function now has improved error handling
- Graceful fallback messages in presentation layer

**Expected Behavior:**
Real BTC transactions should process successfully via Luno API without rate limit errors when account limits are unlimited.

**Diagnostic Information:**
- Console Error: "Edge function error: Edge Function returned a non-2xx status code"
- Edge Function Response: 403 status with error_code "ErrLimitExceeded"
- Blockchain Sync: Not triggered due to failed transaction
- PDF Generation: Skipped due to transaction failure

**Next Steps:**
1. Contact Luno support with API key details
2. Verify production API endpoint vs test/sandbox
3. Check API key permissions in Luno dashboard
4. Review API rate limiting documentation
5. Test with different API credentials if available`,
    category: 'API Integration',
    priority: 'critical',
    status: 'open',
    blocks_development: true,
    notes: 'Logged automatically from presentation layer diagnostic on 2025-10-06. User confirmed unlimited receiving limits on Luno account. Requires immediate investigation of API credentials, permissions, and rate limiting configuration. This is blocking all production cryptocurrency transactions via Luno exchange.'
  };

  const { data, error } = await supabase
    .from('bug_reports')
    .insert(bugReport)
    .select()
    .single();

  if (error) {
    console.error('Failed to create bug report:', error);
    return null;
  }

  console.log('✅ Bug report created successfully:', data);
  return data;
}
