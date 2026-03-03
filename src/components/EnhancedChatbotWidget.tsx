import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { Groq } from 'groq-sdk'

interface ChatMessageType {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  suggestedParts?: string[]
}

// System prompts for different scenarios
const MECHANIC_SYSTEM_PROMPT = `You are an expert automotive mechanic AI assistant for a Filipino motorcycle and car repair shop. Your role is to:

1. Help diagnose vehicle problems based on customer descriptions
2. Suggest appropriate parts and services needed
3. Provide repair estimates and recommendations
4. Answer questions about maintenance schedules
5. Offer troubleshooting steps for common issues

When diagnosing issues:
- Ask clarifying questions about symptoms
- Suggest relevant parts (brake pads, filters, spark plugs, oils, etc.)
- Mention common causes for Filipino vehicles (Honda, Yamaha, Suzuki, etc.)
- Include estimated costs in Philippine Peso (₱)
- Recommend preventive maintenance

Format responses clearly with:
- Problem diagnosis
- Suggested parts (with part names and typical costs)
- Labor estimate
- Timeline for repair

Be friendly, professional, and helpful. Respond in English but can mix with Tagalog for better understanding.`

const CUSTOMER_SERVICE_PROMPT = `You are a helpful customer service AI for an auto repair shop. Help customers with:

1. Service inquiries and pricing
2. Appointment booking information
3. Shop hours and location details
4. General vehicle care tips
5. Payment and warranty information

Always be polite and professional. For specific technical advice, suggest they speak with a mechanic.`

interface EnhancedChatbotWidgetProps {
  userRole?: 'customer' | 'mechanic' | 'admin'
}

const EnhancedChatbotWidget: React.FC<EnhancedChatbotWidgetProps> = ({ userRole = 'customer' }) => {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const groqClient = useRef<Groq | null>(null)

  // Initialize Groq client
  useEffect(() => {
    // @ts-ignore - Vite import.meta.env typing
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
    if (apiKey && typeof apiKey === 'string') {
      groqClient.current = new Groq({ apiKey, dangerouslyAllowBrowser: true })
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const extractPartsFromResponse = (response: string): string[] => {
    const partKeywords = [
      'brake pad',
      'oil filter',
      'spark plug',
      'air filter',
      'coolant',
      'battery',
      'alternator',
      'starter',
      'tire',
      'suspension',
    ]
    const parts: string[] = []
    partKeywords.forEach((keyword) => {
      if (response.toLowerCase().includes(keyword)) {
        parts.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
      }
    })
    return [...new Set(parts)]
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !groqClient.current) return

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const systemPrompt =
        userRole === 'mechanic' ? MECHANIC_SYSTEM_PROMPT : CUSTOMER_SERVICE_PROMPT

      const response = await groqClient.current.chat.completions.create({
        model: 'mixtral-8x7b-32768', // Fallback model
        messages: [
          {
            role: 'system' as const,
            content: systemPrompt,
          },
          ...messages.map((msg) => {
            const role: 'user' | 'assistant' = msg.sender === 'user' ? 'user' : 'assistant'
            return {
              role,
              content: msg.content,
            }
          }),
          {
            role: 'user' as const,
            content: input,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      })

      const botResponseContent = response.choices[0]?.message?.content || 'Unable to generate response'
      const suggestedParts = extractPartsFromResponse(botResponseContent)

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: botResponseContent,
        sender: 'bot',
        timestamp: new Date(),
        suggestedParts: suggestedParts.length > 0 ? suggestedParts : undefined,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again or contact support.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition z-40"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <MessageCircle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 w-full max-w-md bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden z-40"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <h3 className="font-bold">{t('chat.title')}</h3>
              <p className="text-sm text-blue-100">
                {userRole === 'mechanic' ? 'Diagnostic Assistant' : 'Customer Support'}
              </p>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-800">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {userRole === 'mechanic'
                      ? 'Describe vehicle symptoms for diagnosis'
                      : 'Ask me about services, pricing, or schedule'}
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.suggestedParts && message.suggestedParts.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-600">
                        <p className="text-xs font-semibold mb-1">Suggested Parts:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.suggestedParts.map((part, i) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-600 px-2 py-1 rounded"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-slate-400"
                >
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4 bg-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white p-2 rounded transition"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default EnhancedChatbotWidget
