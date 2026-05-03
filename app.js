// app.js

document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    const timelineContainer = document.getElementById('timeline');
    const timelineHeader = document.getElementById('timeline-header');
    const timelineBtns = document.querySelectorAll('.timeline-btn');
    const heroPills = document.querySelectorAll('.country-selector .pill');

    function renderTimeline(countryKey) {
        const data = electionData[countryKey];
        if (!data) return;
        timelineHeader.innerHTML = `<h3><i data-lucide="building" class="icon-sm"></i> Official Body: ${data.body}</h3>`;
        lucide.createIcons();
        timelineContainer.innerHTML = '';
        data.steps.forEach(step => {
            const stepEl = document.createElement('div');
            stepEl.className = 'timeline-step';
            const badgeClass = step.phase === 'Pre-Election' ? 'badge-warning' : step.phase === 'Election Day' ? 'badge-primary' : 'badge-success';
            stepEl.innerHTML = `
                <div class="timeline-marker">${step.id}</div>
                <div class="timeline-content">
                    <div class="timeline-content-header">
                        <h4>${step.icon} ${step.title}</h4>
                        <span class="badge ${badgeClass}">${step.phase}</span>
                    </div>
                    <p class="timeline-duration"><i data-lucide="clock" class="icon-sm"></i> ${step.duration}</p>
                    <div class="timeline-details">
                        <div class="detail-box citizen"><strong><i data-lucide="user" class="icon-sm"></i> Citizen Action:</strong><p>${step.citizen}</p></div>
                        <div class="detail-box official"><strong><i data-lucide="building-2" class="icon-sm"></i> Official Action:</strong><p>${step.official}</p></div>
                    </div>
                </div>`;
            stepEl.querySelector('.timeline-content-header').addEventListener('click', () => {
                stepEl.querySelector('.timeline-details').classList.toggle('expanded');
            });
            timelineContainer.appendChild(stepEl);
        });
        lucide.createIcons();
    }

    function switchCountry(countryKey) {
        renderTimeline(countryKey);
        timelineBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.country === countryKey));
        heroPills.forEach(pill => pill.classList.toggle('active', pill.dataset.country === countryKey));
    }

    timelineBtns.forEach(btn => btn.addEventListener('click', (e) => switchCountry(e.target.dataset.country)));
    heroPills.forEach(pill => pill.addEventListener('click', (e) => switchCountry(e.target.dataset.country)));
    switchCountry('india');

    const faqContainer = document.getElementById('faq-container');
    const faqSearch = document.getElementById('faq-search');

    function renderFAQs(searchTerm = "") {
        faqContainer.innerHTML = '';
        const filteredFaqs = faqData.filter(faq =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredFaqs.length === 0) { faqContainer.innerHTML = '<p class="no-results">No questions found.</p>'; return; }
        filteredFaqs.forEach((faq) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <div class="faq-question"><h3>${faq.question}</h3><i data-lucide="chevron-down" class="faq-icon"></i></div>
                <div class="faq-answer"><p>${faq.answer}</p></div>`;
            faqItem.querySelector('.faq-question').addEventListener('click', () => {
                const answer = faqItem.querySelector('.faq-answer');
                const isOpen = answer.style.maxHeight;
                document.querySelectorAll('.faq-answer').forEach(el => el.style.maxHeight = null);
                document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
                if (!isOpen) { answer.style.maxHeight = answer.scrollHeight + "px"; faqItem.classList.add('active'); }
            });
            faqContainer.appendChild(faqItem);
        });
        lucide.createIcons();
    }

    faqSearch.addEventListener('input', (e) => renderFAQs(e.target.value));
    renderFAQs();

    const glossaryContainer = document.getElementById('glossary-container');
    const glossarySearch = document.getElementById('glossary-search');

    function renderGlossary(searchTerm = "") {
        glossaryContainer.innerHTML = '';
        const filteredTerms = glossaryData.filter(item =>
            item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.definition.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredTerms.length === 0) { glossaryContainer.innerHTML = '<p class="no-results">No terms found.</p>'; return; }
        filteredTerms.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card glossary-card';
            card.innerHTML = `<h3>${item.term}</h3><p>${item.definition}</p>`;
            glossaryContainer.appendChild(card);
        });
    }

    glossarySearch.addEventListener('input', (e) => renderGlossary(e.target.value));
    renderGlossary();

    // Chat
    let conversationHistory = [];
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMsgBtn = document.getElementById('send-msg-btn');
    const chatSuggestions = document.getElementById('chat-suggestions');

    document.getElementById('clear-chat-btn').addEventListener('click', () => {
        chatMessages.innerHTML = '<div class="message ai">Hello! I\'m VoteWise AI. How can I help you understand the election process today?</div>';
        conversationHistory = [];
        chatSuggestions.style.display = 'flex';
    });

    function renderMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
    }

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        if (isUser) { msgDiv.textContent = text; } else { msgDiv.innerHTML = renderMarkdown(text); }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message ai typing';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async function sendMessage(userMessage) {
        addMessage(userMessage, true);
        chatInput.value = '';
        chatSuggestions.style.display = 'none';
        conversationHistory.push({ role: "user", content: userMessage });
        addTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const m = userMessage.toLowerCase();
            let reply = "I'm VoteWise AI. I can guide you through the election process! Try asking about registration, eligibility, polling day, NOTA, EVM, counting, or the Model Code of Conduct.";

            if (m.includes("eligib") || m.includes("who can vote") || m.includes("qualify") || m.includes("age limit") || m.includes("18")) {
                reply = "**Voter Eligibility in India:**\n- Must be **18 years or older** (as of Jan 1 of the revision year)\n- Must be an **Indian citizen**\n- Must be a **resident** of your polling area\n- Must not be disqualified by any law\n\n💡 NRIs can also register at their last Indian address.";
            } else if (m.includes("register") || m.includes("registration") || m.includes("voter id") || m.includes("enroll") || m.includes("form 6") || m.includes("sign up")) {
                reply = "**How to Register as a Voter in India:**\n1. Visit **voters.eci.gov.in** or the **Voter Helpline App**\n2. Fill **Form 6** online or offline\n3. Documents: Aadhaar, address proof, passport photo\n4. After verification → name added to Electoral Roll → EPIC card issued\n\n📞 Helpline: **1950**";
            } else if (m.includes("nota") || m.includes("none of the above") || m.includes("reject all")) {
                reply = "**What is NOTA?**\nNOTA = **None Of The Above** (introduced in 2013 by Supreme Court).\n- Last button on the EVM\n- Lets you reject all candidates without abstaining\n- Even if NOTA wins most votes, the candidate with highest votes still wins\n- But it signals voter dissatisfaction to parties 🗳️";
            } else if (m.includes("polling day") || m.includes("election day") || m.includes("voting day") || m.includes("how to vote") || m.includes("cast vote") || m.includes("booth") || m.includes("happen")) {
                reply = "**On Polling Day in India (7 AM – 6 PM):**\n1. Carry your **Voter ID or approved alternate ID**\n2. Go to your **assigned polling booth**\n3. Identity verified → **indelible ink** on finger\n4. Press **EVM button** next to your candidate\n5. **VVPAT slip** confirms your vote for 7 seconds\n\n🔒 Your vote is completely **secret and anonymous**.";
            } else if (m.includes("evm") || m.includes("electronic voting") || m.includes("tamper") || m.includes("hacking") || m.includes("voting machine")) {
                reply = "**About EVMs:**\n- ✅ NOT connected to internet — remote hacking impossible\n- ✅ Undergoes mock polls before election day\n- ✅ Sealed in presence of party representatives\n- ✅ Results cross-verified with VVPAT slips\n- ✅ Stored in strong rooms under CCTV + paramilitary guard";
            } else if (m.includes("vvpat") || m.includes("paper slip") || m.includes("paper trail") || m.includes("verify vote")) {
                reply = "**What is VVPAT?**\nVVPAT = **Voter Verifiable Paper Audit Trail**\n- After pressing EVM, a paper slip prints\n- Shows candidate name, symbol, serial number\n- Visible for **7 seconds** through transparent window\n- Slip drops into sealed box for audit purposes\n\n✅ Ensures your vote was recorded correctly.";
            } else if (m.includes("document") || m.includes("id proof") || m.includes("aadhaar") || m.includes("pan card") || m.includes("without voter id") || m.includes("alternate id")) {
                reply = "**Accepted IDs at Indian Polling Booths:**\n1. Voter ID (EPIC)\n2. Aadhaar Card\n3. PAN Card\n4. Passport\n5. Driving License\n6. MGNREGA Job Card\n7. Pension document with photo\n8. Bank passbook with photo\n\n📌 Name **must be on the voter list** regardless of ID.";
            } else if (m.includes("count") || m.includes("result") || m.includes("declare") || m.includes("who wins")) {
                reply = "**How Votes are Counted in India:**\n1. Counting centre set up under **CCTV surveillance**\n2. **Candidate agents** present at all times\n3. EVMs opened → **round-by-round tallies** announced\n4. VVPAT slips from random booths cross-verified\n5. **Returning Officer declares the winner**\n\n📊 Live results: **results.eci.gov.in**";
            } else if (m.includes("model code") || m.includes("mcc") || m.includes("code of conduct") || m.includes("campaign rules")) {
                reply = "**Model Code of Conduct (MCC):**\nIssued by ECI when elections are announced.\n- Ruling party cannot announce **new schemes** using govt resources\n- No **hate speech** or religion/caste appeals\n- No **voter bribery** allowed\n\n🔔 Report violations via **cVIGIL App**";
            } else if (m.includes("constituency") || m.includes("delimitation") || m.includes("my area") || m.includes("mp seat")) {
                reply = "**What is a Constituency?**\nA geographical area that elects **one representative**.\n- Lok Sabha → **543 constituencies** across India\n- Boundaries drawn by **Delimitation Commission** after Census\n\n🗺️ Find yours: **electoralsearch.eci.gov.in**";
            } else if (m.includes("moved") || m.includes("new city") || m.includes("shifted") || m.includes("transfer") || m.includes("change address")) {
                reply = "**Moved to a New City?**\n- Submit **Form 8A** (within same constituency)\n- Or **Form 6** (new constituency)\n- File with Electoral Registration Officer of new area\n\n⏱️ Act early — updates take time before elections!";
            } else if (m.includes("missing") || m.includes("name not") || m.includes("not in list") || m.includes("not found")) {
                reply = "**Name Missing from Voter List?**\n1. Check at **voters.eci.gov.in**\n2. Apply via **Form 6** (new registration)\n3. Act early — updates take time\n4. Cannot vote if name isn't listed on polling day\n\n📞 Call **1950** | Visit local Electoral Registration Officer";
            } else if (m.includes("by-election") || m.includes("bypoll") || m.includes("by poll") || m.includes("byelection")) {
                reply = "**What is a By-Election?**\nAn election to fill a **single vacant seat** between general elections.\n- Caused by: death, resignation, or disqualification of sitting member\n- Follows the same process as a general election";
            } else if (m.includes("silent") || m.includes("48 hour") || m.includes("blackout") || m.includes("no campaign")) {
                reply = "**Silent Period:**\nBegins **48 hours before** polling starts.\n- No campaigning of any kind allowed\n- Media blackout on campaign coverage\n- No rallies, speeches, or political ads\n\n🔇 Gives voters time for quiet reflection.";
            } else if (m.includes("eci") || m.includes("election commission") || m.includes("who conducts")) {
                reply = "**Election Commission of India (ECI):**\n- Established in **1950** under Article 324\n- Autonomous constitutional authority\n- Conducts Lok Sabha, Rajya Sabha & State elections\n- Enforces Model Code of Conduct\n- Manages EVMs and voter rolls\n\n🌐 **eci.gov.in**";
            } else if (m.includes("lok sabha") || m.includes("parliament") || m.includes("lower house")) {
                reply = "**Lok Sabha (House of the People):**\n- Lower house of India's Parliament\n- **543 elected seats**\n- Members elected for **5-year terms** by direct vote\n- Winning party/coalition forms the **government**\n- PM is leader of majority party";
            } else if (m.includes("rajya sabha") || m.includes("upper house") || m.includes("council of states")) {
                reply = "**Rajya Sabha (Council of States):**\n- Upper house of India's Parliament\n- **245 seats** total\n- Members chosen by state legislative assemblies\n- Members serve **6-year terms**\n- Cannot be dissolved unlike Lok Sabha";
            } else if (m.includes("exit poll") || m.includes("opinion poll") || m.includes("survey") || m.includes("prediction")) {
                reply = "**Exit Polls vs Opinion Polls:**\n- **Exit Poll:** Survey after voters leave booth — predicts results\n- **Opinion Poll:** Survey before election — gauges preference\n\n⚠️ Exit polls banned in India until **last polling phase closes**\n📌 Only ECI official results are final.";
            } else if (m.includes("hung") || m.includes("coalition") || m.includes("no majority")) {
                reply = "**Hung Parliament / Assembly:**\nNo single party wins majority of seats.\n- Parties negotiate to form a **coalition government**\n- President/Governor invites largest party to form govt\n- If no coalition possible → fresh elections called\n\nExample: UPA, NDA are coalition alliances in India.";
            } else if (m.includes("hello") || m.includes("hi ") || m.includes("hey ") || m.includes("namaste") || m.includes("start") || m.includes("help")) {
                reply = "Hello! 👋 I'm **VoteWise AI**, your election guide.\n\nI can help you with:\n🗳️ Voter registration & eligibility\n📋 What to bring on polling day\n🔢 How votes are counted\n📚 Election terms explained\n🏛️ ECI, EVM, NOTA, VVPAT\n\nWhat would you like to know?";
            } else if (m.includes("thank")) {
                reply = "You're welcome! 😊 Every vote matters — stay informed and encourage others to vote too! 🗳️";
            }

            addMessage(reply, false);
            conversationHistory.push({ role: "assistant", content: reply });

            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'chat-suggestions message-suggestions';
            suggestionsDiv.innerHTML = `
                <button class="chip">How do I register to vote in India?</button>
                <button class="chip">What happens on polling day?</button>
                <button class="chip">What is NOTA?</button>
                <button class="chip">How are votes counted?</button>`;
            chatMessages.appendChild(suggestionsDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            suggestionsDiv.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', (e) => sendMessage(e.target.textContent));
            });
        }, 800);
    }

    sendMsgBtn.addEventListener('click', () => { const msg = chatInput.value.trim(); if (msg) sendMessage(msg); });
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { const msg = chatInput.value.trim(); if (msg) sendMessage(msg); } });
    document.querySelectorAll('.chip').forEach(chip => { chip.addEventListener('click', (e) => sendMessage(e.target.textContent)); });
});