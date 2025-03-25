export interface AIService {
    id: string;
    name: string;
    description: {
      es: string;
      en: string;
    };
    price: string;
    priceDetails: string;
    categories: string[];
    type: "api" | "individual" | "code-editor";
    features: {
      es: string[];
      en: string[];
    };
    rating: number;
    hasFree: boolean;
    hasAPI: boolean;
    commercialUse: boolean;
    customModels: boolean;
    isNew: boolean;
    releaseYear: number;
  }

  // export async function getAIServices(type?: string): Promise<AIService[]> {
  //   if (type === 'api') {
  //     const { apiServices } = await import('./data/api-services');
  //     return apiServices;
  //   } else if (type === 'individual') {
  //     const { individualServices } = await import('./data/individual-services');
  //     return individualServices;
  //   } else if (type === 'code-editor') {
  //     const { codeEditorServices } = await import('./data/code-editor-services');
  //     return codeEditorServices;
  //   }
  //   const [
  //     { apiServices },
  //     { individualServices },
  //     { codeEditorServices }
  //   ] = await Promise.all([
  //     import('./data/api-services'),
  //     import('./data/individual-services'),
  //     import('./data/code-editor-services')
  //   ]);
    
  //   return [...apiServices, ...individualServices, ...codeEditorServices];
  // }

  export async function getAIServices(type?: string): Promise<AIService[]> {
    // Filtrar servicios según el tipo solicitado
    if (type) {
      return aiServices.filter(service => service.type === type);
    }
    
    // Devolver todos los servicios si no se especifica un tipo
    return aiServices;
  }
  
  export const aiServices: AIService[] = [
    // API Services
    {
      id: "openai-api",
      name: "OpenAI API",
      description: {
        es: "Accede a GPT-4, GPT-3.5 y otros modelos con una simple llamada API",
        en: "Access GPT-4, GPT-3.5, and other models with a simple API call"
      },
      price: "$0.01 - $0.12",
      priceDetails: "Per 1K tokens, varies by model",
      categories: ["Text", "Chat", "Image Generation"],
      type: "api",
      features: {
        es: [
          "Acceso a GPT-4, GPT-3.5 y otros modelos",
          "Precios de pago por uso",
          "Capacidades de fine-tuning",
          "Altos límites de tasa disponibles",
          "Documentación completa",
        ],
        en: [
          "Access to GPT-4, GPT-3.5, and other models",
          "Pay-as-you-go pricing",
          "Fine-tuning capabilities",
          "High rate limits available",
          "Comprehensive documentation",
        ]
      },
      rating: 4.8,
      hasFree: true,
      hasAPI: true,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2022,
    },
    {
      id: "stability-api",
      name: "Stability AI API",
      description: {
        es: "Genera imágenes de alta calidad con modelos de difusión de última generación",
        en: "Generate high-quality images with state-of-the-art diffusion models"
      },
      price: "$0.002 - $0.02",
      priceDetails: "Per image, based on resolution",
      categories: ["Image Generation"],
      type: "api",
      features: {
        es: [
          "Generación de imágenes de alta resolución",
          "Múltiples opciones de estilo",
          "Tiempos de generación rápidos",
          "Derechos de uso comercial",
          "Parámetros personalizables",
        ],
        en: [
          "High-resolution image generation",
          "Multiple style options",
          "Fast generation times",
          "Commercial usage rights",
          "Customizable parameters",
        ]
      },
      rating: 4.5,
      hasFree: false,
      hasAPI: true,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2022,
    },
    {
      id: "anthropic-api",
      name: "Anthropic Claude API",
      description: {
        es: "Accede a los modelos Claude para la comprensión y generación de lenguaje natural",
        en: "Access Claude models for natural language understanding and generation"
      },
      price: "$0.008 - $0.024",
      priceDetails: "Per 1K tokens, varies by model",
      categories: ["Text", "Chat"],
      type: "api",
      features: {
        es: [
          "Acceso a los modelos Claude",
          "Ventanas de contexto largas",
          "Reducción de alucinaciones",
          "Precios transparentes",
          "Opciones empresariales disponibles",
        ],
        en: [
          "Access to Claude models",
          "Long context windows",
          "Reduced hallucinations",
          "Transparent pricing",
          "Enterprise options available",
        ]
      },
      rating: 4.6,
      hasFree: false,
      hasAPI: true,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2023,
    },
    {
      id: "elevenlabs-api",
      name: "ElevenLabs API",
      description: {
        es: "Genera texto a voz realista y emocional en múltiples idiomas",
        en: "Generate realistic, emotional text-to-speech in multiple languages"
      },
      price: "$0.0030 - $0.0060",
      priceDetails: "Per 1K characters",
      categories: ["Audio", "Voice"],
      type: "api",
      features: {
        es: [
          "Voces ultra-realistas",
          "Capacidades de clonación de voz",
          "Soporte multilingüe",
          "Control de emoción y énfasis",
          "Transmisión en tiempo real",
        ],
        en: [
          "Ultra-realistic voices",
          "Voice cloning capabilities",
          "Multilingual support",
          "Emotion and emphasis control",
          "Real-time streaming",
        ]
      },
      rating: 4.7,
      hasFree: true,
      hasAPI: true,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2022,
    },
    {
      id: "replicate-api",
      name: "Replicate API",
      description: {
        es: "Ejecuta modelos de código abierto con una simple API",
        en: "Run open-source models with a simple API"
      },
      price: "$0.0001 - $0.10",
      priceDetails: "Per minute, varies by model",
      categories: ["Text", "Image Generation", "Video", "Audio"],
      type: "api",
      features: {
        es: [
          "Acceso a miles de modelos de código abierto",
          "Interfaz API simple",
          "Precios de pago por uso",
          "Alojamiento de modelos personalizados",
          "Soporte para webhooks",
        ],
        en: [
          "Access to thousands of open-source models",
          "Simple API interface",
          "Pay-as-you-go pricing",
          "Custom model hosting",
          "Webhook support",
        ]
      },
      rating: 4.4,
      hasFree: false,
      hasAPI: true,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2021,
    },
    {
      id: "runpod-api",
      name: "RunPod API",
      description: {
        es: "API acelerada por GPU para inferencia y entrenamiento de modelos de IA",
        en: "GPU-accelerated API for AI model inference and training"
      },
      price: "$0.0009 - $0.0059",
      priceDetails: "Per second, varies by GPU",
      categories: ["Text", "Image Generation", "Video"],
      type: "api",
      features: {
        es: [
          "Cómputo GPU sin servidor",
          "Inferencia de baja latencia",
          "Soporte para contenedores personalizados",
          "Auto-escalado",
          "Alta disponibilidad",
        ],
        en: [
          "Serverless GPU compute",
          "Low-latency inference",
          "Custom container support",
          "Auto-scaling",
          "High availability",
        ]
      },
      rating: 4.3,
      hasFree: false,
      hasAPI: true,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2020,
    },
  
    // Individual Services
    {
      id: "chatgpt-plus",
      name: "ChatGPT Plus",
      description: {
        es: "Acceso premium a ChatGPT de OpenAI con capacidades GPT-4o",
        en: "Premium access to OpenAI's ChatGPT with GPT-4o capabilities"
      },
      price: "$20",
      priceDetails: "Per month",
      categories: ["Text", "Chat", "Image Generation"],
      type: "individual",
      features: {
        es: [
          "Acceso a GPT-4o",
          "Acceso prioritario durante horas pico",
          "Tiempos de respuesta más rápidos",
          "Acceso anticipado a nuevas funciones",
          "Generación de imágenes DALL-E",
        ],
        en: [
          "Access to GPT-4o",
          "Priority access during peak times",
          "Faster response times",
          "Early access to new features",
          "DALL-E image generation",
        ]
      },
      rating: 4.9,
      hasFree: false,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: true,
      releaseYear: 2024,
    },
    {
      id: "midjourney",
      name: "Midjourney",
      description: {
        es: "Generación de imágenes AI con calidad artística impresionante",
        en: "AI image generation with stunning artistic quality"
      },
      price: "$10 - $60",
      priceDetails: "Per month, based on plan",
      categories: ["Image Generation"],
      type: "individual",
      features: {
        es: [
          "Generación de imágenes de alta calidad",
          "Interfaz basada en Discord",
          "Tiempos de generación rápidos",
          "Derechos de uso comercial (en niveles más altos)",
          "Soporte comunitario",
        ],
        en: [
          "High-quality image generation",
          "Discord-based interface",
          "Fast generation times",
          "Commercial usage rights (on higher tiers)",
          "Community support",
        ]
      },
      rating: 4.7,
      hasFree: false,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2021,
    },
    {
      id: "claude-pro",
      name: "Claude Pro",
      description: {
        es: "Acceso premium al asistente AI Claude de Anthropic",
        en: "Premium access to Anthropic's Claude AI assistant"
      },
      price: "$20",
      priceDetails: "Per month",
      categories: ["Text", "Chat"],
      type: "individual",
      features: {
        es: [
          "5 veces más uso que el nivel gratuito",
          "Acceso prioritario durante horas pico",
          "Acceso anticipado a nuevas funciones",
          "Ventanas de contexto más largas",
          "Capacidades de carga de archivos",
        ],
        en: [
          "5x more usage than free tier",
          "Priority access during peak times",
          "Early access to new features",
          "Longer context windows",
          "File upload capabilities",
        ]
      },
      rating: 4.6,
      hasFree: false,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2023,
    },
    {
      id: "elevenlabs-premium",
      name: "ElevenLabs Premium",
      description: {
        es: "Texto a voz premium con capacidades de clonación de voz",
        en: "Premium text-to-speech with voice cloning capabilities"
      },
      price: "$5 - $330",
      priceDetails: "Per month, based on plan",
      categories: ["Audio", "Voice"],
      type: "individual",
      features: {
        es: [
          "Límites de caracteres más altos",
          "Capacidades de clonación de voz",
          "Voces profesionales",
          "Conversión prioritaria",
          "Derechos de uso comercial",
        ],
        en: [
          "Higher character limits",
          "Voice cloning capabilities",
          "Professional voices",
          "Priority conversion",
          "Commercial usage rights",
        ]
      },
      rating: 4.5,
      hasFree: false,
      hasAPI: false,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2022,
    },
    {
      id: "perplexity-pro",
      name: "Perplexity Pro",
      description: {
        es: "Motor de búsqueda potenciado por IA con funciones premium",
        en: "AI-powered search engine with premium features"
      },
      price: "$20",
      priceDetails: "Per month",
      categories: ["Text", "Search"],
      type: "individual",
      features: {
        es: [
          "Búsquedas AI ilimitadas",
          "Respuestas potenciadas por GPT-4",
          "Funciones de copiloto",
          "Límites diarios más altos",
          "Acceso anticipado a nuevas funciones",
        ],
        en: [
          "Unlimited AI searches",
          "GPT-4 powered responses",
          "Copilot features",
          "Higher daily limits",
          "Early access to new features",
        ]
      },
      rating: 4.4,
      hasFree: true,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2022,
    },
    {
      id: "runway-gen2",
      name: "Runway Gen-2",
      description: {
        es: "Plataforma de generación y edición de videos AI",
        en: "AI video generation and editing platform"
      },
      price: "$15 - $95",
      priceDetails: "Per month, based on plan",
      categories: ["Video", "Image Generation"],
      type: "individual",
      features: {
        es: [
          "Generación de video a partir de texto",
          "Generación de video a partir de imágenes",
          "Herramientas de edición de video",
          "Almacenamiento en la nube",
          "Derechos de uso comercial (en niveles más altos)",
        ],
        en: [
          "Text-to-video generation",
          "Image-to-video generation",
          "Video editing tools",
          "Cloud storage",
          "Commercial usage rights (on higher tiers)",
        ]
      },
      rating: 4.3,
      hasFree: true,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2023,
    },
  
    // Code Editor Services
    {
      id: "github-copilot",
      name: "GitHub Copilot",
      description: {
        es: "Asistente de programación AI que te ayuda a escribir código más rápido",
        en: "AI pair programmer that helps you write code faster"
      },
      price: "$10 - $19",
      priceDetails: "Per month, individual vs business",
      categories: ["Code Completion", "Code Generation"],
      type: "code-editor",
      features: {
        es: [
          "Sugerencias de código en tiempo real",
          "Funciona en múltiples IDEs",
          "Soporte para múltiples lenguajes de programación",
          "Comprensión contextual",
          "Nivel empresarial con controles de administración",
        ],
        en: [
          "Real-time code suggestions",
          "Works in multiple IDEs",
          "Supports multiple programming languages",
          "Contextual understanding",
          "Business tier with admin controls",
        ]
      },
      rating: 4.8,
      hasFree: false,
      hasAPI: false,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2021,
    },
    {
      id: "codeium",
      name: "Codeium",
      description: {
        es: "Asistente de codificación AI con nivel gratuito para individuos",
        en: "AI coding assistant with free tier for individuals"
      },
      price: "Free - $12",
      priceDetails: "Per month, free for individuals",
      categories: ["Code Completion", "Code Generation"],
      type: "code-editor",
      features: {
        es: [
          "Gratis para desarrolladores individuales",
          "Funciona en 20+ IDEs",
          "Soporte para 70+ lenguajes de programación",
          "Interfaz de chat para explicaciones de código",
          "Funciones empresariales disponibles",
        ],
        en: [
          "Free for individual developers",
          "Works in 20+ IDEs",
          "Supports 70+ programming languages",
          "Chat interface for code explanations",
          "Enterprise features available",
        ]
      },
      rating: 4.6,
      hasFree: true,
      hasAPI: false,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2022,
    },
    {
      id: "tabnine",
      name: "Tabnine",
      description: {
        es: "Asistente de autocompletado de código AI potenciado por múltiples modelos",
        en: "AI code completion assistant powered by multiple models"
      },
      price: "Free - $12",
      priceDetails: "Per month, based on plan",
      categories: ["Code Completion"],
      type: "code-editor",
      features: {
        es: [
          "Opción de procesamiento AI local",
          "Funciona en múltiples IDEs",
          "Funciones de colaboración en equipo",
          "Opción de auto-hospedaje",
          "Funciones de seguridad empresarial",
        ],
        en: [
          "Local AI processing option",
          "Works in multiple IDEs",
          "Team collaboration features",
          "Self-hosted option",
          "Enterprise security features",
        ]
      },
      rating: 4.5,
      hasFree: true,
      hasAPI: false,
      commercialUse: true,
      customModels: true,
      isNew: false,
      releaseYear: 2018,
    },
    {
      id: "cursor",
      name: "Cursor",
      description: {
        es: "Editor de código AI-first basado en VSCode",
        en: "AI-first code editor built on VSCode"
      },
      price: "Free - $20",
      priceDetails: "Per month, pro features",
      categories: ["Code Completion", "Code Generation", "Code Editing"],
      type: "code-editor",
      features: {
        es: [
          "Chat AI integrado",
          "Comandos de edición de código",
          "Comprensión de la base de código",
          "Basado en VSCode",
          "Funciones potenciadas por GPT-4",
        ],
        en: [
          "Built-in AI chat",
          "Code editing commands",
          "Codebase understanding",
          "Based on VSCode",
          "GPT-4 powered features",
        ]
      },
      rating: 4.7,
      hasFree: true,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2020,
    },
    {
      id: "replit-ghostwriter",
      name: "Replit Ghostwriter",
      description: {
        es: "Asistente de codificación AI integrado con Replit",
        en: "AI coding assistant integrated with Replit"
      },
      price: "$10 - $20",
      priceDetails: "Per month, based on plan",
      categories: ["Code Completion", "Code Generation", "Code Editing"],
      type: "code-editor",
      features: {
        es: [
          "Integrado con Replit",
          "Autocompletado de código",
          "Interfaz de chat",
          "Asistencia de depuración",
          "Capacidades de explicación",
        ],
        en: [
          "Integrated with Replit",
          "Code completion",
          "Chat interface",
          "Debugging assistance",
          "Explanation capabilities",
        ]
      },
      rating: 4.2,
      hasFree: false,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2021,
    },
    {
      id: "amazon-codewhisperer",
      name: "Amazon CodeWhisperer",
      description: {
        es: "Compañero de codificación AI de AWS",
        en: "AI coding companion from AWS"
      },
      price: "Free - $19",
      priceDetails: "Per month, professional tier",
      categories: ["Code Completion", "Code Generation"],
      type: "code-editor",
      features: {
        es: [
          "Nivel gratuito disponible",
          "Escaneo de seguridad",
          "Funciona con múltiples IDEs",
          "Seguimiento de referencias",
          "Funciones empresariales",
        ],
        en: [
          "Free tier available",
          "Security scanning",
          "Works with multiple IDEs",
          "Reference tracking",
          "Enterprise features",
        ]
      },
      rating: 4.1,
      hasFree: true,
      hasAPI: false,
      commercialUse: true,
      customModels: false,
      isNew: false,
      releaseYear: 2022,
    },
  ];
  
  
  