document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('product-category');
    const subcategorySelect = document.getElementById('product-subcategory');
    const stepNavigationLinks = document.querySelectorAll('#step-navigation a');
    let categoriesData = {};

    // Fetch categories from JSON file
    fetch('data/categories.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            categoriesData = data.categories;
            if (categorySelect) populateCategories(); // Ensure element exists
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            if (categorySelect) categorySelect.innerHTML = '<option value="" disabled selected>Error loading categories</option>';
        });

    function populateCategories() {
        if (!categoriesData || categoriesData.length === 0) {
            categorySelect.innerHTML = '<option value="" disabled selected>No categories available</option>';
            return;
        }
        categoriesData.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        // Initialize subcategories for the default selected category if any, or leave as is
        if (categorySelect.value) {
            populateSubcategories(categorySelect.value);
        }
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', (event) => {
            populateSubcategories(event.target.value);
        });
    }

    function populateSubcategories(categoryName) {
        if (!subcategorySelect) return;
        subcategorySelect.innerHTML = '<option value="" disabled selected>Select a subcategory...</option>'; // Reset subcategories
        if (!categoryName || !categoriesData) return;

        const selectedCategory = categoriesData.find(cat => cat.name === categoryName);

        if (selectedCategory && selectedCategory.subcategories) {
            selectedCategory.subcategories.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory;
                option.textContent = subcategory;
                subcategorySelect.appendChild(option);
            });
        }
    }

    // Step navigation logic
    stepNavigationLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const stepId = link.getAttribute('data-step');
            showStep(stepId);
            updateActiveNavLink(link);
        });
    });

    // Initialize the first step
    const firstStepId = stepNavigationLinks.length > 0 ? stepNavigationLinks[0].getAttribute('data-step') : null;
    if (firstStepId) {
        showStep(firstStepId);
        updateActiveNavLink(stepNavigationLinks[0]);
    }

    // --- Advertisement Strategy Logic ---
    const adStrategyForm = document.getElementById('ad-strategy-form');
    const paymentModelFieldset = document.getElementById('payment-model-fieldset');
    const printDetailsContainer = document.getElementById('print-details-container');
    const ppcCpmDetailsContainer = document.getElementById('ppc-cpm-details-container');
    const influencerDetailsContainer = document.getElementById('influencer-details-container');

    // Main function to update the ad strategy view by toggling visibility
    function updateAdStrategyView() {
        if (!adStrategyForm) return;

        const formData = new FormData(adStrategyForm);
        const mediaTypes = formData.getAll('media-type');
        const paymentModel = formData.get('payment-model');
        const isDigitalOrMobile = mediaTypes.includes('Digital') || mediaTypes.includes('Mobile');

        // 1. Toggle visibility of the payment model fieldset
        if (paymentModelFieldset) {
            paymentModelFieldset.style.display = isDigitalOrMobile ? 'block' : 'none';
        }

        // 2. Toggle visibility of the dynamic details containers
        if (printDetailsContainer) {
            printDetailsContainer.style.display = mediaTypes.includes('Print') ? 'block' : 'none';
        }

        if (isDigitalOrMobile) {
            if (ppcCpmDetailsContainer) {
                ppcCpmDetailsContainer.style.display = (paymentModel === 'PPC' || paymentModel === 'CPM') ? 'block' : 'none';
            }
            if (influencerDetailsContainer) {
                influencerDetailsContainer.style.display = paymentModel === 'Influencer' ? 'block' : 'none';
            }
        } else {
            // Hide digital/mobile containers if neither media type is selected
            if (ppcCpmDetailsContainer) ppcCpmDetailsContainer.style.display = 'none';
            if (influencerDetailsContainer) influencerDetailsContainer.style.display = 'none';
        }
    }

    // Add a single event listener to the form
    if (adStrategyForm) {
        adStrategyForm.addEventListener('change', updateAdStrategyView);
    }

    // Initial update on page load
    updateAdStrategyView();

});

