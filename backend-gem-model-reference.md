# Backend Error Response Specification

## Overview
This document specifies the expected error response format for the Gem API endpoints, particularly for validation errors. The frontend is designed to parse and display field-specific validation errors to provide a better user experience.

## Error Response Format

### Standard Error Response (Non-Validation Errors)

For general errors (authentication, authorization, server errors, etc.), use the following format:

```json
{
  "success": false,
  "message": "A user-friendly error message describing what went wrong"
}
```

**Example:**
```json
{
  "success": false,
  "message": "Authentication required. Please login to continue."
}
```

### Validation Error Response (Field-Specific Errors)

The frontend supports **two formats** for validation errors:

#### Format 1: Array Format (Express-Validator Style) - **RECOMMENDED**

This is the format currently used by your backend. Use this format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": null,
      "msg": "Invalid birth month",
      "path": "birthMonth",
      "location": "body"
    },
    {
      "type": "field",
      "value": "",
      "msg": "Gem name is required",
      "path": "name",
      "location": "body"
    }
  ]
}
```

**Required fields in each error object:**
- `path` (string, required): The field name that has the error
- `msg` (string, required): The error message to display
- `type` (string, optional): Usually "field"
- `value` (any, optional): The invalid value that was provided
- `location` (string, optional): Usually "body"

#### Format 2: Object Format (Mongoose Validation Style)

Alternative format that is also supported:

```json
{
  "success": false,
  "message": "Validation failed. Please check the form fields.",
  "errors": {
    "name": {
      "message": "Gem name is required"
    },
    "price": {
      "message": "Valid price is required when 'Contact for Price' is not enabled"
    }
  }
}
```

**Simpler object format (also supported):**
```json
{
  "success": false,
  "message": "Validation failed. Please check the form fields.",
  "errors": {
    "name": "Gem name is required",
    "price": "Valid price is required"
  }
}
```

## Field Name Mapping

The frontend maps backend field names to frontend field names as follows:

| Backend Field | Frontend Field | Notes |
|--------------|---------------|-------|
| `name` | `name` | Gem name |
| `category` | `name` | Maps to name field (category is derived from name) |
| `hindiName` | `hindiName` | Hindi name of the gem |
| `planet` | `planet` | Associated planet |
| `planetHindi` | `planetHindi` | Planet name in Hindi |
| `color` | `color` | Gem color |
| `description` | `description` | Gem description |
| `benefits` | `benefits` | Array of benefits |
| `suitableFor` | `suitableFor` | Array of suitable professions |
| `price` | `price` | Gem price (required if contactForPrice is false) |
| `sizeWeight` | `sizeWeight` | Size/weight of the gem |
| `sizeUnit` | `sizeUnit` | Unit (carat, gram, ratti) |
| `stock` | `stock` | Stock quantity |
| `certification` | `certification` | Certification details |
| `origin` | `origin` | Origin of the gem |
| `deliveryDays` | `deliveryDays` | Delivery days |
| `heroImage` | `heroImage` | Main image URL |
| `additionalImages` | `additionalImages` | Array of additional image URLs |
| `birthMonth` | `birthMonth` | Optional birth month (must be valid month name or null) |

## HTTP Status Codes

- **400 Bad Request**: Use for validation errors
- **401 Unauthorized**: Use for authentication errors
- **403 Forbidden**: Use for authorization errors
- **404 Not Found**: Use when resource is not found
- **500 Internal Server Error**: Use for server errors

## Implementation Examples

### Example 1: Express-Validator Error Format (Current Implementation)

```javascript
// In your route handler (Express.js with express-validator)
const { body, validationResult } = require('express-validator');

// Validation rules
const validateGem = [
  body('name').notEmpty().withMessage('Gem name is required'),
  body('hindiName').notEmpty().withMessage('Hindi name is required'),
  body('birthMonth')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December'])
    .withMessage('Invalid birth month'),
  // ... more validations
];

// In your route handler
app.post('/api/gems', validateGem, async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array() // This returns the array format
    });
  }
  
  // Process the request...
});
```

### Example 2: Custom Validation with Array Format

```javascript
// Custom validation example
const validateGemData = (gemData) => {
  const errors = [];
  
  if (!gemData.name || gemData.name.trim() === '') {
    errors.push({
      type: 'field',
      value: gemData.name,
      msg: 'Gem name is required',
      path: 'name',
      location: 'body'
    });
  }
  
  if (!gemData.hindiName || gemData.hindiName.trim() === '') {
    errors.push({
      type: 'field',
      value: gemData.hindiName,
      msg: 'Hindi name is required',
      path: 'hindiName',
      location: 'body'
    });
  }
  
  if (gemData.birthMonth !== null && gemData.birthMonth !== '') {
    const validMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    if (!validMonths.includes(gemData.birthMonth)) {
      errors.push({
        type: 'field',
        value: gemData.birthMonth,
        msg: 'Invalid birth month. Must be one of: January, February, March, April, May, June, July, August, September, October, November, December',
        path: 'birthMonth',
        location: 'body'
      });
    }
  }
  
  if (!gemData.contactForPrice && (!gemData.price || gemData.price <= 0)) {
    errors.push({
      type: 'field',
      value: gemData.price,
      msg: 'Valid price is required when "Contact for Price" is not enabled',
      path: 'price',
      location: 'body'
    });
  }
  
  return errors.length > 0 ? errors : null;
};

