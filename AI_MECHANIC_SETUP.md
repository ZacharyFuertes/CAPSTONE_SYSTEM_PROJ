# 🤖 MotoMech AI Setup Guide

## ✅ How to Enable the Free AI Mechanic Chatbot

### **Step 1: Get Your Free Groq API Key** (2 minutes)

1. Go to **[https://console.groq.com](https://console.groq.com)**
2. Click **Sign Up** (free, no credit card needed)
3. Verify your email
4. Go to **API Keys** section
5. Click **Create API Key**
6. Copy the key

### **Step 2: Add API Key to Your Project**

1. In VS Code, open `.env.local` (at project root)
2. Replace `your_groq_api_key_here` with your actual key:
   ```
   VITE_GROQ_API_KEY=gsk_abc123xyz...
   ```
3. **Save the file** (Ctrl+S)

### **Step 3: Restart Dev Server**

Stop and restart your dev server:
```bash
npm run dev
```

The chatbot will now have access to the free AI mechanic!

---

## 🎯 What MotoMech AI Can Help With

The AI chatbot is specialized to help with:
- 🔧 Diagnosing motorcycle problems (engine, transmission, electrical, suspension, brakes)
- 🛠️ Recommending high-quality aftermarket parts
- 📚 Maintenance tips and service advice
- 🔄 Parts compatibility
- 🚨 Troubleshooting common issues
- ⚡ Suggesting tune-ups and upgrades

---

## 💡 Features

✅ **100% Free** - No limits, no billing
✅ **Unlimited Prompts** - Ask as many questions as you want
✅ **Expert Knowledge** - 20+ years of mechanic expertise
✅ **Real-time Responses** - Super fast with Groq
✅ **Conversation History** - AI remembers context
✅ **Error Handling** - Clear feedback if something goes wrong

---

## 🚀 Example Questions to Try

1. "My bike is making a grinding noise when I shift gears, what could it be?"
2. "I want to upgrade my exhaust system - what are the best options?"
3. "How often should I change my motorcycle oil?"
4. "What's the difference between these two air filters?"
5. "My electrical system is acting weird - diagnostics?"

---

## ⚙️ Technical Details

- **AI Model**: Mixtral 8x7B (fast & capable)
- **Provider**: Groq (free tier, unlimited)
- **Response Time**: ~1-3 seconds
- **Max Response**: 500 tokens (~400 words)
- **Temperature**: 0.7 (balanced creativity & accuracy)

---

## 🆘 Troubleshooting

**"Groq API key not configured" error?**
- Make sure `.env.local` file has your key
- Restart the dev server after adding the key
- Check that key starts with `gsk_`

**"Failed to connect to AI service" error?**
- Check your internet connection
- Verify API key is correct
- Visit [Groq Console](https://console.groq.com) to confirm key is active

**Response is too slow?**
- This is normal for first request (cold start)
- Subsequent messages will be faster
- Groq is one of the fastest AI providers

---

## 📝 Next Steps

1. Add more specialized prompts for different motorcycle types
2. Store conversation history in database
3. Add rating system for responses
4. Connect to your appointment booking system
5. Add voice input/output (optional)

Enjoy your free AI mechanic! 🏍️⚡
