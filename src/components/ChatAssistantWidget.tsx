import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader, AlertCircle } from 'lucide-react'
import { Groq } from 'groq-sdk'

const ChatAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot' }>>([
    { id: 1, text: 'Hey! 🏍️ I\'m MotoMech AI. Need help diagnosing bike issues, finding parts, or booking service? Ask away!', sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [groqClient, setGroqClient] = useState<Groq | null>(null)
  const [error, setError] = useState('')

  // Initialize Groq client
  useEffect(() => {
    // @ts-ignore - Vite environment variable
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      setError('Groq API key not configured')
      return
    }
    setGroqClient(new Groq({ apiKey, dangerouslyAllowBrowser: true }))
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !groqClient) return
    if (error) return

    // Add user message
    const userMsg = { id: Date.now(), text: input, sender: 'user' as const }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Format context for the AI
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text,
      }))

      // Call Groq API with mechanic-specialized prompt
      const response = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Latest LLaMA model
        messages: [
          {
            role: 'system',
            content: `You are MotoMech AI - a specialized motorcycle and car mechanic expert. Your ONLY purpose is to help with:
• Motorcycle/car diagnosis and troubleshooting
• Engine, transmission, electrical, suspension, brake issues
• Part recommendations and compatibility
• Maintenance schedules and service advice
• Repair techniques and tips
• Performance upgrades

IMPORTANT RULES:
1. ONLY answer questions about motorcycles, cars, motors, and mechanical repair
2. If asked about ANYTHING else (sports, politics, weather, recipes, etc), respond ONLY with:
   "I'm a specialized mechanic AI. I can only help with motorcycle and car mechanical questions. Got any bike or car problems?"
3. Stay focused, professional, and safety-conscious
4. Admit when unsure instead of guessing
5. Recommend professional help for complex issues

You are STRICTLY a mechanic assistant - nothing else.`,
          },
          ...conversationHistory,
          { role: 'user', content: input },
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
      })

      const botResponse = response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to AI service'
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `⚠️ Error: ${errorMsg}. Please check your Groq API key in .env.local`,
        sender: 'bot'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Widget Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-40 p-4 rounded-full bg-gradient-accent shadow-2xl shadow-moto-accent/50 hover:shadow-3xl transition-all duration-300"
        aria-label="Open chat assistant"
      >
        <MessageCircle size={28} className="text-white" />
        {!isOpen && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-2 right-2 w-3 h-3 bg-moto-accent-neon rounded-full"
          />
        )}
      </motion.button>

      {/* Chat Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-8 z-40 w-96 h-[32rem] bg-moto-darker border border-moto-gray-light/30 rounded-2xl shadow-2xl flex flex-col backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-moto-gray-light/30 flex justify-between items-center bg-gradient-to-r from-moto-dark to-moto-darker">
              <div>
                <h3 className="font-bold text-lg text-white">🔧 MotoMech AI</h3>
                <p className="text-xs text-gray-400">Expert mechanic • Powered by Groq</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-moto-gray rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-red-900/30 border-b border-red-700/50 flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle size={16} />
                <span>{error} - <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-200">Get free API key</a></span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-accent text-white rounded-br-none'
                        : 'bg-moto-gray text-gray-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 bg-moto-gray rounded-2xl rounded-bl-none">
                    <Loader size={18} className="text-moto-accent-orange animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-moto-gray-light/30 bg-moto-dark">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={error ? "Set API key first..." : "Ask about parts, repairs, service..."}
                  className="flex-1 px-4 py-2 bg-moto-gray border border-moto-gray-light/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-moto-accent-orange transition-colors text-sm disabled:opacity-50"
                  disabled={isLoading || !!error}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || !!error}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-moto-accent-orange hover:bg-moto-accent rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatAssistantWidget
