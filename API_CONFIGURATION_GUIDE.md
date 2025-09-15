# 🔑 API Configuration Guide

## **OpenAI API Setup for TeenyAI**

### **Step 1: Get Your OpenAI API Key**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### **Step 2: Configure Environment Variables**

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

Add your API key to the `.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your_actual_api_key_here

# Development Configuration
NODE_ENV=development
DEBUG_PROD=false

# AI Service Configuration
AI_SERVICE_ENDPOINT=https://api.openai.com/v1
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

### **Step 3: Test AI Features**

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Open AI Assistant**:
   - Click the robot icon in the navigation bar
   - The AI chat panel should open on the right

3. **Test page analysis**:
   - Click "Analyze this page" button
   - The AI should analyze the current webpage
   - Ask questions about the page content

### **Step 4: Verify API Connection**

Check the console for these success messages:
- ✅ "AI Service initialized successfully"
- ✅ "OpenAI API key loaded"
- ✅ "Page analysis completed"

### **Troubleshooting**

#### **API Key Not Working**
- Verify the key starts with `sk-`
- Check for extra spaces or characters
- Ensure the key has sufficient credits

#### **Rate Limiting**
- OpenAI has rate limits based on your plan
- Free tier: 3 requests per minute
- Paid tier: Higher limits

#### **Network Issues**
- Check your internet connection
- Verify firewall settings
- Try a different network

### **Security Best Practices**

1. **Never commit .env files**:
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment-specific files**:
   - `.env.local` for local development
   - `.env.production` for production
   - `.env.example` for documentation

3. **Rotate API keys regularly**:
   - Generate new keys monthly
   - Revoke old keys
   - Monitor usage in OpenAI dashboard

### **API Usage Monitoring**

Monitor your API usage at:
- [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Track costs and usage patterns
- Set up billing alerts

### **Production Deployment**

For production deployment:

1. **Set environment variables**:
   ```bash
   export OPENAI_API_KEY=your_production_key
   ```

2. **Use secure key management**:
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault

3. **Implement rate limiting**:
   - Add request throttling
   - Cache responses
   - Monitor usage patterns

---

**Your TeenyAI browser is now ready for intelligent AI-powered browsing!** 🚀
