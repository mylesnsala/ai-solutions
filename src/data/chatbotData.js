export const chatbotData = {
  welcome: [
    'Hello! How can I help you today?',
    'Hi there! What can I do for you?',
    'Welcome! How may I assist you?',
  ],
  options: {
    main: [
      { text: 'About Us', category: 'about' },
      { text: 'Our Services', category: 'services' },
      { text: 'Contact Information', category: 'contact' },
      { text: 'Help & Support', category: 'help' },
    ],
    about: [
      { text: 'Company History', category: 'history' },
      { text: 'Our Team', category: 'team' },
      { text: 'Mission & Vision', category: 'mission' },
      { text: 'Back to Main Menu', category: 'main' },
    ],
    services: [
      { text: 'AI Solutions', category: 'ai' },
      { text: 'Consulting', category: 'consulting' },
      { text: 'Training', category: 'training' },
      { text: 'Back to Main Menu', category: 'main' },
    ],
    contact: [
      { text: 'Email Us', category: 'email' },
      { text: 'Phone Support', category: 'phone' },
      { text: 'Office Location', category: 'location' },
      { text: 'Back to Main Menu', category: 'main' },
    ],
    help: [
      { text: 'FAQs', category: 'faq' },
      { text: 'Documentation', category: 'docs' },
      { text: 'Report an Issue', category: 'report' },
      { text: 'Back to Main Menu', category: 'main' },
    ],
  },
  responses: {
    greeting: [
      'Hello! How can I help you today?',
      'Hi there! Nice to meet you!',
      'Hey! How can I assist you?',
    ],
    help: [
      'I can help you with general information about our services.',
      'Feel free to ask me any questions about our platform.',
      "I'm here to help! What would you like to know?",
    ],
    goodbye: [
      'Goodbye! Have a great day!',
      'See you later! Take care!',
      'Bye! Come back if you need anything!',
    ],
    default: [
      "I'm not sure I understand. Could you rephrase that?",
      "I'm still learning. Could you try asking that differently?",
      "I don't have an answer for that yet. Is there something else I can help with?",
    ],
  },
  suggestions: [
    'How can I help you?',
    'What would you like to know?',
    'Need assistance? Just ask!',
  ],
};