function showStep(stepId) {
    const steps = document.querySelectorAll('.campaign-step');
    steps.forEach(step => {
        step.classList.remove('active-step');
    });
    const activeStep = document.getElementById(stepId);
    if (activeStep) {
        activeStep.classList.add('active-step');
    }
}

function updateActiveNavLink(activeLink) {
    const stepNavigationLinks = document.querySelectorAll('#step-navigation a');
    stepNavigationLinks.forEach(navLink => {
        navLink.classList.remove('active-nav');
    });
    if (activeLink) {
        activeLink.classList.add('active-nav');
    }
}

// Global function for next/prev buttons within forms
function navigateToStep(targetStepId) {
    showStep(targetStepId);
    const targetNavLink = document.querySelector(`#step-navigation a[data-step="${targetStepId}"]`);
    updateActiveNavLink(targetNavLink);
}

// --- Simulation Engine & Financial Calculations ---

// Global state for the simulation
let simulationState = {
    intervalId: null,
    initialData: {},
    totalInvestment: 0,
    marketFactors: {
        cultural_trends: { value: 1.0, name: 'Cultural Trends', icon: 'fa-users' },
        competitor_influence: { value: 1.0, name: 'Competitor Influence', icon: 'fa-store' },
        search_trends: { value: 1.0, name: 'Search Trends', icon: 'fa-search' },
        local_preferences: { value: 1.0, name: 'Local Preferences', icon: 'fa-map-marker-alt' },
        govt_policies: { value: 1.0, name: 'Govt. Policies', icon: 'fa-landmark' },
        economic_climate: { value: 1.0, name: 'Economic Climate', icon: 'fa-money-bill-wave' },
    }
};

/**
 * Calculates the Return on Investment (ROI).
 * @param {number} revenue - The total estimated revenue.
 * @param {number} investment - The total investment cost.
 * @returns {number} The ROI percentage, rounded to two decimal places.
 */
function calculateROI(revenue, investment) {
    if (investment === 0) {
        return revenue > 0 ? Infinity : 0;
    }
    const roi = ((revenue - investment) / investment) * 100;
    return roi.toFixed(2);
}

/**
 * Estimates the potential revenue based on a simplified simulation model.
 * @param {object} simulationData - The collected data from user inputs.
 * @param {number} totalInvestment - The total calculated investment.
 * @returns {number} The estimated revenue.
 */
function estimateRevenue() {
    const { initialData, totalInvestment, marketFactors } = simulationState;
    
    // Base revenue influenced by initial investment and ad approach
    let baseRevenue = totalInvestment * 1.2;
    const approach = initialData['ad-approach'];
    if (approach === 'Persuasive' || approach === 'Comparative') {
        baseRevenue *= 1.1;
    }
    if (initialData['media-types'] && initialData['media-types'].length > 2) {
        baseRevenue *= 1.08; // Synergy bonus for 3+ media types
    }

    // Apply dynamic market factors
    let dynamicMultiplier = 1.0;
    for (const key in marketFactors) {
        dynamicMultiplier *= marketFactors[key].value;
    }

    // Final revenue is a combination of base strategy and live market conditions
    let finalRevenue = baseRevenue * dynamicMultiplier;

    return Math.max(0, finalRevenue);
}


