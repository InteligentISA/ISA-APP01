# AI-Powered AskISA Feature

## Overview

The AskISA feature is an AI-powered shopping assistant that allows customers to search for products using natural language queries. The system uses intelligent natural language processing to understand customer intent and convert queries into product search parameters.

## How It Works

### 1. Natural Language Processing
The AI service (`aiService.ts`) analyzes customer queries using:
- **Price extraction**: Recognizes price constraints like "under 50,000 KSH", "between 30,000 and 80,000"
- **Category detection**: Identifies product categories from keywords (laptop, smartphone, headphones, etc.)
- **Brand recognition**: Detects brand names and their synonyms
- **Rating preferences**: Understands rating requirements like "4+ stars"

### 2. Query Analysis Examples

| Customer Query | Extracted Information |
|----------------|----------------------|
| "I want an HP laptop under 50,000 KSH" | Category: laptop, Brand: HP, MaxPrice: 50000 |
| "Show me smartphones with good cameras" | Category: smartphone, SearchTerms: ["phone", "camera"] |
| "Gaming laptops between 30,000 and 80,000" | Category: laptop, MinPrice: 30000, MaxPrice: 80000 |
| "Samsung phones with 4+ rating" | Category: smartphone, Brand: Samsung, MinRating: 4 |

### 3. Product Search
The system converts the analyzed query into:
- Search terms for text matching
- Product filters (category, price range, rating)
- Sorting preferences (by rating, price, etc.)

### 4. Response Generation
The AI generates contextual responses including:
- Number of products found
- Applied filters summary
- Follow-up questions when needed
- Product recommendations

## Key Components

### Services
- **`aiService.ts`**: Core NLP functionality for query analysis
- **`chatService.ts`**: Manages conversation flow and integrates AI with product search
- **`productService.ts`**: Handles product database queries

### Components
- **`AskISA.tsx`**: Main chat interface
- **`ChatMessage.tsx`**: Individual message display with product cards
- **`SuggestionChips.tsx`**: Quick query suggestions

## Features

### 1. Intelligent Query Understanding
- Natural language processing
- Context-aware responses
- Multi-parameter filtering

### 2. Product Display
- Rich product cards with images, prices, ratings
- Add to cart functionality
- Like/unlike products
- Stock status indicators

### 3. Conversation Management
- Chat history
- Session management
- Quick suggestions
- Follow-up questions

### 4. User Experience
- Real-time processing
- Loading indicators
- Auto-scroll to new messages
- Responsive design

## Usage Examples

### Basic Queries
```
"I want an HP laptop under 50,000 KSH"
"Show me smartphones with good cameras"
"Find gaming accessories under 10,000"
```

### Advanced Queries
```
"Laptops between 30,000 and 80,000 KSH with 4+ star rating"
"Samsung phones under 25,000 with good battery life"
"Gaming laptops from Dell or HP under 100,000"
```

### Follow-up Interactions
The AI can ask clarifying questions:
- "What type of product are you looking for?"
- "What's your budget range?"
- "Do you have any preference for product ratings?"

## Technical Implementation

### Query Processing Pipeline
1. **Text Analysis**: Parse natural language input
2. **Entity Extraction**: Identify products, brands, prices, ratings
3. **Filter Generation**: Create database query parameters
4. **Product Search**: Query Supabase database
5. **Response Generation**: Create contextual response
6. **Product Display**: Show matching products with actions

### Database Integration
- Uses existing product schema
- Leverages Supabase RLS policies
- Supports complex filtering and sorting
- Real-time updates

### Performance Considerations
- Efficient regex patterns for text parsing
- Optimized database queries
- Caching of common queries
- Lazy loading of product images

## Future Enhancements

### Planned Features
1. **Machine Learning Integration**: Train models on user queries
2. **Voice Input**: Speech-to-text capabilities
3. **Image Recognition**: Search by product images
4. **Personalization**: Learn user preferences over time
5. **Multi-language Support**: Support for Swahili and other languages

### Advanced AI Capabilities
1. **Conversation Memory**: Remember context across messages
2. **Recommendation Engine**: Suggest related products
3. **Price Comparison**: Compare prices across vendors
4. **Trend Analysis**: Show trending products

## Configuration

### Environment Variables
```env
# AI Service Configuration
AI_CONFIDENCE_THRESHOLD=0.5
AI_MAX_RESULTS=20
AI_ENABLE_SUGGESTIONS=true
```

### Customization
- Add new product categories in `categorySynonyms`
- Extend brand recognition in `brandKeywords`
- Modify price patterns in `extractPriceInfo`
- Customize response templates in `generateResponse`

## Testing

Run the test suite to verify AI functionality:
```bash
npm test aiService.test.ts
```

The tests cover:
- Query analysis accuracy
- Price extraction
- Category detection
- Response generation
- Follow-up question logic

## Support

For issues or questions about the AI features:
1. Check the test files for usage examples
2. Review the service implementations
3. Test with sample queries
4. Monitor console logs for debugging information 