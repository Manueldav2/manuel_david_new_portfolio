from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai
import logging
from functools import wraps
import time
import traceback
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Define allowed origins - Allow all origins
ALLOWED_ORIGINS = "*"

# Use only flask-cors for CORS handling
CORS(app,
     origins=ALLOWED_ORIGINS,
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Accept"],
     max_age=3600)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    logger.error("OpenAI API key is not set in environment variables")

# Manuel David's Knowledge Base
MANUEL_KNOWLEDGE = {
    "personal_info": {
        "name": "Manuel David",
        "title": "Software Developer & AI Engineer",
        "experience": "2+ years",
        "location": "Atlanta, GA",
        "email": "manueldavid500@gmail.com",
        "phone": "(479) 250-8678",
        "website": "nouvo.dev",
        "company": "Nouvo.dev (Founder)"
    },
    "summary": {
        "overview": "Results-driven Software Developer & AI Engineer with 2+ years of experience architecting and deploying high-performance, full-stack applications and AI-driven web solutions. Proven ability to lead technical initiatives and deliver measurable business outcomes.",
        "specialization": "Specialized in React, Python, and AI APIs including OpenAI and Eleven Labs to automate workflows, power intelligent chatbots, and scale SaaS platforms.",
        "expertise": "Demonstrated expertise in delivering clean, maintainable code and innovative client-facing solutions that drive user engagement and business growth.",
        "goal": "Seeking senior software engineering roles that leverage AI and full-stack development expertise to drive organizational transformation and technological innovation."
    },
    "projects": {
        "resume_site_ai": {
            "name": "Resume Site AI",
            "description": "An intelligent portfolio site featuring a smart Q&A agent that dynamically answers questions about experience using NLP and contextual matching from resume content.",
            "technologies": ["React", "OpenAI API", "Python", "Natural Language Processing", "Firebase"],
            "status": "Live",
            "features": [
                "Natural language Q&A assistant",
                "Personalized content responses", 
                "Dynamic resume parsing and matching",
                "Clean, mobile-friendly UI"
            ],
            "challenges_solved": [
                "Interpreting vague questions - solved with fallback prompts and intent clarification",
                "Structuring resume data for NLP - created tagging system for roles, skills, and achievements"
            ]
        },
        "cold_email_saas": {
            "name": "Cold Email SaaS",
            "description": "A platform that automates cold email campaigns by combining OpenAI-generated copy with BillionMail's SMTP/domain management system for seamless outreach.",
            "technologies": ["Node.js", "OpenAI", "BillionMail", "React", "Firebase"],
            "status": "Live",
            "features": [
                "AI-written cold email sequences",
                "Automated inbox/domain warm-up",
                "Campaign scheduling and analytics",
                "Lead segmentation and filters"
            ],
            "challenges_solved": [
                "Deliverability and compliance - used BillionMail's warm-up and rotation tools",
                "Dynamic message personalization - created input templates and personas for scalable customization"
            ]
        },
        "therapist_ai": {
            "name": "Therapist AI",
            "description": "A voice-based AI mental health assistant that engages in empathetic, therapeutic conversations, using natural dialogue and emotional nuance.",
            "technologies": ["Python", "OpenAI API", "Eleven Labs", "Firebase"],
            "status": "Prototype",
            "features": [
                "Conversational voice interaction",
                "Topic memory across sessions",
                "Emotion-aware response tuning",
                "Safe-mode for mental health conversations"
            ],
            "challenges_solved": [
                "Ensuring ethical responses - embedded OpenAI's moderation API + post-processing filters",
                "Natural voice cadence - preprocessed responses with timing metadata"
            ]
        },
        "nouvo_platform": {
            "name": "Nouvo.dev Platform",
            "description": "An all-in-one AI agency platform that automates service onboarding, client engagement, and task delivery through chatbot and workflow logic.",
            "technologies": ["React", "OpenAI + External APIs", "Firebase", "Zoho", "Calendly", "Slack API", "Heroku"],
            "status": "Live",
            "features": [
                "Dynamic onboarding flows",
                "Embedded service catalog",
                "Custom AI chatbot assistant",
                "Third-party integrations (Calendly, Zoho, Slack)"
            ],
            "challenges_solved": [
                "Automating diverse services - used schema-driven onboarding logic",
                "Client communications sync - integrated Slack bot alerts and Zoho inbox routing"
            ]
        },
        "popup_drink_website": {
            "name": "Business Website (Pop Up)",
            "description": "An interactive beverage brand site that uses AI to recommend drinks based on user taste, vibe, or event — combining e-commerce with AI-powered engagement.",
            "technologies": ["React", "OpenAI", "Firebase", "Custom CSS Animations"],
            "status": "Live",
            "features": [
                "AI drink recommendation tool",
                "Taste quiz with GPT integration",
                "Real-time product filters",
                "Clean e-commerce flow"
            ],
            "challenges_solved": [
                "Mapping AI suggestions to real products - built matching layer using categories and tags",
                "Optimizing performance on mobile - lazy-loaded assets and used Lottie for lightweight animations"
            ]
        },
        "business_websites": {
            "name": "Business Websites Portfolio",
            "description": "A growing collection of modern, mobile-first websites for brands in fashion, tech, and services — customized for performance, design, and interactivity.",
            "technologies": ["React", "Webflow", "Firebase", "TailwindCSS", "Stripe"],
            "status": "Live",
            "features": [
                "Unique client branding",
                "Responsive design and UX flows",
                "Integrated e-commerce features",
                "SEO and performance optimized"
            ],
            "challenges_solved": [
                "Custom designs at scale - created reusable design system with components",
                "Client non-technical handoff - built admin panels and site documentation"
            ]
        }
    },
    "skills": {
        "frontend": ["React", "Next.js", "TypeScript", "JavaScript", "TailwindCSS", "HTML5", "CSS3"],
        "backend": ["Python", "Node.js", "Flask", "Express.js", "Firebase Functions"],
        "ai_ml": ["OpenAI API", "Eleven Labs", "Natural Language Processing", "AI Integration", "Prompt Engineering"],
        "databases": ["Firebase", "MongoDB", "PostgreSQL", "Firestore"],
        "tools": ["Git", "GitHub", "Heroku", "Vercel", "Webflow", "Figma"],
        "other": ["RESTful APIs", "Responsive Design", "SEO Optimization", "Performance Optimization"]
    },
    "metrics": {
        "years_experience": "2+",
        "websites_delivered": "12+", 
        "ai_projects": "10+",
        "companies_founded": "1",
        "client_satisfaction": "93%"
    }
}