function runSimulation() {
    navigateToStep('monitoring-section');

    const productForm = document.getElementById('product-description-form');
    const targetingForm = document.getElementById('targeting-form');
    const adStrategyForm = document.getElementById('ad-strategy-form');
    const outputContainer = document.getElementById('simulation-output');

    if (!productForm || !targetingForm || !adStrategyForm || !outputContainer) {
        console.error('One or more required forms or the output container is missing.');
        outputContainer.innerHTML = '<p class="error">Error: Could not find all required elements to run the simulation.</p>';
        return;
    }

    // Collect data from all forms using FormData
    const productData = new FormData(productForm);
    const targetingData = new FormData(targetingForm);
    const adStrategyData = new FormData(adStrategyForm);

    const simulationData = {};

    // Combine all form data into a single object
    productData.forEach((value, key) => { simulationData[key] = value; });
    targetingData.forEach((value, key) => { simulationData[key] = value; });
    
    // Special handling for ad strategy to include dynamic fields
    simulationData['media-types'] = adStrategyData.getAll('media-type');
    adStrategyData.forEach((value, key) => {
        if (key !== 'media-type') { // Avoid duplicating media-type
            simulationData[key] = value;
        }
    });

    // Generate HTML output using a card-based layout
    let outputHtml = '<h2><i class="fas fa-chart-line"></i> Campaign Summary</h2>';

    // Card 1: Product & Targeting
    outputHtml += `
    <div class="summary-card">
        <div class="summary-header">
            <i class="fas fa-box-open"></i>
            <h3>Product & Targeting</h3>
        </div>
        <div class="summary-content">
            <p><strong>Product Name:</strong> ${simulationData['product-name'] || 'N/A'}</p>
            <p><strong>Category:</strong> ${simulationData['product-category'] || 'N/A'} &gt; ${simulationData['product-subcategory'] || 'N/A'}</p>
            <p><strong>Description:</strong> ${simulationData['product-details'] || 'N/A'}</p>
            <hr>
            <p><strong>Target Location(s):</strong> ${simulationData['target-location'] || 'N/A'}</p>
            <p><strong>Competitors:</strong> ${simulationData['competitors'] || 'N/A'}</p>
        </div>
    </div>`;

    // Card 2: Advertising Strategy
    outputHtml += `
    <div class="summary-card">
        <div class="summary-header">
            <i class="fas fa-bullhorn"></i>
            <h3>Advertising Strategy</h3>
        </div>
        <div class="summary-content">
            <p><strong>Media Types:</strong> ${(simulationData['media-types'] && simulationData['media-types'].join(', ')) || 'None Selected'}</p>
            <p><strong>Ad Approach:</strong> ${simulationData['ad-approach'] || 'N/A'}</p>
            ${simulationData['payment-model'] ? `<p><strong>Payment Model:</strong> ${simulationData['payment-model']}</p>` : ''}
        </div>
    </div>`;

    // Card 3: Detailed Ad Spend (conditional)
    let adDetailsContent = '';
    if (simulationData['media-types'] && simulationData['media-types'].includes('Print')) {
        adDetailsContent += `
        <div class="details-section">
            <h4><i class="fas fa-newspaper"></i> Print Details</h4>
            <p><strong>Publication:</strong> ${simulationData['print-publication'] || 'N/A'}</p>
            <p><strong>Ad Size:</strong> ${simulationData['print-ad-size'] || 'N/A'}</p>
            <p><strong>Frequency:</strong> ${simulationData['print-frequency'] || 'N/A'}</p>
            <p><strong>Est. Cost per Ad:</strong> $${simulationData['print-cost'] || '0'}</p>
        </div>`;
    }
    if (simulationData['payment-model'] === 'PPC' || simulationData['payment-model'] === 'CPM') {
        adDetailsContent += `
        <div class="details-section">
            <h4><i class="fas fa-mouse-pointer"></i> PPC/CPM Details</h4>
            <p><strong>Keywords:</strong> ${simulationData['digital-keywords'] || 'N/A'}</p>
            <p><strong>Campaign Budget:</strong> $${simulationData['digital-budget'] || '0'}</p>
            <p><strong>Target CPC/CPM:</strong> $${simulationData['digital-target-cpc'] || '0'}</p>
        </div>`;
    }
    if (simulationData['payment-model'] === 'Influencer') {
        adDetailsContent += `
        <div class="details-section">
            <h4><i class="fas fa-star"></i> Influencer Details</h4>
            <p><strong>Platform:</strong> ${simulationData['influencer-platform'] || 'N/A'}</p>
            <p><strong>Niche:</strong> ${simulationData['influencer-niche'] || 'N/A'}</p>
            <p><strong>Follower Count:</strong> ${simulationData['influencer-followers'] || 'N/A'}</p>
            <p><strong>Est. Cost per Post:</strong> $${simulationData['influencer-cost'] || '0'}</p>
        </div>`;
    }

    if (adDetailsContent) {
        outputHtml += `
        <div class="summary-card">
            <div class="summary-header">
                <i class="fas fa-dollar-sign"></i>
                <h3>Investment Details</h3>
            </div>
            <div class="summary-content">
                ${adDetailsContent}
            </div>
        </div>`;
    }

        // --- Initial ROI Calculation & Real-Time Simulation Kick-off ---

    const printCost = parseFloat(simulationData['print-cost'] || 0);
    const digitalBudget = parseFloat(simulationData['digital-budget'] || 0);
    const influencerCost = parseFloat(simulationData['influencer-cost'] || 0);

    const totalInvestment = printCost + digitalBudget + influencerCost;
    
    // Store initial data in the global state
    simulationState.initialData = simulationData;
    simulationState.totalInvestment = totalInvestment;

    // Perform an initial calculation for the summary card
    const initialRevenue = estimateRevenue(); 
    const netProfitOrLoss = initialRevenue - totalInvestment;
    const roi = calculateROI(initialRevenue, totalInvestment);

    const profitClass = netProfitOrLoss >= 0 ? 'text-success' : 'text-danger';
    const roiClass = roi >= 0 ? 'text-success' : 'text-danger';

    // Card 4: Financial Summary
    outputHtml += `
    <div class="summary-card">
        <div class="summary-header">
            <i class="fas fa-calculator"></i>
            <h3>Financial Summary</h3>
        </div>
        <div class="summary-content">
            <p><strong>Total Investment:</strong> $${totalInvestment.toFixed(2)}</p>
            <p><strong>Projected Revenue:</strong> $${initialRevenue.toFixed(2)}</p>
            <p><strong>Net Profit/Loss:</strong> <span class="${profitClass}">$${netProfitOrLoss.toFixed(2)}</span></p>
            <hr>
            <p><strong>Return on Investment (ROI):</strong> <span class="${roiClass}">${roi}%</span></p>
        </div>
    </div>`;

    // --- Prepare and Save Data to Backend ---
    const dataToSave = {
        productName: simulationState.initialData['product-name'],
        productCategory: simulationState.initialData['product-category'],
        productSubcategory: simulationState.initialData['product-subcategory'],
        productDetails: simulationState.initialData['product-details'],
        targetLocation: simulationState.initialData['target-location'],
        competitors: simulationState.initialData['competitors'],
        mediaTypes: simulationState.initialData['media-types'],
        adApproach: simulationState.initialData['ad-approach'],
        paymentModel: simulationState.initialData['payment-model'],
        printDetails: {
            publication: simulationState.initialData['print-publication'],
            adSize: simulationState.initialData['print-ad-size'],
            frequency: simulationState.initialData['print-frequency'],
            cost: parseFloat(simulationState.initialData['print-cost'] || 0)
        },
        digitalDetails: {
            keywords: simulationState.initialData['digital-keywords'],
            budget: parseFloat(simulationState.initialData['digital-budget'] || 0),
            targetCPC: parseFloat(simulationState.initialData['digital-target-cpc'] || 0)
        },
        influencerDetails: {
            platform: simulationState.initialData['influencer-platform'],
            niche: simulationState.initialData['influencer-niche'],
            followers: simulationState.initialData['influencer-followers'],
            cost: parseFloat(simulationState.initialData['influencer-cost'] || 0)
        },
        totalInvestment: totalInvestment,
        finalROI: parseFloat(roi),
        netProfit: netProfitOrLoss
    };

    saveSimulationData(dataToSave);

    outputContainer.innerHTML = outputHtml;

    // Show the static summary, then switch to the real-time dashboard
    setTimeout(() => {
        const summaryEl = document.getElementById('simulation-output');
        const dashboardEl = document.getElementById('real-time-dashboard');
        if (summaryEl && dashboardEl) {
            summaryEl.style.display = 'none';
            dashboardEl.style.display = 'block';
            startRealTimeSimulation();
        }
    }, 4000); // Wait 4 seconds before showing the live dashboard
}

