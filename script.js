// DVNC.AI - Leonardo's Intelligence System

class DVNCAgent {
    constructor() {
        this.state = {
            conversationActive: false,
            showThinkingProcess: true,
            memoryItems: [],
            contextItems: []
        };
        
        this.elements = {};
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.neurons = [];
        this.connections = [];
        
        // Leonardo's knowledge domains
        this.leonardoResponses = {
            hydraulic: "Applying Leonardo's observations on fluid dynamics: Water follows the path of least resistance, creating vortices and eddies that can be harnessed. For your portable pump system, consider implementing an Archimedean screw mechanism combined with modern materials. The spiral geometry provides continuous flow with minimal energy input, much like Leonardo's canal lock designs. I've referenced his Codex Atlanticus folios 26v-27r on hydraulic machines. Would you like me to elaborate on the pressure differential calculations or focus on the mechanical design?",
            
            biomechanical: "Leonardo's anatomical studies reveal that human joints operate through an elegant system of levers and pulleys. For your exoskeleton design, I suggest mimicking the natural antagonistic muscle pairs - particularly the biceps-triceps relationship documented in his Windsor anatomical manuscripts. Using tensioned cables running through guides at joint fulcrums can provide both power amplification and natural movement patterns. The key insight from folio 19037r: force multiplication occurs when the artificial 'tendons' attach further from the joint center than natural ones. Shall we explore the load distribution across multiple joints?",
            
            biomedical: "Leonardo's studies of blood flow in the Codex Leicester demonstrate his understanding of circulatory dynamics centuries before Harvey. For your wearable device, consider his observation that blood flow creates specific pressure patterns at arterial branches. Modern piezoelectric sensors placed at these bifurcation points - wrist, carotid, and temporal arteries - can capture rich cardiovascular data. Leonardo's drawings in RL 19073v-19074r show the heart's spiral muscle structure, suggesting rotational flow patterns we can now measure. Would you like specifics on sensor placement or data interpretation algorithms?",
            
            general: "Your inquiry touches on the intersection of multiple disciplines - precisely where Leonardo's genius thrived. He saw no boundaries between art, science, and engineering. Let me analyze your challenge through his methodology: First, careful observation of natural phenomena; Second, mathematical analysis of underlying principles; Third, innovative mechanical solutions; Fourth, aesthetic refinement. Which aspect would you like to explore first? I can reference specific codices and manuscripts relevant to your particular challenge."
        };
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.attachEventListeners();
            this.initializeNeuralNetwork();
            this.animateNeuralNetwork();
            this.initializeTextareaResize();
        });
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
            contextBar: document.getElementById('contextBar'),
            contextItems: document.getElementById('contextItems'),
            sourcesPanel: document.getElementById('sourcesPanel'),
            sourcesCount: document.getElementById('sourcesCount'),
            inputInterface: document.getElementById('inputInterface')
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
    
    initializeNeuralNetwork() {
        this.canvas = document.getElementById('neuralCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Create neural network nodes
        const layers = [3, 5, 4, 3]; // Network structure
        const layerSpacing = this.canvas.width / (layers.length + 1);
        
        layers.forEach((nodeCount, layerIndex) => {
            const x = layerSpacing * (layerIndex + 1);
            const nodeSpacing = this.canvas.height / (nodeCount + 1);
            
            for (let i = 0; i < nodeCount; i++) {
                const y = nodeSpacing * (i + 1);
                this.neurons.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: (Math.random() - 0.5) * 0.2,
                    layer: layerIndex,
                    activation: Math.random(),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        });
        
        // Create connections between layers
        layers.forEach((_, layerIndex) => {
            if (layerIndex < layers.length - 1) {
                const currentLayer = this.neurons.filter(n => n.layer === layerIndex);
                const nextLayer = this.neurons.filter(n => n.layer === layerIndex + 1);
                
                currentLayer.forEach(neuron1 => {
                    nextLayer.forEach(neuron2 => {
                        if (Math.random() > 0.3) { // 70% connection probability
                            this.connections.push({
                                from: neuron1,
                                to: neuron2,
                                strength: Math.random() * 0.5 + 0.2,
                                pulseOffset: Math.random() * Math.PI * 2
                            });
                        }
                    });
                });
            }
        });
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    animateNeuralNetwork() {
        if (!this.ctx || !this.canvas) return;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(248, 249, 250, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update neuron activations
        this.neurons.forEach(neuron => {
            neuron.pulsePhase += 0.02;
            neuron.activation = Math.sin(neuron.pulsePhase) * 0.5 + 0.5;
            
            // Slight movement
            neuron.x += neuron.vx;
            neuron.y += neuron.vy;
            
            // Boundary check with elastic collision
            if (neuron.x < 50 || neuron.x > this.canvas.width - 50) neuron.vx *= -1;
            if (neuron.y < 50 || neuron.y > this.canvas.height - 50) neuron.vy *= -1;
            
            // Damping
            neuron.vx *= 0.999;
            neuron.vy *= 0.999;
        });
        
        // Draw connections with pulsing effect
        this.connections.forEach(conn => {
            const pulse = Math.sin(Date.now() * 0.001 + conn.pulseOffset) * 0.5 + 0.5;
            const opacity = conn.strength * pulse * 0.3;
            
            // Create gradient for connection
            const gradient = this.ctx.createLinearGradient(
                conn.from.x, conn.from.y,
                conn.to.x, conn.to.y
            );
            gradient.addColorStop(0, `rgba(52, 152, 219, ${opacity * conn.from.activation})`);
            gradient.addColorStop(1, `rgba(231, 76, 60, ${opacity * conn.to.activation})`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 0.5 + pulse * 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.stroke();
        });
        
        // Draw neurons with glow effect
        this.neurons.forEach(neuron => {
            const size = 3 + neuron.activation * 3;
            
            // Outer glow
            const glow = this.ctx.createRadialGradient(
                neuron.x, neuron.y, 0,
                neuron.x, neuron.y, size * 3
            );
            glow.addColorStop(0, `rgba(243, 156, 18, ${neuron.activation * 0.3})`);
            glow.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = glow;
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Core
            this.ctx.fillStyle = `rgba(44, 62, 80, ${0.6 + neuron.activation * 0.4})`;
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner bright spot
            this.ctx.fillStyle = `rgba(255, 255, 255, ${neuron.activation * 0.8})`;
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.animationId = requestAnimationFrame(() => this.animateNeuralNetwork());
    }
    
    initializeTextareaResize() {
        const textarea = this.elements.dvncInput;
        if (!textarea) return;
        
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
    }
    
    handlePromptCard(prompt) {
        this.startConversation();
        this.addMessage(prompt, 'user');
        
        // Determine response type based on prompt
        let responseType = 'general';
        if (prompt.includes('water pump') || prompt.includes('fluid')) {
            responseType = 'hydraulic';
        } else if (prompt.includes('exoskeleton')) {
            responseType = 'biomechanical';
        } else if (prompt.includes('circulatory') || prompt.includes('wearable')) {
            responseType = 'biomedical';
        }
        
        this.processAgentResponse(responseType);
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
    
    sendMessage() {
        const message = this.elements.dvncInput.value.trim();
        if (!message) return;
        
        this.startConversation();
        this.addMessage(message, 'user');
        this.elements.dvncInput.value = '';
        this.elements.dvncInput.style.height = 'auto';
        
        // Analyze message for Leonardo context
        let responseType = 'general';
        const keywords = {
            hydraulic: ['water', 'pump', 'fluid', 'flow', 'hydraulic'],
            biomechanical: ['exoskeleton', 'joint', 'muscle', 'movement', 'biomechanical'],
            biomedical: ['circulatory', 'heart', 'blood', 'medical', 'wearable']
        };
        
        for (const [type, words] of Object.entries(keywords)) {
            if (words.some(word => message.toLowerCase().includes(word))) {
                responseType = type;
                break;
            }
        }
        
        this.processAgentResponse(responseType);
    }
    
    addMessage(text, sender) {
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
        messageText.textContent = text;
        
        messageContent.appendChild(messageText);
        
        // Add Leonardo's sources for agent messages
        if (sender === 'agent') {
            const sources = this.createLeonardoSources();
            messageContent.appendChild(sources);
        }
        
        messageWrapper.appendChild(avatar);
        messageWrapper.appendChild(messageContent);
        messageBlock.appendChild(messageWrapper);
        
        this.elements.messageThread.appendChild(messageBlock);
        this.scrollToBottom();
    }
    
    createLeonardoSources() {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'message-sources';
        
        const sources = [
            { name: 'Codex Atlanticus', icon: '📜' },
            { name: 'Codex Leicester', icon: '📖' },
            { name: 'Windsor Manuscripts', icon: '📚' },
            { name: 'Codex Madrid I', icon: '📝' }
        ];
        
        // Randomly select 2-3 sources
        const selectedSources = sources
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 2) + 2);
        
        sourcesDiv.innerHTML = `
            <div class="source-label">Leonardo's References</div>
            <div class="source-items">
                ${selectedSources.map(source => `
                    <a href="#" class="source-chip" onclick="event.preventDefault()">
                        <span>${source.icon}</span>
                        <span>${source.name}</span>
                    </a>
                `).join('')}
            </div>
        `;
        
        return sourcesDiv;
    }
    
    async processAgentResponse(type) {
        if (this.state.showThinkingProcess) {
            await this.showThinkingSteps();
        }
        
        setTimeout(() => {
            const response = this.leonardoResponses[type] || this.leonardoResponses.general;
            this.addMessage(response, 'agent');
            
            // Update sources count
            this.state.memoryItems.push(`Analysis at ${new Date().toLocaleTimeString()}`);
            this.updateSourcesCount();
            
            // Hide thinking process
            if (this.elements.thinkingProcess) {
                this.elements.thinkingProcess.style.display = 'none';
            }
        }, 1500);
    }
    
    async showThinkingSteps() {
        this.elements.thinkingProcess.style.display = 'block';
        this.elements.thinkingSteps.innerHTML = '';
        
        const steps = [
            '📖 Consulting Leonardo\'s codices...',
            '🔬 Analyzing natural principles...',
            '⚙️ Synthesizing mechanical solutions...',
            '🎨 Applying aesthetic proportions...',
            '💡 Formulating innovative approach...'
        ];
        
        for (const step of steps) {
            await this.delay(400);
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
        this.elements.contextBar.style.display = 'none';
        this.elements.contextItems.innerHTML = '';
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