// In route handler
const validationErrors = validateGemData(req.body);
if (validationErrors) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: validationErrors
  });
}
```

### Example 3: Multiple Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Gem name is required",
      "path": "name",
      "location": "body"
    },
    {
      "type": "field",
      "value": "",
      "msg": "Hindi name is required",
      "path": "hindiName",
      "location": "body"
    },
    {
      "type": "field",
      "value": null,
      "msg": "Invalid birth month",
      "path": "birthMonth",
      "location": "body"
    },
    {
      "type": "field",
      "value": -100,
      "msg": "Valid price is required when 'Contact for Price' is not enabled",
      "path": "price",
      "location": "body"
    }
  ]
}
```

## Required Fields for Gem Creation

Based on the frontend validation, the following fields are required:

1. **name** (string, required)
2. **hindiName** (string, required)
3. **planet** (string, required)
4. **color** (string, required)
5. **description** (string, required)
6. **benefits** (array, required, at least one item)
7. **suitableFor** (array, required, at least one item)
8. **price** (number, required if `contactForPrice` is false)
9. **sizeWeight** (number, required)
10. **certification** (string, required)
11. **origin** (string, required)
12. **deliveryDays** (number, required)
13. **heroImage** (string, required)

**Optional Fields:**
- `birthMonth` (string, optional, must be valid month name or null/empty string)
- `stock` (number, optional)
- `discount` (number, optional, default: 0)
- `discountType` (string, optional, default: 'percentage')
- `additionalImages` (array, optional)
- `contactForPrice` (boolean, optional, default: false)
- `availability` (boolean, optional, default: true)

## Special Validation Rules

### Birth Month Validation
- If `birthMonth` is provided, it must be one of the 12 month names: `January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`
- If `birthMonth` is `null` or empty string, it's valid (optional field)
- If `birthMonth` is any other value, return error: `"Invalid birth month"`

### Price Validation
- If `contactForPrice` is `false`, `price` is required and must be a positive number
- If `contactForPrice` is `true`, `price` should be `null` or not sent

## Testing Error Responses

To test error responses, you can use the following curl commands:

### Test Validation Error (Birth Month):
```bash
curl -X POST http://localhost:5000/api/gems \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Emerald (Panna)",
    "hindiName": "Panna (पन्ना)",
    "birthMonth": "InvalidMonth"
  }'
```

Expected response:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "InvalidMonth",
      "msg": "Invalid birth month",
      "path": "birthMonth",
      "location": "body"
    }
  ]
}
```

### Test Multiple Validation Errors:
```bash
curl -X POST http://localhost:5000/api/gems \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "",
    "hindiName": "",
    "price": -100
  }'
```

Expected response:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Gem name is required",
      "path": "name",
      "location": "body"
    },
    {
      "type": "field",
      "value": "",
      "msg": "Hindi name is required",
      "path": "hindiName",
      "location": "body"
    },
    {
      "type": "field",
      "value": -100,
      "msg": "Price must be a positive number",
      "path": "price",
      "location": "body"
    }
  ]
}
```

## Notes

1. **Error Message Clarity**: Error messages should be user-friendly and specific. Avoid technical jargon.

2. **Field Names**: Use the exact field names as they appear in your database schema/model. The frontend will handle the mapping.

3. **Multiple Errors**: When multiple fields have errors, include all of them in the response. Don't stop at the first error.

4. **Consistency**: Maintain consistent error response format across all endpoints.

5. **Error Messages**: Use clear, actionable error messages. For example:
   - ✅ Good: "Invalid birth month"
   - ✅ Good: "Gem name is required"
   - ❌ Bad: "name: Path `name` is required."
   - ❌ Bad: "ValidationError"

6. **Status Codes**: Always use appropriate HTTP status codes (400 for validation errors).

7. **Array Format**: The array format (Format 1) is recommended as it's more flexible and matches express-validator's output format.

## Questions or Issues?

If you have questions about this specification or need clarification, please contact the frontend development team.