def create_system_prompt():
    return f"""You are an AI assistant representing Manuel David, a Software Developer & AI Engineer. 

Your knowledge about Manuel includes:

PERSONAL INFO:
- Name: {MANUEL_KNOWLEDGE['personal_info']['name']}
- Title: {MANUEL_KNOWLEDGE['personal_info']['title']}
- Experience: {MANUEL_KNOWLEDGE['personal_info']['experience']}
- Location: {MANUEL_KNOWLEDGE['personal_info']['location']}
- Email: {MANUEL_KNOWLEDGE['personal_info']['email']}
- Phone: {MANUEL_KNOWLEDGE['personal_info']['phone']}
- Website: {MANUEL_KNOWLEDGE['personal_info']['website']}
- Company: {MANUEL_KNOWLEDGE['personal_info']['company']}

PROFESSIONAL SUMMARY:
{MANUEL_KNOWLEDGE['summary']['overview']} {MANUEL_KNOWLEDGE['summary']['specialization']} {MANUEL_KNOWLEDGE['summary']['expertise']} {MANUEL_KNOWLEDGE['summary']['goal']}

PROJECTS:
{json.dumps(MANUEL_KNOWLEDGE['projects'], indent=2)}

SKILLS:
{json.dumps(MANUEL_KNOWLEDGE['skills'], indent=2)}

METRICS:
{json.dumps(MANUEL_KNOWLEDGE['metrics'], indent=2)}

INSTRUCTIONS:
1. Answer questions about Manuel David based ONLY on the knowledge provided above
2. Be conversational, professional, and enthusiastic about Manuel's work
3. If asked about something not in your knowledge base, respond with: "I'm sorry, I don't have that specific information about Manuel in my knowledge base. You can contact him directly at manueldavid500@gmail.com for more details."
4. When discussing projects, be specific about technologies, features, and challenges solved
5. Always represent Manuel in a professional and positive manner
6. If asked about contact information, provide his email and phone number
7. Keep responses concise but informative (2-3 paragraphs max unless specifically asked for more detail)
"""