function startRealTimeSimulation() {
    // Stop any previous simulation
    if (simulationState.intervalId) {
        clearInterval(simulationState.intervalId);
    }

    // Initial render of the dashboard
    updateSimulationTick();

    // Start the simulation loop
    simulationState.intervalId = setInterval(updateSimulationTick, 2500); // Update every 2.5 seconds
}

function updateSimulationTick() {
    // 1. Simulate changes in market factors
    for (const key in simulationState.marketFactors) {
        const factor = simulationState.marketFactors[key];
        const change = (Math.random() - 0.49) * 0.05; // Small, random fluctuation
        factor.value = Math.max(0.8, Math.min(1.2, factor.value + change)); // Clamp between 0.8 and 1.2
    }

    // 2. Recalculate financials
    const currentRevenue = estimateRevenue();
    const currentROI = calculateROI(currentRevenue, simulationState.totalInvestment);
    const currentNetProfit = currentRevenue - simulationState.totalInvestment;

    // 3. Update the UI
    renderImpactFactors();
    renderLiveROI(currentROI, currentNetProfit);
}

function renderImpactFactors() {
    const grid = document.getElementById('impact-factors-grid');
    if (!grid) return;

    let html = '';
    for (const key in simulationState.marketFactors) {
        const factor = simulationState.marketFactors[key];
        const valuePercent = ((factor.value - 1) * 100).toFixed(1);
        let trendIcon = 'fa-minus';
        if (valuePercent > 1) trendIcon = 'fa-arrow-up';
        if (valuePercent < -1) trendIcon = 'fa-arrow-down';

        html += `
        <div class="impact-factor-card">
            <div class="factor-header">
                <i class="fas ${factor.icon}"></i>
                <span>${factor.name}</span>
            </div>
            <div class="factor-value">${factor.value.toFixed(3)}</div>
            <div class="factor-trend">
                <i class="fas ${trendIcon}"></i>
                <span>${valuePercent}%</span>
            </div>
        </div>`;
    }
    grid.innerHTML = html;
}

function renderLiveROI(roi, netProfit) {
    const display = document.getElementById('live-roi-display');
    if (!display) return;

    const roiValueEl = display.querySelector('.roi-value');
    const profitValueEl = display.querySelector('.profit-value'); // Assuming this element exists or will be added
    const roiClass = roi >= 0 ? 'text-success' : 'text-danger';

    // Update background color based on performance
    display.style.backgroundColor = roi >= 0 ? '#2c3e50' : '#c0392b';

    let html = `
        <span class="roi-label">Live Return on Investment</span>
        <span class="roi-value ${roiClass}">${roi}%</span>
        <span class="profit-label">Net Profit/Loss: <span class="${roiClass}">$${netProfit.toFixed(2)}</span></span>
    `;
    display.innerHTML = html;
}

// --- API Communication ---

/**
 * Sends the final simulation data to the backend to be saved.
 * @param {object} data - The structured simulation data.
 */
async function saveSimulationData(data) {
    const API_URL = 'http://localhost:5000/api/simulations';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.message || 'Failed to save simulation');
        }

        const result = await response.json();
        console.log('Simulation saved successfully:', result);
    } catch (error) {
        console.error('Error saving simulation:', error);
        // Optionally, display an error to the user on the UI
    }
}
