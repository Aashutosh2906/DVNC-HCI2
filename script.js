// DVNC.AI - Leonardo's Intelligence System with Backend Integration

class DVNCAgent {
    constructor() {
        this.state = {
            conversationActive: false,
            showThinkingProcess: true,
            memoryItems: [],
            contextItems: [],
            apiUrl: window.location.hostname === 'localhost' 
                ? 'http://localhost:5000/api' 
                : '/api'  // Vercel will handle the API routing
        };
        
        this.elements = {};
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.attachEventListeners();
            this.initializeTextareaResize();
            this.checkBackendHealth();
        });
    }
    
    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.state.apiUrl}/health`);
            const data = await response.json();
            console.log('Backend status:', data.status);
        } catch (error) {
            console.warn('Backend not available, using frontend-only mode');
        }
    }
    
    initializeElements() {
        this.elements = {
            welcomeSection: document.getElementById('welcomeSection'),
            conversationArea: document.getElementById('conversationArea'),
            messageThread: document.getElementById('messageThread'),
            dvncInput: document.getElementById('dvncInput'),
            sendBtn: document.getElementById('sendBtn'),
            newChatBtn: document.getElementById('newChatBtn'),
            thinkingProcess: document.getElementById('thinkingProcess'),
            thinkingSteps: document.getElementById('thinkingSteps'),
            sourcesPanel: document.getElementById('sourcesPanel'),
            sourcesCount: document.getElementById('sourcesCount')
        };
    }
    
    attachEventListeners() {
        // Send message
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send
        this.elements.dvncInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Prompt cards
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                this.handlePromptCard(prompt);
            });
        });
        
        // New chat button
        this.elements.newChatBtn?.addEventListener('click', () => {
            this.resetToHome();
        });
    }
    
    initializeTextareaResize() {
        const textarea = this.elements.dvncInput;
        if (!textarea) return;
        
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
    }
    
    async handlePromptCard(prompt) {
        this.startConversation();
        this.addMessage(prompt, 'user');
        await this.processWithBackend(prompt);
    }
    
    startConversation() {
        if (!this.state.conversationActive) {
            this.state.conversationActive = true;
            this.elements.welcomeSection.style.display = 'none';
            this.elements.conversationArea.style.display = 'flex';
            this.elements.newChatBtn.style.display = 'flex';
            this.elements.sourcesPanel.style.display = 'flex';
            this.updateSourcesCount();
        }
    }
    
    async sendMessage() {
        const message = this.elements.dvncInput.value.trim();
        if (!message) return;
        
        this.startConversation();
        this.addMessage(message, 'user');
        this.elements.dvncInput.value = '';
        this.elements.dvncInput.style.height = 'auto';
        
        await this.processWithBackend(message);
    }
    
    async processWithBackend(prompt) {
        // Show thinking process
        if (this.state.showThinkingProcess) {
            await this.showThinkingSteps();
        }
        
        try {
            // Call backend API
            const response = await fetch(`${this.state.apiUrl}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Format and display the response
                this.displayDesignResponse(data.design);
            } else {
                // Fallback to frontend-only response
                this.displayFallbackResponse(prompt);
            }
        } catch (error) {
            console.error('Backend error:', error);
            // Fallback to frontend-only response
            this.displayFallbackResponse(prompt);
        }
        
        // Hide thinking process
        if (this.elements.thinkingProcess) {
            this.elements.thinkingProcess.style.display = 'none';
        }
    }
    
    displayDesignResponse(design) {
        // Build comprehensive response from backend data
        let response = `I've synthesized a design for your ${design.product_type}: **${design.name}**\n\n`;
        response += `**Target Market:** ${design.target_market}\n`;
        response += `**Innovation Score:** ${design.innovation_score}/10 | `;
        response += `**Feasibility:** ${design.feasibility_score}/10 | `;
        response += `**Viability:** ${design.viability_score}\n\n`;
        response += `**Key Features:**\n`;
        
        design.features.forEach((feature, index) => {
            response += `${index + 1}. ${feature.description}\n`;
            response += `   *Stage:* ${feature.development_stage} - ${feature.engineering_notes}\n`;
            response += `   *Leonardo's Insight:* ${feature.inspiration.split('||')[0]}\n\n`;
        });
        
        response += `This design harmoniously blends ${design.principles.join(', ')} principles, `;
        response += `drawing from Leonardo's methodology to create a truly innovative solution.`;
        
        this.addMessage(response, 'agent', design.codices);
        
        // Update sources count
        this.state.memoryItems.push(`Design: ${design.name}`);
        this.updateSourcesCount();
    }
    
    displayFallbackResponse(prompt) {
        // Use existing frontend logic as fallback
        let responseType = 'general';
        const keywords = {
            hydraulic: ['water', 'pump', 'fluid', 'flow', 'hydraulic'],
            biomechanical: ['exoskeleton', 'joint', 'muscle', 'movement', 'biomechanical'],
            biomedical: ['circulatory', 'heart', 'blood', 'medical', 'wearable']
        };
        
        for (const [type, words] of Object.entries(keywords)) {
            if (words.some(word => prompt.toLowerCase().includes(word))) {
                responseType = type;
                break;
            }
        }
        
        const response = this.getLeonardoResponse(responseType);
        this.addMessage(response, 'agent');
        
        this.state.memoryItems.push(`Analysis at ${new Date().toLocaleTimeString()}`);
        this.updateSourcesCount();
    }
    
    getLeonardoResponse(type) {
        const responses = {
            hydraulic: "Applying Leonardo's observations on fluid dynamics: Water follows the path of least resistance, creating vortices and eddies that can be harnessed. For your portable pump system, consider implementing an Archimedean screw mechanism combined with modern materials. The spiral geometry provides continuous flow with minimal energy input, much like Leonardo's canal lock designs.",
            biomechanical: "Leonardo's anatomical studies reveal that human joints operate through an elegant system of levers and pulleys. For your exoskeleton design, I suggest mimicking the natural antagonistic muscle pairs - particularly the biceps-triceps relationship documented in his Windsor anatomical manuscripts.",
            biomedical: "Leonardo's studies of blood flow in the Codex Leicester demonstrate his understanding of circulatory dynamics centuries before Harvey. For your wearable device, consider his observation that blood flow creates specific pressure patterns at arterial branches.",
            general: "Your inquiry touches on the intersection of multiple disciplines - precisely where Leonardo's genius thrived. He saw no boundaries between art, science, and engineering. Let me analyze your challenge through his methodology."
        };
        return responses[type] || responses.general;
    }
    
    addMessage(text, sender, codices = null) {
        const messageBlock = document.createElement('div');
        messageBlock.className = `message-block ${sender}`;
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'agent') {
            avatar.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2v20M2 12h20"/>
                    <path d="M12 7l5 5-5 5-5-5z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
        } else {
            avatar.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            `;
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        // Parse markdown-like formatting
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        messageText.innerHTML = formattedText;
        
        messageContent.appendChild(messageText);
        
        // Add Leonardo's sources for agent messages
        if (sender === 'agent') {
            const sources = this.createLeonardoSources(codices);
            messageContent.appendChild(sources);
        }
        
        messageWrapper.appendChild(avatar);
        messageWrapper.appendChild(messageContent);
        messageBlock.appendChild(messageWrapper);
        
        this.elements.messageThread.appendChild(messageBlock);
        this.scrollToBottom();
    }
    
    createLeonardoSources(codices = null) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'message-sources';
        
        // Use provided codices or generate random ones
        const sources = codices || [
            { name: 'Codex Atlanticus', icon: '📜' },
            { name: 'Codex Leicester', icon: '📖' },
            { name: 'Windsor Manuscripts', icon: '📚' },
            { name: 'Codex Madrid I', icon: '📝' }
        ].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 2);
        
        sourcesDiv.innerHTML = `
            <div class="source-label">Leonardo's References</div>
            <div class="source-items">
                ${sources.map(source => `
                    <a href="#" class="source-chip" onclick="event.preventDefault()">
                        <span>${source.icon}</span>
                        <span>${source.name}</span>
                    </a>
                `).join('')}
            </div>
        `;
        
        return sourcesDiv;
    }
    
    async showThinkingSteps() {
        this.elements.thinkingProcess.style.display = 'block';
        this.elements.thinkingSteps.innerHTML = '';
        
        const steps = [
            '📖 Consulting Leonardo\'s codices...',
            '🔬 Analyzing through Mechanics & Physics SLM...',
            '🧬 Processing through Anatomy & Biology SLM...',
            '🎨 Evaluating through Optics & Aesthetics SLM...',
            '⚙️ Synthesizing via Da Vinci Abstraction Organ...',
            '💡 Formulating innovative design solution...'
        ];
        
        for (const step of steps) {
            await this.delay(300);
            const stepDiv = document.createElement('div');
            stepDiv.className = 'thinking-step';
            stepDiv.textContent = step;
            this.elements.thinkingSteps.appendChild(stepDiv);
        }
        
        this.scrollToBottom();
    }
    
    updateSourcesCount() {
        const count = this.state.memoryItems.length + 4; // +4 for Leonardo's codices
        this.elements.sourcesCount.textContent = `${count} references active`;
    }
    
    resetToHome() {
        this.state.conversationActive = false;
        this.elements.welcomeSection.style.display = 'flex';
        this.elements.conversationArea.style.display = 'none';
        this.elements.newChatBtn.style.display = 'none';
        this.elements.sourcesPanel.style.display = 'none';
        this.elements.messageThread.innerHTML = '';
        this.elements.dvncInput.value = '';
        this.state.memoryItems = [];
        this.state.contextItems = [];
    }
    
    scrollToBottom() {
        this.elements.messageThread.scrollTop = this.elements.messageThread.scrollHeight;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize DVNC Agent
const dvnc = new DVNCAgent();