def retry_on_failure(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(delay)
            logger.error(f"All {max_retries} attempts failed. Last error: {str(last_error)}")
            raise last_error
        return wrapper
    return decorator

def validate_input(data):
    try:
        if not isinstance(data, dict):
            logger.warning(f"Invalid request format: {type(data)}")
            return False, "Invalid request format"
        
        user_input = data.get('message') or data.get('userInput')
        if not user_input:
            logger.warning("Missing message in request")
            return False, "Message is required"
        
        if not isinstance(user_input, str):
            logger.warning(f"Invalid message type: {type(user_input)}")
            return False, "Message must be a string"
        
        stripped_input = user_input.strip()
        if len(stripped_input) < 1:
            logger.warning("Empty message")
            return False, "Please provide a message"
        
        return True, stripped_input
    except Exception as e:
        logger.error(f"Error in validate_input: {str(e)}")
        return False, "Error validating input"

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'status': 'Manuel David Portfolio Chatbot API',
        'version': '1.0.0',
        'description': 'AI assistant with knowledge about Manuel David\'s portfolio and experience'
    }), 200

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.status_code = 200
        return response

    try:
        logger.info("Received chat request")
        data = request.get_json()
        logger.debug(f"Request data: {data}")
        
        is_valid, result = validate_input(data)
        if not is_valid:
            logger.warning(f"Invalid input: {result}")
            return jsonify({'error': result}), 400

        user_message = result
        logger.info(f"Processing message: {user_message[:50]}...")

        @retry_on_failure(max_retries=3, delay=1)
        def get_openai_response():
            try:
                logger.info("Attempting OpenAI API call")
                if not openai.api_key:
                    logger.error("OpenAI API key is not configured")
                    raise Exception("OpenAI API key is not configured")
                
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {
                            "role": "system",
                            "content": create_system_prompt()
                        },
                        {
                            "role": "user",
                            "content": user_message
                        }
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                logger.info("OpenAI API call successful")
                return response
            except openai.error.AuthenticationError as e:
                logger.error(f"OpenAI Authentication Error: {str(e)}")
                raise Exception("OpenAI API key is invalid or expired")
            except openai.error.RateLimitError as e:
                logger.error(f"OpenAI Rate Limit Error: {str(e)}")
                raise Exception("OpenAI API rate limit exceeded")
            except openai.error.APIError as e:
                logger.error(f"OpenAI API Error: {str(e)}")
                raise Exception("OpenAI API is currently experiencing issues")
            except Exception as e:
                logger.error(f"OpenAI API call failed: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise

        try:
            response = get_openai_response()
            logger.info("Successfully received OpenAI response")
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            error_message = str(e)
            if "API key" in error_message:
                return jsonify({
                    'error': 'Service configuration error. Please contact support.',
                    'details': 'API key issue' if app.debug else None
                }), 503
            elif "rate limit" in error_message.lower():
                return jsonify({
                    'error': 'Service is busy. Please try again in a few minutes.',
                    'details': 'Rate limit exceeded' if app.debug else None
                }), 503
            else:
                return jsonify({
                    'error': 'AI service is temporarily unavailable. Please try again in a few minutes.',
                    'details': error_message if app.debug else None
                }), 503

        if not response.choices or not response.choices[0].message.content:
            logger.error("Empty response from OpenAI API")
            return jsonify({
                'error': 'Unable to generate response. Please try again.',
                'details': 'Empty response from AI service'
            }), 500

        ai_response = response.choices[0].message.content
        logger.info("Successfully generated response")
        return jsonify({
            'response': ai_response,
            'status': 'success'
        })

    except Exception as e:
        logger.error(f"Unexpected error in chat route: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': 'An unexpected error occurred. Please try again later.',
            'details': str(e) if app.debug else None
        }), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'timestamp': time.time(),
        'service': 'Manuel David Portfolio Chatbot'
    }), 200

# Knowledge endpoint for testing
@app.route('/api/knowledge', methods=['GET'])
def get_knowledge():
    return jsonify({
        'status': 'success',
        'data': {
            'name': MANUEL_KNOWLEDGE['personal_info']['name'],
            'title': MANUEL_KNOWLEDGE['personal_info']['title'],
            'projects_count': len(MANUEL_KNOWLEDGE['projects']),
            'skills_categories': list(MANUEL_KNOWLEDGE['skills'].keys()),
            'contact': {
                'email': MANUEL_KNOWLEDGE['personal_info']['email'],
                'website': MANUEL_KNOWLEDGE['personal_info']['website']
            }
        }
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000))) 