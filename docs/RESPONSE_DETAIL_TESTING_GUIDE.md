# Response Detail Testing Guide

## Overview
This guide provides comprehensive instructions for testing the response detail functionality in the Survey App. The response detail feature allows survey owners to view individual survey responses with full details.

## Features Being Tested

### 1. API Endpoints
- `GET /api/surveys/[id]/responses` - List all responses for a survey
- Response data includes transformed response_data object with answers

### 2. Access Control
- ✅ Only survey owners can view responses
- ✅ Non-owners receive 403 Forbidden error
- ✅ Anonymous users receive 401 Unauthorized error

### 3. UI Components
- **ResponseDetailDialog** - Modal dialog for viewing response details
- **Response List** - Table showing all responses with preview
- **View Button** - Opens detail dialog for individual response

### 4. Response Details Displayed
- Response metadata (ID, submission date, device info)
- User type (logged in vs anonymous)
- Time spent on survey
- All questions with their answers
- Visual formatting for different question types

## Automated Test Script

### Running the Test Script

```bash
# Make the script executable
chmod +x scripts/test-response-detail.js

# Run the test
node scripts/test-response-detail.js

# Or with a custom base URL
BASE_URL=https://your-app.com node scripts/test-response-detail.js
```

### What the Script Tests

1. **Authentication** - Logs in test users
2. **Survey Creation** - Creates a test survey with multiple question types
3. **Response Submission** - Submits test responses
4. **Access Control** - Verifies only owners can view responses
5. **Data Retrieval** - Confirms response data is correctly formatted

### Expected Output

```
🧪 Response Detail Test Suite
============================

🔐 Logging in as admin@example.com...
✅ Login successful

📝 Creating test survey...
✅ Survey created: [survey-id]

📋 Adding questions to survey...
✅ Added question: What is your name?
✅ Added question: How satisfied are you?
✅ Added question: Select all that apply:
✅ Added question: Rate our service:
✅ Added question: Additional comments:

🚀 Publishing survey...
✅ Survey published

📤 Submitting test response...
✅ Response submitted: [response-id]

🔒 Testing Access Control
========================

🔍 Testing GET responses (expected: success)...
✅ Successfully retrieved 2 responses

🔍 Testing response detail access (expected: success)...
✅ Response detail accessible
  - Response ID: [response-id]
  - Submitted at: 2025-06-13T12:00:00
  - Has answers: true

🔐 Logging in as user1@example.com...
✅ Login successful

🔍 Testing GET responses (expected: denied)...
✅ Access correctly denied

🔍 Testing response detail access (expected: denied)...
✅ Access correctly denied

✅ All tests passed!
```

## Manual Testing Steps

### 1. Setup Test Data

1. Login as admin user:
   - Email: `admin@example.com`
   - Password: `adminpass123`

2. Create a new survey with various question types:
   - Text input
   - Single choice
   - Multiple choice
   - Rating scale
   - Text area

3. Publish the survey

4. Submit 2-3 test responses:
   - Use different browsers/devices
   - Leave some optional questions blank
   - Use varying response times

### 2. Test Response List View

1. Navigate to `/surveys/[survey-id]/responses`

2. Verify the following:
   - [ ] Page loads without errors
   - [ ] Shows total response count
   - [ ] Lists all submitted responses
   - [ ] Shows response preview (first 2 answers)
   - [ ] Displays submission date/time
   - [ ] Shows response ID (truncated)

3. Test sorting and filtering (if implemented):
   - [ ] Sort by date
   - [ ] Filter by date range

### 3. Test Response Detail Dialog

1. Click "詳細" (Details) button on any response

2. Verify dialog shows:
   - [ ] Loading state initially
   - [ ] Response metadata section
     - [ ] Submission date/time
     - [ ] Time spent (if available)
     - [ ] User type (anonymous/logged in)
     - [ ] Device type
     - [ ] IP address (if available)
   - [ ] All survey questions in order
   - [ ] Correct answer formatting:
     - [ ] Text: Plain text display
     - [ ] Single choice: Selected option
     - [ ] Multiple choice: Badges for each selection
     - [ ] Rating: Star visualization
     - [ ] Date: Formatted date
     - [ ] Matrix: Row/value pairs
   - [ ] "回答なし" for unanswered questions
   - [ ] Response ID at bottom

3. Test dialog interactions:
   - [ ] Close button works
   - [ ] ESC key closes dialog
   - [ ] Clicking outside closes dialog
   - [ ] Can scroll if content is long

### 4. Test Access Control

1. Login as a different user (not survey owner)

2. Try to access `/surveys/[survey-id]/responses`
   - [ ] Should redirect or show error

3. Try to access the API directly:
   ```bash
   curl -X GET http://localhost:3000/api/surveys/[survey-id]/responses \
     -H "Cookie: [non-owner-session]"
   ```
   - [ ] Should return 403 Forbidden

### 5. Test Edge Cases

1. **Empty Responses**
   - Create a survey with no responses
   - Verify empty state message is shown

2. **Partial Responses**
   - Submit a response with only required fields
   - Verify optional fields show "回答なし"

3. **Long Text Responses**
   - Submit very long text answers
   - Verify proper text wrapping in dialog

4. **Special Characters**
   - Submit responses with quotes, commas, newlines
   - Verify proper escaping and display

5. **Performance**
   - Test with 100+ responses
   - Verify list loads reasonably fast
   - Check dialog opens without delay

### 6. Test Export Functionality

1. Click "CSVエクスポート" button
   - [ ] Downloads CSV file
   - [ ] CSV contains all responses
   - [ ] Proper formatting and escaping

2. Click "レポート生成" button
   - [ ] Opens export dialog
   - [ ] Can generate PDF report
   - [ ] Report includes response details

## Common Issues and Solutions

### Issue 1: "Access denied" for survey owner
**Solution**: Check that the user ID in the database matches the logged-in user

### Issue 2: Response detail shows empty
**Solution**: Verify response_data is being transformed correctly in the service

### Issue 3: Dialog doesn't open
**Solution**: Check browser console for JavaScript errors

### Issue 4: Incorrect answer formatting
**Solution**: Verify question_type is being passed correctly to formatAnswer function

## API Response Format

### GET /api/surveys/[id]/responses

Success Response (200):
```json
{
  "responses": [
    {
      "id": "response-uuid",
      "survey_id": "survey-uuid",
      "submitted_at": "2025-06-13T12:00:00Z",
      "completed_at": "2025-06-13T12:00:00Z",
      "time_spent": 180,
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1",
      "response_data": {
        "question-id-1": "Text answer",
        "question-id-2": "Single choice answer",
        "question-id-3": ["Multiple", "Choice", "Answers"],
        "question-id-4": 5,
        "question-id-5": "Long text answer..."
      }
    }
  ]
}
```

Error Response (403):
```json
{
  "error": "Access denied"
}
```

## Database Schema Reference

### responses table
```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  is_complete BOOLEAN,
  is_test_response BOOLEAN
);
```

### answers table
```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY,
  response_id UUID REFERENCES responses(id),
  question_id UUID REFERENCES questions(id),
  answer_text TEXT,
  answer_value JSONB
);
```

## Testing Checklist

- [ ] Automated test script passes
- [ ] Manual UI testing completed
- [ ] Access control verified
- [ ] Edge cases tested
- [ ] Performance acceptable
- [ ] Export functionality works
- [ ] No console errors
- [ ] Responsive on mobile devices

## Support

If you encounter issues during testing:
1. Check the browser console for errors
2. Verify test user accounts exist
3. Ensure survey is published
4. Check Supabase logs for database errors
5. Review the ResponseDetailDialog component code